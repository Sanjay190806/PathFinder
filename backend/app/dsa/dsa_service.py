from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_
from backend.app.models.dsa import DSADomain, DSATopic, DSASubtopic, DSAConcept
from backend.app.models.assessment import AssessmentQuestion


class DSAService:
    @staticmethod
    def list_domains(db: Session) -> List[DSADomain]:
        """Lists all DSA domains with topics and concept counts."""
        domains = (
            db.query(DSADomain)
            .options(
                joinedload(DSADomain.topics)
                .joinedload(DSATopic.subtopics)
                .joinedload(DSASubtopic.concepts)
            )
            .order_by(DSADomain.order.asc())
            .all()
        )
        return domains

    @staticmethod
    def list_topics(
        db: Session,
        domain_slug: Optional[str] = None,
        difficulty: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 200,
    ) -> List[Dict[str, Any]]:
        """Lists all 28 topics with concept counts and difficulty breakdowns.

        API-003: page/page_size added to support frontend pagination.
        Default page_size=200 preserves backward compatibility (all topics returned
        when params are omitted, since there are only 28 canonical topics).
        """
        query = (
            db.query(DSATopic)
            .options(
                joinedload(DSATopic.domain),
                joinedload(DSATopic.subtopics).joinedload(DSASubtopic.concepts),
            )
        )

        if domain_slug:
            query = query.join(DSADomain).filter(func.lower(DSADomain.slug) == domain_slug.lower())

        if search:
            search_term = f"%{search.strip().lower()}%"
            query = query.filter(
                or_(
                    func.lower(DSATopic.name).like(search_term),
                    func.lower(DSATopic.slug).like(search_term),
                    func.lower(DSATopic.description).like(search_term),
                )
            )

        # Apply pagination (offset/limit) after all filters
        offset = (max(1, page) - 1) * max(1, page_size)
        topics = (
            query.order_by(DSATopic.order.asc())
            .offset(offset)
            .limit(page_size)
            .all()
        )

        results = []
        for t in topics:
            concepts = [c for s in (t.subtopics or []) for c in (s.concepts or [])]

            if difficulty:
                # Filter concepts by difficulty if requested
                concepts = [c for c in concepts if c.difficulty.upper() == difficulty.upper()]

            difficulty_breakdown = {
                "EASY": sum(1 for c in concepts if c.difficulty == "EASY"),
                "MEDIUM": sum(1 for c in concepts if c.difficulty == "MEDIUM"),
                "HARD": sum(1 for c in concepts if c.difficulty == "HARD"),
            }

            results.append({
                "id": t.id,
                "domain_id": t.domain_id,
                "domain_slug": t.domain.slug if t.domain else None,
                "domain_name": t.domain.name if t.domain else None,
                "skill_id": t.skill_id,
                "slug": t.slug,
                "name": t.name,
                "description": t.description,
                "order": t.order,
                "typical_importance": t.typical_importance,
                "prerequisite_topic_slugs": t.prerequisite_topic_slugs or [],
                "concepts_count": len(concepts),
                "difficulty_breakdown": difficulty_breakdown,
            })

        return results

    @staticmethod
    def get_topic_by_slug(db: Session, topic_slug: str) -> Optional[DSATopic]:
        """Retrieves a single topic with its hierarchy of subtopics and concepts."""
        return (
            db.query(DSATopic)
            .options(
                joinedload(DSATopic.domain),
                joinedload(DSATopic.subtopics).joinedload(DSASubtopic.concepts),
            )
            .filter(func.lower(DSATopic.slug) == topic_slug.lower())
            .first()
        )

    @staticmethod
    def get_concept_by_slug(db: Session, concept_slug: str) -> Optional[DSAConcept]:
        """Retrieves a single concept with objectives, patterns, mistakes, and practice resources."""
        return (
            db.query(DSAConcept)
            .options(joinedload(DSAConcept.subtopic).joinedload(DSASubtopic.topic))
            .filter(func.lower(DSAConcept.slug) == concept_slug.lower())
            .first()
        )

    @staticmethod
    def get_topic_questions(
        db: Session,
        topic_slug: str,
        difficulty: Optional[str] = None,
        limit: int = 10,
    ) -> List[AssessmentQuestion]:
        """Retrieves Phase 10 assessment questions aligned with this DSA topic."""
        topic = db.query(DSATopic).filter(func.lower(DSATopic.slug) == topic_slug.lower()).first()
        if not topic:
            return []

        search_terms = [topic.name.lower(), topic.slug.replace("-", " ").lower()]
        for sub in topic.subtopics:
            search_terms.append(sub.name.lower())

        conditions = [
            func.lower(AssessmentQuestion.question_text).like(f"%{term}%")
            for term in search_terms[:3]
        ]
        if topic.skill_id:
            conditions.append(AssessmentQuestion.skill_id == topic.skill_id)

        query = db.query(AssessmentQuestion).filter(or_(*conditions))

        if difficulty:
            query = query.filter(func.lower(AssessmentQuestion.difficulty) == difficulty.lower())

        return query.limit(limit).all()
