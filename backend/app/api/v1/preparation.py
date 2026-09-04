from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.api.v1.auth import get_current_user
from backend.app.models.user import User
from backend.app.preparation.preparation_engine import PreparationEngine
from backend.app.preparation.schemas import (
    PreparationReadinessResponse,
    PreparationGapsResponse,
    AdaptiveQuestionRequest,
    AdaptiveQuestionResponse,
    MockSessionCreateRequest,
    MockTurnSubmitRequest,
    MockTurnEvaluationResponse,
    MockSessionResponse,
    ResumeAuditRequest,
    ResumeAuditResponse,
    PortfolioAuditResponse,
    OpportunityPrepResponse,
    PreparationPlanResponse,
)

router = APIRouter(prefix="/preparation", tags=["Phase 9 Stage 10 Preparation Intelligence"])


@router.get("/readiness", response_model=PreparationReadinessResponse)
def get_preparation_readiness(
    career_id: Optional[str] = Query(None, description="Optional target career ID or slug"),
    opportunity_id: Optional[str] = Query(None, description="Optional target opportunity ID"),
    record_history: bool = Query(True, description="Whether to record a time-series history snapshot"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Computes candidate application readiness across 9 dimensions with DecisionTrace.
    """
    engine = PreparationEngine(db)
    return engine.get_readiness(
        learner_id=current_user.id,
        career_id=career_id,
        opportunity_id=opportunity_id,
        record_history=record_history,
    )


@router.get("/gaps", response_model=PreparationGapsResponse)
def get_preparation_gaps(
    career_id: Optional[str] = Query(None, description="Optional target career ID or slug"),
    opportunity_id: Optional[str] = Query(None, description="Optional target opportunity ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns multi-dimensional gaps across skills, projects, resume ATS, portfolio, interview, and behavioral readiness.
    """
    engine = PreparationEngine(db)
    return engine.get_gaps(
        learner_id=current_user.id,
        career_id=career_id,
        opportunity_id=opportunity_id,
    )


@router.post("/questions", response_model=AdaptiveQuestionResponse)
def generate_adaptive_questions(
    req: AdaptiveQuestionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generates tailored interview questions across categories and difficulty tiers with rubrics.
    """
    engine = PreparationEngine(db)
    return engine.question_engine.generate_questions(
        learner_id=current_user.id,
        category=req.category or "TECHNICAL",
        difficulty=req.difficulty,
        career_id=req.career_id,
        opportunity_id=req.opportunity_id,
        count=req.count or 5,
    )


@router.post("/mock-interview/sessions", response_model=MockSessionResponse)
def start_mock_interview_session(
    req: MockSessionCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Initializes a new interactive mock interview session with pre-generated structured questions.
    """
    engine = PreparationEngine(db)
    return engine.interview_engine.create_session(
        learner_id=current_user.id,
        session_type=req.session_type or "MIXED",
        career_id=req.career_id,
        opportunity_id=req.opportunity_id,
        target_difficulty=req.target_difficulty or "AUTO",
    )


@router.post("/mock-interview/sessions/{session_id}/turn")
def submit_mock_interview_turn(
    session_id: str,
    req: MockTurnSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Evaluates a candidate's answer against 6 dimensions (accuracy, depth, structure, confidence, India market, overall).
    """
    engine = PreparationEngine(db)
    requester_profile_id = current_user.profile.id if current_user.profile else current_user.id
    try:
        return engine.interview_engine.submit_turn(
            session_id=session_id,
            question_id=req.question_id,
            response_text=req.response_text,
            requester_profile_id=requester_profile_id,
        )
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/mock-interview/sessions/{session_id}", response_model=MockSessionResponse)
def get_mock_interview_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieves the full transcript, evaluations, and progress of a mock interview session.
    """
    engine = PreparationEngine(db)
    requester_profile_id = current_user.profile.id if current_user.profile else current_user.id
    try:
        return engine.interview_engine.get_session(
            session_id=session_id,
            requester_profile_id=requester_profile_id,
        )
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/resume/audit", response_model=ResumeAuditResponse)
def audit_learner_resume(
    req: ResumeAuditRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Audits resume text for ATS keyword match, action verb strength, quantification, and provides verified bullet rewrites.
    """
    engine = PreparationEngine(db)
    return engine.resume_intelligence.audit_resume(
        learner_id=current_user.id,
        resume_text=req.resume_text,
        career_id=req.career_id,
        opportunity_id=req.opportunity_id,
    )


@router.get("/portfolio/audit", response_model=PortfolioAuditResponse)
def audit_learner_portfolio(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Assesses portfolio completeness, project depth, README documentation, live demos, and automated test coverage.
    """
    engine = PreparationEngine(db)
    return engine.portfolio_auditor.audit_portfolio(learner_id=current_user.id)


@router.get("/opportunities/{opportunity_id}/prep", response_model=OpportunityPrepResponse)
def get_opportunity_preparation(
    opportunity_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Provides opportunity requirement-to-evidence matrix, application state, company brief, and tailored interview prep.
    """
    engine = PreparationEngine(db)
    try:
        return engine.application_engine.evaluate_opportunity_prep(
            learner_id=current_user.id,
            opportunity_id=opportunity_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/plan", response_model=PreparationPlanResponse)
def get_preparation_plan(
    career_id: Optional[str] = Query(None, description="Optional target career ID"),
    opportunity_id: Optional[str] = Query(None, description="Optional target opportunity ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generates actionable prioritized preparation tasks and estimated days to application readiness.
    """
    engine = PreparationEngine(db)
    return engine.plan_engine.generate_preparation_plan(
        learner_id=current_user.id,
        career_id=career_id,
        opportunity_id=opportunity_id,
    )


@router.get("/history", response_model=List[Dict[str, Any]])
def get_preparation_history(
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns time-series historical preparation records and trend progression.
    """
    engine = PreparationEngine(db)
    return engine.history_tracker.get_learner_history(
        learner_id=current_user.id,
        limit=limit,
    )
