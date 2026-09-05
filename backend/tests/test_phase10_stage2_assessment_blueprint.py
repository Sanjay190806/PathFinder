import pytest
import uuid
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.database import SessionLocal
from backend.app.models.user import User
from backend.app.models.resource import LearningResource, ResourceSkill
from backend.app.models.skill import Skill
from backend.app.models.syllabus import CourseSyllabus, SyllabusModule, SyllabusTopic, LearningObjective
from backend.app.models.assessment import AssessmentBlueprint, Assessment, AssessmentQuestion
from backend.app.schemas.assessment_blueprint import AssessmentBlueprintCreate, QuestionCreate
from backend.app.assessment.blueprint_engine import BlueprintEngine
from backend.app.assessment.coverage_validator import CoverageValidator
from backend.app.assessment.question_validator import QuestionValidator, QuestionValidationError
from backend.app.assessment.question_generator import QuestionGenerator

client = TestClient(app)


@pytest.fixture
def test_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.query(LearningResource).filter(LearningResource.slug.like("stage2-course-%")).delete(synchronize_session=False)
        db.commit()
        db.close()


def get_demo_auth():
    login_res = client.post("/api/v1/demo/login")
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def create_mock_syllabus(db, slug_prefix="stage2-course"):
    slug = f"{slug_prefix}-{uuid.uuid4().hex[:6]}"
    res = LearningResource(
        id=str(uuid.uuid4()),
        title="Full Stack Cloud Systems",
        slug=slug,
        description="Comprehensive course on full stack cloud engineering",
        provider="IIT Bombay",
        url=f"https://nptel.ac.in/courses/{slug}",
        resource_type="course",
        difficulty="Intermediate",
        estimated_hours=40.0,
        quality_score=0.92,
        language="English",
        price_type="GENUINELY_FREE",
        verification_status="VERIFIED"
    )
    db.add(res)
    db.flush()

    sk = db.query(Skill).first()
    if sk:
        db.add(ResourceSkill(
            id=str(uuid.uuid4()),
            resource_id=res.id,
            skill_id=sk.id,
            relevance_weight=1.0,
            coverage_level="comprehensive",
            is_primary=True
        ))

    syl = CourseSyllabus(
        id=str(uuid.uuid4()),
        course_id=res.id,
        version=1,
        title="Full Stack Cloud Systems Syllabus",
        is_active=True,
        source="INSTITUTION",
        provider="IIT Bombay",
        verification_status="VERIFIED"
    )
    db.add(syl)
    db.flush()

    # Module 1: 40% weight
    m1 = SyllabusModule(
        id=str(uuid.uuid4()),
        syllabus_id=syl.id,
        title="Backend Microservices",
        order_index=1,
        weight=40.0
    )
    db.add(m1)
    db.flush()

    t1 = SyllabusTopic(
        id=str(uuid.uuid4()),
        module_id=m1.id,
        title="FastAPI REST Architecture",
        order_index=1,
        weight=100.0,
        difficulty="Intermediate"
    )
    db.add(t1)
    db.flush()

    obj1 = LearningObjective(
        id=str(uuid.uuid4()),
        topic_id=t1.id,
        objective="Build scalable asynchronous microservices with dependency injection",
        objective_type="APPLICATION"
    )
    db.add(obj1)

    # Module 2: 60% weight
    m2 = SyllabusModule(
        id=str(uuid.uuid4()),
        syllabus_id=syl.id,
        title="Cloud Infrastructure & DevOps",
        order_index=2,
        weight=60.0
    )
    db.add(m2)
    db.flush()

    t2 = SyllabusTopic(
        id=str(uuid.uuid4()),
        module_id=m2.id,
        title="Docker & Kubernetes Orchestration",
        order_index=1,
        weight=100.0,
        difficulty="Advanced"
    )
    db.add(t2)
    db.flush()

    obj2 = LearningObjective(
        id=str(uuid.uuid4()),
        topic_id=t2.id,
        objective="Deploy declarative container pods with autoscaling policies",
        objective_type="SYNTHESIS"
    )
    db.add(obj2)

    db.commit()
    db.refresh(syl)
    return res, syl, [m1, m2], [t1, t2], [obj1, obj2]


# ============================================================================
# 1. Blueprint Creation & Syllabus Derivation
# ============================================================================

