from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.app.models.syllabus import CourseSyllabus, SyllabusModule, SyllabusTopic, LearningObjective
from backend.app.models.assessment import AssessmentQuestion
from backend.app.schemas.assessment_blueprint import SyllabusCoverageReport


class CoverageValidator:
    """
    Validates that an assessment or set of questions adequately covers the authoritative course syllabus.
    Prevents single-module concentration, verifies topic distribution, and flags uncovered curriculum areas.
    """

    @classmethod
    def validate_coverage(
        cls,
        syllabus: CourseSyllabus,
        questions: List[AssessmentQuestion]
    ) -> SyllabusCoverageReport:
        warnings: List[str] = []
        modules = syllabus.modules
        total_modules = len(modules)
        all_topics: List[SyllabusTopic] = []
        for m in modules:
            all_topics.extend(m.topics)
        total_topics = len(all_topics)

        # Build lookup maps
        module_map = {m.id: m for m in modules}
        topic_map = {t.id: t for t in all_topics}

        # Track question allocations
        module_q_counts: Dict[str, int] = {m.id: 0 for m in modules}
        topic_q_counts: Dict[str, int] = {t.id: 0 for t in all_topics}
        diff_counts: Dict[str, int] = {"BEGINNER": 0, "INTERMEDIATE": 0, "ADVANCED": 0, "EXPERT": 0}
        type_counts: Dict[str, int] = {}

        total_questions = len(questions)

        for q in questions:
            # Map module
            mod_id = q.module_id
            if mod_id and mod_id in module_q_counts:
                module_q_counts[mod_id] += 1
            elif q.topic_id and q.topic_id in topic_map:
                t = topic_map[q.topic_id]
                module_q_counts[t.module_id] += 1
            else:
                warnings.append(f"Question '{q.id}' is not mapped to any valid syllabus module or topic.")

            # Map topic
            if q.topic_id and q.topic_id in topic_q_counts:
                topic_q_counts[q.topic_id] += 1

            # Count diff and types
            diff = (q.difficulty or "INTERMEDIATE").upper()
            diff_counts[diff] = diff_counts.get(diff, 0) + 1

            q_type = (q.question_type or "MCQ").upper()
            type_counts[q_type] = type_counts.get(q_type, 0) + 1

        # Calculate covered and uncovered
        covered_modules = [m.title for m in modules if module_q_counts[m.id] > 0]
        uncovered_modules = [m.title for m in modules if module_q_counts[m.id] == 0]

        covered_topics = [t.title for t in all_topics if topic_q_counts[t.id] > 0]
        uncovered_topics = [t.title for t in all_topics if topic_q_counts[t.id] == 0]

        # Calculate coverage percentage weighted by module weights
        covered_weight = sum(m.weight for m in modules if module_q_counts[m.id] > 0)
        coverage_percentage = round(covered_weight, 2)

        # Fairness Invariant 1: Check for single-module monopoly (>75% in 1 module when total modules >= 3)
        if total_modules >= 3 and total_questions > 0:
            for m in modules:
                count = module_q_counts[m.id]
                pct = (count / total_questions) * 100.0
                if pct > 75.0 and m.weight < 50.0:
                    warnings.append(
                        f"Module concentration warning: '{m.title}' accounts for {pct:.1f}% of questions "
                        f"despite representing only {m.weight}% syllabus weight."
                    )

        # Fairness Invariant 2: Uncovered heavy modules (weight >= 25%)
        for m in modules:
            if module_q_counts[m.id] == 0 and m.weight >= 25.0:
                warnings.append(
                    f"Curriculum gap: Major module '{m.title}' (weight {m.weight}%) has 0 questions."
                )

        # Build representation dictionary
        module_representation = {}
        for m in modules:
            module_representation[m.id] = {
                "title": m.title,
                "syllabus_weight": m.weight,
                "question_count": module_q_counts[m.id],
                "question_ratio": round(module_q_counts[m.id] / max(total_questions, 1), 3)
            }

        is_valid = (
            total_questions > 0 and
            len(covered_modules) > 0 and
            (coverage_percentage >= 50.0 or total_modules <= 1)
        )

        return SyllabusCoverageReport(
            syllabus_id=syllabus.id,
            syllabus_version=syllabus.version,
            total_syllabus_modules=total_modules,
            total_syllabus_topics=total_topics,
            covered_modules=covered_modules,
            uncovered_modules=uncovered_modules,
            covered_topics=covered_topics,
            uncovered_topics=uncovered_topics,
            coverage_percentage=coverage_percentage,
            module_representation=module_representation,
            difficulty_distribution=diff_counts,
            question_type_distribution=type_counts,
            is_valid_assessment=is_valid,
            coverage_warnings=warnings
        )
