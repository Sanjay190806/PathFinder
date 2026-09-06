import pytest
import uuid
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.database import SessionLocal
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.models.resource import LearningResource, ResourceSkill
from backend.app.models.skill import Skill
from backend.app.models.syllabus import (
    CourseSyllabus, SyllabusModule, SyllabusTopic,
    LearningObjective, SyllabusTopicSkill, LearnerCourseProgress
)
from backend.app.schemas.syllabus import CourseSyllabusCreate
from backend.app.syllabus.syllabus_engine import SyllabusEngine
from backend.app.syllabus.syllabus_validator import SyllabusValidator
from backend.app.core.security import hash_password, create_access_token

client = TestClient(app)


@pytest.fixture
def test_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_demo_auth():
    login_res = client.post("/api/v1/demo/login")
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def get_or_create_test_course(db, slug="test-course-intro"):
    res = db.query(LearningResource).filter(LearningResource.slug == slug).first()
    if not res:
        res = LearningResource(
            id=str(uuid.uuid4()),
            title="Introduction to Engineering Systems",
            slug=slug,
            description="Foundational engineering systems course",
            provider="NPTEL",
            url=f"https://nptel.ac.in/courses/test/{slug}",
            resource_type="course",
            difficulty="Beginner",
            estimated_hours=20.0,
            quality_score=0.90,
            language="English",
            price_type="GENUINELY_FREE",
            verification_status="VERIFIED"
        )
        db.add(res)
        db.flush()
        sk = db.query(Skill).first()
        if sk:
            rs = ResourceSkill(
                id=str(uuid.uuid4()),
                resource_id=res.id,
                skill_id=sk.id,
                relevance_weight=1.0,
                coverage_level="comprehensive",
                is_primary=True
            )
            db.add(rs)
        db.commit()
        db.refresh(res)
    return res


# ============================================================================
# 1. Course Syllabus Creation & Nested Hierarchy
# ============================================================================

def test_stage1_01_create_valid_course_syllabus(test_db):
    course = get_or_create_test_course(test_db, f"valid-create-course-{uuid.uuid4().hex[:6]}")
    engine = SyllabusEngine(test_db)

    syllabus_payload = {
        "course_id": course.id,
        "title": "Systems Engineering Syllabus v1",
        "description": "Comprehensive engineering syllabus",
        "version": 1,
        "language": "English",
        "source": "OFFICIAL_PROVIDER",
        "provider": "NPTEL",
        "verification_status": "VERIFIED",
        "modules": [
            {
                "title": "Module 1: Foundations",
                "description": "Basic concepts",
                "order_index": 1,
                "weight": 50.0,
                "estimated_learning_hours": 10.0,
                "topics": [
                    {
                        "title": "Topic 1.1: System Architecture",
                        "description": "Architectural principles",
                        "order_index": 1,
                        "weight": 100.0,
                        "difficulty": "Beginner",
                        "estimated_learning_hours": 5.0,
                        "subtopics": [
                            {"title": "Subtopic 1: Component Models", "description": "Modularity", "order_index": 1, "difficulty": "Beginner"}
                        ],
                        "objectives": [
                            {"objective": "Understand component modularity", "objective_type": "UNDERSTAND", "skill_ids": ["python"], "difficulty": "Beginner", "importance": "HIGH"},
                            {"objective": "Implement system diagram", "objective_type": "IMPLEMENT", "skill_ids": ["python"], "difficulty": "Intermediate", "importance": "HIGH"}
                        ],
                        "skills": []
                    }
                ]
            },
            {
                "title": "Module 2: Applied Engineering",
                "description": "Practical application",
                "order_index": 2,
                "weight": 50.0,
                "estimated_learning_hours": 10.0,
                "topics": [
                    {
                        "title": "Topic 2.1: Verification & Testing",
                        "description": "System testing",
                        "order_index": 1,
                        "weight": 100.0,
                        "difficulty": "Intermediate",
                        "estimated_learning_hours": 5.0,
                        "subtopics": [],
                        "objectives": [
                            {"objective": "Analyze test coverage", "objective_type": "ANALYZE", "skill_ids": [], "difficulty": "Intermediate", "importance": "MEDIUM"}
                        ],
                        "skills": []
                    }
                ]
            }
        ]
    }

    create_schema = CourseSyllabusCreate.model_validate(syllabus_payload)
    new_syllabus, is_valid, errors = engine.create_syllabus(create_schema)

    assert is_valid is True
    assert len(errors) == 0
    assert new_syllabus.id is not None
    assert new_syllabus.version == 1
    assert len(new_syllabus.modules) == 2
    assert len(new_syllabus.modules[0].topics) == 1
    assert len(new_syllabus.modules[0].topics[0].objectives) == 2
    assert len(new_syllabus.modules[0].topics[0].subtopics) == 1


