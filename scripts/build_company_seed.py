# Helper script containing company definitions for Phase 12 Stage 1

from scripts.build_company_seed_data import COMPANIES_RAW, ADDITIONAL_COMPANIES

def generate_catalog():
    all_companies = COMPANIES_RAW + ADDITIONAL_COMPANIES
    return all_companies
