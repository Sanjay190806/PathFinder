import sys
import os

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from backend.app.providers.registry import ProviderRegistry
from backend.app.providers.igot_adapter import IGOTProviderAdapter
from backend.app.resources.taxonomy_mapper import TaxonomyMapper
from backend.app.resources.resource_verifier import ResourceVerifier
from backend.app.resources.resource_discovery_engine import ResourceDiscoveryEngine
from backend.app.database import Base, engine, SessionLocal

def test_igot_multi_source_integration():
    Base.metadata.create_all(bind=engine)
    print("--- 1. Testing Registry ---")
    reg = ProviderRegistry()
    assert len(reg.list_providers()) >= 12
    igot = reg.get_adapter("igot_karmayogi")
    assert igot.is_official_url("https://igotkarmayogi.gov.in/test")
    assert not igot.is_official_url("https://evil.com")
    print("Registry checks passed.")

    print("--- 2. Testing Taxonomy Mapping ---")
    skills = TaxonomyMapper.map_competencies_to_skills(["Public Policy Formulation & Analysis", "Citizen Centricity"])
    assert "public-policy" in skills
    assert "citizen-centricity" in skills
    print("Taxonomy checks passed.")

    print("--- 3. Testing Verifier & SSRF Guard ---")
    verifier = ResourceVerifier()
    accessible, final_url, status_code, err = verifier.verify_url("https://igotkarmayogi.gov.in/public/course/anti-corruption")
    assert accessible == True
    assert status_code == 200

    safe, reason = ResourceVerifier.is_safe_destination("http://127.0.0.1:8000/internal")
    assert safe == False
    assert "blocked" in reason.lower()
    print("Verifier checks passed.")

    print("--- 4. Testing Discovery & Deterministic Ranking ---")
    disc_engine = ResourceDiscoveryEngine()
    gov = disc_engine.discover_resources(skill_slug="public-policy", competency="Public Policy")
    print(f"Top Gov result: {gov[0].title} ({gov[0].provider}) - score: {gov[0].match_score}")
    assert "iGOT" in gov[0].provider or gov[0].source_tier == 1

    tech = disc_engine.discover_resources(skill_slug="python", career_slug="software-engineer")
    print(f"Top Tech result: {tech[0].title} ({tech[0].provider}) - score: {tech[0].match_score}")
    assert "Python" in tech[0].title
    assert "iGOT" not in tech[0].provider
    print("Discovery & Ranking checks passed.")

    diag = disc_engine.get_diagnostics()
    print(f"Diagnostics: Total={diag['total_resources']}, iGOT={diag['igot_resources_count']}, Tier 1={diag['by_tier'].get('tier_1')}")
    assert diag["igot_resources_count"] >= 10
    print("\n==========================================")
    print("ALL MULTI-SOURCE & iGOT TESTS PASSED (100%)")
    print("==========================================\n")

if __name__ == "__main__":
    run_tests()
