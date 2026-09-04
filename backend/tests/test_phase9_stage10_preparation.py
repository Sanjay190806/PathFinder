import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.database import SessionLocal
from backend.app.models.user import User
from backend.app.models.opportunity import Opportunity
from backend.app.preparation.preparation_scorer import PreparationScorer
from backend.app.preparation.question_engine import QuestionEngine
from backend.app.preparation.interview_engine import InterviewEngine
from backend.app.preparation.resume_intelligence import ResumeIntelligence
from backend.app.preparation.portfolio_readiness import PortfolioReadinessAuditor
from backend.app.preparation.application_readiness_engine import ApplicationReadinessEngine
from backend.app.preparation.preparation_plan import PreparationPlanEngine
from backend.app.preparation.preparation_history import PreparationHistoryTracker
from backend.app.preparation.preparation_engine import PreparationEngine

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


# 1. PreparationScorer 9 Dimensions and DecisionTrace
def test_stage10_01_preparation_scorer_9_dimensions(test_db):
    scorer = PreparationScorer(test_db)
    # Verify dimension weights sum to 1.0
    assert round(sum(scorer.DIMENSION_WEIGHTS.values()), 2) == 1.0
    assert len(scorer.DIMENSION_WEIGHTS) == 9

    demo_user = test_db.query(User).filter(User.email == "alex@pathfinder.demo").first()
    assert demo_user is not None

    score_result = scorer.calculate_preparation_score(demo_user.id)
    assert "overall_score" in score_result
    assert 0.0 <= score_result["overall_score"] <= 100.0
    assert score_result["readiness_level"] in ("LOW", "MODERATE", "GOOD", "APPLICATION_READY")

    # Verify all 9 dimensions are present
    dims = score_result["dimension_scores"]
    for dim in scorer.DIMENSION_WEIGHTS.keys():
        assert dim in dims
        assert 0.0 <= dims[dim] <= 100.0

    # Verify DecisionTrace
    trace = score_result["decision_trace"]
    assert trace["algorithm"] == "PreparationScorer_v1_Stage10"
    assert "inputs" in trace
    assert "formula" in trace


# 2. Adaptive Question Generation & Difficulty Scaling
def test_stage10_02_adaptive_question_generation(test_db):
    demo_user = test_db.query(User).filter(User.email == "alex@pathfinder.demo").first()
    q_engine = QuestionEngine(test_db)

    # Test difficulty tiers
    for diff in ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]:
        res = q_engine.generate_questions(
            learner_id=demo_user.id,
            category="TECHNICAL",
            difficulty=diff,
            count=2,
        )
        assert len(res["questions"]) >= 1
        assert res["questions"][0]["difficulty"] == diff
        assert "prompt" in res["questions"][0]
        assert "rubric" in res["questions"][0]

    # Test India Market category
    india_res = q_engine.generate_questions(
        learner_id=demo_user.id,
        category="INDIA_MARKET",
        count=2,
    )
    assert len(india_res["questions"]) >= 1
    assert india_res["questions"][0]["category"] == "INDIA_MARKET"


# 3. Mock Interview Chamber Turn-by-Turn Evaluation
def test_stage10_03_mock_interview_evaluation(test_db):
    demo_user = test_db.query(User).filter(User.email == "alex@pathfinder.demo").first()
    int_engine = InterviewEngine(test_db)

    # 1. Create Session
    session = int_engine.create_session(
        learner_id=demo_user.id,
        session_type="MIXED",
    )
    assert session["session_id"] is not None
    assert session["status"] == "IN_PROGRESS"
    assert len(session["questions"]) > 0

    first_q = session["questions"][0]

    # 2. Submit Turn Response
    turn_res = int_engine.submit_turn(
        session_id=session["session_id"],
        question_id=first_q["id"],
        response_text=(
            "First, I evaluate system trade-offs between memory footprint and latency. "
            "In our FastAPI service, we implemented Redis connection pooling and B-Tree indexes, "
            "optimizing P99 latency by 35% under high concurrency and distributed scale."
        ),
    )
    assert turn_res["session_id"] == session["session_id"]
    eval_data = turn_res["turn_evaluation"]
    assert "technical_accuracy" in eval_data
    assert "depth_clarity" in eval_data
    assert "structure_framework" in eval_data
    assert "confidence_language" in eval_data
    assert "india_market_relevance" in eval_data
    assert "overall_turn_score" in eval_data
    assert eval_data["overall_turn_score"] > 60.0
    assert len(eval_data["strengths"]) > 0
    assert eval_data["model_answer"] is not None


