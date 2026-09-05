from typing import Dict, List, Any, Optional, Set
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from backend.app.models.profile import LearnerProfile
from backend.app.models.progress import Progress
from backend.app.dsa.learner_dsa_gap_service import LearnerDSAGapService
from backend.app.roadmap.company_roadmap_service import CompanyRoadmapService
from backend.app.resources.course_intelligence_service import CourseIntelligenceService
from backend.app.resources.youtube_practice_service import YouTubePracticeService


class CompanyRecommendationService:
    @staticmethod
    def get_personalized_recommendations(
        db: Session,
        company_slug: str,
        role_slug: str,
        learner_id: str,
        budget_preference: str = "FREE",
        preferred_language: str = "English",
    ) -> Dict[str, Any]:
        """Synthesizes Target Company + Role + DSA Priorities + Learner Gaps + Roadmap into an actionable learning action sequence."""
        # 1. Fetch learner gap analysis and roadmap
        gaps = LearnerDSAGapService.evaluate_learner_gaps(
            db, company_slug=company_slug, role_slug=role_slug, learner_id=learner_id
        )
        roadmap = CompanyRoadmapService.generate_company_roadmap(
            db=db, company_slug=company_slug, role_slug=role_slug, learner_id=learner_id
        )

        course_service = CourseIntelligenceService(db)
        all_courses = course_service.get_all_courses()

        # Check completed resources to filter duplicates
        completed_progress = (
            db.query(Progress)
            .filter(Progress.profile_id == learner_id, Progress.status == "completed")
            .all()
        )
        completed_ids: Set[str] = {p.resource_id for p in completed_progress}

        # 2. Determine Primary Next Milestone
        next_topic = gaps.get("next_recommended_topic")
        target_topic_slug = next_topic["topic_slug"] if next_topic else "arrays"
        target_topic_name = next_topic["topic_name"] if next_topic else "Core Foundations"
        target_diff = next_topic["target_difficulty"] if next_topic else "MEDIUM"

        # Search matching courses
        free_courses = [
            c for c in all_courses
            if c.get("free_learning")
            and (target_topic_slug in [t.lower() for t in c.get("dsa_topics", [])] or target_topic_slug in [s.lower() for s in c.get("skills", [])])
            and c["id"] not in completed_ids
        ]
        paid_courses = [
            c for c in all_courses
            if not c.get("free_learning")
            and (target_topic_slug in [t.lower() for t in c.get("dsa_topics", [])] or target_topic_slug in [s.lower() for s in c.get("skills", [])])
            and c["id"] not in completed_ids
        ]

        # Search YouTube resources
        yt_resources = YouTubePracticeService.search_youtube_resources(
            topic_slug=target_topic_slug, language=preferred_language, limit=3
        )

        # Search Practice Problems
        practice_probs = YouTubePracticeService.get_practice_problems(
            topic_slug=target_topic_slug
        )

        # Primary recommended course depends on budget preference
        primary_course = None
        if budget_preference.upper() == "FREE":
            primary_course = free_courses[0] if free_courses else (paid_courses[0] if paid_courses else None)
        else:
            # Paid allowed: prefer highest quality score
            candidates = free_courses + paid_courses
            candidates.sort(key=lambda x: x.get("quality_score", 0.8), reverse=True)
            primary_course = candidates[0] if candidates else None

        # 3. Build Action Payload
        critical_next = {
            "focus_topic": target_topic_name,
            "topic_slug": target_topic_slug,
            "target_difficulty": target_diff,
            "priority": "CRITICAL",
            "reason": f"Highest unblocked gap identified for {gaps.get('role_name')} at {gaps.get('company_name')}.",
            "primary_course": primary_course,
            "free_alternative": free_courses[0] if free_courses else None,
            "paid_alternative": paid_courses[0] if paid_courses else None,
            "youtube_alternative": yt_resources[0] if yt_resources else None,
            "practice_problems": practice_probs,
            "assessment_action": {
                "title": f"Take {target_topic_name} Proficiency Assessment",
                "exam_route": f"/assessment/dsa-{target_topic_slug}",
                "benchmark_score": "75%",
            },
        }

        # 4. Group remaining roadmap items into High Priority & Recommended
        high_priority_items = []
        recommended_items = []

        for item in roadmap.get("items", []):
            if item["status"] == "COMPLETED" or item["topic_slug"] == target_topic_slug:
                continue
            item_data = {
                "id": item["id"],
                "title": item["title"],
                "stage": item["stage"],
                "item_type": item["item_type"],
                "difficulty": item["difficulty"],
                "estimated_hours": item["estimated_hours"],
                "status": item["status"],
                "prerequisites": item["prerequisites"],
            }
            if item["priority"] in ("CRITICAL", "HIGH") and item["status"] != "LOCKED":
                high_priority_items.append(item_data)
            else:
                recommended_items.append(item_data)

        # 5. Build Decision Trace
        decision_trace = {
            "decision": "PERSONALIZED_RECOMMENDATION_SEQUENCE",
            "primary_milestone": target_topic_name,
            "rationale": (
                f"Selected {target_topic_name} as immediate next focus for learner targeting {gaps.get('role_name')} "
                f"at {gaps.get('company_name')}. Prerequisites are satisfied and role importance is {gaps.get('dsa_priority_level')}."
            ),
            "factors": [
                {"factor": "Role Priority", "value": gaps.get("dsa_priority_level")},
                {"factor": "Learner Mastery", "value": f"{round(next_topic.get('learner_confidence', 0.0) * 100)}%" if next_topic else "Unassessed"},
                {"factor": "Budget Alignment", "value": budget_preference},
                {"factor": "Language", "value": preferred_language},
            ],
        }

        return {
            "company_slug": company_slug,
            "company_name": gaps.get("company_name"),
            "role_slug": role_slug,
            "role_name": gaps.get("role_name"),
            "learner_id": learner_id,
            "budget_preference": budget_preference,
            "preferred_language": preferred_language,
            "critical_next": critical_next,
            "high_priority": high_priority_items[:4],
            "recommended": recommended_items[:6],
            "decision_trace": decision_trace,
        }

    @staticmethod
    def get_dsa_readiness_dashboard(
        db: Session,
        company_slug: str,
        role_slug: str,
        learner_id: str,
    ) -> Dict[str, Any]:
        """Returns structured topic-by-topic DSA dashboard data for frontend visualization."""
        gaps = LearnerDSAGapService.evaluate_learner_gaps(
            db, company_slug=company_slug, role_slug=role_slug, learner_id=learner_id
        )
        dsa_topics = gaps.get("dsa_topic_evaluations", [])

        return {
            "company_slug": company_slug,
            "company_name": gaps.get("company_name"),
            "role_slug": role_slug,
            "role_name": gaps.get("role_name"),
            "is_dsa_applicable": gaps.get("is_dsa_applicable"),
            "dsa_priority_level": gaps.get("dsa_priority_level"),
            "overall_readiness": gaps.get("readiness_percentage"),
            "topics": dsa_topics,
            "next_recommended_topic": gaps.get("next_recommended_topic"),
            "prerequisite_blockers": gaps.get("prerequisite_blockers"),
        }