# ============================================================================
# 2. Retrieval via API & Modules/Topics
# ============================================================================

def test_stage1_02_api_retrieval_and_modules(test_db):
    course = get_or_create_test_course(test_db, "api-retrieval-course")
    engine = SyllabusEngine(test_db)
    
    # Ensure syllabus exists
    existing = engine.get_active_syllabus(course.id)
    if not existing:
        py_payload = {
            "course_id": course.id,
            "title": "API Test Syllabus",
            "version": 1,
            "modules": [{
                "title": "Module 1", "order_index": 1, "weight": 100.0,
                "topics": [{
                    "title": "Topic 1", "order_index": 1, "weight": 100.0,
                    "difficulty": "Beginner",
                    "objectives": [{"objective": "Understand basics", "objective_type": "UNDERSTAND"}]
                }]
            }]
        }
        engine.create_syllabus(CourseSyllabusCreate.model_validate(py_payload))

    # 1. GET /api/v1/courses/{course_id}/syllabus
    res = client.get(f"/api/v1/courses/{course.id}/syllabus")
    assert res.status_code == 200
    data = res.json()
    assert data["title"] == "API Test Syllabus"
    assert len(data["modules"]) == 1

    # 2. GET /api/v1/courses/{course_id}/syllabus/modules
    res_mod = client.get(f"/api/v1/courses/{course.id}/syllabus/modules")
    assert res_mod.status_code == 200
    assert len(res_mod.json()) == 1
    assert res_mod.json()[0]["title"] == "Module 1"

    # 3. GET /api/v1/courses/{course_id}/syllabus/topics
    res_top = client.get(f"/api/v1/courses/{course.id}/syllabus/topics")
    assert res_top.status_code == 200
    assert len(res_top.json()) == 1
    assert res_top.json()[0]["title"] == "Topic 1"


# ============================================================================
# 3. Weight Normalization Validation
# ============================================================================

def test_stage1_03_weight_normalization_enforcement():
    # 1. Module weights sum to 80% (invalid: must be 100%)
    invalid_mod_weights = {
        "course_id": "c1",
        "title": "Invalid Weights",
        "modules": [
            {
                "title": "Mod 1", "order_index": 1, "weight": 40.0,
                "topics": [{"title": "T1", "order_index": 1, "weight": 100.0, "difficulty": "Beginner"}]
            },
            {
                "title": "Mod 2", "order_index": 2, "weight": 40.0,  # Sum is 80, not 100
                "topics": [{"title": "T2", "order_index": 1, "weight": 100.0, "difficulty": "Beginner"}]
            }
        ]
    }
    is_valid, errors = SyllabusValidator.validate_syllabus_data(invalid_mod_weights)
    assert is_valid is False
    assert any("Module weights in syllabus must sum to 100.0%" in e for e in errors)

    # 2. Topic weights sum to 70% within module (invalid)
    invalid_topic_weights = {
        "course_id": "c1",
        "title": "Invalid Topic Weights",
        "modules": [
            {
                "title": "Mod 1", "order_index": 1, "weight": 100.0,
                "topics": [
                    {"title": "T1", "order_index": 1, "weight": 35.0, "difficulty": "Beginner"},
                    {"title": "T2", "order_index": 2, "weight": 35.0, "difficulty": "Beginner"}  # Sum = 70
                ]
            }
        ]
    }
    is_valid, errors = SyllabusValidator.validate_syllabus_data(invalid_topic_weights)
    assert is_valid is False
    assert any("Topic weights in module 'Mod 1' must sum to 100.0%" in e for e in errors)


# ============================================================================
# 4. Invalid Input Rejection (Duplicate Topics, Empty Modules, Objective Types)
# ============================================================================

