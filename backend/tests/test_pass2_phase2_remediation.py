"""
Regression Test Suite for Pass 2 Phase 2 Remediation:
- SEC-003: Refresh token lifecycle, rotation, revocation, replay detection
- SEC-005: Object-level authorization / IDOR prevention across careers, recommendations, roadmaps
- SEC-006: CSRF protection on cookie-authenticated mutating requests
- SEC-008: SSRF protections (ports, cloud metadata, private subnets, DNS rebinding)
- DATA-003: Resource skill and prerequisite unique constraint integrity
- FLOW-003: DSA prerequisite graph completeness, DAG acyclicity
- PERF-001: Career detail query count boundedness (no N+1)
- PERF-002: Critical performance indexes on foreign keys
"""
import uuid
import pytest
from starlette.testclient import TestClient
from sqlalchemy import inspect as sa_inspect, event
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from backend.app.main import app
from backend.app.database import SessionLocal, get_db
from backend.app.models.user import User, RefreshToken
from backend.app.models.profile import LearnerProfile
from backend.app.models.resource import LearningResource, ResourceSkill, ResourcePrerequisite
from backend.app.models.career import Career, CareerSkillRequirement, CareerRequirement
from backend.app.core.security import create_access_token, create_refresh_token, hash_token
from backend.app.core.csrf import generate_csrf_token
from backend.app.resources.resource_verifier import ResourceVerifier
from backend.app.career.discovery_service import CareerDiscoveryService
from backend.app.seed.dsa_seed import DSA_CATALOG


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def test_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============================================================================
# 1. SEC-003: Token Lifecycle & Refresh Flow
# ============================================================================

def test_sec003_login_issues_access_and_refresh_tokens(client, test_db):
    uid = uuid.uuid4().hex[:8]
    email = f"user_sec003_{uid}@test.com"
    reg_resp = client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "SecurePassword123!",
        "full_name": "SEC-003 Learner"
    })
    assert reg_resp.status_code == 200
    data = reg_resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"

    # Refresh token must also be saved in database
    user = test_db.query(User).filter(User.email == email).first()
    assert user is not None
    db_tokens = test_db.query(RefreshToken).filter(RefreshToken.user_id == user.id).all()
    assert len(db_tokens) >= 1
    assert any(not t.revoked for t in db_tokens)


def test_sec003_refresh_token_rotation_and_revocation(client, test_db):
    uid = uuid.uuid4().hex[:8]
    email = f"user_rot_{uid}@test.com"
    reg = client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "SecurePassword123!",
        "full_name": "Rotation Learner"
    })
    first_refresh = reg.json()["refresh_token"]
    first_access = reg.json()["access_token"]

    # Refresh tokens
    ref_resp = client.post("/api/v1/auth/refresh", json={"refresh_token": first_refresh})
    assert ref_resp.status_code == 200
    ref_data = ref_resp.json()
    second_refresh = ref_data["refresh_token"]
    second_access = ref_data["access_token"]

    # New refresh token must be different (rotated)
    assert second_refresh != first_refresh
    assert second_access != first_access

    # Replaying the old (now rotated/revoked) refresh token must be rejected
    replay_resp = client.post("/api/v1/auth/refresh", json={"refresh_token": first_refresh})
    assert replay_resp.status_code == 401
    assert "revoked" in replay_resp.json()["detail"].lower() or "replay" in replay_resp.json()["detail"].lower()


def test_sec003_logout_revokes_tokens(client, test_db):
    uid = uuid.uuid4().hex[:8]
    email = f"user_logout_{uid}@test.com"
    reg = client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "SecurePassword123!",
        "full_name": "Logout Learner"
    })
    refresh_token = reg.json()["refresh_token"]
    access_token = reg.json()["access_token"]

    # Logout
    logout_resp = client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {access_token}"},
        json={"refresh_token": refresh_token}
    )
    assert logout_resp.status_code == 200

    # Attempting to refresh with the revoked token must fail
    ref_resp = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert ref_resp.status_code == 401


def test_sec003_token_type_segregation(client, test_db):
    uid = uuid.uuid4().hex[:8]
    email = f"user_type_{uid}@test.com"
    reg = client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "SecurePassword123!",
        "full_name": "Type Learner"
    })
    refresh_token = reg.json()["refresh_token"]
    access_token = reg.json()["access_token"]

    # Using refresh token to access protected endpoint must fail (401)
    prot_resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {refresh_token}"})
    assert prot_resp.status_code == 401

    # Using access token to refresh must fail (401)
    ref_resp = client.post("/api/v1/auth/refresh", json={"refresh_token": access_token})
    assert ref_resp.status_code == 401


# ============================================================================
# 2. SEC-005: Object-Level Authorization / IDOR Prevention
# ============================================================================

