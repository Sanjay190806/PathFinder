import pytest
import os
from fastapi.testclient import TestClient
from backend.app.main import app

os.environ["SECRET_KEY"] = "test_secret_key_12345678901234567890"

@pytest.fixture
def client():
    return TestClient(app)

def test_get_companies_paginated(client):
    res = client.get("/api/v1/companies?page=1&page_size=25")
    assert res.status_code == 200
    data = res.json()
    assert data["total_count"] >= 250
    assert len(data["items"]) == 25
    assert data["page"] == 1
    assert data["page_size"] == 25

    first = data["items"][0]
    assert "slug" in first
    assert "display_name" in first
    assert "industry" in first
    assert "company_type" in first
    assert "headquarters_country" in first

def test_filter_companies_by_industry(client):
    res = client.get("/api/v1/companies", params={"industry": "Semiconductor & Hardware", "page_size": 50})
    assert res.status_code == 200
    data = res.json()
    assert data["total_count"] >= 20
    for item in data["items"]:
        assert item["industry"].lower() == "semiconductor & hardware".lower()

def test_filter_companies_by_country(client):
    res = client.get("/api/v1/companies?country=India&page_size=50")
    assert res.status_code == 200
    data = res.json()
    assert data["total_count"] >= 40
    for item in data["items"]:
        assert item["headquarters_country"].lower() == "india"

def test_company_search_text(client):
    res = client.get("/api/v1/companies?search=Google")
    assert res.status_code == 200
    data = res.json()
    assert any(c["slug"] == "google" for c in data["items"])

def test_company_detail_and_provenance(client):
    res = client.get("/api/v1/companies/google")
    assert res.status_code == 200
    data = res.json()
    assert data["slug"] == "google"
    assert data["canonical_name"] == "Google LLC"
    assert data["display_name"] == "Google"
    assert data["is_verified"] is True
    assert data["verification_status"] == "VERIFIED"
    assert "Corporate Filings" in data["source"]
    assert "Alphabet" in data["aliases"]
    assert len(data["roles"]) >= 1

def test_company_alias_resolution(client):
    res = client.get("/api/v1/companies/resolve?query=Alphabet")
    assert res.status_code == 200
    data = res.json()
    assert data["slug"] == "google"

    res_msft = client.get("/api/v1/companies/resolve?query=MSFT")
    assert res_msft.status_code == 200
    assert res_msft.json()["slug"] == "microsoft"

def test_company_roles_listing(client):
    res = client.get("/api/v1/companies/microsoft/roles")
    assert res.status_code == 200
    data = res.json()
    assert data["total_count"] >= 1
    assert any(r["role_slug"] == "software-engineer" for r in data["items"])

def test_company_role_detail_signals(client):
    res = client.get("/api/v1/companies/google/roles/software-engineer")
    assert res.status_code == 200
    data = res.json()
    assert data["role_slug"] == "software-engineer"
    assert data["dsa_relevance"] == "VERY_HIGH"
    assert "os" in data["cs_fundamentals_relevance"]
    assert "dbms" in data["cs_fundamentals_relevance"]
    assert data["career_slug"] == "software-engineer"

def test_company_by_career(client):
    res = client.get("/api/v1/companies/by-career/software-engineer")
    assert res.status_code == 200
    data = res.json()
    assert data["career_slug"] == "software-engineer"
    assert data["total_count"] >= 10
    companies = [c["company_slug"] for c in data["items"]]
    assert "google" in companies
    assert "microsoft" in companies

def test_company_meta_industries(client):
    res = client.get("/api/v1/companies/meta/industries")
    assert res.status_code == 200
    industries = res.json()
    assert len(industries) >= 5
    assert "Technology & Software" in industries
    assert "Semiconductor & Hardware" in industries
