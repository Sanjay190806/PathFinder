import pytest
import uuid
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.database import SessionLocal
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.models.opportunity import Opportunity
from backend.app.models.goal import Goal
from backend.app.opportunities.opportunity_engine import OpportunityEngine, BaseOpportunityProvider, CuratedRegistryProvider
from backend.app.ai.coach import AICoach

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

# 1. Provider Abstraction & 2. Normalization
def test_stage9_01_02_provider_abstraction_and_normalization(test_db):
    class MockProvider(BaseOpportunityProvider):
        def fetch_opportunities(self):
            return [{
                "slug": "mock-test-fellowship",
                "title": "Mock AI Research Fellowship",
                "company_name": "IISc Bangalore",
                "role_category": "Research Fellow",
                "required_skills": ["python", "machine-learning"],
                "preferred_skills": ["pytorch"],
                "min_experience_level": "Undergraduate",
                "location_type": "Onsite",
                "salary_range": "₹35,000 / month",
                "description": "Fundamental machine learning research fellowship.",
                "opportunity_type": "Fellowship",
                "country": "India",
                "state": "Karnataka",
                "city": "Bangalore",
                "min_education_stage": "Undergraduate",
                "eligible_streams": ["Computer Science", "ECE"],
                "verification_status": "VERIFIED",
                "freshness": "FRESH"
            }]
    engine = OpportunityEngine(test_db, provider=MockProvider())
    opps = engine.list_opportunities(role="Research Fellow")
    assert len(opps) > 0
    assert opps[0].title == "Mock AI Research Fellowship"
    assert opps[0].country == "India"
    assert opps[0].city == "Bangalore"

# 3. Current Search (Discover)
def test_stage9_03_current_search(test_db):
    engine = OpportunityEngine(test_db)
    results = engine.discover_opportunities(career="Data Analyst")
    assert len(results) > 0
    assert any("Data Analyst" in r.role_category for r in results)

# 4. Opportunity Verification Status & 5. Freshness
def test_stage9_04_05_verification_and_freshness(test_db):
    engine = OpportunityEngine(test_db)
    opps = engine.list_opportunities()
    assert len(opps) > 0
    for o in opps:
        assert o.verification_status in ("VERIFIED", "PARTIALLY_VERIFIED", "UNVERIFIED", "UNAVAILABLE")
        assert o.freshness in ("FRESH", "RECENT", "AGING", "STALE", "EXPIRED")

# 6. Expiration Handling & 20. Unavailable Source Exclusion
def test_stage9_06_20_expiration_and_unavailable_exclusion(test_db):
    # Ensure unavailable opps are excluded from learner matching
    existing_unav = test_db.query(Opportunity).filter(Opportunity.slug == "unavail-test-opp").first()
    if not existing_unav:
        unav = Opportunity(
            slug="unavail-test-opp",
            title="Expired Dead Opportunity",
            company_name="Unavailable Inc",
            role_category="Full Stack Developer",
            description="Unavailable listing",
            opportunity_type="Job",
            verification_status="UNAVAILABLE",
            is_active=True
        )
        test_db.add(unav)
        test_db.commit()

    get_demo_auth()
    demo_user = test_db.query(User).filter(User.email == "alex@pathfinder.demo").first()
    engine = OpportunityEngine(test_db)
    matches = engine.match_opportunities(demo_user.profile.id)
    assert all(m.opportunity.slug != "unavail-test-opp" for m in matches)

# 7. Duplicate Handling
def test_stage9_07_duplicate_handling(test_db):
    engine = OpportunityEngine(test_db)
    before_count = test_db.query(Opportunity).count()
    engine._ensure_opportunities()
    after_count = test_db.query(Opportunity).count()
    assert before_count == after_count

# 8. India Filtering (Chennai, Bangalore, Hyderabad)
def test_stage9_08_india_filtering(test_db):
    engine = OpportunityEngine(test_db)
    chennai_opps = engine.discover_opportunities(city="Chennai")
    assert len(chennai_opps) > 0
    assert all(o.city == "Chennai" for o in chennai_opps)

    bangalore_opps = engine.discover_opportunities(city="Bangalore")
    assert len(bangalore_opps) > 0
    assert all(o.city == "Bangalore" for o in bangalore_opps)

# 9. Skill Matching
def test_stage9_09_skill_matching(test_db):
    engine = OpportunityEngine(test_db)
    python_opps = engine.discover_opportunities(skill="python")
    assert len(python_opps) > 0
    for o in python_opps:
        assert any("python" in s.lower() for s in o.required_skills)

