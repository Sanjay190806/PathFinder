from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import uuid
import re

from backend.app.models.resource import LearningResource
from backend.app.models.skill import Skill
from backend.app.models.syllabus import (
    CourseSyllabus,
    SyllabusModule,
    SyllabusTopic,
    SyllabusSubtopic,
    LearningObjective,
    SyllabusTopicSkill,
    LearnerCourseProgress
)
from backend.app.schemas.syllabus import (
    CourseSyllabusCreate,
    SyllabusCoverageOut,
    CourseSyllabusDetailOut
)
from backend.app.syllabus.syllabus_validator import SyllabusValidator


class SyllabusEngine:
    """
    Core engine managing versioned syllabus lifecycles, validation,
    coverage metrics, and multi-domain blueprint transformations.
    """

    def __init__(self, db: Session):
        self.db = db

    def _resolve_course_id(self, course_id_or_slug: str) -> str:
        res = (
            self.db.query(LearningResource)
            .filter((LearningResource.id == course_id_or_slug) | (LearningResource.slug == course_id_or_slug))
            .first()
        )
        return res.id if res else course_id_or_slug

    def get_active_syllabus(self, course_id: str) -> Optional[CourseSyllabus]:
        """Retrieves the latest active syllabus for a course (by ID or slug)."""
        actual_id = self._resolve_course_id(course_id)
        return (
            self.db.query(CourseSyllabus)
            .filter(CourseSyllabus.course_id == actual_id, CourseSyllabus.is_active == True)
            .order_by(CourseSyllabus.version.desc())
            .first()
        )

    def get_syllabus_by_version(self, course_id: str, version: int) -> Optional[CourseSyllabus]:
        """Retrieves a specific historical version of a syllabus."""
        actual_id = self._resolve_course_id(course_id)
        return (
            self.db.query(CourseSyllabus)
            .filter(CourseSyllabus.course_id == actual_id, CourseSyllabus.version == version)
            .first()
        )

    def list_syllabus_versions(self, course_id: str) -> List[Dict[str, Any]]:
        """Lists all registered syllabus versions for a course."""
        actual_id = self._resolve_course_id(course_id)
        syllabuses = (
            self.db.query(CourseSyllabus)
            .filter(CourseSyllabus.course_id == actual_id)
            .order_by(CourseSyllabus.version.desc())
            .all()
        )
        return [
            {
                "id": s.id,
                "course_id": s.course_id,
                "version": s.version,
                "title": s.title,
                "is_active": s.is_active,
                "source": s.source,
                "verification_status": s.verification_status,
                "created_at": s.created_at
            }
            for s in syllabuses
        ]

    def create_syllabus(
        self,
        syllabus_in: CourseSyllabusCreate,
        auto_activate: bool = True
    ) -> Tuple[CourseSyllabus, bool, List[str]]:
        """
        Validates and creates a new versioned syllabus for a course.
        Preserves historical versions intact.
        """
        raw_dict = syllabus_in.model_dump()
        is_valid, errors = SyllabusValidator.validate_syllabus_data(raw_dict)

        # Determine next version number
        latest_version = (
            self.db.query(CourseSyllabus.version)
            .filter(CourseSyllabus.course_id == syllabus_in.course_id)
            .order_by(CourseSyllabus.version.desc())
            .first()
        )
        next_version = (latest_version[0] + 1) if latest_version else 1

        # If auto_activate is requested, deactivate previous versions
        if auto_activate and is_valid:
            self.db.query(CourseSyllabus).filter(
                CourseSyllabus.course_id == syllabus_in.course_id,
                CourseSyllabus.is_active == True
            ).update({"is_active": False})

        new_syllabus = CourseSyllabus(
            id=str(uuid.uuid4()),
            course_id=syllabus_in.course_id,
            title=syllabus_in.title,
            description=syllabus_in.description,
            version=next_version,
            is_active=auto_activate and is_valid,
            language=syllabus_in.language or "English",
            source=syllabus_in.source or "OFFICIAL_PROVIDER",
            source_url=syllabus_in.source_url,
            provider=syllabus_in.provider or "NPTEL",
            verification_status=syllabus_in.verification_status or ("VERIFIED" if is_valid else "UNVERIFIED"),
            validation_status="VALID" if is_valid else "INVALID",
            validation_errors=errors,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        self.db.add(new_syllabus)
        self.db.flush()

        # Insert modules, topics, subtopics, objectives, and skills
        for mod_data in syllabus_in.modules:
            module = SyllabusModule(
                id=str(uuid.uuid4()),
                syllabus_id=new_syllabus.id,
                title=mod_data.title,
                description=mod_data.description,
                order_index=mod_data.order_index,
                weight=mod_data.weight,
                estimated_learning_hours=mod_data.estimated_learning_hours,
                prerequisite_module_ids=mod_data.prerequisite_module_ids
            )
            self.db.add(module)
            self.db.flush()

            for top_data in mod_data.topics:
                topic = SyllabusTopic(
                    id=str(uuid.uuid4()),
                    module_id=module.id,
                    title=top_data.title,
                    description=top_data.description,
                    order_index=top_data.order_index,
                    weight=top_data.weight,
                    difficulty=top_data.difficulty,
                    estimated_learning_hours=top_data.estimated_learning_hours
                )
                self.db.add(topic)
                self.db.flush()

                for sub_data in top_data.subtopics:
                    subtopic = SyllabusSubtopic(
                        id=str(uuid.uuid4()),
                        topic_id=topic.id,
                        title=sub_data.title,
                        description=sub_data.description,
                        order_index=sub_data.order_index,
                        difficulty=sub_data.difficulty
                    )
                    self.db.add(subtopic)

                for obj_data in top_data.objectives:
                    objective = LearningObjective(
                        id=str(uuid.uuid4()),
                        topic_id=topic.id,
                        objective=obj_data.objective,
                        objective_type=obj_data.objective_type,
                        skill_ids=obj_data.skill_ids,
                        difficulty=obj_data.difficulty,
                        importance=obj_data.importance
                    )
                    self.db.add(objective)

                for sk_data in top_data.skills:
                    # Match skill_id against existing Skill table if present
                    skill_rec = (
                        self.db.query(Skill)
                        .filter((Skill.id == sk_data.skill_id) | (Skill.slug == sk_data.skill_id))
                        .first()
                    )
                    resolved_skill_id = skill_rec.id if skill_rec else sk_data.skill_id
                    topic_skill = SyllabusTopicSkill(
                        id=str(uuid.uuid4()),
                        topic_id=topic.id,
                        skill_id=resolved_skill_id,
                        relationship_type=sk_data.relationship_type,
                        importance=sk_data.importance,
                        confidence=sk_data.confidence,
                        source=sk_data.source
                    )
                    self.db.add(topic_skill)

        self.db.commit()
        self.db.refresh(new_syllabus)
        return new_syllabus, is_valid, errors

    def calculate_coverage(
        self,
        profile_id: str,
        course_id: str,
        syllabus_id: Optional[str] = None
    ) -> SyllabusCoverageOut:
        """
        Calculates granular and weighted coverage for a learner across a course's syllabus.
        Derives authoritative course state.
        """
        actual_course_id = self._resolve_course_id(course_id)
        if syllabus_id:
            syllabus = self.db.query(CourseSyllabus).filter(CourseSyllabus.id == syllabus_id).first()
        else:
            syllabus = self.get_active_syllabus(actual_course_id)

        if not syllabus:
            return SyllabusCoverageOut(
                course_id=actual_course_id,
                syllabus_id="",
                syllabus_version=1,
                course_state="NOT_STARTED",
                total_modules=0,
                completed_modules=0,
                module_coverage_pct=0.0,
                total_topics=0,
                completed_topics=0,
                topic_coverage_pct=0.0,
                total_objectives=0,
                mastered_objectives=0,
                objective_coverage_pct=0.0,
                weighted_coverage_pct=0.0,
                is_assessment_ready=False,
                readiness_reasons=["No syllabus registered for course."],
                completed_module_ids=[],
                completed_topic_ids=[],
                mastered_objective_ids=[]
            )

        # Get or create learner progress record
        progress = (
            self.db.query(LearnerCourseProgress)
            .filter(
                LearnerCourseProgress.profile_id == profile_id,
                LearnerCourseProgress.course_id == actual_course_id,
                LearnerCourseProgress.syllabus_id == syllabus.id
            )
            .first()
        )

        completed_mod_set = set(progress.completed_module_ids or []) if progress else set()
        completed_top_set = set(progress.completed_topic_ids or []) if progress else set()
        mastered_obj_set = set(progress.mastered_objective_ids or []) if progress else set()

        total_modules = len(syllabus.modules)
        total_topics = 0
        total_objectives = 0

        weighted_progress_sum = 0.0

        for mod in syllabus.modules:
            mod_topics = mod.topics
            mod_topic_count = len(mod_topics)
            total_topics += mod_topic_count

            mod_completed_topics = 0
            for top in mod_topics:
                if top.id in completed_top_set:
                    mod_completed_topics += 1
                total_objectives += len(top.objectives)

            # Check if all topics in module completed -> auto-mark module complete
            if mod_topic_count > 0 and mod_completed_topics == mod_topic_count:
                completed_mod_set.add(mod.id)

            # Module weighted contribution
            if mod_topic_count > 0:
                mod_ratio = mod_completed_topics / mod_topic_count
                weighted_progress_sum += (mod.weight / 100.0) * mod_ratio * 100.0

        completed_modules_count = len(completed_mod_set)
        completed_topics_count = len(completed_top_set)
        mastered_objectives_count = len(mastered_obj_set)

        mod_pct = (completed_modules_count / total_modules * 100.0) if total_modules > 0 else 0.0
        top_pct = (completed_topics_count / total_topics * 100.0) if total_topics > 0 else 0.0
        obj_pct = (mastered_objectives_count / total_objectives * 100.0) if total_objectives > 0 else 0.0
        weighted_pct = min(100.0, max(0.0, weighted_progress_sum))

        # Course State Evaluation
        is_assessment_ready = False
        reasons: List[str] = []

        if weighted_pct >= 80.0 and completed_modules_count >= max(1, int(total_modules * 0.75)):
            course_state = "ASSESSMENT_READY"
            is_assessment_ready = True
            reasons.append("Syllabus coverage reached readiness threshold (>= 80% weighted coverage).")
        elif completed_topics_count > 0 or completed_modules_count > 0:
            course_state = "IN_PROGRESS"
            reasons.append(f"In progress: {completed_topics_count}/{total_topics} topics completed.")
        else:
            course_state = "NOT_STARTED"
            reasons.append("Course not yet started.")

        # Persist or update progress record
        if progress:
            progress.completed_module_ids = list(completed_mod_set)
            progress.completed_topic_ids = list(completed_top_set)
            progress.mastered_objective_ids = list(mastered_obj_set)
            progress.module_progress_pct = mod_pct
            progress.topic_progress_pct = top_pct
            progress.objective_progress_pct = obj_pct
            progress.overall_coverage_pct = weighted_pct
            progress.status = course_state
            if is_assessment_ready and not progress.assessment_ready_at:
                progress.assessment_ready_at = datetime.now(timezone.utc)
            progress.updated_at = datetime.now(timezone.utc)
        else:
            progress = LearnerCourseProgress(
                id=str(uuid.uuid4()),
                profile_id=profile_id,
                course_id=course_id,
                syllabus_id=syllabus.id,
                syllabus_version=syllabus.version,
                status=course_state,
                completed_module_ids=list(completed_mod_set),
                completed_topic_ids=list(completed_top_set),
                mastered_objective_ids=list(mastered_obj_set),
                module_progress_pct=mod_pct,
                topic_progress_pct=top_pct,
                objective_progress_pct=obj_pct,
                overall_coverage_pct=weighted_pct,
                assessment_ready_at=datetime.now(timezone.utc) if is_assessment_ready else None,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
            self.db.add(progress)

        self.db.commit()

        return SyllabusCoverageOut(
            course_id=course_id,
            syllabus_id=syllabus.id,
            syllabus_version=syllabus.version,
            course_state=course_state,
            total_modules=total_modules,
            completed_modules=completed_modules_count,
            module_coverage_pct=round(mod_pct, 1),
            total_topics=total_topics,
            completed_topics=completed_topics_count,
            topic_coverage_pct=round(top_pct, 1),
            total_objectives=total_objectives,
            mastered_objectives=mastered_objectives_count,
            objective_coverage_pct=round(obj_pct, 1),
            weighted_coverage_pct=round(weighted_pct, 1),
            is_assessment_ready=is_assessment_ready,
            readiness_reasons=reasons,
            completed_module_ids=list(completed_mod_set),
            completed_topic_ids=list(completed_top_set),
            mastered_objective_ids=list(mastered_obj_set)
        )

    def update_progress(
        self,
        profile_id: str,
        course_id: str,
        topic_id: Optional[str] = None,
        is_topic_completed: Optional[bool] = None,
        objective_id: Optional[str] = None,
        is_objective_mastered: Optional[bool] = None,
        module_id: Optional[str] = None,
        is_module_completed: Optional[bool] = None
    ) -> SyllabusCoverageOut:
        """Updates granular completion state and triggers coverage recalculation."""
        actual_course_id = self._resolve_course_id(course_id)
        syllabus = self.get_active_syllabus(actual_course_id)
        if not syllabus:
            raise ValueError(f"No active syllabus found for course '{course_id}'.")

        progress = (
            self.db.query(LearnerCourseProgress)
            .filter(
                LearnerCourseProgress.profile_id == profile_id,
                LearnerCourseProgress.course_id == actual_course_id,
                LearnerCourseProgress.syllabus_id == syllabus.id
            )
            .first()
        )

        if not progress:
            progress = LearnerCourseProgress(
                id=str(uuid.uuid4()),
                profile_id=profile_id,
                course_id=actual_course_id,
                syllabus_id=syllabus.id,
                syllabus_version=syllabus.version,
                completed_module_ids=[],
                completed_topic_ids=[],
                mastered_objective_ids=[]
            )
            self.db.add(progress)
            self.db.flush()

        top_ids = set(progress.completed_topic_ids or [])
        obj_ids = set(progress.mastered_objective_ids or [])
        mod_ids = set(progress.completed_module_ids or [])

        if topic_id:
            if is_topic_completed is True:
                top_ids.add(topic_id)
            elif is_topic_completed is False:
                top_ids.discard(topic_id)

        if objective_id:
            if is_objective_mastered is True:
                obj_ids.add(objective_id)
            elif is_objective_mastered is False:
                obj_ids.discard(objective_id)

        if module_id:
            if is_module_completed is True:
                mod_ids.add(module_id)
            elif is_module_completed is False:
                mod_ids.discard(module_id)

        progress.completed_topic_ids = list(top_ids)
        progress.mastered_objective_ids = list(obj_ids)
        progress.completed_module_ids = list(mod_ids)
        progress.updated_at = datetime.now(timezone.utc)
        self.db.commit()

        return self.calculate_coverage(profile_id, course_id, syllabus.id)

    @classmethod
    def extract_ai_syllabus_proposal(
        cls,
        course_title: str,
        raw_text: str,
        course_id: str = "temp-course-id",
        provider: str = "Imported Provider"
    ) -> Dict[str, Any]:
        """
        Parses unformatted course syllabus text into normalized modules, topics, and objectives.
        Marks provenance as AI_ASSISTED_EXTRACTION.
        """
        lines = [ln.strip() for ln in raw_text.split("\n") if ln.strip()]
        modules: List[Dict[str, Any]] = []
        current_mod: Optional[Dict[str, Any]] = None
        current_top: Optional[Dict[str, Any]] = None

        mod_idx = 0
        top_idx = 0

        for line in lines:
            # Check for Module Header
            if re.match(r"^(module|chapter|unit|section|week)\s*\d+[:.-]?", line, re.IGNORECASE) or line.startswith("#"):
                mod_idx += 1
                clean_title = re.sub(r"^(module|chapter|unit|section|week)\s*\d+[:.-]?\s*", "", line, flags=re.IGNORECASE).strip("# \t")
                if not clean_title:
                    clean_title = f"Module {mod_idx}: Core Concepts"

                current_mod = {
                    "title": clean_title,
                    "description": f"Core topics covering {clean_title}",
                    "order_index": mod_idx,
                    "weight": 0.0,  # Will normalize
                    "estimated_learning_hours": 6.0,
                    "prerequisite_module_ids": [],
                    "topics": []
                }
                modules.append(current_mod)
                top_idx = 0
                current_top = None
                continue

            # If no module exists yet, initialize first default module
            if not current_mod:
                mod_idx += 1
                current_mod = {
                    "title": f"Module {mod_idx}: Foundations",
                    "description": f"Foundational concepts for {course_title}",
                    "order_index": mod_idx,
                    "weight": 0.0,
                    "estimated_learning_hours": 6.0,
                    "prerequisite_module_ids": [],
                    "topics": []
                }
                modules.append(current_mod)
                top_idx = 0

            # Check for Topic line (bullet or short sentence)
            if line.startswith(("-", "*", "•")) or (len(line) < 80 and not line.endswith(".")):
                top_idx += 1
                clean_top = line.lstrip("-*• ").strip()
                if not clean_top:
                    continue

                current_top = {
                    "title": clean_top,
                    "description": f"Exploration and practice of {clean_top}",
                    "order_index": top_idx,
                    "weight": 0.0,  # Will normalize
                    "difficulty": "Intermediate",
                    "estimated_learning_hours": 2.0,
                    "subtopics": [],
                    "objectives": [
                        {
                            "objective": f"Understand core principles of {clean_top}",
                            "objective_type": "UNDERSTAND",
                            "skill_ids": [],
                            "difficulty": "Intermediate",
                            "importance": "HIGH"
                        },
                        {
                            "objective": f"Apply and implement practical solutions using {clean_top}",
                            "objective_type": "APPLY",
                            "skill_ids": [],
                            "difficulty": "Intermediate",
                            "importance": "HIGH"
                        }
                    ],
                    "skills": []
                }
                current_mod["topics"].append(current_top)
            elif current_top and len(line) > 10:
                # Add as learning objective or subtopic
                current_top["subtopics"].append({
                    "title": line[:100],
                    "description": line,
                    "order_index": len(current_top["subtopics"]) + 1,
                    "difficulty": "Intermediate"
                })

        # Ensure at least one module and topic
        if not modules:
            modules = [{
                "title": "Module 1: Foundations",
                "description": f"Foundational curriculum for {course_title}",
                "order_index": 1,
                "weight": 100.0,
                "estimated_learning_hours": 8.0,
                "prerequisite_module_ids": [],
                "topics": [{
                    "title": "Fundamental Concepts",
                    "description": "Core principles and introductory topics",
                    "order_index": 1,
                    "weight": 100.0,
                    "difficulty": "Beginner",
                    "estimated_learning_hours": 4.0,
                    "subtopics": [],
                    "objectives": [{
                        "objective": "Understand foundational fundamentals",
                        "objective_type": "UNDERSTAND",
                        "skill_ids": [],
                        "difficulty": "Beginner",
                        "importance": "HIGH"
                    }],
                    "skills": []
                }]
            }]

        # Normalize module weights to sum to exactly 100.0
        num_mods = len(modules)
        base_mod_weight = round(100.0 / num_mods, 2)
        mod_weight_sum = 0.0
        for i, m in enumerate(modules):
            if i == num_mods - 1:
                m["weight"] = round(100.0 - mod_weight_sum, 2)
            else:
                m["weight"] = base_mod_weight
                mod_weight_sum += base_mod_weight

            # Normalize topic weights within each module
            num_topics = len(m["topics"])
            if num_topics == 0:
                # Add default topic if module was empty
                m["topics"].append({
                    "title": f"{m['title']} Overview",
                    "description": "Overview of module competencies",
                    "order_index": 1,
                    "weight": 100.0,
                    "difficulty": "Intermediate",
                    "estimated_learning_hours": 2.0,
                    "subtopics": [],
                    "objectives": [{
                        "objective": f"Master principles of {m['title']}",
                        "objective_type": "UNDERSTAND",
                        "skill_ids": [],
                        "difficulty": "Intermediate",
                        "importance": "HIGH"
                    }],
                    "skills": []
                })
                num_topics = 1

            base_top_weight = round(100.0 / num_topics, 2)
            top_weight_sum = 0.0
            for j, t in enumerate(m["topics"]):
                if j == num_topics - 1:
                    t["weight"] = round(100.0 - top_weight_sum, 2)
                else:
                    t["weight"] = base_top_weight
                    top_weight_sum += base_top_weight

        return {
            "course_id": course_id,
            "title": f"{course_title} Syllabus",
            "description": f"AI-assisted extracted curriculum for {course_title}",
            "version": 1,
            "language": "English",
            "source": "AI_ASSISTED_EXTRACTION",
            "provider": provider,
            "verification_status": "AI_ASSISTED",
            "modules": modules
        }
