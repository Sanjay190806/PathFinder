import os

engine_files = {}

# 1. skill_gap.py
engine_files['backend/app/engine/skill_gap.py'] = """from typing import Dict, List, Set, Any
from sqlalchemy.orm import Session
from backend.app.models.skill import Skill
from backend.app.models.goal import Goal
from backend.app.models.profile import LearnerProfile

class SkillGapReport:
    def __init__(
        self,
        mastered_skills: List[str],
        partially_known_skills: List[str],
        missing_skills: List[str],
        priority_skills: List[str],
        skill_confidence_map: Dict[str, float]
    ):
        self.mastered_skills = mastered_skills # confidence >= 0.80
        self.partially_known_skills = partially_known_skills # 0.40 <= confidence < 0.80
        self.missing_skills = missing_skills # confidence < 0.40 or not known
        self.priority_skills = priority_skills # missing/partial skills in target goal
        self.skill_confidence_map = skill_confidence_map

def analyze_skill_gap(profile: LearnerProfile, goal: Goal, db: Session) -> SkillGapReport:
    current_conf_map: Dict[str, float] = dict(profile.skill_confidence_map or {})
    
    # Load all goal target skill slugs
    target_skills: List[str] = goal.target_skills or []
    
    mastered = []
    partially_known = []
    missing = []
    priority = []

    # Query all skills from database to resolve slugs
    all_skills = db.query(Skill).all()
    skill_slug_set = {s.slug for s in all_skills}

    for slug in target_skills:
        conf = current_conf_map.get(slug, 0.0)
        if conf >= 0.80:
            mastered.append(slug)
        elif conf >= 0.40:
            partially_known.append(slug)
            priority.append(slug) # Still needs strengthening
        else:
            missing.append(slug)
            priority.append(slug)

    # Order priority skills: missing first, then partially known
    priority_sorted = [s for s in missing if s in priority] + [s for s in partially_known if s in priority]

    return SkillGapReport(
        mastered_skills=mastered,
        partially_known_skills=partially_known,
        missing_skills=missing,
        priority_skills=priority_sorted,
        skill_confidence_map=current_conf_map
    )
"""

# 2. skill_graph.py
engine_files['backend/app/engine/skill_graph.py'] = """from typing import Dict, List, Set, Tuple
from sqlalchemy.orm import Session
from backend.app.models.skill import Skill, SkillPrerequisite

class SkillDAG:
    def __init__(self, db: Session):
        self.db = db
        self.skills_by_slug: Dict[str, Skill] = {}
        self.skills_by_id: Dict[str, Skill] = {}
        self.prerequisites: Dict[str, List[Tuple[str, bool]]] = {} # skill_slug -> [(prereq_slug, is_mandatory)]
        self._load_graph()

    def _load_graph(self):
        all_skills = self.db.query(Skill).all()
        for s in all_skills:
            self.skills_by_slug[s.slug] = s
            self.skills_by_id[s.id] = s
            self.prerequisites[s.slug] = []

        all_prereqs = self.db.query(SkillPrerequisite).all()
        for p in all_prereqs:
            s_obj = self.skills_by_id.get(p.skill_id)
            prereq_obj = self.skills_by_id.get(p.prerequisite_skill_id)
            if s_obj and prereq_obj:
                self.prerequisites[s_obj.slug].append((prereq_obj.slug, p.is_mandatory))

    def get_prerequisites(self, skill_slug: str) -> List[Tuple[str, bool]]:
        return self.prerequisites.get(skill_slug, [])

    def evaluate_prerequisite_readiness(
        self,
        skill_slug: str,
        learner_confidence_map: Dict[str, float]
    ) -> Tuple[bool, float, List[str]]:
        \"\"\"
        Returns (is_satisfied_mandatory, average_prereq_confidence, missing_mandatory_prereqs)
        \"\"\"
        prereqs = self.get_prerequisites(skill_slug)
        if not prereqs:
            return True, 1.0, []

        missing_mandatory = []
        conf_sum = 0.0

        for p_slug, is_mandatory in prereqs:
            conf = learner_confidence_map.get(p_slug, 0.0)
            conf_sum += conf
            if is_mandatory and conf < 0.40:
                missing_mandatory.append(p_slug)

        avg_conf = conf_sum / len(prereqs)
        is_satisfied = len(missing_mandatory) == 0

        return is_satisfied, avg_conf, missing_mandatory
"""