# 4. Resume Intelligence ATS Audit & Evidence Mapping
def test_stage10_04_resume_intelligence_audit(test_db):
    demo_user = test_db.query(User).filter(User.email == "alex@pathfinder.demo").first()
    resume_eng = ResumeIntelligence(test_db)

    sample_resume = (
        "Software Engineer with experience in Python, REST API, and Docker. "
        "Engineered scalable microservices reducing P99 latency by 40% and handled 10k requests per second. "
        "Automated CI/CD pipelines with comprehensive unit tests."
    )
    audit = resume_eng.audit_resume(
        learner_id=demo_user.id,
        resume_text=sample_resume,
        career_id="Software Engineer",
    )
    assert audit["ats_score"] > 50.0
    assert "matched_keywords" in audit["keyword_coverage"]
    assert audit["action_verb_strength"] > 40.0
    assert audit["quantification_score"] > 40.0
    assert len(audit["enhancement_suggestions"]) > 0
    # Enhancements cite verified work
    assert "suggested_bullet" in audit["enhancement_suggestions"][0]


# 5. Portfolio Readiness Audit
def test_stage10_05_portfolio_readiness_audit(test_db):
    demo_user = test_db.query(User).filter(User.email == "alex@pathfinder.demo").first()
    port_auditor = PortfolioReadinessAuditor(test_db)

    audit = port_auditor.audit_portfolio(demo_user.id)
    assert 0.0 <= audit["portfolio_score"] <= 100.0
    assert "completeness_score" in audit
    assert "project_depth_score" in audit
    assert "readme_quality_score" in audit
    assert "live_demo_score" in audit
    assert "test_coverage_score" in audit
    assert len(audit["recommended_portfolio_upgrades"]) > 0


# 6. Opportunity Requirement-to-Evidence Matrix & Application States
def test_stage10_06_opportunity_requirement_matrix(test_db):
    demo_user = test_db.query(User).filter(User.email == "alex@pathfinder.demo").first()
    opp = test_db.query(Opportunity).filter(Opportunity.is_active == True).first()
    assert opp is not None

    app_eng = ApplicationReadinessEngine(test_db)
    prep = app_eng.evaluate_opportunity_prep(demo_user.id, opp.id)

    assert prep["opportunity_id"] == opp.id
    assert prep["application_state"] in ("DISCOVERY", "PREPARING", "READY_TO_APPLY", "APPLIED")
    assert len(prep["requirement_evidence_matrix"]) > 0
    # Verify each requirement has status MET, PARTIAL, or MISSING
    for item in prep["requirement_evidence_matrix"]:
        assert item["status"] in ("MET", "PARTIAL", "MISSING")
        assert "evidence_found" in item
        assert "source" in item
    assert "company_prep_brief" in prep
    assert len(prep["tailored_resume_tips"]) > 0


# 7. Preparation Plan Engine
def test_stage10_07_preparation_plan_engine(test_db):
    demo_user = test_db.query(User).filter(User.email == "alex@pathfinder.demo").first()
    plan_eng = PreparationPlanEngine(test_db)

    plan = plan_eng.generate_preparation_plan(demo_user.id)
    assert "plan_items" in plan
    assert len(plan["plan_items"]) >= 2
    assert plan["estimated_days_to_ready"] > 0
    assert "priority_focus" in plan


