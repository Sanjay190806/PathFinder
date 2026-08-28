import pytest
from backend.app.database import SessionLocal
from backend.app.seed.seed_data import seed_database
from backend.app.seed.validator import validate_seed_data

def test_full_seed_validation_metrics():
    db = SessionLocal()
    try:
        report = seed_database(db)
        assert report["skills_count"] >= 30
        assert report["resources_count"] >= 50
        assert report["prerequisites_count"] >= 30
        assert report["resource_skills_count"] >= 80
        assert report["is_acyclic"] is True
        assert len(report["errors"]) == 0
    finally:
        db.close()
