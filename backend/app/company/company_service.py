from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func
from backend.app.models.company import Company, CompanyRole
from backend.app.models.career import Career


class CompanyService:
    @staticmethod
    def list_companies(
        db: Session,
        search: Optional[str] = None,
        industry: Optional[str] = None,
        company_type: Optional[str] = None,
        headquarters_country: Optional[str] = None,
        is_verified: Optional[bool] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[Company], int]:
        query = db.query(Company)

        if is_verified is not None:
            query = query.filter(Company.is_verified == is_verified)

        if industry:
            query = query.filter(func.lower(Company.industry) == industry.lower())

        if company_type:
            query = query.filter(func.lower(Company.company_type) == company_type.lower())

        if headquarters_country:
            query = query.filter(func.lower(Company.headquarters_country) == headquarters_country.lower())

        if search:
            search_term = f"%{search.strip().lower()}%"
            # Match canonical name, display name, slug, or industry
            query = query.filter(
                or_(
                    func.lower(Company.canonical_name).like(search_term),
                    func.lower(Company.display_name).like(search_term),
                    func.lower(Company.slug).like(search_term),
                    func.lower(Company.industry).like(search_term),
                    func.lower(Company.description).like(search_term),
                )
            )

        total = query.count()
        companies = query.order_by(Company.display_name.asc()).offset(skip).limit(limit).all()
        return companies, total

    @staticmethod
    def get_company_by_slug(db: Session, company_slug: str) -> Optional[Company]:
        return (
            db.query(Company)
            .options(joinedload(Company.roles).joinedload(CompanyRole.career))
            .filter(func.lower(Company.slug) == company_slug.lower())
            .first()
        )

    @staticmethod
    def get_company_by_id(db: Session, company_id: str) -> Optional[Company]:
        return (
            db.query(Company)
            .options(joinedload(Company.roles).joinedload(CompanyRole.career))
            .filter(Company.id == company_id)
            .first()
        )

    @staticmethod
    def resolve_company_by_alias(db: Session, query_text: str) -> Optional[Company]:
        """Resolves a company by slug, name, or alias (e.g. Alphabet, JPMC, AWS)."""
        clean_text = query_text.strip().lower()

        # 1. Exact slug or display/canonical name match
        direct = (
            db.query(Company)
            .filter(
                or_(
                    func.lower(Company.slug) == clean_text,
                    func.lower(Company.display_name) == clean_text,
                    func.lower(Company.canonical_name) == clean_text,
                )
            )
            .first()
        )
        if direct:
            return direct

        # 2. Search in aliases JSON
        all_companies = db.query(Company).all()
        for comp in all_companies:
            aliases = comp.aliases or []
            for a in aliases:
                if isinstance(a, str) and clean_text == a.strip().lower():
                    return comp

        # 3. Substring match fallback
        for comp in all_companies:
            if clean_text in comp.display_name.lower() or clean_text in comp.canonical_name.lower():
                return comp

        return None

    @staticmethod
    def list_company_roles(
        db: Session,
        company_slug: str,
        career_id: Optional[str] = None,
        experience_level: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[CompanyRole], int]:
        company = db.query(Company).filter(func.lower(Company.slug) == company_slug.lower()).first()
        if not company:
            return [], 0

        query = (
            db.query(CompanyRole)
            .options(joinedload(CompanyRole.career), joinedload(CompanyRole.company))
            .filter(CompanyRole.company_id == company.id)
        )

        if career_id:
            query = query.filter(CompanyRole.career_id == career_id)

        if experience_level:
            query = query.filter(CompanyRole.experience_level == experience_level.upper())

        total = query.count()
        roles = query.order_by(CompanyRole.canonical_role_name.asc()).offset(skip).limit(limit).all()
        return roles, total

    @staticmethod
    def get_company_role(
        db: Session,
        company_slug: str,
        role_slug: str
    ) -> Optional[CompanyRole]:
        company = db.query(Company).filter(func.lower(Company.slug) == company_slug.lower()).first()
        if not company:
            return None

        return (
            db.query(CompanyRole)
            .options(joinedload(CompanyRole.career), joinedload(CompanyRole.company))
            .filter(
                CompanyRole.company_id == company.id,
                func.lower(CompanyRole.role_slug) == role_slug.lower(),
            )
            .first()
        )

    @staticmethod
    def get_companies_by_career(
        db: Session,
        career_slug: str,
        skip: int = 0,
        limit: int = 20
    ) -> Tuple[List[Dict[str, Any]], int]:
        """Finds all companies that have roles mapped to the given canonical Career slug."""
        career = db.query(Career).filter(func.lower(Career.slug) == career_slug.lower()).first()
        if not career:
            return [], 0

        roles = (
            db.query(CompanyRole)
            .options(joinedload(CompanyRole.company))
            .filter(CompanyRole.career_id == career.id)
            .offset(skip)
            .limit(limit)
            .all()
        )
        total = db.query(CompanyRole).filter(CompanyRole.career_id == career.id).count()

        results = []
        for r in roles:
            results.append({
                "company_id": r.company.id,
                "company_slug": r.company.slug,
                "company_name": r.company.display_name,
                "industry": r.company.industry,
                "headquarters_country": r.company.headquarters_country,
                "role_id": r.id,
                "role_slug": r.role_slug,
                "role_name": r.display_name,
                "dsa_relevance": r.dsa_relevance,
                "experience_level": r.experience_level,
                "employment_type": r.employment_type
            })

        return results, total

    @staticmethod
    def get_meta_industries(db: Session) -> List[str]:
        industries = db.query(Company.industry).distinct().all()
        return sorted([ind[0] for ind in industries if ind[0]])
