"""
Phase 11 Stage 5 Test Suite: Career Comparison & Alternative Career Discovery
Tests 2-way and 3-way comparative analytics, skill overlap extraction,
transition feasibility, and alternative career discovery.
"""

import pytest
from sqlalchemy.orm import Session
from backend.app.database import SessionLocal
from backend.app.career.comparison_service import CareerComparisonService


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_two_way_comparison_data_scientist_and_aiml(db: Session):
    """Verify 2-way comparison between Data Scientist and AI/ML Engineer."""
    svc = CareerComparisonService(db=db)
    res = svc.compare_careers(["data-scientist", "ai-ml-engineer"])

    assert len(res.careers) == 2
    assert res.careers[0].slug == "data-scientist"
    assert res.careers[1].slug == "ai-ml-engineer"

    # Verify shared skills
    assert len(res.skill_overlap.shared_skills) >= 1, "Data Scientist and AI/ML Engineer must share foundational skills (e.g., Python, Machine Learning)."

    # Verify pair-wise transition feasibility
    pair_key = "data-scientist_to_ai-ml-engineer"
    assert pair_key in res.transition_feasibility
    tf = res.transition_feasibility[pair_key]
    assert tf["feasibility"] in ["HIGH", "MODERATE"], "Transition from Data Scientist to AI/ML should be HIGH or MODERATE."
    assert tf["overlap_percentage"] > 20.0


def test_three_way_comparison_software_stack(db: Session):
    """Verify 3-way comparison between Software Engineer, Full Stack Developer, and Cloud DevOps."""
    svc = CareerComparisonService(db=db)
    slugs = ["software-engineer", "full-stack-developer", "cloud-devops-engineer"]
    res = svc.compare_careers(slugs)

    assert len(res.careers) == 3
    assert len(res.difficulty_ranking) == 3

    # Verify unique skills mapping exists for each career
    for slug in slugs:
        assert slug in res.skill_overlap.unique_skills_by_career

    # Verify education comparison exists for each
    for slug in slugs:
        assert slug in res.education_comparison


def test_comparison_invalid_slug_counts(db: Session):
    """Verify that comparison strictly enforces 2 or 3 careers."""
    svc = CareerComparisonService(db=db)

    # 1 career should raise ValueError
    with pytest.raises(ValueError):
        svc.compare_careers(["software-engineer"])

    # 4 careers should raise ValueError
    with pytest.raises(ValueError):
        svc.compare_careers(["software-engineer", "data-scientist", "doctor", "nurse"])


def test_alternative_careers_discovery(db: Session):
    """Verify discovery of adjacent and transition alternatives for Graphic Designer."""
    svc = CareerComparisonService(db=db)
    res = svc.get_alternative_careers(career_slug="graphic-designer", limit=4)

    assert res.source_career_slug == "graphic-designer"
    assert len(res.alternatives) >= 1, "Should discover at least 1 alternative career for Graphic Designer."

    # UI/UX Designer should be one of the top alternatives
    uiux_alt = next((a for a in res.alternatives if a.slug == "ui-ux-designer"), None)
    assert uiux_alt is not None, "UI/UX Designer should be suggested as an alternative for Graphic Designer."
    assert uiux_alt.similarity_score > 0.4
    assert len(uiux_alt.transferable_skills) > 0


def test_transition_feasibility_regulated_barrier(db: Session):
    """Verify that transitioning from an unregulated to a regulated career flags low feasibility with long timeline."""
    svc = CareerComparisonService(db=db)
    res = svc.compare_careers(["graphic-designer", "doctor"])

    pair_key = "graphic-designer_to_doctor"
    assert pair_key in res.transition_feasibility
    tf = res.transition_feasibility[pair_key]
    assert tf["feasibility"] in ["VERY_LOW", "LOW"]
    assert "licens" in tf["rationale"].lower() or "statutory" in tf["rationale"].lower()