# 10. Education Matching & 14. Hard Constraints
def test_stage9_10_14_education_matching_and_hard_constraints(test_db):
    # Create school learner (Class 9-10)
    school_user = test_db.query(User).filter(User.email == "school_test@pathfinder.io").first()
    if not school_user:
        school_user = User(email="school_test@pathfinder.io", hashed_password="pw", full_name="School Student")
        test_db.add(school_user)
        test_db.commit()
        test_db.refresh(school_user)

    school_prof = test_db.query(LearnerProfile).filter(LearnerProfile.user_id == school_user.id).first()
    if not school_prof:
        school_prof = LearnerProfile(
            user_id=school_user.id,
            education_stage="School Education",
            education_level="Secondary School (Classes 9-10)",
            education_stream="General"
        )
        test_db.add(school_prof)
        test_db.commit()
        test_db.refresh(school_prof)
    else:
        school_prof.education_stage = "School Education"
        test_db.commit()

    engine = OpportunityEngine(test_db)
    matches = engine.match_opportunities(school_prof.id)
    
    # Must NOT contain professional jobs requiring Undergraduate degree
    for m in matches:
        assert m.opportunity.min_education_stage.lower() not in ("undergraduate", "postgraduate")
        assert m.opportunity.opportunity_type in ("Competition", "Internship", "Fellowship", "Open Source")

# 11. Readiness Matching, 12. Practical Competency & 13. Portfolio Matching
def test_stage9_11_12_13_multi_factor_matching(test_db):
    get_demo_auth()
    demo_user = test_db.query(User).filter(User.email == "alex@pathfinder.demo").first()
    engine = OpportunityEngine(test_db)
    matches = engine.match_opportunities(demo_user.profile.id)
    assert len(matches) > 0
    top = matches[0]
    assert 0.0 <= top.match_score <= 100.0
    assert "skill_coverage" in top.factor_breakdown
    assert "theoretical_readiness" in top.factor_breakdown
    assert "portfolio_fit" in top.factor_breakdown

# 15. Recommendation Ordering (Sorted descending by match score)
def test_stage9_15_recommendation_ordering(test_db):
    get_demo_auth()
    demo_user = test_db.query(User).filter(User.email == "alex@pathfinder.demo").first()
    engine = OpportunityEngine(test_db)
    matches = engine.match_opportunities(demo_user.profile.id)
    scores = [m.match_score for m in matches]
    assert scores == sorted(scores, reverse=True)

# 16. Explanation (Why it matches + blockers)
def test_stage9_16_explanation_and_blockers(test_db):
    get_demo_auth()
    demo_user = test_db.query(User).filter(User.email == "alex@pathfinder.demo").first()
    engine = OpportunityEngine(test_db)
    matches = engine.match_opportunities(demo_user.profile.id)
    assert len(matches) > 0
    assert len(matches[0].match_reasons) > 0
    # Every match exposes match_reasons and structured blockers list
    assert isinstance(matches[0].blockers, list)

# 17. Authentication & 18. User Isolation
def test_stage9_17_18_auth_and_user_isolation():
    # Unauthenticated must be rejected with 401
    unauth_res = client.get("/api/v1/opportunities/recommended")
    assert unauth_res.status_code == 401

    # Authenticated succeeds
    headers = get_demo_auth()
    auth_res = client.get("/api/v1/opportunities/recommended", headers=headers)
    assert auth_res.status_code == 200
    assert isinstance(auth_res.json(), list)

# 19. Stale Data Handling
def test_stage9_19_stale_data_handling(test_db):
    engine = OpportunityEngine(test_db)
    opps = engine.list_opportunities()
    for o in opps:
        assert o.freshness is not None

# 21. No Fabricated Jobs (Strict database backing)
def test_stage9_21_no_fabricated_jobs(test_db):
    engine = OpportunityEngine(test_db)
    opps = engine.list_opportunities()
    db_count = test_db.query(Opportunity).filter(Opportunity.is_active == True).count()
    assert len(opps) == db_count

# 22. Coach Integration (Opportunity grounding via AI Coach)
def test_stage9_22_coach_integration(test_db):
    headers = get_demo_auth()
    res = client.post(
        "/api/v1/ai/chat",
        json={"message": "What internships and opportunities are available for me in Chennai?"},
        headers=headers
    )
    assert res.status_code == 200
    data = res.json()
    assert "internship" in data["reply"].lower() or "opportunit" in data["reply"].lower() or "chennai" in data["reply"].lower()

# 23. Application Handoff
def test_stage9_23_application_handoff(test_db):
    headers = get_demo_auth()
    opp = test_db.query(Opportunity).filter(Opportunity.is_active == True).first()
    assert opp is not None

    apply_res = client.post(
        f"/api/v1/opportunities/{opp.id}/apply",
        json={"cover_note": "Interested in applying via Stage 9 flow"},
        headers=headers
    )
    assert apply_res.status_code == 200
    app_data = apply_res.json()
    assert app_data["opportunity_id"] == opp.id
    assert app_data["status"] == "applied"
    assert app_data["handoff_url"] is not None

# 24. Multi-Domain Opportunity Matching (AI/ML, Data Analyst, VLSI, Cybersecurity, Competitions)
def test_stage9_24_multi_domain_matching(test_db):
    engine = OpportunityEngine(test_db)
    domains = {o.role_category for o in engine.list_opportunities()}
    assert any("AI/ML" in d for d in domains)
    assert any("Data Analyst" in d for d in domains)
    assert any("VLSI" in d for d in domains)
    assert any("Cybersecurity" in d for d in domains)
    assert any("Competition" in d for d in domains)