def test_stage1_04_invalid_input_rejection():
    # 1. Empty module
    payload_empty_mod = {
        "course_id": "c1",
        "title": "Empty Mod",
        "modules": [{"title": "Empty Module", "order_index": 1, "weight": 100.0, "topics": []}]
    }
    is_val, errs = SyllabusValidator.validate_syllabus_data(payload_empty_mod)
    assert is_val is False
    assert any("contains no topics" in e for e in errs)

    # 2. Duplicate topic title in same module
    payload_dup_topic = {
        "course_id": "c1",
        "title": "Dup Topic",
        "modules": [{
            "title": "Module 1", "order_index": 1, "weight": 100.0,
            "topics": [
                {"title": "Algorithms", "order_index": 1, "weight": 50.0, "difficulty": "Beginner"},
                {"title": "algorithms", "order_index": 2, "weight": 50.0, "difficulty": "Beginner"}
            ]
        }]
    }
    is_val, errs = SyllabusValidator.validate_syllabus_data(payload_dup_topic)
    assert is_val is False
    assert any("Duplicate topic title" in e for e in errs)

    # 3. Invalid objective type
    payload_invalid_obj = {
        "course_id": "c1",
        "title": "Invalid Objective",
        "modules": [{
            "title": "Module 1", "order_index": 1, "weight": 100.0,
            "topics": [{
                "title": "Algorithms", "order_index": 1, "weight": 100.0, "difficulty": "Beginner",
                "objectives": [{"objective": "Dream about algorithms", "objective_type": "DREAM_MAGICAL"}]
            }]
        }]
    }
    is_val, errs = SyllabusValidator.validate_syllabus_data(payload_invalid_obj)
    assert is_val is False
    assert any("invalid type 'DREAM_MAGICAL'" in e for e in errs)


# ============================================================================
# 5. Skill Mapping Integration with Existing Skill Graph
# ============================================================================

def test_stage1_05_skill_mapping_integration(test_db):
    course = get_or_create_test_course(test_db, "skill-mapping-course")
    engine = SyllabusEngine(test_db)
    
    # Retrieve existing skill
    py_skill = test_db.query(Skill).filter(Skill.slug == "python").first()
    assert py_skill is not None

    payload = {
        "course_id": course.id,
        "title": "Python Graph Mapped Course",
        "modules": [{
            "title": "Core Module", "order_index": 1, "weight": 100.0,
            "topics": [{
                "title": "Scripting Topic", "order_index": 1, "weight": 100.0, "difficulty": "Beginner",
                "objectives": [{"objective": "Write scripts", "objective_type": "IMPLEMENT", "skill_ids": [py_skill.slug]}],
                "skills": [{"skill_id": py_skill.id, "relationship_type": "REQUIRED", "importance": 1.0, "confidence": 0.95}]
            }]
        }]
    }
    new_syl, is_val, _ = engine.create_syllabus(CourseSyllabusCreate.model_validate(payload))
    assert is_val is True
    
    topic = new_syl.modules[0].topics[0]
    assert len(topic.topic_skills) == 1
    assert topic.topic_skills[0].skill_id == py_skill.id
    assert topic.topic_skills[0].relationship_type == "REQUIRED"


# ============================================================================
# 6. Provenance & Verification Tracking
# ============================================================================

def test_stage1_06_provenance_and_verification_tracking(test_db):
    course = get_or_create_test_course(test_db, "provenance-course")
    engine = SyllabusEngine(test_db)

    payload = {
        "course_id": course.id,
        "title": "IIT Madras Certified Course",
        "source": "INSTITUTION",
        "source_url": "https://nptel.ac.in/courses/106/106/106106182/",
        "provider": "NPTEL / IIT Madras",
        "verification_status": "VERIFIED",
        "modules": [{
            "title": "Module 1", "order_index": 1, "weight": 100.0,
            "topics": [{"title": "Topic 1", "order_index": 1, "weight": 100.0, "difficulty": "Intermediate"}]
        }]
    }
    syl, is_val, _ = engine.create_syllabus(CourseSyllabusCreate.model_validate(payload))
    assert syl.source == "INSTITUTION"
    assert syl.provider == "NPTEL / IIT Madras"
    assert syl.verification_status == "VERIFIED"
    assert syl.retrieved_at is not None


# ============================================================================
# 7. Syllabus Versioning & Historical Integrity
# ============================================================================

