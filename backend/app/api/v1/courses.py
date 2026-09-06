from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from backend.app.database import get_db
from backend.app.api.v1.auth import get_current_user
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.models.resource import LearningResource
from backend.app.models.syllabus import CourseSyllabus, SyllabusModule, SyllabusTopic
from backend.app.schemas.syllabus import (
    CourseSyllabusCreate,
    CourseSyllabusOut,
    CourseSyllabusDetailOut,
    SyllabusModuleOut,
    SyllabusTopicOut,
    SyllabusCoverageOut,
    LearnerSyllabusProgressUpdate,
    AIExtractSyllabusRequest,
    AIExtractSyllabusResponse
)
from backend.app.syllabus.syllabus_engine import SyllabusEngine
from backend.app.syllabus.syllabus_validator import SyllabusValidator

router = APIRouter(prefix="/courses", tags=["Course Syllabus & Assessment Blueprint"])


def _resolve_resource_id(db: Session, course_id_or_slug: str) -> str:
    """Resolves resource ID by either UUID id or slug, supporting extended catalog items."""
    engine = SyllabusEngine(db)
    return engine._resolve_course_id(course_id_or_slug)


def _build_syllabus_detail(syllabus: CourseSyllabus) -> CourseSyllabusDetailOut:
    """Builds a detailed nested output object from a CourseSyllabus ORM entity."""
    total_hours = 0.0
    total_topics = 0
    total_objectives = 0

    modules_out: List[SyllabusModuleOut] = []
    for m in syllabus.modules:
        total_hours += m.estimated_learning_hours or 0.0
        topics_out: List[SyllabusTopicOut] = []
        for t in m.topics:
            total_topics += 1
            total_objectives += len(t.objectives)
            topics_out.append(SyllabusTopicOut.model_validate(t))
        
        m_out = SyllabusModuleOut(
            id=m.id,
            syllabus_id=m.syllabus_id,
            title=m.title,
            description=m.description,
            order_index=m.order_index,
            weight=m.weight,
            estimated_learning_hours=m.estimated_learning_hours,
            prerequisite_module_ids=m.prerequisite_module_ids or [],
            topics=topics_out
        )
        modules_out.append(m_out)

    return CourseSyllabusDetailOut(
        id=syllabus.id,
        course_id=syllabus.course_id,
        title=syllabus.title,
        description=syllabus.description,
        version=syllabus.version,
        is_active=syllabus.is_active,
        language=syllabus.language,
        source=syllabus.source,
        source_url=syllabus.source_url,
        provider=syllabus.provider,
        verification_status=syllabus.verification_status,
        validation_status=syllabus.validation_status,
        validation_errors=syllabus.validation_errors or [],
        retrieved_at=syllabus.retrieved_at,
        verified_at=syllabus.verified_at,
        created_at=syllabus.created_at,
        updated_at=syllabus.updated_at,
        modules=modules_out,
        total_estimated_hours=round(total_hours, 1),
        total_modules=len(modules_out),
        total_topics=total_topics,
        total_objectives=total_objectives
    )


@router.get("/{course_id}/syllabus", response_model=CourseSyllabusDetailOut)
def get_active_course_syllabus(
    course_id: str,
    db: Session = Depends(get_db)
):
    """Retrieves the active authoritative syllabus hierarchy for a course."""
    actual_course_id = _resolve_resource_id(db, course_id)
    engine = SyllabusEngine(db)
    syllabus = engine.get_active_syllabus(actual_course_id)
    
    if not syllabus:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Active syllabus not found for course '{course_id}'."
        )
    return _build_syllabus_detail(syllabus)


@router.get("/{course_id}/syllabus/versions", response_model=List[Dict[str, Any]])
def list_course_syllabus_versions(
    course_id: str,
    db: Session = Depends(get_db)
):
    """Lists all historical and active syllabus versions for a course."""
    actual_course_id = _resolve_resource_id(db, course_id)
    engine = SyllabusEngine(db)
    # Ensure active syllabus is provisioned first so versions list is populated for valid courses
    engine.get_active_syllabus(actual_course_id)
    return engine.list_syllabus_versions(actual_course_id)


@router.get("/{course_id}/syllabus/versions/{version}", response_model=CourseSyllabusDetailOut)
def get_course_syllabus_version(
    course_id: str,
    version: int,
    db: Session = Depends(get_db)
):
    """Retrieves a specific historical version of a course syllabus."""
    actual_course_id = _resolve_resource_id(db, course_id)
    engine = SyllabusEngine(db)
    syllabus = engine.get_syllabus_by_version(actual_course_id, version)
    if not syllabus and version == 1:
        syllabus = engine.get_active_syllabus(actual_course_id)
    
    if not syllabus:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Syllabus version {version} not found for course '{course_id}'."
        )
    return _build_syllabus_detail(syllabus)