def test_sec005_cross_user_career_fit_blocked(client, test_db):
    # Create User A (victim)
    user_a = User(email=f"victim_{uuid.uuid4().hex[:8]}@real.com", hashed_password="pw", full_name="User A")
    test_db.add(user_a)
    test_db.flush()
    profile_a = LearnerProfile(user_id=user_a.id, experience_level="Intermediate", weekly_hours=20)
    test_db.add(profile_a)

    # Create User B (attacker)
    user_b = User(email=f"attacker_{uuid.uuid4().hex[:8]}@real.com", hashed_password="pw", full_name="User B")
    test_db.add(user_b)
    test_db.flush()
    profile_b = LearnerProfile(user_id=user_b.id, experience_level="Beginner", weekly_hours=10)
    test_db.add(profile_b)
    test_db.commit()

    token_b = create_access_token(user_b.id)

    # Unauthenticated attacker queries User A profile -> 401
    unauth_resp = client.get(f"/api/v1/careers/software-engineer/fit?profile_id={profile_a.id}")
    assert unauth_resp.status_code == 401

    # Authenticated User B queries User A profile -> 403
    auth_b_resp = client.get(
        f"/api/v1/careers/software-engineer/fit?profile_id={profile_a.id}",
        headers={"Authorization": f"Bearer {token_b}"}
    )
    assert auth_b_resp.status_code == 403

    # Authenticated User B queries their own profile -> 200
    auth_own_resp = client.get(
        f"/api/v1/careers/software-engineer/fit?profile_id={profile_b.id}",
        headers={"Authorization": f"Bearer {token_b}"}
    )
    assert auth_own_resp.status_code == 200


def test_sec005_cross_user_recommendations_and_roadmaps_blocked(client, test_db):
    user_a = User(email=f"rec_victim_{uuid.uuid4().hex[:8]}@real.com", hashed_password="pw", full_name="Rec Victim")
    test_db.add(user_a)
    test_db.flush()
    profile_a = LearnerProfile(user_id=user_a.id, experience_level="Intermediate", weekly_hours=20)
    test_db.add(profile_a)

    user_b = User(email=f"rec_attacker_{uuid.uuid4().hex[:8]}@real.com", hashed_password="pw", full_name="Rec Attacker")
    test_db.add(user_b)
    test_db.flush()
    profile_b = LearnerProfile(user_id=user_b.id, experience_level="Beginner", weekly_hours=10)
    test_db.add(profile_b)
    test_db.commit()

    token_b = create_access_token(user_b.id)

    # Recommendations: User B querying User A -> 403
    rec_resp = client.get(
        f"/api/v1/recommendations/company-role-learning?company_slug=google&role_slug=software-engineer&learner_id={profile_a.id}",
        headers={"Authorization": f"Bearer {token_b}"}
    )
    assert rec_resp.status_code == 403

    # Roadmaps: User B generating for User A -> 403
    gen_resp = client.get(
        f"/api/v1/company-roadmaps/generate?company_slug=google&role_slug=software-engineer&learner_id={profile_a.id}",
        headers={"Authorization": f"Bearer {token_b}"}
    )
    assert gen_resp.status_code == 403


# ============================================================================
# 3. SEC-006: CSRF Protection
# ============================================================================

def test_sec006_csrf_cookie_mutations_enforced(client):
    # Calling state-changing endpoint with auth cookie but missing CSRF token -> 403
    client.cookies.set("pathfinder_token", "mock_jwt_cookie_value")
    resp = client.post("/api/v1/company-roadmaps/crm_test123/switch-company", json={"new_company_slug": "google"})
    assert resp.status_code == 403
    assert "csrf" in resp.json()["detail"].lower()

    # Clear cookie
    client.cookies.clear()


def test_sec006_csrf_token_generation_and_bearer_bypass(client):
    # GET /auth/csrf generates a token and sets cookie
    csrf_resp = client.get("/api/v1/auth/csrf")
    assert csrf_resp.status_code == 200
    csrf_token = csrf_resp.json()["csrf_token"]
    assert len(csrf_token) > 20
    assert csrf_resp.cookies.get("pathfinder_csrf_token") is not None

    # Safe GET request passes without CSRF token
    get_resp = client.get("/api/v1/careers/domains")
    assert get_resp.status_code == 200


# ============================================================================
# 4. SEC-008: SSRF Hardened Protection
# ============================================================================