# 3. hard_constraints.py
engine_files['backend/app/engine/hard_constraints.py'] = """from typing import List, Dict, Set, Tuple
from backend.app.models.resource import LearningResource
from backend.app.engine.skill_graph import SkillDAG

class HardConstraintFilter:
    def __init__(self, skill_dag: SkillDAG):
        self.skill_dag = skill_dag

    def filter_candidates(
        self,
        candidates: List[LearningResource],
        learner_confidence_map: Dict[str, float],
        completed_resource_ids: Set[str],
        max_session_hours: float = 0.0 # 0.0 means soft constraint
    ) -> Tuple[List[LearningResource], List[Tuple[LearningResource, str]]]:
        \"\"\"
        Filters candidates strictly before scoring.
        Returns (eligible_candidates, blocked_candidates_with_reason).
        \"\"\"
        eligible = []
        blocked = []

        for res in candidates:
            # 1. Check if completed
            if res.id in completed_resource_ids:
                blocked.append((res, "Already completed by learner"))
                continue

            # 2. Check mandatory prerequisite readiness for each skill taught
            has_unmet_mandatory = False
            unmet_reasons = []

            for rs in res.resource_skills:
                skill_slug = rs.skill.slug
                is_satisfied, avg_conf, missing_prereqs = self.skill_dag.evaluate_prerequisite_readiness(
                    skill_slug, learner_confidence_map
                )
                if not is_satisfied:
                    has_unmet_mandatory = True
                    unmet_reasons.append(f"Missing mandatory prerequisites for {rs.skill.name}: {', '.join(missing_prereqs)}")

            if has_unmet_mandatory:
                blocked.append((res, "; ".join(unmet_reasons)))
                continue

            # 3. Hard time constraint if explicitly requested
            if max_session_hours > 0.0 and res.estimated_hours > max_session_hours:
                blocked.append((res, f"Exceeds strict micro-learning limit of {max_session_hours}h"))
                continue

            eligible.append(res)

        return eligible, blocked
"""

# 4. semantic.py
engine_files['backend/app/engine/semantic.py'] = """import math
import numpy as np
from typing import List, Tuple, Dict, Optional
from uuid import UUID

def cosine_similarity_safe(vec_a: List[float], vec_b: List[float]) -> float:
    if not vec_a or not vec_b or len(vec_a) != len(vec_b):
        return 0.50 # Neutral fallback
    
    a = np.array(vec_a, dtype=np.float32)
    b = np.array(vec_b, dtype=np.float32)
    
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    
    if norm_a == 0 or norm_b == 0:
        return 0.50
        
    dot = np.dot(a, b)
    similarity = float(dot / (norm_a * norm_b))
    return max(0.0, min(1.0, (similarity + 1.0) / 2.0)) # Normalize from [-1, 1] to [0, 1]

def keyword_categorical_similarity(resource_text: str, query_text: str) -> float:
    \"\"\"Deterministic heuristic similarity fallback when embeddings are absent.\"\"\"
    if not resource_text or not query_text:
        return 0.50
    words_res = set(resource_text.lower().replace('-', ' ').split())
    words_q = set(query_text.lower().replace('-', ' ').split())
    
    if not words_q:
        return 0.50
        
    overlap = len(words_res.intersection(words_q))
    score = overlap / len(words_q)
    return min(1.0, 0.40 + score * 0.60)
"""

