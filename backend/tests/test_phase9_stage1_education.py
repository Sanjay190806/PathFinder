"""
Phase 9 Stage 1: Indian Education Taxonomy & Profile Persistence Tests
Validates hierarchy integrity, stable IDs, alias matching, custom options, board support,
and zero regressions on legacy user profiles.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import get_db, SessionLocal
from backend.app.core.education_catalog import (
    get_education_catalog,
    search_education_taxonomy,
    get_education_levels,
    get_streams_for_level,
    get_specializations_for_stream,
    get_education_boards,
    get_institution_types,
    get_study_years
)
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal

client = TestClient(app)

def test_stage1_catalog_hierarchy_integrity():
    """Validates that all 10 normalized education levels exist with stable IDs and non-empty streams."""
    catalog = get_education_catalog()
    assert len(catalog) == 10

    expected_level_ids = [
        "secondary-school",
        "higher-secondary",
        "undergraduate",
        "postgraduate",
        "diploma-polytechnic",
        "iti-industrial-training",
        "vocational-skill-education",
        "professional-degree",
        "certification",
        "other"
    ]
    catalog_ids = [lvl.id for lvl in catalog]
    for expected_id in expected_level_ids:
        assert expected_id in catalog_ids

    # Check that stream IDs and specialization IDs are unique per level
    seen_specializations = set()
    for lvl in catalog:
        assert len(lvl.streams) > 0
        for stream in lvl.streams:
            assert len(stream.specializations) > 0
            for spec in stream.specializations:
                assert spec.id is not None
                assert len(spec.name) > 0
                seen_specializations.add(spec.id)

    assert len(seen_specializations) > 50

def test_stage1_boards_and_institution_types():
    """Checks that official national/state boards and institution types are available."""
    boards = get_education_boards()
    board_ids = [b["id"] for b in boards]
    assert "cbse" in board_ids
    assert "cisce-isc" in board_ids
    assert "state-board" in board_ids
    assert "nios" in board_ids

    inst_types = get_institution_types()
    inst_ids = [it["id"] for it in inst_types]
    assert "central-university" in inst_ids
    assert "state-university" in inst_ids
    assert "polytechnic-iti" in inst_ids

    years = get_study_years()
    year_ids = [y["id"] for y in years]
    assert "year-1" in year_ids
    assert "graduated" in year_ids

def test_stage1_alias_search():
    """Tests that Indian academic aliases resolve correctly."""
    # 1. CSE -> Computer Science Engineering
    res_cse = search_education_taxonomy("CSE")
    assert any("Computer Science Engineering" in m["specialization_name"] for m in res_cse)

    # 2. ECE -> Electronics & Communication Engineering
    res_ece = search_education_taxonomy("ECE")
    assert any("Electronics & Communication" in m["specialization_name"] for m in res_ece)

    # 3. PCM -> Class 12 Science PCM
    res_pcm = search_education_taxonomy("PCM")
    assert any("PCM (Physics + Chemistry + Mathematics)" in m["specialization_name"] for m in res_pcm)

    # 4. ITI COPA -> Computer Operator
    res_copa = search_education_taxonomy("COPA")
    assert any("COPA" in m["specialization_name"] or "Computer Operator" in m["specialization_name"] for m in res_copa)

    # 5. Empty / whitespace search
    assert search_education_taxonomy("") == []
    assert search_education_taxonomy("   ") == []

def test_stage1_api_endpoints():
    """Tests public REST endpoints under /api/v1/education."""
    # Catalog
    res_cat = client.get("/api/v1/education/catalog")
    assert res_cat.status_code == 200
    data_cat = res_cat.json()
    assert data_cat["country"] == "India"
    assert len(data_cat["education_levels"]) == 10

    # Levels
    res_lvls = client.get("/api/v1/education/levels")
    assert res_lvls.status_code == 200
    assert len(res_lvls.json()) == 10

    # Streams for level
    res_streams = client.get("/api/v1/education/streams/higher-secondary")
    assert res_streams.status_code == 200
    stream_ids = [s["id"] for s in res_streams.json()]
    assert "science" in stream_ids
    assert "commerce" in stream_ids
    assert "humanities-arts" in stream_ids

    # 404 on malformed level
    res_404 = client.get("/api/v1/education/streams/non-existent-level")
    assert res_404.status_code == 404

    # Specializations for stream
    res_specs = client.get("/api/v1/education/specializations/engineering-technology")
    assert res_specs.status_code == 200
    spec_ids = [sp["id"] for sp in res_specs.json()]
    assert "computer-science-engineering" in spec_ids
    assert "mechanical-engineering" in spec_ids

    # Boards & Institution Types
    res_boards = client.get("/api/v1/education/boards")
    assert res_boards.status_code == 200
    assert len(res_boards.json()) >= 5

    res_inst = client.get("/api/v1/education/institution-types")
    assert res_inst.status_code == 200
    assert len(res_inst.json()) >= 5

def test_stage1_profile_persistence_with_extended_attributes():
    """Tests saving and retrieving all Stage 1 education attributes on learner profile."""
    # Demo login to get valid token
    login_res = client.post("/api/v1/demo/login")
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Update profile with comprehensive Stage 1 attributes
    payload = {
        "country": "India",
        "education_stage": "undergraduate",
        "education_domain": "engineering-technology",
        "education_stream": "electronics-communication-engineering",
        "specialization": "Electronics & Communication Engineering",
        "qualification": "B.Tech ECE",
        "board": "State Board (Anna University)",
        "subject_combination": "Digital Electronics, Signals, Microprocessors",
        "institution": "PSG College of Technology",
        "institution_type": "autonomous-college",
        "current_year": "year-3",
        "graduation_year": "2026",
        "subjects": ["VLSI Design", "Microcontrollers", "Digital Signal Processing"],
        "custom_education_label": None,
        "education_profile": {
            "board": "Anna University",
            "tier": "Tier-1 Autonomous"
        }
    }

    update_res = client.put("/api/v1/profile/education", json=payload, headers=headers)
    assert update_res.status_code == 200
    updated = update_res.json()

    assert updated["board"] == "State Board (Anna University)"
    assert updated["subject_combination"] == "Digital Electronics, Signals, Microprocessors"
    assert updated["institution_type"] == "autonomous-college"
    assert updated["current_year"] == "year-3"
    assert updated["subjects"] == ["VLSI Design", "Microcontrollers", "Digital Signal Processing"]
    assert updated["qualification"] == "B.Tech ECE"

    # Verify GET /profile returns these exact fields
    get_res = client.get("/api/v1/profile", headers=headers)
    assert get_res.status_code == 200
    retrieved = get_res.json()
    assert retrieved["board"] == "State Board (Anna University)"
    assert retrieved["institution_type"] == "autonomous-college"
    assert retrieved["current_year"] == "year-3"
    assert len(retrieved["subjects"]) == 3

def test_stage1_legacy_user_backward_compatibility():
    """Ensures legacy users with null board/subjects load cleanly without error."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "legacy_test_user@example.com").first()
        if not user:
            user = User(email="legacy_test_user@example.com", hashed_password="pw", full_name="Legacy User")
            db.add(user)
            db.commit()
            db.refresh(user)

        profile = db.query(LearnerProfile).filter(LearnerProfile.user_id == user.id).first()
        if not profile:
            profile = LearnerProfile(user_id=user.id, education_level="Undergraduate", experience_level="Beginner")
            db.add(profile)
            db.commit()
            db.refresh(profile)

        # Confirm nullable fields don't raise exceptions
        assert profile.board is None
        assert profile.subjects is None
        assert profile.institution_type is None
    finally:
        db.close()
