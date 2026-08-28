from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.app.database import get_db
from backend.app.api.v1.auth import get_current_user
from backend.app.models.user import User
from backend.app.models.goal import Goal
from backend.app.schemas.goal import GoalOut

router = APIRouter(prefix="/goals", tags=["Goals"])

CAREER_GOAL_TEMPLATES: List[Dict[str, Any]] = [
    {
        "role": "AI/ML Engineer",
        "title": "Become an AI/ML Engineer",
        "description": "Master machine learning algorithms, deep learning with PyTorch, transformers, LLM agents, and MLOps model serving pipelines.",
        "target_skills": ["python", "linear-algebra", "machine-learning", "deep-learning", "transformers", "langchain-agents", "vector-rag", "mlops"]
    },
    {
        "role": "Data Scientist",
        "title": "Become a Data Scientist",
        "description": "Master SQL analytics, exploratory data analysis, statistical experimentation, predictive machine learning, and big data with PySpark.",
        "target_skills": ["python", "pandas", "sql", "eda", "machine-learning", "statistics", "pyspark"]
    },
    {
        "role": "Full Stack Developer",
        "title": "Become a Full Stack Developer",
        "description": "Build high-performance web applications with TypeScript, React 18, Next.js App Router, Tailwind CSS, and REST/GraphQL backend services.",
        "target_skills": ["typescript", "react-nextjs", "tailwind", "rest-apis", "graphql-websockets", "docker"]
    },
    {
        "role": "Cloud / DevOps Engineer",
        "title": "Become a Cloud & DevOps Engineer",
        "description": "Orchestrate resilient cloud infrastructure with Linux, automated CI/CD pipelines, Docker containers, Kubernetes, and AWS.",
        "target_skills": ["linux", "git-cicd", "docker", "kubernetes", "aws"]
    },
    {
        "role": "Cybersecurity Analyst",
        "title": "Become a Cybersecurity Analyst",
        "description": "Protect systems and networks with deep networking protocol inspection, OWASP web application defense, cryptography, and penetration testing.",
        "target_skills": ["networking", "linux", "web-security", "cryptography", "pentesting"]
    },
    {
        "role": "Software Engineer",
        "title": "Become a Core Software Engineer",
        "description": "Excel in data structures and algorithms, low-latency microservices with Go, and large-scale distributed system architecture.",
        "target_skills": ["dsa", "system-design", "golang", "rest-apis", "sql", "git-cicd"]
    }
]

@router.get("", response_model=List[GoalOut])
def get_user_goals(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.profile:
        return []
    goals = db.query(Goal).filter(Goal.profile_id == current_user.profile.id).all()
    return [GoalOut.model_validate(g) for g in goals]

@router.get("/templates")
def get_goal_templates():
    return CAREER_GOAL_TEMPLATES
