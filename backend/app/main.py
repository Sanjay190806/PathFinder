from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from backend.app.core.config import settings
from backend.app.core.logger import logger
from backend.app.database import engine, Base, SessionLocal
from backend.app.seed.seed_data import seed_database
from backend.app.api.v1 import (
    auth,
    profile,
    skills,
    goals,
    resources,
    learning_path,
    progress,
    feedback,
    assessment,
    analytics,
    ai_chat,
    demo,
    recommendations,
    interactions,
    intelligence,
    practical,
    projects,
    scenarios,
    practical_assessment,
    portfolio,
    employability,
    opportunities,
    applications,
    career_prep,
    education,
    career_discovery,
    pathways,
    market_intelligence,
    planner,
    preparation,
    courses,
    careers,
    companies,
    dsa,
    company_roadmaps,
    dynamic_intelligence,
)
from backend.app.api.v1.assessments import assessments_router, questions_router, exam_sessions_router

# ---------------------------------------------------------------------------
# Rate limiter — per-IP, default 200 requests/minute across all routes.
# Sensitive routes (auth, AI) override with stricter limits in their routers.
# ---------------------------------------------------------------------------
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.PROJECT_NAME} (Algo version: {settings.RECOMMENDATION_ALGO_VERSION})")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
        logger.info("Database schema and demo seed initialized.")
    finally:
        db.close()
    yield
    logger.info("Shutting down PathFinder API.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# ---------------------------------------------------------------------------
# Rate limiter state + handler
# ---------------------------------------------------------------------------
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ---------------------------------------------------------------------------
# CORS — only the origins listed in CORS_ORIGINS setting are allowed.
# Update CORS_ORIGINS in your .env to add production domains.
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "X-CSRF-Token", "X-Refresh-Token"],
)


# ---------------------------------------------------------------------------
# SEC-006: CSRF protection middleware for state-changing cookie requests
# ---------------------------------------------------------------------------
from backend.app.core.csrf import validate_csrf_protection

@app.middleware("http")
async def csrf_middleware(request: Request, call_next):
    try:
        validate_csrf_protection(request)
    except HTTPException as exc:
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
    return await call_next(request)


# ---------------------------------------------------------------------------
# Security headers middleware — applied to every response.
# ---------------------------------------------------------------------------
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
            headers=getattr(exc, "headers", None)
        )
    logger.error(f"Unhandled server exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please contact PathFinder support."}
    )

app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(profile.router, prefix=settings.API_V1_STR)
app.include_router(skills.router, prefix=settings.API_V1_STR)
app.include_router(goals.router, prefix=settings.API_V1_STR)
app.include_router(resources.router, prefix=settings.API_V1_STR)
app.include_router(recommendations.router, prefix=settings.API_V1_STR)
app.include_router(learning_path.router, prefix=settings.API_V1_STR)
app.include_router(progress.router, prefix=settings.API_V1_STR)
app.include_router(feedback.router, prefix=settings.API_V1_STR)
app.include_router(assessment.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(ai_chat.router, prefix=settings.API_V1_STR)
app.include_router(interactions.router, prefix=settings.API_V1_STR)
app.include_router(demo.router, prefix=settings.API_V1_STR)
app.include_router(intelligence.router, prefix=settings.API_V1_STR)
app.include_router(practical.router, prefix=settings.API_V1_STR)
app.include_router(projects.router, prefix=settings.API_V1_STR)
app.include_router(scenarios.router, prefix=settings.API_V1_STR)
app.include_router(practical_assessment.router, prefix=settings.API_V1_STR)
app.include_router(portfolio.router, prefix=settings.API_V1_STR)
app.include_router(employability.router, prefix=settings.API_V1_STR)
app.include_router(opportunities.router, prefix=settings.API_V1_STR)
app.include_router(applications.router, prefix=settings.API_V1_STR)
app.include_router(career_prep.router, prefix=settings.API_V1_STR)
app.include_router(education.router, prefix=settings.API_V1_STR)
app.include_router(career_discovery.router, prefix=settings.API_V1_STR)
app.include_router(careers.router, prefix=settings.API_V1_STR)
app.include_router(pathways.router, prefix=settings.API_V1_STR)
app.include_router(market_intelligence.router, prefix=settings.API_V1_STR)
app.include_router(planner.router, prefix=settings.API_V1_STR)
app.include_router(preparation.router, prefix=settings.API_V1_STR)
app.include_router(courses.router, prefix=settings.API_V1_STR)
app.include_router(assessments_router, prefix=settings.API_V1_STR)
app.include_router(questions_router, prefix=settings.API_V1_STR)
app.include_router(exam_sessions_router, prefix=settings.API_V1_STR)
app.include_router(companies.router, prefix=settings.API_V1_STR)
app.include_router(dsa.router, prefix=settings.API_V1_STR)
app.include_router(company_roadmaps.router, prefix=settings.API_V1_STR)
app.include_router(dynamic_intelligence.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "name": "PathFinder API",
        "version": settings.RECOMMENDATION_ALGO_VERSION,
        "status": "online",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