def test_stage1_07_syllabus_versioning_and_history(test_db):
    course = get_or_create_test_course(test_db, f"versioning-course-{uuid.uuid4().hex[:6]}")
    engine = SyllabusEngine(test_db)

    # 1. Create Version 1
    p1 = {
        "course_id": course.id,
        "title": "Syllabus Version 1",
        "modules": [{
            "title": "Mod 1", "order_index": 1, "weight": 100.0,
            "topics": [{"title": "Top 1", "order_index": 1, "weight": 100.0, "difficulty": "Beginner"}]
        }]
    }
    s1, _, _ = engine.create_syllabus(CourseSyllabusCreate.model_validate(p1))
    assert s1.version == 1
    assert s1.is_active is True

    # 2. Create Version 2 for same course
    p2 = {
        "course_id": course.id,
        "title": "Syllabus Version 2 (Revised Curriculum)",
        "modules": [{
            "title": "Mod 1 Updated", "order_index": 1, "weight": 100.0,
            "topics": [{"title": "Top 1 Updated", "order_index": 1, "weight": 100.0, "difficulty": "Intermediate"}]
        }]
    }
    s2, _, _ = engine.create_syllabus(CourseSyllabusCreate.model_validate(p2))
    assert s2.version == 2
    assert s2.is_active is True

    # Version 1 must now be deactivated but preserved intact
    test_db.refresh(s1)
    assert s1.is_active is False
    assert s1.title == "Syllabus Version 1"

    # Historical query by version
    s_hist = engine.get_syllabus_by_version(course.id, version=1)
    assert s_hist is not None
    assert s_hist.title == "Syllabus Version 1"

    # Active query returns Version 2
    s_active = engine.get_active_syllabus(course.id)
    assert s_active.version == 2


# ============================================================================
# 8. Coverage Calculation & 9. Course State Transitions
# ============================================================================

def test_stage1_08_09_coverage_and_course_state_transitions(test_db):
    auth = get_demo_auth()
    
    # 1. Initial coverage on python-data-science-bootcamp
    cov_res = client.get("/api/v1/courses/python-data-science-bootcamp/syllabus/coverage", headers=auth)
    assert cov_res.status_code == 200
    cov = cov_res.json()
    assert cov["total_modules"] >= 2
    assert "course_state" in cov

    # 2. Get syllabus topics to get valid topic IDs
    syl_res = client.get("/api/v1/courses/python-data-science-bootcamp/syllabus")
    assert syl_res.status_code == 200
    syl = syl_res.json()
    
    all_topics = []
    for m in syl["modules"]:
        for t in m["topics"]:
            all_topics.append((m["id"], t["id"]))

    assert len(all_topics) >= 2

    # 3. Mark all topics complete to reach ASSESSMENT_READY (>= 80%)
    for m_id, t_id in all_topics:
        client.post(
            "/api/v1/courses/python-data-science-bootcamp/syllabus/progress",
            json={"topic_id": t_id, "is_topic_completed": True, "module_id": m_id, "is_module_completed": True},
            headers=auth
        )

    # Check updated coverage
    final_cov_res = client.get("/api/v1/courses/python-data-science-bootcamp/syllabus/coverage", headers=auth)
    assert final_cov_res.status_code == 200
    final_cov = final_cov_res.json()
    assert final_cov["weighted_coverage_pct"] >= 80.0
    assert final_cov["course_state"] == "ASSESSMENT_READY"
    assert final_cov["is_assessment_ready"] is True


# ============================================================================
# 10. Authorization & IDOR Protection
# ============================================================================

def test_stage1_10_authorization_and_idor_protection(test_db):
    auth_a = get_demo_auth()

    # User B
    user_b_email = "syllabus_victim@test.demo"
    user_b = test_db.query(User).filter(User.email == user_b_email).first()
    if not user_b:
        user_b = User(email=user_b_email, hashed_password=hash_password("pw123"), full_name="User B")
        test_db.add(user_b)
        test_db.commit()
        test_db.refresh(user_b)

    token_b = create_access_token(user_b.id)
    auth_b = {"Authorization": f"Bearer {token_b}"}
    client.cookies.clear()

    # Coverage for User B should be independent (NOT_STARTED, 0% complete)
    cov_b_res = client.get("/api/v1/courses/python-data-science-bootcamp/syllabus/coverage", headers=auth_b)
    assert cov_b_res.status_code == 200
    cov_b = cov_b_res.json()
    assert cov_b["completed_topics"] == 0
    assert cov_b["course_state"] == "NOT_STARTED"