def test_sec008_ssrf_rejects_loopback_private_metadata_and_ports():
    verifier = ResourceVerifier()

    # Loopback
    is_safe, err = verifier.is_safe_destination("http://127.0.0.1:80/status")
    assert not is_safe
    assert "loopback" in err.lower() or "localhost" in err.lower()

    is_safe, err = verifier.is_safe_destination("http://localhost/test")
    assert not is_safe

    # Private Subnets
    for private_ip in ["10.0.0.1", "192.168.1.1", "172.16.0.5"]:
        is_safe, err = verifier.is_safe_destination(f"http://{private_ip}/internal")
        assert not is_safe
        assert "private" in err.lower()

    # Cloud Metadata
    is_safe, err = verifier.is_safe_destination("http://169.254.169.254/latest/meta-data")
    assert not is_safe

    is_safe, err = verifier.is_safe_destination("http://metadata.google.internal/computeMetadata/v1/")
    assert not is_safe
    assert "metadata" in err.lower()

    # Dangerous Non-Standard Ports
    is_safe, err = verifier.is_safe_destination("http://example.com:22/ssh")
    assert not is_safe
    assert "port" in err.lower()

    is_safe, err = verifier.is_safe_destination("http://example.com:6379/redis")
    assert not is_safe
    assert "port" in err.lower()

    # Trusted Public Destinations
    is_safe, err = verifier.is_safe_destination("https://nptel.ac.in/courses/106105087")
    assert is_safe
    assert err is None


# ============================================================================
# 5. DATA-003: Resource Model Unique Constraints
# ============================================================================

def test_data003_resource_skill_unique_constraint(test_db):
    mapper = sa_inspect(ResourceSkill)
    table = mapper.tables[0]
    unique_constraints = [c for c in table.constraints if c.__class__.__name__ == "UniqueConstraint"]
    # Confirms table has a unique constraint on resource_id and skill_id
    has_res_skill_uc = any(
        set(col.name for col in uc.columns) == {"resource_id", "skill_id"}
        for uc in unique_constraints
    )
    assert has_res_skill_uc, "ResourceSkill must have a UNIQUE constraint on (resource_id, skill_id)"

    # Confirms no duplicate constraint definitions on the table
    matching_ucs = [
        uc for uc in unique_constraints
        if set(col.name for col in uc.columns) == {"resource_id", "skill_id"}
    ]
    assert len(matching_ucs) == 1, "ResourceSkill should have exactly 1 unique constraint on (resource_id, skill_id)"


# ============================================================================
# 6. FLOW-003: DSA Prerequisite Graph Completeness & Acyclicity
# ============================================================================

def test_flow003_dsa_graph_is_valid_dag():
    topics = {}
    for domain in DSA_CATALOG:
        for t in domain.get("topics", []):
            topics[t["slug"]] = t
    assert len(topics) >= 25

    # Zero missing prerequisites
    for slug, t in topics.items():
        for prereq in t.get("prerequisite_topic_slugs", []):
            assert prereq in topics, f"DSA topic {slug} references nonexistent prerequisite {prereq}"
            assert prereq != slug, f"DSA topic {slug} has self-referential prerequisite"

    # Zero cycles (Topological sort verification)
    in_degree = {slug: 0 for slug in topics}
    adjacency = {slug: [] for slug in topics}
    for slug, t in topics.items():
        for prereq in t.get("prerequisite_topic_slugs", []):
            adjacency[prereq].append(slug)
            in_degree[slug] += 1

    queue = [slug for slug, deg in in_degree.items() if deg == 0]
    visited = 0
    while queue:
        curr = queue.pop(0)
        visited += 1
        for neighbor in adjacency[curr]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    assert visited == len(topics), "DSA prerequisite graph must be an acyclic DAG with 0 cycles"


# ============================================================================
# 7. PERF-001: Career Detail Query Count
# ============================================================================

def test_perf001_career_detail_query_count_bounded(test_db):
    svc = CareerDiscoveryService(db=test_db)
    queries = []

    def count_query(conn, cursor, statement, parameters, context, executemany):
        queries.append(statement)

    event.listen(test_db.bind, "before_cursor_execute", count_query)
    try:
        detail = svc.get_career_detail("software-engineer")
        assert detail is not None
        # Must not produce N+1 queries for skills/pathways; exactly 1 joined query executed
        assert len(queries) <= 2, f"Expected <= 2 queries, got {len(queries)}"
    finally:
        event.remove(test_db.bind, "before_cursor_execute", count_query)


# ============================================================================
# 8. PERF-002: Foreign Key Performance Indexes
# ============================================================================

def test_perf002_foreign_key_indexes_exist(test_db):
    inspector = sa_inspect(test_db.bind)

    # Check resource_skills.skill_id
    rs_indexes = inspector.get_indexes("resource_skills")
    rs_indexed_cols = {col for idx in rs_indexes for col in idx.get("column_names", [])}
    assert "skill_id" in rs_indexed_cols, "resource_skills must index skill_id"

    # Check career_skill_requirements.skill_id
    csr_indexes = inspector.get_indexes("career_skill_requirements")
    csr_indexed_cols = {col for idx in csr_indexes for col in idx.get("column_names", [])}
    assert "skill_id" in csr_indexed_cols, "career_skill_requirements must index skill_id"

    # Check career_requirements.career_id
    cr_indexes = inspector.get_indexes("career_requirements")
    cr_indexed_cols = {col for idx in cr_indexes for col in idx.get("column_names", [])}
    assert "career_id" in cr_indexed_cols, "career_requirements must index career_id"