# 8. Historical Tracking & Snapshots
def test_stage10_08_preparation_history_snapshots(test_db):
    demo_user = test_db.query(User).filter(User.email == "alex@pathfinder.demo").first()
    tracker = PreparationHistoryTracker(test_db)

    snapshot = tracker.record_snapshot(
        learner_id=demo_user.id,
        overall_score=78.5,
        dimension_scores={"technical_readiness": 80.0, "resume_ats": 75.0},
        identified_gaps=[{"title": "System design"}],
        recommended_actions=[{"title": "Practice STAR questions"}],
    )
    assert snapshot.id is not None
    assert snapshot.overall_score == 78.5

    history = tracker.get_learner_history(demo_user.id)
    assert len(history) >= 1
    assert history[0]["overall_score"] == 78.5


# 9. API Auth & Endpoints Integration
def test_stage10_09_api_endpoints():
    # 401 Unauthenticated check
    unauth_res = client.get("/api/v1/preparation/readiness")
    assert unauth_res.status_code == 401

    headers = get_demo_auth()

    # GET /readiness
    readiness_res = client.get("/api/v1/preparation/readiness", headers=headers)
    assert readiness_res.status_code == 200
    assert "overall_score" in readiness_res.json()

    # GET /gaps
    gaps_res = client.get("/api/v1/preparation/gaps", headers=headers)
    assert gaps_res.status_code == 200
    assert "gaps_by_category" in gaps_res.json()

    # POST /questions
    questions_res = client.post(
        "/api/v1/preparation/questions",
        json={"category": "TECHNICAL", "difficulty": "INTERMEDIATE", "count": 3},
        headers=headers,
    )
    assert questions_res.status_code == 200
    assert len(questions_res.json()["questions"]) == 3

    # POST /mock-interview/sessions
    start_res = client.post(
        "/api/v1/preparation/mock-interview/sessions",
        json={"session_type": "MIXED"},
        headers=headers,
    )
    assert start_res.status_code == 200
    session_id = start_res.json()["session_id"]
    q_id = start_res.json()["questions"][0]["id"]

    # POST /mock-interview/sessions/{session_id}/turn
    turn_res = client.post(
        f"/api/v1/preparation/mock-interview/sessions/{session_id}/turn",
        json={"question_id": q_id, "response_text": "I utilized STAR methodology to optimize database latency by 30%."},
        headers=headers,
    )
    assert turn_res.status_code == 200
    assert "turn_evaluation" in turn_res.json()

    # GET /mock-interview/sessions/{session_id}
    get_sess_res = client.get(f"/api/v1/preparation/mock-interview/sessions/{session_id}", headers=headers)
    assert get_sess_res.status_code == 200
    assert get_sess_res.json()["session_id"] == session_id

    # POST /resume/audit
    resume_res = client.post(
        "/api/v1/preparation/resume/audit",
        json={"resume_text": "Backend Engineer with Python and Docker experience. Reduced latency by 20%."},
        headers=headers,
    )
    assert resume_res.status_code == 200
    assert "ats_score" in resume_res.json()

    # GET /portfolio/audit
    port_res = client.get("/api/v1/preparation/portfolio/audit", headers=headers)
    assert port_res.status_code == 200
    assert "portfolio_score" in port_res.json()

    # GET /plan
    plan_res = client.get("/api/v1/preparation/plan", headers=headers)
    assert plan_res.status_code == 200
    assert "plan_items" in plan_res.json()

    # GET /history
    hist_res = client.get("/api/v1/preparation/history", headers=headers)
    assert hist_res.status_code == 200
    assert isinstance(hist_res.json(), list)


# 10. AI Coach Integration with Preparation Intents
def test_stage10_10_coach_preparation_intent():
    headers = get_demo_auth()

    # Mock interview query
    res1 = client.post(
        "/api/v1/ai/chat",
        json={"message": "Can you give me mock interview practice for my role?"},
        headers=headers,
    )
    assert res1.status_code == 200
    assert "interview" in res1.json()["reply"].lower()

    # Resume ATS query
    res2 = client.post(
        "/api/v1/ai/chat",
        json={"message": "What is my resume ATS score and keywords?"},
        headers=headers,
    )
    assert res2.status_code == 200
    assert "resume" in res2.json()["reply"].lower() or "ats" in res2.json()["reply"].lower()
