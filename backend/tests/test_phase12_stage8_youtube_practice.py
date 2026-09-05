import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.resources.youtube_practice_service import YouTubePracticeService


@pytest.fixture
def client():
    return TestClient(app)


def test_youtube_curated_series_discovery():
    """Verifies retrieval of premier educational YouTube series."""
    results = YouTubePracticeService.search_youtube_resources(topic_slug="dynamic-programming")
    assert len(results) >= 1
    titles = [r["title"].lower() for r in results]
    assert any("striver" in t or "abdul bari" in t or "neetcode" in t for t in titles)
    for r in results:
        assert r["price_type"] == "YOUTUBE_FREE_CONTENT"
        assert r["verification_status"] in ("VERIFIED", "PARTIALLY_VERIFIED")


def test_youtube_graceful_degradation_without_api_key(monkeypatch):
    """Verifies that absence of YOUTUBE_API_KEY degrades gracefully without error."""
    monkeypatch.delenv("YOUTUBE_API_KEY", raising=False)
    results = YouTubePracticeService.search_youtube_resources(topic_slug="arrays")
    assert isinstance(results, list)
    assert len(results) >= 1


def test_practice_problems_easy_medium_hard():
    """Verifies that practice problems cover Easy, Medium, and Hard progression for Graphs."""
    problems = YouTubePracticeService.get_practice_problems("graphs")
    assert len(problems) >= 3
    diffs = [p["difficulty"] for p in problems]
    assert "EASY" in diffs
    assert "MEDIUM" in diffs
    assert "HARD" in diffs

    # Verify problem links and patterns
    for p in problems:
        assert p["problem_url"].startswith("http")
        assert "pattern" in p
        assert p["platform"] in ("LeetCode", "GeeksforGeeks", "HackerRank")


def test_practice_problem_difficulty_filter():
    """Verifies filtering practice problems by difficulty."""
    easy_probs = YouTubePracticeService.get_practice_problems("graphs", difficulty="EASY")
    for p in easy_probs:
        assert p["difficulty"] == "EASY"


def test_practice_synthetic_fallback():
    """Verifies unindexed DSA topics generate standard practice platform guidance."""
    fallback_probs = YouTubePracticeService.get_practice_problems("trie")
    assert len(fallback_probs) >= 1
    assert any("trie" in p["problem_url"].lower() for p in fallback_probs)


def test_api_youtube_by_topic(client):
    """Tests GET /api/v1/resources/youtube/by-topic/{topic_slug}."""
    res = client.get("/api/v1/resources/youtube/by-topic/graphs")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "channel_title" in data[0]


def test_api_practice_by_topic(client):
    """Tests GET /api/v1/resources/practice/by-topic/{topic_slug}."""
    res = client.get("/api/v1/resources/practice/by-topic/arrays?difficulty=EASY")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["difficulty"] == "EASY"
    assert "two sum" in data[0]["title"].lower()
