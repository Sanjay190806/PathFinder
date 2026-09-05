from typing import List, Tuple, Dict, Any, Optional
import math

VALID_OBJECTIVE_TYPES = {
    "UNDERSTAND", "EXPLAIN", "APPLY", "ANALYZE",
    "IMPLEMENT", "DEBUG", "DESIGN", "EVALUATE", "PRACTICE"
}

VALID_DIFFICULTIES = {"Beginner", "Intermediate", "Advanced"}

VALID_SOURCES = {
    "OFFICIAL_PROVIDER", "INSTITUTION", "COURSE_METADATA",
    "LEARNER_PROVIDED", "IMPORTED_DOCUMENT", "AI_ASSISTED_EXTRACTION",
    "MANUAL_ADMIN", "OTHER"
}

VALID_VERIFICATION_STATUSES = {
    "VERIFIED", "PARTIALLY_VERIFIED", "UNVERIFIED", "AI_ASSISTED"
}


class SyllabusValidator:
    """
    Authoritative backend validator for Course Syllabus hierarchies.
    Ensures mathematical normalization, structural integrity, and provenance.
    """

    @classmethod
    def validate_syllabus_data(cls, data: Dict[str, Any]) -> Tuple[bool, List[str]]:
        errors: List[str] = []

        # 1. Basic Fields
        title = data.get("title", "").strip() if data.get("title") else ""
        if not title:
            errors.append("Syllabus title is required and cannot be empty.")
        
        course_id = data.get("course_id", "").strip() if data.get("course_id") else ""
        if not course_id:
            errors.append("course_id is required.")

        source = data.get("source", "OFFICIAL_PROVIDER")
        if source not in VALID_SOURCES:
            errors.append(f"Invalid source '{source}'. Must be one of: {', '.join(sorted(VALID_SOURCES))}")

        ver_status = data.get("verification_status", "UNVERIFIED")
        if ver_status not in VALID_VERIFICATION_STATUSES:
            errors.append(f"Invalid verification_status '{ver_status}'. Must be one of: {', '.join(sorted(VALID_VERIFICATION_STATUSES))}")

        # 2. Module Validation
        modules = data.get("modules", [])
        if not modules:
            errors.append("Syllabus must contain at least one module (cannot be empty).")
            return False, errors

        # Module Weights Sum
        module_weights: List[float] = []
        module_order_indices = set()
        module_titles = set()

        for idx, mod in enumerate(modules, start=1):
            mod_title = (mod.get("title") or "").strip()
            if not mod_title:
                errors.append(f"Module #{idx} is missing a title.")
            elif mod_title.lower() in module_titles:
                errors.append(f"Duplicate module title found: '{mod_title}'.")
            else:
                module_titles.add(mod_title.lower())

            order_idx = mod.get("order_index", idx)
            if order_idx in module_order_indices:
                errors.append(f"Module #{idx} has duplicate order_index: {order_idx}.")
            else:
                module_order_indices.add(order_idx)

            weight = float(mod.get("weight", 0.0))
            if weight < 0.0 or weight > 100.0:
                errors.append(f"Module '{mod_title or idx}' weight ({weight}) must be between 0 and 100.")
            module_weights.append(weight)

            # Topics within module
            topics = mod.get("topics", [])
            if not topics:
                errors.append(f"Module '{mod_title or idx}' contains no topics (empty modules not allowed).")
                continue

            topic_weights: List[float] = []
            topic_order_indices = set()
            topic_titles_in_module = set()

            for t_idx, top in enumerate(topics, start=1):
                top_title = (top.get("title") or "").strip()
                if not top_title:
                    errors.append(f"Topic #{t_idx} in module '{mod_title or idx}' is missing a title.")
                elif top_title.lower() in topic_titles_in_module:
                    errors.append(f"Duplicate topic title '{top_title}' in module '{mod_title or idx}'.")
                else:
                    topic_titles_in_module.add(top_title.lower())

                t_order = top.get("order_index", t_idx)
                if t_order in topic_order_indices:
                    errors.append(f"Topic '{top_title or t_idx}' has duplicate order_index: {t_order}.")
                else:
                    topic_order_indices.add(t_order)

                t_diff = top.get("difficulty", "Intermediate")
                if t_diff not in VALID_DIFFICULTIES:
                    errors.append(f"Topic '{top_title}' has invalid difficulty '{t_diff}'. Must be one of: {', '.join(sorted(VALID_DIFFICULTIES))}")

                t_weight = float(top.get("weight", 0.0))
                if t_weight < 0.0 or t_weight > 100.0:
                    errors.append(f"Topic '{top_title}' weight ({t_weight}) must be between 0 and 100.")
                topic_weights.append(t_weight)

                # Objectives within topic
                objectives = top.get("objectives", [])
                for o_idx, obj in enumerate(objectives, start=1):
                    obj_text = (obj.get("objective") or "").strip()
                    if not obj_text:
                        errors.append(f"Objective #{o_idx} in topic '{top_title}' has empty text.")
                    
                    obj_type = (obj.get("objective_type") or "").upper().strip()
                    if obj_type not in VALID_OBJECTIVE_TYPES:
                        errors.append(f"Objective '{obj_text[:30]}' in topic '{top_title}' has invalid type '{obj_type}'. Must be one of: {', '.join(sorted(VALID_OBJECTIVE_TYPES))}")

            # Topic weight normalization check (within module)
            if topic_weights:
                sum_topic_weights = sum(topic_weights)
                # Allow tolerance of 0.5% for floating point rounding
                if not math.isclose(sum_topic_weights, 100.0, abs_tol=0.5):
                    errors.append(
                        f"Topic weights in module '{mod_title}' must sum to 100.0%. Current sum: {round(sum_topic_weights, 2)}%."
                    )

        # Module weight normalization check (across syllabus)
        if module_weights:
            sum_mod_weights = sum(module_weights)
            if not math.isclose(sum_mod_weights, 100.0, abs_tol=0.5):
                errors.append(
                    f"Module weights in syllabus must sum to 100.0%. Current sum: {round(sum_mod_weights, 2)}%."
                )

        is_valid = len(errors) == 0
        return is_valid, errors