@router.post("/{course_id}/syllabus", response_model=CourseSyllabusDetailOut, status_code=status.HTTP_201_CREATED)
def create_course_syllabus(
    course_id: str,
    syllabus_in: CourseSyllabusCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Creates or registers a new versioned syllabus for a course.
    Enforces strict structural and weight normalization validation.
    """
    actual_course_id = _resolve_resource_id(db, course_id)
    syllabus_in.course_id = actual_course_id

    engine = SyllabusEngine(db)
    new_syllabus, is_valid, errors = engine.create_syllabus(syllabus_in)
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "message": "Syllabus validation failed. Check weight sums and structural requirements.",
                "errors": errors
            }
        )
    return _build_syllabus_detail(new_syllabus)


@router.get("/{course_id}/syllabus/modules", response_model=List[SyllabusModuleOut])
def list_course_syllabus_modules(
    course_id: str,
    db: Session = Depends(get_db)
):
    """Retrieves all modules of the active syllabus."""
    actual_course_id = _resolve_resource_id(db, course_id)
    engine = SyllabusEngine(db)
    syllabus = engine.get_active_syllabus(actual_course_id)
    if not syllabus:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Syllabus not found for course '{course_id}'."
        )
    return [SyllabusModuleOut.model_validate(m) for m in syllabus.modules]


@router.get("/{course_id}/syllabus/topics", response_model=List[SyllabusTopicOut])
def list_course_syllabus_topics(
    course_id: str,
    db: Session = Depends(get_db)
):
    """Retrieves all topics across modules of the active syllabus."""
    actual_course_id = _resolve_resource_id(db, course_id)
    engine = SyllabusEngine(db)
    syllabus = engine.get_active_syllabus(actual_course_id)
    if not syllabus:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Syllabus not found for course '{course_id}'."
        )
    topics = []
    for m in syllabus.modules:
        for t in m.topics:
            topics.append(SyllabusTopicOut.model_validate(t))
    return topics


@router.get("/{course_id}/syllabus/coverage", response_model=SyllabusCoverageOut)
def get_learner_course_coverage(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Computes real-time coverage metrics and authoritative course state
    for the authenticated learner. Scoped strictly through current_user.profile.
    """
    profile = current_user.profile
    if not profile:
        profile = LearnerProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    actual_course_id = _resolve_resource_id(db, course_id)
    engine = SyllabusEngine(db)
    return engine.calculate_coverage(profile.id, actual_course_id)


@router.post("/{course_id}/syllabus/progress", response_model=SyllabusCoverageOut)
def update_learner_course_progress(
    course_id: str,
    update_data: LearnerSyllabusProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates completion state for a specific topic, module, or objective,
    and recalculates authoritative course state.
    """
    profile = current_user.profile
    if not profile:
        profile = LearnerProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    actual_course_id = _resolve_resource_id(db, course_id)
    engine = SyllabusEngine(db)
    try:
        return engine.update_progress(
            profile_id=profile.id,
            course_id=actual_course_id,
            topic_id=update_data.topic_id,
            is_topic_completed=update_data.is_topic_completed,
            objective_id=update_data.objective_id,
            is_objective_mastered=update_data.is_objective_mastered,
            module_id=update_data.module_id,
            is_module_completed=update_data.is_module_completed
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))


@router.post("/{course_id}/syllabus/ai-extract", response_model=AIExtractSyllabusResponse)
def extract_ai_syllabus(
    course_id: str,
    extract_req: AIExtractSyllabusRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Parses unstructured syllabus text into a validated syllabus proposal.
    Explicitly tags provenance as AI_ASSISTED_EXTRACTION.
    """
    actual_course_id = _resolve_resource_id(db, course_id)
    raw_proposal = SyllabusEngine.extract_ai_syllabus_proposal(
        course_title=extract_req.course_title,
        raw_text=extract_req.raw_content,
        course_id=actual_course_id,
        provider=extract_req.provider or "AI Extracted"
    )

    is_valid, validation_warnings = SyllabusValidator.validate_syllabus_data(raw_proposal)
    proposal_schema = CourseSyllabusCreate.model_validate(raw_proposal)

    return AIExtractSyllabusResponse(
        syllabus_proposal=proposal_schema,
        is_ai_assisted=True,
        confidence_score=0.88 if is_valid else 0.65,
        extracted_summary=f"Extracted {len(raw_proposal['modules'])} modules from content.",
        extraction_warnings=validation_warnings
    )