def test_stage2_01_blueprint_creation_from_syllabus(test_db):
    res, syl, modules, topics, objs = create_mock_syllabus(test_db, "blueprint-test")
    engine = BlueprintEngine(test_db)

    payload = AssessmentBlueprintCreate(
        course_id=res.id,
        syllabus_id=syl.id,
        title="Cloud Systems Blueprint",
        total_questions=20,
        total_marks=100.0,
        duration_minutes=45,
        passing_score=65.0
    )

    bp = engine.create_blueprint_from_syllabus(payload)
    assert bp.id is not None
    assert bp.syllabus_id == syl.id
    assert bp.total_questions == 20
    assert bp.total_marks == 100.0
    assert len(bp.section_rules) == 2

    # Verify proportional distribution based on weights (40% vs 60%)
    sec1 = bp.section_rules[0]
    sec2 = bp.section_rules[1]
    assert sec1["module_weight"] == 40.0
    assert sec1["target_questions"] == 8  # 40% of 20
    assert sec1["target_marks"] == 40.0

    assert sec2["module_weight"] == 60.0
    assert sec2["target_questions"] == 12  # 60% of 20
    assert sec2["target_marks"] == 60.0

    # Total questions and marks must sum exactly
    total_q = sum(s["target_questions"] for s in bp.section_rules)
    total_m = sum(s["target_marks"] for s in bp.section_rules)
    assert total_q == 20
    assert total_m == 100.0


# ============================================================================
# 2. Syllabus Coverage Validator & Skew Warning
# ============================================================================

def test_stage2_02_syllabus_coverage_validation_and_skew(test_db):
    res, syl, modules, topics, objs = create_mock_syllabus(test_db, "coverage-test")

    # Generate 5 questions all targeting Module 1 (skipping Module 2)
    questions = []
    for i in range(5):
        q = AssessmentQuestion(
            id=str(uuid.uuid4()),
            course_id=res.id,
            syllabus_id=syl.id,
            module_id=modules[0].id,
            topic_id=topics[0].id,
            question_text=f"Question {i+1} covering backend microservices in detail.",
            question_type="MCQ",
            difficulty="Intermediate",
            marks=2.0
        )
        questions.append(q)

    report = CoverageValidator.validate_coverage(syl, questions)
    assert report.total_syllabus_modules == 2
    assert modules[0].title in report.covered_modules
    assert modules[1].title in report.uncovered_modules
    # Module 2 (60% weight) is completely uncovered, so coverage percentage should be 40%
    assert report.coverage_percentage == 40.0
    # Must flag warning for uncovered major module (weight >= 25%)
    assert any("Cloud Infrastructure & DevOps" in w for w in report.coverage_warnings)


# ============================================================================
# 3. Question Validation Rules (MCQ, Coding, Scenario)
# ============================================================================

def test_stage2_03_question_validator_rules():
    # 1. Valid MCQ
    valid_mcq = {
        "question_text": "What is the primary role of an API Gateway in microservices?",
        "question_type": "MCQ",
        "difficulty": "INTERMEDIATE",
        "marks": 2.0,
        "options": ["Routing & auth", "Database storage", "Memory heap", "Hardware bios"],
        "correct_option_index": 0
    }
    assert QuestionValidator.validate_question_data(valid_mcq) == []

    # 2. Invalid MCQ (missing options, index out of range)
    invalid_mcq = {
        "question_text": "Short",
        "question_type": "MCQ",
        "difficulty": "INVALID_DIFF",
        "marks": -1.0,
        "options": ["Only one option"],
        "correct_option_index": 5
    }
    errs = QuestionValidator.validate_question_data(invalid_mcq)
    assert len(errs) >= 4
    assert any("at least 10 characters" in e for e in errs)
    assert any("Invalid difficulty" in e for e in errs)
    assert any("positive number" in e for e in errs)
    assert any("at least 2 options" in e for e in errs)

    # 3. Valid Coding Question
    valid_coding = {
        "question_text": "Implement a binary search function with O(log n) complexity.",
        "question_type": "CODING",
        "difficulty": "ADVANCED",
        "marks": 10.0,
        "code_language": "python",
        "test_cases": [{"input": "[1, 2, 3, 4], 3", "expected": "2", "hidden": False}]
    }
    assert QuestionValidator.validate_question_data(valid_coding) == []


# ============================================================================
# 4. Question Near-Duplicate Detection
# ============================================================================

def test_stage2_04_duplicate_detection():
    pool = [
        "Explain how asynchronous coroutines function inside the Python asyncio event loop.",
        "Describe the differences between relational databases and NoSQL document stores."
    ]

    # Exact duplicate
    cand_exact = "Explain how asynchronous coroutines function inside the Python asyncio event loop."
    is_dup, match, sim = QuestionValidator.check_duplicate(cand_exact, pool)
    assert is_dup is True
    assert sim == 1.0

    # Near-duplicate with slight rephrasing
    cand_near = "Explain how asynchronous coroutines function and run inside the Python asyncio event loop."
    is_dup2, match2, sim2 = QuestionValidator.check_duplicate(cand_near, pool, threshold=0.75)
    assert is_dup2 is True
    assert sim2 >= 0.75

    # Completely different question
    cand_unique = "Calculate the stress distribution in a cantilever beam under uniform load."
    is_dup3, match3, sim3 = QuestionValidator.check_duplicate(cand_unique, pool)
    assert is_dup3 is False
    assert sim3 < 0.3


