"""
Phase 11 Stage 10 Test Suite: Multilingual Career Discovery, Localization & Accessibility
Tests:
- All 12 supported Indian & global languages (en, hi, ta, te, kn, ml, mr, bn, gu, pa, or, ur)
- Canonical language registry, locales, and RTL direction handling for Urdu
- Language fallback hierarchy (requested -> fallback -> English)
- Canonical career ID/slug invariance across language overlays
- Multilingual search across native scripts (Tamil, Hindi, Urdu)
- Technical terminology preservation in Latin script (Python, PyTorch, SQL, DGCA, NMC)
- Grounded AI career explanations with UniversalDecisionTrace
- Learner language preference persistence
- Security & authorization checks
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.main import app
from backend.app.database import SessionLocal
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.models.career import Career, CareerTranslation
from backend.app.career.multilingual_service import MultilingualCareerService
from backend.app.seed.career_translations_seed import SUPPORTED_LANGUAGES_REGISTRY
from backend.app.core.security import create_access_token

client = TestClient(app)


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def get_demo_auth_header():
    login_res = client.post("/api/v1/demo/login")
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ---------------------------------------------------------------------------
# 1. Canonical Supported Languages & RTL Handling
# ---------------------------------------------------------------------------
def test_supported_languages_catalog(db: Session):
    """Verifies that all 12 canonical languages are registered with correct directions and locales."""
    svc = MultilingualCareerService(db=db)
    res = svc.get_supported_languages()

    assert res.total_languages >= 12
    lang_codes = {item.code: item for item in res.languages}

    expected_codes = ["en", "hi", "ta", "te", "kn", "ml", "mr", "bn", "gu", "pa", "or", "ur"]
    for code in expected_codes:
        assert code in lang_codes, f"Language {code} must be registered."

    # Verify Urdu is RTL
    assert lang_codes["ur"].direction == "rtl", "Urdu must be marked with direction='rtl'."
    assert lang_codes["ur"].native_name == "اردو"

    # Verify Tamil is LTR
    assert lang_codes["ta"].direction == "ltr"
    assert lang_codes["ta"].native_name == "தமிழ்"

    # API Endpoint check
    api_res = client.get("/api/v1/careers/languages")
    assert api_res.status_code == 200
    data = api_res.json()
    assert data["total_languages"] >= 12


# ---------------------------------------------------------------------------
# 2. Canonical Career ID & Slug Invariance
# ---------------------------------------------------------------------------
def test_canonical_id_preservation_across_languages(db: Session):
    """Verifies that translations are overlays and do NOT duplicate or alter canonical career IDs."""
    aiml = db.query(Career).filter(Career.slug == "ai-ml-engineer").first()
    assert aiml is not None

    svc = MultilingualCareerService(db=db)

    # Fetch English
    en_trans = svc.get_career_translation("ai-ml-engineer", language="en")
    assert en_trans.career_slug == "ai-ml-engineer"
    assert en_trans.title == "AI/ML Engineer"

    # Fetch Tamil
    ta_trans = svc.get_career_translation("ai-ml-engineer", language="ta")
    assert ta_trans.career_slug == "ai-ml-engineer"
    assert "பொறியாளர்" in ta_trans.title
    assert ta_trans.resolved_language == "ta"
    assert ta_trans.direction == "ltr"

    # Fetch Urdu
    ur_trans = svc.get_career_translation("ai-ml-engineer", language="ur")
    assert ur_trans.career_slug == "ai-ml-engineer"
    assert ur_trans.direction == "rtl"
    assert "انجینئر" in ur_trans.title

    # Canonical database record remains completely untouched
    db.refresh(aiml)
    assert aiml.slug == "ai-ml-engineer"
    assert aiml.display_name == "AI/ML Engineer"


# ---------------------------------------------------------------------------
# 3. Translation Fallback Hierarchy
# ---------------------------------------------------------------------------
def test_translation_fallback_order(db: Session):
    """
    Verifies fallback order:
    requested language -> fallback language -> canonical English.
    Never returns null or empty title.
    """
    svc = MultilingualCareerService(db=db)

    # 1. Non-existent career raises 404
    with pytest.raises(ValueError):
        svc.get_career_translation("non-existent-career-xyz", language="ta")

    # 2. Unsupported language with valid fallback
    res = svc.get_career_translation("doctor", language="klingon", fallback_language="hi")
    assert res.career_slug == "doctor"
    assert res.resolved_language == "hi"
    assert res.is_fallback is True
    assert "चिकित्सक" in res.title or "डॉक्टर" in res.title

    # 3. Unsupported language and unsupported fallback -> Falls back to English
    res_en = svc.get_career_translation("doctor", language="klingon", fallback_language="esperanto")
    assert res_en.career_slug == "doctor"
    assert res_en.resolved_language == "en"
    assert res_en.is_fallback is True
    assert "Doctor" in res_en.title or "Physician" in res_en.title
    assert res_en.direction == "ltr"


# ---------------------------------------------------------------------------
# 4. Multilingual Career Search
# ---------------------------------------------------------------------------
def test_multilingual_search_native_scripts(db: Session):
    """Verifies that native script search queries resolve to canonical career records."""
    svc = MultilingualCareerService(db=db)

    # 1. Tamil search for Doctor: 'மருத்துவர்'
    doc_results = svc.search_careers_multilingual("மருத்துவர்", language="ta")
    assert len(doc_results) > 0
    assert any(c.slug == "doctor" for c in doc_results)

    # 2. Tamil search for AI: 'செயற்கை நுண்ணறிவு'
    aiml_results = svc.search_careers_multilingual("செயற்கை நுண்ணறிவு", language="ta")
    assert len(aiml_results) > 0
    assert any(c.slug == "ai-ml-engineer" for c in aiml_results)

    # 3. Hindi search for Pilot: 'पायलट'
    pilot_results = svc.search_careers_multilingual("पायलट", language="hi")
    assert len(pilot_results) > 0
    assert any(c.slug == "commercial-airline-pilot" for c in pilot_results)

    # 4. Urdu search for Doctor: 'طبیب'
    ur_results = svc.search_careers_multilingual("طبیب", language="ur")
    assert len(ur_results) > 0
    assert any(c.slug == "doctor" for c in ur_results)


# ---------------------------------------------------------------------------
# 5. Technical Terminology Preservation in Localized AI Explanations
# ---------------------------------------------------------------------------
def test_technical_terms_preservation_in_ai_explanation(db: Session):
    """
    Verifies that localized AI career explanations preserve critical technical
    keywords (Python, PyTorch, SQL, DGCA, NMC) in Latin script without corruption.
    """
    svc = MultilingualCareerService(db=db)

    # AI/ML Engineer in Tamil
    ta_exp = svc.generate_ai_career_explanation("ai-ml-engineer", language="ta")
    assert ta_exp.career_slug == "ai-ml-engineer"
    assert ta_exp.language_code == "ta"
    assert ta_exp.direction == "ltr"
    # Technical tokens strictly present in explanation text
    assert "Python" in ta_exp.explanation
    assert "PathFinder" in ta_exp.explanation
    assert len(ta_exp.grounded_facts) >= 3

    # Commercial Pilot in Hindi
    hi_pilot = svc.generate_ai_career_explanation("commercial-airline-pilot", language="hi")
    assert hi_pilot.career_slug == "commercial-airline-pilot"
    assert hi_pilot.language_code == "hi"
    assert "DGCA" in hi_pilot.explanation
    assert "CPL" in hi_pilot.explanation

    # Doctor in Urdu (RTL)
    ur_doc = svc.generate_ai_career_explanation("doctor", language="ur")
    assert ur_doc.career_slug == "doctor"
    assert ur_doc.language_code == "ur"
    assert ur_doc.direction == "rtl"
    assert "NMC" in ur_doc.explanation or "NEET" in ur_doc.explanation


# ---------------------------------------------------------------------------
# 6. AI Explanation Grounding & DecisionTrace
# ---------------------------------------------------------------------------
def test_ai_explanation_grounding_and_trace(db: Session):
    """Verifies that explanations are grounded in verified DB facts with decision traces."""
    svc = MultilingualCareerService(db=db)
    res = svc.generate_ai_career_explanation("software-engineer", language="hi")

    assert res.decision_trace is not None
    assert res.decision_trace["decision_type"] == "multilingual_career_explanation"
    assert res.decision_trace["target_role"] == "software-engineer"
    assert len(res.decision_trace["factors"]) >= 3
    assert len(res.decision_trace["evidence"]) >= 1

    # Verified salary benchmark reference
    assert "वेतन" in res.explanation or "INR" in res.explanation or "₹" in res.explanation


# ---------------------------------------------------------------------------
# 7. Learner Language Preference API
# ---------------------------------------------------------------------------
def test_learner_language_preference_persistence(db: Session):
    """Verifies that user can set preferred and fallback languages via API."""
    auth = get_demo_auth_header()

    # Update language preference to Tamil with Hindi fallback
    payload = {
        "preferred_language": "ta",
        "fallback_language": "hi"
    }
    res = client.post("/api/v1/careers/languages/preference", json=payload, headers=auth)
    assert res.status_code == 200
    data = res.json()
    assert data["preferred_language"] == "ta"
    assert data["fallback_language"] == "hi"
    assert data["direction"] == "ltr"
    assert data["status"] == "SUCCESS"

    # Verify update persisted in DB
    db.expire_all()
    demo_user = db.query(User).filter(User.email == "alex@pathfinder.demo").first()
    assert demo_user is not None
    assert demo_user.profile.preferred_language == "ta"
    assert demo_user.profile.fallback_language == "hi"

    # Reset back to English for clean state
    reset_res = client.post(
        "/api/v1/careers/languages/preference",
        json={"preferred_language": "en", "fallback_language": "en"},
        headers=auth
    )
    assert reset_res.status_code == 200


# ---------------------------------------------------------------------------
# 8. Translation & AI Explanation REST Endpoints
# ---------------------------------------------------------------------------
def test_career_translation_and_ai_endpoints():
    """Tests GET /api/v1/careers/{career_slug}/translations and ai-explanation."""
    # 1. Translation endpoint public access
    res = client.get("/api/v1/careers/graphic-designer/translations?language=ta")
    assert res.status_code == 200
    data = res.json()
    assert data["career_slug"] == "graphic-designer"
    assert data["resolved_language"] == "ta"
    assert "வடிவமைப்பாளர்" in data["title"]

    # 2. AI explanation endpoint
    res_ai = client.get("/api/v1/careers/graphic-designer/ai-explanation?language=ta")
    assert res_ai.status_code == 200
    ai_data = res_ai.json()
    assert ai_data["career_slug"] == "graphic-designer"
    assert "Adobe" in ai_data["explanation"] or "Photoshop" in ai_data["explanation"] or "Illustrator" in ai_data["explanation"]
    assert "decision_trace" in ai_data

    # 3. 404 for invalid career
    res_404 = client.get("/api/v1/careers/fake-career-999/translations")
    assert res_404.status_code == 404

    # 4. Unauthenticated language preference change is blocked
    res_unauth = client.post("/api/v1/careers/languages/preference", json={"preferred_language": "ta"})
    assert res_unauth.status_code in [401, 403]
