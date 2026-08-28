from typing import Dict, Any, List, Tuple
from backend.app.adaptive.config import (
    PREREQUISITE_THRESHOLD,
    MEANINGFUL_CHANGE_CONF_THRESHOLD,
    MEANINGFUL_CHANGE_TOLERANCE_THRESHOLD
)

class ChangeDetector:
    @staticmethod
    def detect_meaningful_change(
        event_type: str,
        diff_summary: Dict[str, Any]
    ) -> Tuple[bool, str, List[Dict[str, Any]]]:
        """
        Evaluates whether a state modification constitutes a meaningful change requiring roadmap regeneration.
        
        Triggers:
        - Course completion
        - Prerequisite threshold crossing (crosses 0.40 boundary)
        - Major confidence delta (>= 0.04)
        - Major difficulty tolerance shift (>= 0.04)
        - Goal change
        """
        if event_type == "course_completed":
            return True, "Course completed, removing from active curriculum and advancing prerequisite state.", []

        if event_type == "goal_change":
            return True, "Primary career goal changed.", []

        transitions = []
        skills_updated = diff_summary.get("skills_updated", {})
        
        for slug, delta_info in skills_updated.items():
            old_val = delta_info.get("old", 0.0)
            new_val = delta_info.get("new", 0.0)
            delta = abs(delta_info.get("delta", 0.0))

            # Check prerequisite threshold transitions (0.40 boundary)
            if old_val < PREREQUISITE_THRESHOLD <= new_val:
                transitions.append({
                    "skill": slug,
                    "type": "BLOCKED_TO_ELIGIBLE",
                    "old": old_val,
                    "new": new_val
                })
            elif new_val < PREREQUISITE_THRESHOLD <= old_val:
                transitions.append({
                    "skill": slug,
                    "type": "ELIGIBLE_TO_BLOCKED",
                    "old": old_val,
                    "new": new_val
                })
            elif delta >= MEANINGFUL_CHANGE_CONF_THRESHOLD:
                transitions.append({
                    "skill": slug,
                    "type": "SIGNIFICANT_CONFIDENCE_DELTA",
                    "old": old_val,
                    "new": new_val
                })

        if transitions:
            t_descriptions = [f"{t['skill']} ({t['type']}: {t['old']:.2f} -> {t['new']:.2f})" for t in transitions]
            return True, f"Prerequisite competency shifts detected: {', '.join(t_descriptions)}", transitions

        # Check difficulty tolerance shift
        tol_change = diff_summary.get("tolerance_change", {})
        if tol_change:
            delta = abs(tol_change.get("delta", 0.0))
            if delta >= MEANINGFUL_CHANGE_TOLERANCE_THRESHOLD:
                return True, f"Learner difficulty tolerance shifted by {delta:.2f}", []

        return False, "Change was below adaptive threshold; roadmap remains optimal.", []
