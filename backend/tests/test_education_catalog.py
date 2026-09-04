"""
Comprehensive Test Suite for Centralized India Education Catalog & Taxonomy
Covers:
1. Catalog retrieval & structural integrity
2. Hierarchy validation across all 10 education levels
3. Alias & acronym search engine (CSE, ECE, BCA, PCM, ITI COPA)
4. Custom options & custom label persistence
5. Onboarding and Profile API integration
6. Backward compatibility with legacy education fields
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_get_education_catalog():
    """Verify GET /api/v1/education/catalog returns the full normalized catalog."""
    res = client.get("/api/v1/education/catalog")
    assert res.status_code == 200
    data = res.json()
    assert data["country"] == "India"
    assert "taxonomy_version" in data
    assert "education_levels" in data

    levels = data["education_levels"]
    assert len(levels) >= 10

    level_ids = [l["id"] for l in levels]
    expected_levels = [
        "secondary-school",
        "higher-secondary",
        "diploma-polytechnic",
        "iti-industrial-training",
        "undergraduate",
        "postgraduate",
        "professional-degree",
        "vocational-skill-education",
        "certification",
        "other"
    ]
    for exp in expected_levels:
        assert exp in level_ids, f"Expected level '{exp}' not found in catalog"

def test_education_hierarchy_consistency():
    """Verify that every level contains valid streams and specializations."""
    res = client.get("/api/v1/education/catalog")
    levels = res.json()["education_levels"]

    for lvl in levels:
        assert lvl["name"], f"Level {lvl['id']} missing name"
        assert lvl["short_label"], f"Level {lvl['id']} missing short_label"
        assert len(lvl["streams"]) > 0, f"Level {lvl['id']} has no streams"

        for st in lvl["streams"]:
            assert st["id"], f"Stream in {lvl['id']} missing id"
            assert st["name"], f"Stream {st['id']} missing name"
            assert len(st["specializations"]) > 0, f"Stream {st['id']} has no specializations"

            for spec in st["specializations"]:
                assert spec["id"], f"Spec in {st['id']} missing id"
                assert spec["name"], f"Spec {spec['id']} missing name"

def test_search_taxonomy_aliases():
    """Verify alias and acronym expansion (CSE, ECE, BCA, PCM, ITI COPA, MBBS)."""
    # 1. CSE -> Computer Science Engineering
    res_cse = client.get("/api/v1/education/search?q=CSE")
    assert res_cse.status_code == 200
    results = res_cse.json()
    assert len(results) > 0
    spec_names = [r["specialization_name"].lower() for r in results]
    assert any("computer science" in name for name in spec_names)

    # 2. ECE -> Electronics & Communication Engineering
    res_ece = client.get("/api/v1/education/search?q=ECE")
    assert res_ece.status_code == 200
    results = res_ece.json()
    assert len(results) > 0
    spec_names = [r["specialization_name"].lower() for r in results]
    assert any("electronics" in name for name in spec_names)

    # 3. BCA -> Bachelor of Computer Applications
    res_bca = client.get("/api/v1/education/search?q=BCA")
    assert res_bca.status_code == 200
    results = res_bca.json()
    assert len(results) > 0
    spec_names = [r["specialization_name"].lower() for r in results]
    assert any("bca" in name or "computer applications" in name for name in spec_names)

    # 4. PCM -> Higher Secondary PCM
    res_pcm = client.get("/api/v1/education/search?q=PCM")
    assert res_pcm.status_code == 200
    results = res_pcm.json()
    assert len(results) > 0
    spec_names = [r["specialization_name"].lower() for r in results]
    assert any("pcm" in name for name in spec_names)

    # 5. COPA -> ITI Trade
    res_copa = client.get("/api/v1/education/search?q=COPA")
    assert res_copa.status_code == 200
    results = res_copa.json()
    assert len(results) > 0
    spec_names = [r["specialization_name"].lower() for r in results]
    assert any("copa" in name or "computer operator" in name for name in spec_names)

def test_search_taxonomy_empty_or_no_match():
    """Verify search edge cases."""
    # Empty query should return 422
    res_empty = client.get("/api/v1/education/search?q=")
    assert res_empty.status_code == 422

    # Query with no match returns empty array
    res_no_match = client.get("/api/v1/education/search?q=xyznonexistent123")
    assert res_no_match.status_code == 200
    assert res_no_match.json() == []

def test_profile_onboarding_and_education_selection():
    """Verify end-to-end onboarding with structured education attributes."""
    rand_email = f"learner_tax_{id(test_profile_onboarding_and_education_selection)}@pathfinder.demo"
    reg_res = client.post("/api/v1/auth/register", json={
        "email": rand_email,
        "password": "Password123!",
        "full_name": "Rohan Gupta"
    })
    assert reg_res.status_code == 200
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Onboarding payload with structured education fields
    onb_res = client.post("/api/v1/profile/onboarding", json={
        "education_level": "undergraduate",
        "field_of_study": "engineering-technology",
        "experience_level": "Intermediate",
        "weekly_hours": 15,
        "preferred_formats": ["video", "hands-on", "projects"],
        "learning_objective": "Placement",
        "target_role": "Full Stack Developer",
        "country": "India",
        "education_stage": "undergraduate",
        "education_domain": "engineering-technology",
        "education_stream": "electronics-communication-engineering",
        "specialization": "Electronics & Communication Engineering",
        "qualification": "B.Tech ECE",
        "institution": "National Institute of Technology",
        "graduation_year": "2026",
        "skills": []
    }, headers=headers)

    assert onb_res.status_code == 200
    prof = onb_res.json()
    assert prof["education_stage"] == "undergraduate"
    assert prof["education_domain"] == "engineering-technology"
    assert prof["education_stream"] == "electronics-communication-engineering"
    assert prof["qualification"] == "B.Tech ECE"
    assert prof["institution"] == "National Institute of Technology"
    assert prof["graduation_year"] == "2026"

def test_update_education_profile_custom_label():
    """Verify Other / Custom option and custom label persistence."""
    rand_email = f"learner_custom_{id(test_update_education_profile_custom_label)}@pathfinder.demo"
    reg_res = client.post("/api/v1/auth/register", json={
        "email": rand_email,
        "password": "Password123!",
        "full_name": "Ananya Sen"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Update with custom specialization
    update_res = client.put("/api/v1/profile/education", json={
        "country": "India",
        "education_stage": "undergraduate",
        "education_domain": "interdisciplinary-emerging",
        "education_stream": "other-interdisciplinary-ug",
        "specialization": "other-custom",
        "qualification": "B.Sc (Hons)",
        "custom_education_label": "B.Sc in Computational Social Dynamics & GIS",
        "institution": "Jadavpur University",
        "graduation_year": "2025"
    }, headers=headers)

    assert update_res.status_code == 200
    prof = update_res.json()
    assert prof["custom_education_label"] == "B.Sc in Computational Social Dynamics & GIS"
    assert prof["institution"] == "Jadavpur University"

def test_backward_compatibility():
    """Verify legacy clients sending standard onboarding payload without new fields work."""
    rand_email = f"learner_compat_{id(test_backward_compatibility)}@pathfinder.demo"
    reg_res = client.post("/api/v1/auth/register", json={
        "email": rand_email,
        "password": "Password123!",
        "full_name": "Legacy Learner"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Minimal legacy payload
    legacy_payload = {
        "education_level": "Undergraduate",
        "field_of_study": "Computer Science",
        "experience_level": "Beginner",
        "weekly_hours": 10,
        "preferred_formats": ["video"],
        "learning_objective": "Internship",
        "target_role": "Software Engineer",
        "skills": []
    }
    res = client.post("/api/v1/profile/onboarding", json=legacy_payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["education_level"] == "Undergraduate"
    assert data["field_of_study"] == "Computer Science"
    assert data["country"] == "India"
