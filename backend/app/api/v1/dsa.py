from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.dsa.dsa_service import DSAService
from backend.app.schemas.dsa import (
    DSADomainSchema,
    DSATopicSummary,
    DSATopicDetail,
    DSASubtopicSchema,
    DSAConceptSchema,
    PracticeResourceItem,
)

router = APIRouter(prefix="/dsa", tags=["DSA Intelligence & Learning"])


@router.get("/domains", response_model=List[DSADomainSchema])
def get_dsa_domains(db: Session = Depends(get_db)):
    """Retrieves all DSA domains with nested topic summaries."""
    domains = DSAService.list_domains(db)

    results = []
    for d in domains:
        topic_summaries = []
        for t in d.topics:
            concepts = [c for s in (t.subtopics or []) for c in (s.concepts or [])]
            topic_summaries.append(
                DSATopicSummary(
                    id=t.id,
                    domain_id=t.domain_id,
                    skill_id=t.skill_id,
                    slug=t.slug,
                    name=t.name,
                    description=t.description,
                    order=t.order,
                    typical_importance=t.typical_importance or "HIGH",
                    prerequisite_topic_slugs=t.prerequisite_topic_slugs or [],
                    concepts_count=len(concepts),
                )
            )
        results.append(
            DSADomainSchema(
                id=d.id,
                slug=d.slug,
                name=d.name,
                description=d.description,
                order=d.order,
                topics=topic_summaries,
            )
        )
    return results


@router.get("/topics", response_model=List[Dict[str, Any]])
def get_dsa_topics(
    domain_slug: Optional[str] = Query(None, description="Filter by domain slug"),
    difficulty: Optional[str] = Query(None, description="Filter concepts by difficulty: EASY, MEDIUM, HARD"),
    search: Optional[str] = Query(None, description="Search topics by keyword"),
    db: Session = Depends(get_db),
):
    """Retrieves all 28 canonical DSA topics with concept counts and difficulty breakdowns."""
    return DSAService.list_topics(db, domain_slug=domain_slug, difficulty=difficulty, search=search)


@router.get("/topics/{topic_slug}", response_model=DSATopicDetail)
def get_dsa_topic_detail(topic_slug: str, db: Session = Depends(get_db)):
    """Retrieves fine-grained hierarchy for a single DSA topic."""
    topic = DSAService.get_topic_by_slug(db, topic_slug)
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"DSA topic with slug '{topic_slug}' not found.",
        )

    all_concepts = [c for s in (topic.subtopics or []) for c in (s.concepts or [])]

    subtopic_schemas = []
    for s in (topic.subtopics or []):
        concept_schemas = [
            DSAConceptSchema(
                id=c.id,
                subtopic_id=c.subtopic_id,
                slug=c.slug,
                name=c.name,
                description=c.description,
                difficulty=c.difficulty or "MEDIUM",
                learning_objectives=c.learning_objectives or [],
                common_patterns=c.common_patterns or [],
                common_mistakes=c.common_mistakes or [],
                practice_resources=[PracticeResourceItem(**r) for r in (c.practice_resources or [])],
            )
            for c in (s.concepts or [])
        ]
        subtopic_schemas.append(
            DSASubtopicSchema(
                id=s.id,
                topic_id=s.topic_id,
                slug=s.slug,
                name=s.name,
                description=s.description,
                order=s.order,
                concepts=concept_schemas,
            )
        )

    return DSATopicDetail(
        id=topic.id,
        domain_id=topic.domain_id,
        domain_name=topic.domain.name if topic.domain else None,
        skill_id=topic.skill_id,
        slug=topic.slug,
        name=topic.name,
        description=topic.description,
        order=topic.order,
        typical_importance=topic.typical_importance or "HIGH",
        prerequisite_topic_slugs=topic.prerequisite_topic_slugs or [],
        concepts_count=len(all_concepts),
        subtopics=subtopic_schemas,
    )


@router.get("/concepts/{concept_slug}", response_model=DSAConceptSchema)
def get_dsa_concept_detail(concept_slug: str, db: Session = Depends(get_db)):
    """Retrieves deep specifications for a single DSA concept."""
    concept = DSAService.get_concept_by_slug(db, concept_slug)
    if not concept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"DSA concept with slug '{concept_slug}' not found.",
        )

    return DSAConceptSchema(
        id=concept.id,
        subtopic_id=concept.subtopic_id,
        slug=concept.slug,
        name=concept.name,
        description=concept.description,
        difficulty=concept.difficulty or "MEDIUM",
        learning_objectives=concept.learning_objectives or [],
        common_patterns=concept.common_patterns or [],
        common_mistakes=concept.common_mistakes or [],
        practice_resources=[PracticeResourceItem(**r) for r in (concept.practice_resources or [])],
    )


@router.get("/topics/{topic_slug}/questions")
def get_topic_assessment_questions(
    topic_slug: str,
    difficulty: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """Retrieves aligned Phase 10 assessment questions for this DSA topic."""
    questions = DSAService.get_topic_questions(db, topic_slug, difficulty=difficulty, limit=limit)
    return {
        "topic_slug": topic_slug,
        "difficulty_filter": difficulty,
        "total_returned": len(questions),
        "questions": [
            {
                "id": q.id,
                "question_text": q.question_text,
                "difficulty": q.difficulty,
                "question_type": q.question_type,
                "marks": q.marks,
                "options": q.options,
                "explanation": q.explanation,
            }
            for q in questions
        ],
    }