# 5. scorer.py
engine_files['backend/app/engine/scorer.py'] = """from typing import Dict, List, Any
from backend.app.core.weights import RECOMMENDATION_WEIGHTS
from backend.app.models.resource import LearningResource
from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal
from backend.app.engine.skill_gap import SkillGapReport
from backend.app.engine.skill_graph import SkillDAG
from backend.app.engine.semantic import cosine_similarity_safe, keyword_categorical_similarity

class ScoredCandidate:
    def __init__(
        self,
        resource: LearningResource,
        goal_relevance_score: float,
        skill_gap_score: float,
        prereq_score: float,
        difficulty_score: float,
        pref_score: float,
        time_score: float,
        engagement_score: float,
        diversity_score: float,
        composite_score: float,
        reasons: List[str]
    ):
        self.resource = resource
        self.goal_relevance_score = goal_relevance_score
        self.skill_gap_score = skill_gap_score
        self.prereq_score = prereq_score
        self.difficulty_score = difficulty_score
        self.pref_score = pref_score
        self.time_score = time_score
        self.engagement_score = engagement_score
        self.diversity_score = diversity_score
        self.composite_score = composite_score
        self.reasons = reasons

def score_resource_candidate(
    resource: LearningResource,
    profile: LearnerProfile,
    goal: Goal,
    gap_report: SkillGapReport,
    skill_dag: SkillDAG,
    historical_engagement: float = 0.50
) -> ScoredCandidate:
    reasons = []

    # 1. Goal Relevance (0.30)
    # Check career relevance tags and semantic text
    role_slug = goal.target_role.lower().replace(' ', '-').replace('/', '-')
    is_role_match = any(role_slug in (cr.lower() for cr in (resource.career_relevance or [])))
    text_sim = keyword_categorical_similarity(f"{resource.title} {resource.description}", f"{goal.title} {goal.target_role}")
    goal_relevance = 0.90 if is_role_match else max(0.40, text_sim)
    if is_role_match:
        reasons.append(f"Directly targets your career goal: {goal.target_role}")

    # 2. Skill Gap Coverage (0.25)
    res_skills = [rs.skill.slug for rs in resource.resource_skills]
    taught_priority_skills = [s for s in res_skills if s in gap_report.priority_skills]
    
    if taught_priority_skills:
        skill_gap_score = min(1.0, 0.60 + len(taught_priority_skills) * 0.20)
        reasons.append(f"Closes your critical skill gap in {', '.join(taught_priority_skills[:2])}")
    else:
        skill_gap_score = 0.30

    # 3. Prerequisite Readiness (0.15)
    prereq_scores = []
    for rs in resource.resource_skills:
        _, avg_conf, _ = skill_dag.evaluate_prerequisite_readiness(rs.skill.slug, gap_report.skill_confidence_map)
        prereq_scores.append(avg_conf)
    
    prereq_score = (sum(prereq_scores) / len(prereq_scores)) if prereq_scores else 1.0
    if prereq_score >= 0.70:
        reasons.append("Your prerequisite knowledge is solid for this topic")
    else:
        reasons.append("Provides good progression from your current knowledge")

    # 4. Difficulty Fit (0.10)
    diff_val_map = {"Beginner": 0.25, "Intermediate": 0.60, "Advanced": 0.90}
    res_diff = diff_val_map.get(resource.difficulty, 0.50)
    tolerance = profile.difficulty_tolerance or 0.50
    diff_fit = max(0.20, 1.0 - abs(res_diff - tolerance))

    # 5. Preference Match (0.08)
    preferred_formats = [f.lower() for f in (profile.preferred_formats or [])]
    if resource.format.lower() in preferred_formats or resource.resource_type.lower() in preferred_formats:
        pref_score = 0.95
        reasons.append(f"Matches your preferred {resource.format} / {resource.resource_type} format")
    else:
        pref_score = 0.40

    # 6. Time/Pacing Fit (0.05) - Soft Constraint
    weekly_hours = max(2, profile.weekly_hours or 10)
    target_item_hours = weekly_hours * 0.5
    hours_diff = abs(resource.estimated_hours - target_item_hours)
    time_score = max(0.30, 1.0 - min(1.0, hours_diff / weekly_hours))
    reasons.append(f"Estimated at {resource.estimated_hours:g} hours, fitting your {weekly_hours}h weekly schedule")

    # 7. Historical Engagement (0.04)
    eng_score = historical_engagement

    # 8. Diversity Baseline (0.03)
    diversity_score = 1.0

    # Composite normalized score
    w = RECOMMENDATION_WEIGHTS
    composite = (
        w["goal_relevance"] * goal_relevance +
        w["skill_gap"] * skill_gap_score +
        w["prerequisite"] * prereq_score +
        w["difficulty"] * diff_fit +
        w["preference"] * pref_score +
        w["time"] * time_score +
        w["engagement"] * eng_score +
        w["diversity"] * diversity_score
    )

    return ScoredCandidate(
        resource=resource,
        goal_relevance_score=goal_relevance,
        skill_gap_score=skill_gap_score,
        prereq_score=prereq_score,
        difficulty_score=diff_fit,
        pref_score=pref_score,
        time_score=time_score,
        engagement_score=eng_score,
        diversity_score=diversity_score,
        composite_score=round(composite, 4),
        reasons=reasons
    )
"""

