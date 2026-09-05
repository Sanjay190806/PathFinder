import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import get_db
from backend.app.resources.course_intelligence_service import CourseIntelligenceService
from backend.app.resources.resource_verifier import ResourceVerifier


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def db():
    db_gen = get_db()
    db_sess = next(db_gen)
    try:
        yield db_sess
    finally:
        try:
            next(db_gen)
        except StopIteration:
            pass


def test_pricing_classification_distinction(db):
    """Verifies that free learning is accurately distinguished from free enrollment with paid certificate."""
    service = CourseIntelligenceService(db)
    courses = service.get_all_courses()

    # Find MIT 6.006 (Genuinely Free)
    mit = next((c for c in courses if "mit-6006" in c["slug"]), None)
    assert mit is not None
    assert mit["price_type"] == "GENUINELY_FREE"
    assert mit["free_learning"] is True
    assert mit["learning_cost"] == 0.0

    # Find NPTEL (Free to Enroll / Paid Certificate)
    nptel = next((c for c in courses if "nptel" in c["slug"]), None)
    assert nptel is not None
    assert nptel["price_type"] == "FREE_TO_ENROLL_PAID_CERTIFICATE"
    assert nptel["free_learning"] is True
    assert nptel["certificate_cost"] == "optional_paid"


def test_paid_course_classification(db):
    """Verifies paid courses retain non-zero learning cost and false free_learning flag."""
    service = CourseIntelligenceService(db)
    courses = service.get_all_courses()

    paid_item = next((c for c in courses if c["price_type"] == "PAID"), None)
    assert paid_item is not None
    assert paid_item["free_learning"] is False
    assert paid_item["learning_cost"] > 0.0


def test_courses_by_dsa_topic(db):
    """Verifies courses mapping directly to canonical DSA topics (graphs, arrays)."""
    service = CourseIntelligenceService(db)
    graph_courses = service.get_courses_by_dsa_topic("graphs")
    assert len(graph_courses) >= 1
    slugs = [c["slug"] for c in graph_courses]
    assert any("mit" in s or "princeton" in s or "algorithms" in s for s in slugs)


def test_courses_by_role_google_swe(db):
    """Verifies role-aligned course discovery for Google Software Engineer."""
    service = CourseIntelligenceService(db)
    results = service.get_courses_by_role(company_slug="google", role_slug="software-engineer")
    assert len(results) >= 1
    # Should include systems, algorithms, or programming courses
    titles = [c["title"].lower() for c in results]
    assert any("algorithms" in t or "systems" in t or "python" in t for t in titles)


def test_non_software_disciplines(db):
    """Verifies discovery of non-software disciplines (Graphic Design, Finance)."""
    service = CourseIntelligenceService(db)
    des_res = service.search_courses(career_slug="graphic-designer")
    assert des_res["total_count"] >= 1
    assert any("graphic design" in c["title"].lower() for c in des_res["items"])


def test_ssrf_and_url_safety():
    """Verifies that ResourceVerifier rejects localhost, private IPs, and invalid protocols."""
    verifier = ResourceVerifier()
    safe, err = verifier.is_safe_destination("http://127.0.0.1:8000/internal")
    assert safe is False
    assert "blocked" in err.lower()

    safe, err = verifier.is_safe_destination("http://192.168.1.1/admin")
    assert safe is False

    safe, err = verifier.is_safe_destination("ftp://files.example.com")
    assert safe is False


def test_api_courses_search(client):
    """Tests GET /api/v1/resources/courses with pricing and difficulty filters."""
    res = client.get("/api/v1/resources/courses?free_only=true")
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert "total_count" in data
    for item in data["items"]:
        assert item["free_learning"] is True


def test_api_pricing_categories(client):
    """Tests GET /api/v1/resources/pricing-categories."""
    res = client.get("/api/v1/resources/pricing-categories")
    assert res.status_code == 200
    data = res.json()
    assert "GENUINELY_FREE" in data
    assert "FREE_TO_ENROLL_PAID_CERTIFICATE" in data
    assert "PAID" in data


def test_api_by_dsa_topic(client):
    """Tests GET /api/v1/resources/by-dsa/{topic_slug}."""
    res = client.get("/api/v1/resources/by-dsa/graphs")
    assert res.status_code == 200
    items = res.json()
    assert isinstance(items, list)
    assert len(items) >= 1