# ============================================================================
# 11. Multi-Domain Support (VLSI, Mechanical, Commerce)
# ============================================================================

def test_stage1_11_multi_domain_support(test_db):
    engine = SyllabusEngine(test_db)

    # Verify VLSI syllabus exists and is valid
    vlsi_syl = engine.get_active_syllabus("vlsi-design-verilog")
    assert vlsi_syl is not None
    assert "Verilog" in vlsi_syl.title
    assert vlsi_syl.validation_status == "VALID"
    assert len(vlsi_syl.modules) == 2

    # Verify Mechanical CAD syllabus exists and is valid
    cad_syl = engine.get_active_syllabus("solidworks-mechanical-cad")
    assert cad_syl is not None
    assert "Mechanical" in cad_syl.title
    assert cad_syl.validation_status == "VALID"

    # Verify Financial Valuation syllabus exists and is valid
    fin_syl = engine.get_active_syllabus("financial-accounting-valuation")
    assert fin_syl is not None
    assert "Valuation" in fin_syl.title
    assert fin_syl.validation_status == "VALID"


# ============================================================================
# 12. AI-Assisted Extraction Fallback & Proposal Normalizer
# ============================================================================

def test_stage1_12_ai_assisted_extraction_proposal():
    raw_course_text = """
    Module 1: Introduction to Microservices
    - Microservice architecture patterns
    - Service discovery and API gateways
    Module 2: Containerization & Kubernetes
    - Docker container builds and multi-stage Dockerfiles
    - Kubernetes Pods, Deployments, and Services
    """

    proposal = SyllabusEngine.extract_ai_syllabus_proposal(
        course_title="Cloud Native Microservices",
        raw_text=raw_course_text,
        course_id="cloud-native-101",
        provider="Coursera / Cloud Native"
    )

    assert proposal["source"] == "AI_ASSISTED_EXTRACTION"
    assert proposal["verification_status"] == "AI_ASSISTED"
    assert len(proposal["modules"]) == 2
    assert proposal["modules"][0]["weight"] + proposal["modules"][1]["weight"] == 100.0
    
    # Check validator confirms the proposal is mathematically valid
    is_valid, errors = SyllabusValidator.validate_syllabus_data(proposal)
    assert is_valid is True
    assert len(errors) == 0


# ============================================================================
# 13. AI Extraction API Endpoint
# ============================================================================

def test_stage1_13_ai_extract_api_endpoint():
    auth = get_demo_auth()
    req_body = {
        "course_title": "Full Stack Next.js Development",
        "raw_content": "Chapter 1: Server Components\n- Streaming and Suspense\nChapter 2: API Route Handlers\n- Dynamic routing and middleware",
        "provider": "Vercel Academy"
    }

    res = client.post(
        "/api/v1/courses/python-data-science-bootcamp/syllabus/ai-extract",
        json=req_body,
        headers=auth
    )
    assert res.status_code == 200
    data = res.json()
    assert data["is_ai_assisted"] is True
    assert data["syllabus_proposal"]["source"] == "AI_ASSISTED_EXTRACTION"
    assert len(data["syllabus_proposal"]["modules"]) == 2


# ============================================================================
# 14. UI/UX Designer Multi-Course Syllabus Verification
# ============================================================================

