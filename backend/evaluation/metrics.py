from typing import List, Set, Dict, Any

def precision_at_k(recommended_skills: List[str], target_skills: Set[str], k: int = 10) -> float:
    if not recommended_skills or k == 0:
        return 0.0
    top_k = recommended_skills[:k]
    hits = sum(1 for s in top_k if s in target_skills)
    return hits / min(k, len(top_k))

def recall_at_k(recommended_skills: List[str], target_skills: Set[str], k: int = 10) -> float:
    if not target_skills or not recommended_skills:
        return 0.0
    top_k = recommended_skills[:k]
    hits = len(set(top_k).intersection(target_skills))
    return hits / len(target_skills)

def curriculum_coverage(recommended_skills: List[str], target_skills: Set[str]) -> float:
    if not target_skills:
        return 1.0
    covered = set(recommended_skills).intersection(target_skills)
    return len(covered) / len(target_skills)

def evaluate_prerequisite_violations(ordered_resources: List[Any], skill_dag: Any, initial_confidence: Dict[str, float]) -> float:
    violations = 0
    simulated_confidence = dict(initial_confidence)
    
    for res in ordered_resources:
        for rs in res.resource_skills:
            is_satisfied, _, missing = skill_dag.evaluate_prerequisite_readiness(rs.skill.slug, simulated_confidence)
            if not is_satisfied:
                violations += 1
            simulated_confidence[rs.skill.slug] = max(0.75, simulated_confidence.get(rs.skill.slug, 0.20) + 0.35)

    return (violations / len(ordered_resources)) if ordered_resources else 0.0