# ============================================================================
# 5. Question Generation with Objective Traceability & AI Fallback
# ============================================================================

def test_stage2_05_question_generation_and_traceability(test_db):
    res, syl, modules, topics, objs = create_mock_syllabus(test_db, "gen-test")
    generator = QuestionGenerator(test_db)

    # Generate question for Objective 1
    q = generator.generate_question_for_objective(
        objective_id=objs[0].id,
        question_type="MCQ",
        difficulty="INTERMEDIATE",
        marks=2.5
    )

    assert q.id is not None
    assert q.objective_id == objs[0].id
    assert q.topic_id == topics[0].id
    assert q.module_id == modules[0].id
    assert q.course_id == res.id
    assert q.generation_method in {"AI_GENERATED", "TEMPLATE"}
    assert q.verification_status in {"AI_ASSISTED", "VERIFIED"}
    assert len(q.options) >= 2


# ============================================================================
# 6. Assessment Generation from Blueprint & State Transitions
# ============================================================================

def test_stage2_06_assessment_generation_from_blueprint(test_db):
    res, syl, modules, topics, objs = create_mock_syllabus(test_db, "generate-assessment")
    engine = BlueprintEngine(test_db)

    payload = AssessmentBlueprintCreate(
        course_id=res.id,
        syllabus_id=syl.id,
        title="Automated Certification Exam",
        total_questions=10,
        total_marks=50.0,
        duration_minutes=30,
        passing_score=35.0
    )
    bp = engine.create_blueprint_from_syllabus(payload)

    # Generate assessment
    assessment = engine.generate_assessment_from_blueprint(
        blueprint_id=bp.id,
        assessment_type="STANDARD",
        randomize=True,
        random_seed=42
    )

    assert assessment.id is not None
    assert assessment.blueprint_id == bp.id
    assert assessment.total_questions == 10
    assert assessment.total_marks == 50.0
    assert len(assessment.questions) == 10
    # Status should be VALIDATED as it passes coverage validation
    assert assessment.status == "VALIDATED"


# ============================================================================
# 7. Learner Answer-Key Redaction & IDOR Protection
# ============================================================================

def test_stage2_07_learner_answer_key_protection_and_security(test_db):
    res, syl, modules, topics, objs = create_mock_syllabus(test_db, "security-assessment")
    engine = BlueprintEngine(test_db)

    bp = engine.create_blueprint_from_syllabus(AssessmentBlueprintCreate(
        course_id=res.id,
        title="Security Blueprint",
        total_questions=4,
        total_marks=20.0
    ))
    assessment = engine.generate_assessment_from_blueprint(bp.id)

    # Learner views assessment via GET /api/v1/assessments/{id}
    res_learner = client.get(f"/api/v1/assessments/{assessment.id}")
    assert res_learner.status_code == 200
    data = res_learner.json()

    # CRITICAL SECURITY INVARIANT:
    # Learner view MUST NOT contain correct_answer, correct_option_index, or explanation!
    for q in data["questions"]:
        assert "correct_answer" not in q or q.get("correct_answer") is None
        assert "correct_option_index" not in q or q.get("correct_option_index") is None
        assert "explanation" not in q or q.get("explanation") is None
        assert "question_text" in q
        assert "options" in q


# ============================================================================
# 8. Multi-Domain Assessments (VLSI, Mechanical CAD, Valuation)
# ============================================================================

def test_stage2_08_multi_domain_blueprints(test_db):
    domains = [
        ("vlsi-design-verilog", "VLSI Design"),
        ("solidworks-mechanical-cad", "Mechanical CAD"),
        ("financial-accounting-valuation", "Finance Valuation")
    ]

    engine = BlueprintEngine(test_db)

    for slug, title in domains:
        course = test_db.query(LearningResource).filter(LearningResource.slug == slug).first()
        if not course:
            continue
        syl = test_db.query(CourseSyllabus).filter(
            CourseSyllabus.course_id == course.id, CourseSyllabus.is_active == True
        ).first()
        if not syl:
            continue

        bp = engine.create_blueprint_from_syllabus(AssessmentBlueprintCreate(
            course_id=course.id,
            syllabus_id=syl.id,
            title=f"{title} Assessment Blueprint",
            total_questions=15,
            total_marks=100.0
        ))
        assert bp.id is not None
        assert bp.total_questions == 15
        assert len(bp.section_rules) == len(syl.modules)
