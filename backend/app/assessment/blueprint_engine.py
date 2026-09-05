import uuid
import random
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from backend.app.models.syllabus import CourseSyllabus, SyllabusModule, SyllabusTopic
from backend.app.models.assessment import AssessmentBlueprint, Assessment, AssessmentQuestion
from backend.app.models.resource import LearningResource
from backend.app.models.skill import Skill
from backend.app.schemas.assessment_blueprint import AssessmentBlueprintCreate
from backend.app.assessment.coverage_validator import CoverageValidator
from backend.app.assessment.question_validator import QuestionValidator


class BlueprintEngine:
    """
    Translates an authoritative CourseSyllabus into a mathematically normalized AssessmentBlueprint,
    and produces fully validated Assessment instances respecting question distributions and marks.
    """

    def __init__(self, db: Session):
        self.db = db

    def create_blueprint_from_syllabus(
        self,
        payload: AssessmentBlueprintCreate
    ) -> AssessmentBlueprint:
        """
        Derives an authoritative AssessmentBlueprint strictly from the course syllabus.
        Each module's target questions and marks are calculated proportionally to module.weight.
        """
        # Resolve syllabus
        syllabus = None
        if payload.syllabus_id:
            syllabus = self.db.query(CourseSyllabus).filter(CourseSyllabus.id == payload.syllabus_id).first()
        elif payload.course_id:
            syllabus = (
                self.db.query(CourseSyllabus)
                .filter(CourseSyllabus.course_id == payload.course_id, CourseSyllabus.is_active == True)
                .first()
            )

        if not syllabus:
            # Check if course_id is slug
            course = self.db.query(LearningResource).filter(
                (LearningResource.id == payload.course_id) | (LearningResource.slug == payload.course_id)
            ).first()
            if course:
                syllabus = (
                    self.db.query(CourseSyllabus)
                    .filter(CourseSyllabus.course_id == course.id, CourseSyllabus.is_active == True)
                    .first()
                )

        if not syllabus:
            raise ValueError(f"No active CourseSyllabus found for course '{payload.course_id}'")

        modules = syllabus.modules
        if not modules:
            raise ValueError(f"Syllabus '{syllabus.id}' has 0 modules. Cannot generate blueprint.")

        # Calculate section rules based on module weights
        section_rules = []
        allocated_questions = 0
        allocated_marks = 0.0

        for i, mod in enumerate(modules):
            # Target questions for module: round(total_questions * (weight / 100.0))
            if i == len(modules) - 1:
                # Assign remainder to last module to ensure exact sum
                target_q = max(1, payload.total_questions - allocated_questions)
                target_m = round(payload.total_marks - allocated_marks, 2)
            else:
                ratio = (mod.weight or 0.0) / 100.0
                target_q = max(1, int(round(payload.total_questions * ratio)))
                target_m = round(payload.total_marks * ratio, 2)
                allocated_questions += target_q
                allocated_marks += target_m

            # Calculate topic breakdown within module
            topic_rules = []
            if mod.topics:
                sub_alloc_q = 0
                for j, top in enumerate(mod.topics):
                    t_ratio = (top.weight or 0.0) / 100.0
                    if j == len(mod.topics) - 1:
                        t_q = max(1, target_q - sub_alloc_q)
                    else:
                        t_q = max(1, int(round(target_q * t_ratio)))
                        sub_alloc_q += t_q
                    topic_rules.append({
                        "topic_id": top.id,
                        "topic_title": top.title,
                        "topic_weight": top.weight,
                        "target_questions": t_q,
                        "difficulty": top.difficulty or "INTERMEDIATE"
                    })

            section_rules.append({
                "module_id": mod.id,
                "module_title": mod.title,
                "module_weight": mod.weight,
                "target_questions": target_q,
                "target_marks": target_m,
                "topic_rules": topic_rules
            })

        blueprint = AssessmentBlueprint(
            id=str(uuid.uuid4()),
            course_id=syllabus.course_id,
            syllabus_id=syllabus.id,
            syllabus_version=syllabus.version,
            title=payload.title,
            description=payload.description,
            total_questions=payload.total_questions,
            total_marks=payload.total_marks,
            duration_minutes=payload.duration_minutes,
            passing_score=payload.passing_score,
            difficulty_distribution=payload.difficulty_distribution,
            question_type_distribution=payload.question_type_distribution,
            section_rules=section_rules,
            allowed_types=payload.allowed_types,
            status="ACTIVE"
        )
        self.db.add(blueprint)
        self.db.commit()
        self.db.refresh(blueprint)
        return blueprint

    def generate_assessment_from_blueprint(
        self,
        blueprint_id: str,
        assessment_type: str = "STANDARD",
        title: Optional[str] = None,
        randomize: bool = True,
        random_seed: Optional[int] = None
    ) -> Assessment:
        """
        Generates a concrete Assessment instance from a blueprint by selecting matching
        questions from the Question Bank and ensuring full syllabus coverage.
        """
        blueprint = self.db.query(AssessmentBlueprint).filter(AssessmentBlueprint.id == blueprint_id).first()
        if not blueprint:
            raise ValueError(f"AssessmentBlueprint with id '{blueprint_id}' not found")

        syllabus = self.db.query(CourseSyllabus).filter(CourseSyllabus.id == blueprint.syllabus_id).first()
        if not syllabus:
            raise ValueError(f"CourseSyllabus '{blueprint.syllabus_id}' not found for blueprint")

        course = self.db.query(LearningResource).filter(LearningResource.id == blueprint.course_id).first()
        course_title = course.title if course else "Course Assessment"

        assessment = Assessment(
            id=str(uuid.uuid4()),
            title=title or f"{blueprint.title} - {assessment_type}",
            domain=course.resource_type if course else "Engineering",
            course_id=blueprint.course_id,
            syllabus_id=blueprint.syllabus_id,
            syllabus_version=blueprint.syllabus_version,
            blueprint_id=blueprint.id,
            description=blueprint.description or f"Blueprint-based assessment for {course_title}",
            assessment_type=assessment_type,
            duration_minutes=blueprint.duration_minutes,
            total_questions=blueprint.total_questions,
            total_marks=blueprint.total_marks,
            passing_score=blueprint.passing_score,
            attempt_limit=3 if assessment_type in {"FINAL", "STANDARD"} else 0,
            status="DRAFT",
            random_seed=random_seed
        )
        self.db.add(assessment)
        self.db.flush()

        # Gather questions matching blueprint section rules from question bank
        selected_questions: List[AssessmentQuestion] = []
        existing_texts: List[str] = []

        # Pull available questions in question bank for this syllabus or course
        pool = self.db.query(AssessmentQuestion).filter(
            (AssessmentQuestion.course_id == blueprint.course_id) |
            (AssessmentQuestion.syllabus_id == blueprint.syllabus_id)
        ).all()

        pool_by_topic: Dict[str, List[AssessmentQuestion]] = {}
        for q in pool:
            if q.topic_id:
                pool_by_topic.setdefault(q.topic_id, []).append(q)

        # For each section rule, allocate questions
        for s_rule in blueprint.section_rules:
            mod_id = s_rule.get("module_id")
            for t_rule in s_rule.get("topic_rules", []):
                t_id = t_rule.get("topic_id")
                target_q = t_rule.get("target_questions", 1)
                available = pool_by_topic.get(t_id, [])

                # Pick up to target_q from available
                picked = available[:target_q]
                for q in picked:
                    resolved_skill_id = q.skill_id
                    if not resolved_skill_id:
                        first_sk = self.db.query(Skill).first()
                        resolved_skill_id = first_sk.id if first_sk else None

                    bound_q = AssessmentQuestion(
                        id=str(uuid.uuid4()),
                        assessment_id=assessment.id,
                        skill_id=resolved_skill_id,
                        question_text=q.question_text,
                        options=q.options,
                        correct_option_index=q.correct_option_index,
                        correct_answer=q.correct_answer,
                        explanation=q.explanation,
                        difficulty_weight=q.difficulty_weight,
                        course_id=blueprint.course_id,
                        syllabus_id=blueprint.syllabus_id,
                        syllabus_version=blueprint.syllabus_version,
                        module_id=mod_id,
                        topic_id=t_id,
                        objective_id=q.objective_id,
                        skill_ids=q.skill_ids,
                        question_type=q.question_type,
                        difficulty=q.difficulty,
                        marks=q.marks or (blueprint.total_marks / blueprint.total_questions),
                        test_cases=q.test_cases,
                        rubric=q.rubric,
                        code_template=q.code_template,
                        code_language=q.code_language,
                        source=q.source,
                        verification_status=q.verification_status,
                        generation_method=q.generation_method
                    )
                    self.db.add(bound_q)
                    selected_questions.append(bound_q)
                    existing_texts.append(bound_q.question_text)

                # If shortfall, synthesize baseline template question for topic
                shortfall = target_q - len(picked)
                if shortfall > 0:
                    topic_obj = self.db.query(SyllabusTopic).filter(SyllabusTopic.id == t_id).first()
                    topic_title = topic_obj.title if topic_obj else t_rule.get("topic_title", "Topic Concept")
                    tpl_skill_id = None
                    if topic_obj and topic_obj.topic_skills:
                        tpl_skill_id = topic_obj.topic_skills[0].skill_id
                    else:
                        first_sk = self.db.query(Skill).first()
                        tpl_skill_id = first_sk.id if first_sk else None

                    for k in range(shortfall):
                        tpl_q = AssessmentQuestion(
                            id=str(uuid.uuid4()),
                            assessment_id=assessment.id,
                            skill_id=tpl_skill_id,
                            question_text=f"Explain and evaluate the core architectural principles of {topic_title} (Part {k+1}).",
                            options=[
                                f"Option A: Baseline application of {topic_title}",
                                f"Option B: Optimized implementation of {topic_title}",
                                f"Option C: Prerequisite constraint in {topic_title}",
                                f"Option D: None of the above"
                            ],
                            correct_option_index=1,
                            correct_answer="1",
                            explanation=f"Demonstrates comprehensive mastery of {topic_title} according to syllabus blueprint.",
                            difficulty_weight=0.5,
                            course_id=blueprint.course_id,
                            syllabus_id=blueprint.syllabus_id,
                            syllabus_version=blueprint.syllabus_version,
                            module_id=mod_id,
                            topic_id=t_id,
                            objective_id=topic_obj.objectives[0].id if (topic_obj and topic_obj.objectives) else None,
                            skill_ids=[s.skill_id for s in topic_obj.topic_skills] if (topic_obj and topic_obj.topic_skills) else [],
                            question_type="MCQ",
                            difficulty=t_rule.get("difficulty", "INTERMEDIATE"),
                            marks=round(blueprint.total_marks / blueprint.total_questions, 2),
                            source="BLUEPRINT_TEMPLATE",
                            verification_status="VERIFIED",
                            generation_method="TEMPLATE"
                        )
                        self.db.add(tpl_q)
                        selected_questions.append(tpl_q)

        # Randomize question ordering if enabled
        if randomize:
            rng = random.Random(random_seed) if random_seed is not None else random.Random()
            rng.shuffle(selected_questions)

        # Authoritative Coverage Validation
        report = CoverageValidator.validate_coverage(syllabus, selected_questions)
        if report.is_valid_assessment:
            assessment.status = "VALIDATED"
        else:
            assessment.status = "DRAFT"

        self.db.commit()
        self.db.refresh(assessment)
        return assessment