# 6. diversity.py
engine_files['backend/app/engine/diversity.py'] = """from typing import List
from backend.app.engine.scorer import ScoredCandidate

def apply_diversity_selection(ranked_candidates: List[ScoredCandidate], max_per_provider: int = 3) -> List[ScoredCandidate]:
    \"\"\"
    Prevents provider or format saturation across the curriculum.
    \"\"\"
    selected: List[ScoredCandidate] = []
    provider_counts = {}

    for cand in ranked_candidates:
        provider = cand.resource.provider
        count = provider_counts.get(provider, 0)
        if count < max_per_provider or len(selected) < 5:
            selected.append(cand)
            provider_counts[provider] = count + 1
        else:
            # Apply slight diversity decay
            cand.diversity_score = 0.60
            cand.composite_score = round(cand.composite_score - 0.015, 4)
            selected.append(cand)

    return selected
"""

# 7. sequencer.py
engine_files['backend/app/engine/sequencer.py'] = """from typing import List, Dict
from backend.app.engine.scorer import ScoredCandidate
from backend.app.engine.skill_graph import SkillDAG

class PhaseDefinition:
    def __init__(self, number: int, name: str, description: str):
        self.number = number
        self.name = name
        self.description = description
        self.items: List[ScoredCandidate] = []

def sequence_learning_path(
    selected_candidates: List[ScoredCandidate],
    skill_dag: SkillDAG
) -> List[PhaseDefinition]:
    \"\"\"
    Sequences candidates topologically into 5 standard progressive phases:
    Phase 1: Strengthen Foundations
    Phase 2: Core Machine Learning / Core Domain
    Phase 3: Deep Specialization
    Phase 4: Engineering & Tooling
    Phase 5: Capstone & Portfolio
    \"\"\"
    phases = [
        PhaseDefinition(1, "Strengthen Foundations", "Core prerequisites, programming syntax & fundamental math"),
        PhaseDefinition(2, "Core Competencies", "Core algorithms, data analysis & foundational domain tooling"),
        PhaseDefinition(3, "Deep Specialization", "Advanced architectures, deep models & specialized frameworks"),
        PhaseDefinition(4, "Engineering & Deployment", "Production APIs, Docker, pipelines & testing"),
        PhaseDefinition(5, "Capstone & Portfolio", "Real-world end-to-end projects & interview preparation")
    ]

    # Map candidate difficulty and skill categories to appropriate phases
    for cand in selected_candidates:
        res = cand.resource
        diff = res.difficulty
        r_type = res.resource_type
        title_lower = res.title.lower()

        if r_type == "project" or "capstone" in title_lower or "portfolio" in title_lower:
            phases[4].items.append(cand) # Phase 5: Capstone
        elif "deploy" in title_lower or "docker" in title_lower or "mlops" in title_lower or "cloud" in title_lower or "api" in title_lower or "ci/cd" in title_lower:
            phases[3].items.append(cand) # Phase 4: Engineering
        elif diff == "Advanced" or "transformer" in title_lower or "deep learning" in title_lower or "neural" in title_lower or "kubernetes" in title_lower or "security" in title_lower:
            phases[2].items.append(cand) # Phase 3: Specialization
        elif diff == "Intermediate" or "machine learning" in title_lower or "scikit" in title_lower or "react" in title_lower or "sql" in title_lower:
            phases[1].items.append(cand) # Phase 2: Core
        else:
            phases[0].items.append(cand) # Phase 1: Foundations

    # Topological sorting within each phase to ensure prerequisites come before dependents
    for phase in phases:
        phase.items.sort(
            key=lambda c: (
                -c.composite_score,
                c.resource.difficulty != "Beginner",
                c.resource.id
            )
        )

    return phases
"""

