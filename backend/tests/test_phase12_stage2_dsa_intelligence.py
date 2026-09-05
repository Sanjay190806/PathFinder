import pytest
import os
from fastapi.testclient import TestClient
from backend.app.main import app

os.environ["SECRET_KEY"] = "test_secret_key_12345678901234567890"

@pytest.fixture
def client():
    return TestClient(app)

def test_get_dsa_domains(client):
    res = client.get("/api/v1/dsa/domains")
    assert res.status_code == 200
    domains = res.json()
    assert len(domains) == 5
    slugs = [d["slug"] for d in domains]
    assert "linear-data-structures" in slugs
    assert "algorithmic-paradigms" in slugs
    assert "trees-and-hierarchical-structures" in slugs
    assert "graph-algorithms" in slugs
    assert "dynamic-programming-and-advanced" in slugs

def test_get_all_dsa_topics(client):
    res = client.get("/api/v1/dsa/topics")
    assert res.status_code == 200
    topics = res.json()
    assert len(topics) == 28
    
    first = topics[0]
    assert "slug" in first
    assert "name" in first
    assert "typical_importance" in first
    assert "concepts_count" in first
    assert "difficulty_breakdown" in first
    assert "EASY" in first["difficulty_breakdown"]
    assert "MEDIUM" in first["difficulty_breakdown"]
    assert "HARD" in first["difficulty_breakdown"]

def test_filter_topics_by_domain(client):
    res = client.get("/api/v1/dsa/topics?domain_slug=linear-data-structures")
    assert res.status_code == 200
    topics = res.json()
    assert len(topics) == 6
    slugs = [t["slug"] for t in topics]
    assert "arrays" in slugs
    assert "strings" in slugs
    assert "linked-lists" in slugs
    assert "stacks" in slugs
    assert "queues" in slugs
    assert "hash-tables" in slugs

def test_filter_topics_by_search(client):
    res = client.get("/api/v1/dsa/topics?search=dynamic")
    assert res.status_code == 200
    topics = res.json()
    assert len(topics) >= 3
    assert any("Dynamic" in t["name"] or "dynamic" in t["description"].lower() for t in topics)

def test_dsa_topic_detail(client):
    res = client.get("/api/v1/dsa/topics/arrays")
    assert res.status_code == 200
    data = res.json()
    assert data["slug"] == "arrays"
    assert data["name"] == "Arrays & Dynamic Arrays"
    assert len(data["subtopics"]) >= 1
    assert len(data["subtopics"][0]["concepts"]) >= 1

def test_dsa_concept_detail(client):
    res = client.get("/api/v1/dsa/concepts/two-sum")
    assert res.status_code == 200
    data = res.json()
    assert data["slug"] == "two-sum"
    assert data["difficulty"] == "EASY"
    assert len(data["learning_objectives"]) >= 1
    assert len(data["common_patterns"]) >= 1
    assert len(data["practice_resources"]) >= 1

    resource = data["practice_resources"][0]
    assert "title" in resource
    assert "url" in resource
    assert "platform" in resource
    assert resource["is_free"] is True

def test_topic_prerequisites_graph(client):
    res_dp = client.get("/api/v1/dsa/topics/dp-2d")
    assert res_dp.status_code == 200
    assert "dp-1d" in res_dp.json()["prerequisite_topic_slugs"]

    res_lcs = client.get("/api/v1/dsa/topics/shortest-paths")
    assert res_lcs.status_code == 200
    assert "graphs" in res_lcs.json()["prerequisite_topic_slugs"]
    assert "heaps" in res_lcs.json()["prerequisite_topic_slugs"]

def test_topic_assessment_questions_route(client):
    res = client.get("/api/v1/dsa/topics/arrays/questions")
    assert res.status_code == 200
    data = res.json()
    assert data["topic_slug"] == "arrays"
    assert "total_returned" in data
    assert isinstance(data["questions"], list)