def test_stage1_14_ui_ux_designer_syllabus_support(test_db):
    engine = SyllabusEngine(test_db)

    # 1. CalArts Graphic Design & Typography
    calarts = engine.get_active_syllabus("calarts-graphic-design-typography")
    assert calarts is not None
    assert "Typography" in calarts.title or "CalArts" in calarts.title
    assert calarts.validation_status == "VALID"
    assert len(calarts.modules) == 4
    total_mod_weight = sum(m.weight for m in calarts.modules)
    assert abs(total_mod_weight - 100.0) < 0.5
    for m in calarts.modules:
        topic_sum = sum(t.weight for t in m.topics)
        assert abs(topic_sum - 100.0) < 0.5

    # 2. Query by course ID (UUID) through API endpoint
    res = test_db.query(LearningResource).filter(LearningResource.slug == "calarts-graphic-design-typography").first()
    assert res is not None
    api_res = client.get(f"/api/v1/courses/{res.id}/syllabus")
    assert api_res.status_code == 200
    syl_data = api_res.json()
    assert syl_data["id"] == calarts.id
    assert syl_data["total_modules"] == 4

    # 3. Google UX Design Certificate
    g_syl = engine.get_active_syllabus("google-ux-design-specialization")
    assert g_syl is not None
    assert g_syl.validation_status == "VALID"
    assert len(g_syl.modules) == 4

    # 4. Figma UI/UX Design Masterclass
    f_syl = engine.get_active_syllabus("figma-ui-ux-design-masterclass")
    assert f_syl is not None
    assert f_syl.validation_status == "VALID"
    assert len(f_syl.modules) == 3


# ============================================================================
# 15. Universal Fallback & Extended Catalog Auto-Synthesis
# ============================================================================

def test_stage1_15_universal_fallback_and_extended_registry(test_db):
    auth = get_demo_auth()

    # 1. Query extended registry resource by ID
    res = client.get("/api/v1/courses/res-ext-nptel-py/syllabus")
    assert res.status_code == 200
    data = res.json()
    assert data["total_modules"] == 4
    assert data["is_active"] is True
    assert data["total_estimated_hours"] > 0

    # 2. Coverage calculation on auto-synthesized course
    cov_res = client.get("/api/v1/courses/res-ext-nptel-py/syllabus/coverage", headers=auth)
    assert cov_res.status_code == 200
    cov_data = cov_res.json()
    assert cov_data["total_modules"] == 4
    assert cov_data["course_state"] in ("NOT_STARTED", "IN_PROGRESS", "ASSESSMENT_READY")

    # 3. Dynamic course without any pre-defined template
    unique_slug = f"dynamic-course-{uuid.uuid4().hex[:6]}"
    dyn_res = LearningResource(
        id=str(uuid.uuid4()),
        title="Custom Advanced Autonomous Robotics",
        slug=unique_slug,
        description="Path planning, SLAM algorithms, and kinematics.",
        provider="Robotics Institute",
        url=f"https://example.com/courses/{unique_slug}",
        resource_type="course",
        difficulty="Advanced",
        estimated_hours=20.0
    )
    test_db.add(dyn_res)
    test_db.commit()

    # Fetch syllabus - engine must dynamically synthesize a valid 4-module syllabus
    dyn_syl_res = client.get(f"/api/v1/courses/{unique_slug}/syllabus")
    assert dyn_syl_res.status_code == 200
    dyn_syl = dyn_syl_res.json()
    assert dyn_syl["total_modules"] == 4
    assert dyn_syl["total_topics"] == 8
    assert dyn_syl["validation_status"] == "VALID"


# ============================================================================
# 16. Verified Course Catalog & Arbitrary UUID Universal Fallback
# ============================================================================

def test_stage1_16_verified_course_catalog_and_arbitrary_uuid_fallback(test_db):
    auth = get_demo_auth()

    # 1. UI/UX course from VERIFIED_COURSE_CATALOG by ID
    res = client.get("/api/v1/courses/crs-des-calarts/syllabus")
    assert res.status_code == 200
    data = res.json()
    assert data["total_modules"] == 4
    assert data["is_active"] is True
    assert "Design" in data["title"] or "CalArts" in data["title"]

    # 2. DSA course from VERIFIED_COURSE_CATALOG by slug
    res = client.get("/api/v1/courses/mit-6006-intro-algorithms/syllabus")
    assert res.status_code == 200
    assert res.json()["total_modules"] >= 3

    # 3. Completely arbitrary UUID (simulating user screenshot navigation)
    random_uuid = str(uuid.uuid4())
    res = client.get(f"/api/v1/courses/{random_uuid}/syllabus")
    assert res.status_code == 200
    arb_data = res.json()
    assert arb_data["total_modules"] == 4
    assert arb_data["total_topics"] == 8
    assert arb_data["validation_status"] == "VALID"

    # 4. Coverage calculation for arbitrary UUID
    cov_res = client.get(f"/api/v1/courses/{random_uuid}/syllabus/coverage", headers=auth)
    assert cov_res.status_code == 200
    assert cov_res.json()["total_modules"] == 4