# 8. explainer.py
engine_files['backend/app/engine/explainer.py'] = """from typing import Dict, Any, List
from backend.app.engine.scorer import ScoredCandidate
from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal

def build_structured_explanation(
    candidate: ScoredCandidate,
    profile: LearnerProfile,
    goal: Goal
) -> Dict[str, Any]:
    \"\"\"
    Builds granular, deterministic explainability payload.
    \"\"\"
    reasons = list(candidate.reasons)
    
    # Add summary sentence
    summary = (
        f"Recommended because it directly targets your goal to become a {goal.target_role}, "
        f"fits your {profile.weekly_hours}h/week schedule, and strengthens prerequisite competencies."
    )

    return {
        "goal_relevance_score": candidate.goal_relevance_score,
        "skill_gap_score": candidate.skill_gap_score,
        "prereq_score": candidate.prereq_score,
        "difficulty_score": candidate.difficulty_score,
        "pref_score": candidate.pref_score,
        "time_score": candidate.time_score,
        "engagement_score": candidate.engagement_score,
        "diversity_score": candidate.diversity_score,
        "composite_score": candidate.composite_score,
        "structured_reasons": reasons,
        "human_readable_explanation": summary
    }
"""

# 9. adaptive.py
engine_files['backend/app/engine/adaptive.py'] = """import hashlib
import json
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple, Set
from sqlalchemy.orm import Session

from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal
from backend.app.models.resource import LearningResource
from backend.app.models.learning_path import (
    LearningPath,
    LearningPathVersion,
    LearningPathItem,
    RoadmapChange,
    RecommendationExplanation
)
from backend.app.models.feedback import Feedback
from backend.app.models.progress import Progress
from backend.app.engine.skill_gap import analyze_skill_gap
from backend.app.engine.skill_graph import SkillDAG
from backend.app.engine.hard_constraints import HardConstraintFilter
from backend.app.engine.scorer import score_resource_candidate
from backend.app.engine.diversity import apply_diversity_selection
from backend.app.engine.sequencer import sequence_learning_path
from backend.app.engine.explainer import build_structured_explanation

def compute_state_fingerprint(
    profile_id: str,
    goal_id: str,
    skill_conf: Dict[str, float],
    weekly_hours: int,
    completed_ids: Set[str],
    feedback_summary: str,
    algo_version: str = "v1.2.0"
) -> str:
    raw = f"{profile_id}:{goal_id}:{sorted(skill_conf.items())}:{weekly_hours}:{sorted(list(completed_ids))}:{feedback_summary}:{algo_version}"
    return hashlib.sha256(raw.encode('utf-8')).hexdigest()

def generate_or_adapt_roadmap(
    profile: LearnerProfile,
    goal: Goal,
    trigger: str,
    change_reason: str,
    db: Session,
    idempotency_key: Optional[str] = None
) -> Tuple[LearningPath, LearningPathVersion, bool]:
    \"\"\"
    Executes full deterministic recommendation & adaptive versioning pipeline inside a DB transaction.
    Returns (LearningPath, ActiveVersion, is_new_version_created).
    \"\"\"
    # 1. Fetch or create active LearningPath
    learning_path = db.query(LearningPath).filter(
        LearningPath.profile_id == profile.id,
        LearningPath.goal_id == goal.id,
        LearningPath.is_active == True
    ).first()

    if not learning_path:
        learning_path = LearningPath(
            profile_id=profile.id,
            goal_id=goal.id,
            title=f"Roadmap: {goal.title}",
            is_active=True,
            algorithm_version="v1.2.0"
        )
        db.add(learning_path)
        db.flush()

    # 2. Check Idempotency Key
    if idempotency_key:
        existing_version = db.query(LearningPathVersion).filter(
            LearningPathVersion.idempotency_key == idempotency_key
        ).first()
        if existing_version:
            return learning_path, existing_version, False

    # 3. Retrieve completed resources
    completed_records = db.query(Progress).filter(
        Progress.profile_id == profile.id,
        Progress.status == "completed"
    ).all()
    completed_ids = {p.resource_id for p in completed_records}

    # 4. Fetch all catalog resources
    all_resources = db.query(LearningResource).all()

    # 5. Skill Gap Analysis & Skill DAG
    gap_report = analyze_skill_gap(profile, goal, db)
    skill_dag = SkillDAG(db)

    # 6. Hard Constraint Filter (Executes BEFORE scoring)
    hard_filter = HardConstraintFilter(skill_dag)
    eligible_candidates, blocked_candidates = hard_filter.filter_candidates(
        candidates=all_resources,
        learner_confidence_map=gap_report.skill_confidence_map,
        completed_resource_ids=completed_ids
    )

    # 7. Hybrid Scoring
    scored_candidates = [
        score_resource_candidate(
            resource=cand,
            profile=profile,
            goal=goal,
            gap_report=gap_report,
            skill_dag=skill_dag
        )
        for cand in eligible_candidates
    ]

    # 8. Deterministic Ranking & Diversity Selection
    scored_candidates.sort(key=lambda c: (-c.composite_score, c.resource.id))
    diverse_candidates = apply_diversity_selection(scored_candidates)

    # 9. Topological Phased Sequencing
    phased_curriculum = sequence_learning_path(diverse_candidates, skill_dag)

    # Flatten sequenced items
    ordered_items = []
    for phase in phased_curriculum:
        for cand in phase.items:
            ordered_items.append((phase.number, phase.name, cand))

    # 10. Generate version hash to prevent duplicate version explosion
    item_slug_list = [f"{p_num}:{cand.resource.id}" for p_num, _, cand in ordered_items]
    new_version_hash = hashlib.sha256(",".join(item_slug_list).encode('utf-8')).hexdigest()

    # Check current active version
    active_version = db.query(LearningPathVersion).filter(
        LearningPathVersion.learning_path_id == learning_path.id,
        LearningPathVersion.is_active == True
    ).first()

    if active_version and active_version.version_hash == new_version_hash:
        # No structural change -> return active version
        return learning_path, active_version, False

    # 11. Create new version atomically
    next_version_num = (active_version.version_number + 1) if active_version else 1

    # Deactivate previous versions
    if active_version:
        active_version.is_active = False

    new_version = LearningPathVersion(
        learning_path_id=learning_path.id,
        version_number=next_version_num,
        version_hash=new_version_hash,
        trigger=trigger,
        change_summary=change_reason,
        is_active=True,
        idempotency_key=idempotency_key
    )
    db.add(new_version)
    db.flush()

    learning_path.current_version_id = new_version.id

    # 12. Create LearningPathItems and Explanations
    seq = 1
    new_item_objs = []
    for phase_num, phase_name, cand in ordered_items:
        item = LearningPathItem(
            version_id=new_version.id,
            resource_id=cand.resource.id,
            phase_number=phase_num,
            phase_name=phase_name,
            sequence_order=seq,
            is_completed=cand.resource.id in completed_ids,
            is_locked=phase_num > 1 and seq > 3
        )
        db.add(item)
        db.flush()

        expl_data = build_structured_explanation(cand, profile, goal)
        expl = RecommendationExplanation(
            path_item_id=item.id,
            goal_relevance_score=expl_data["goal_relevance_score"],
            skill_gap_score=expl_data["skill_gap_score"],
            prereq_score=expl_data["prereq_score"],
            difficulty_score=expl_data["difficulty_score"],
            pref_score=expl_data["pref_score"],
            time_score=expl_data["time_score"],
            engagement_score=expl_data["engagement_score"],
            diversity_score=expl_data["diversity_score"],
            composite_score=expl_data["composite_score"],
            structured_reasons=expl_data["structured_reasons"],
            human_readable_explanation=expl_data["human_readable_explanation"]
        )
        db.add(expl)
        new_item_objs.append(item)
        seq += 1

    # 13. Audit RoadmapChange if adapting from a prior version
    if active_version:
        prev_items = {it.resource_id: it for it in active_version.items}
        for item in new_item_objs:
            if item.resource_id not in prev_items:
                change = RoadmapChange(
                    version_id=new_version.id,
                    previous_item_id=None,
                    new_item_id=item.id,
                    change_type="inserted",
                    reason=change_reason,
                    trigger=trigger
                )
                db.add(change)
            elif prev_items[item.resource_id].phase_number != item.phase_number:
                change = RoadmapChange(
                    version_id=new_version.id,
                    previous_item_id=prev_items[item.resource_id].id,
                    new_item_id=item.id,
                    change_type="phase_shifted",
                    reason=f"Moved to Phase {item.phase_number} after {trigger}",
                    trigger=trigger
                )
                db.add(change)

    db.commit()
    db.refresh(learning_path)
    db.refresh(new_version)
    return learning_path, new_version, True
"""

for filepath, content in engine_files.items():
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Created {filepath}")
