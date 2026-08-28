from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from backend.app.database import get_db
from backend.app.models.skill import Skill, SkillPrerequisite
from backend.app.models.user import User
from backend.app.schemas.skill import SkillOut, SkillGraphOut, SkillGraphNode, SkillGraphEdge
from backend.app.engine.skill_graph import SkillDAG
from backend.app.api.v1.auth import get_optional_current_user

router = APIRouter(prefix="/skills", tags=["Skills"])

@router.get("", response_model=List[SkillOut])
def list_skills(db: Session = Depends(get_db)):
    skills = db.query(Skill).order_by(Skill.category, Skill.name).all()
    return [SkillOut.model_validate(s) for s in skills]

@router.get("/graph", response_model=SkillGraphOut)
def get_skill_graph(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    dag = SkillDAG(db)
    all_skills = db.query(Skill).all()
    
    # Extract learner confidence map if user is authenticated
    learner_conf: Dict[str, float] = {}
    if current_user and current_user.profile and current_user.profile.skill_confidence_map:
        learner_conf = current_user.profile.skill_confidence_map
    
    # Compute topological depth for each skill node
    # Depth = 0 for foundation roots, max(prereq_depth) + 1 for dependents
    depth_map: Dict[str, int] = {}
    
    # Topological sort ensures we process prereqs before dependents
    topo_order = dag.topological_sort()
    for slug in topo_order:
        prereqs = dag.get_prerequisites(slug)
        if not prereqs:
            depth_map[slug] = 0
        else:
            max_p_depth = max((depth_map.get(p_slug, 0) for p_slug, _ in prereqs), default=0)
            depth_map[slug] = max_p_depth + 1
            
    # Build dependents map
    dependents_map: Dict[str, List[str]] = {s.slug: [] for s in all_skills}
    for s_slug, p_list in dag.prerequisites.items():
        for p_slug, _ in p_list:
            if p_slug in dependents_map:
                dependents_map[p_slug].append(s_slug)
                
    nodes: List[SkillGraphNode] = []
    for s in all_skills:
        conf = float(learner_conf.get(s.slug, 0.0))
        prereqs = dag.get_prerequisites(s.slug)
        prereq_slugs = [p_slug for p_slug, _ in prereqs]
        dep_slugs = dependents_map.get(s.slug, [])
        
        # Determine status
        is_ready, _, _ = dag.evaluate_prerequisite_readiness(s.slug, learner_conf)
        if conf >= 0.80:
            status = "completed"
        elif conf >= 0.40:
            status = "in_progress"
        elif is_ready:
            status = "eligible"
        else:
            status = "locked"
            
        nodes.append(SkillGraphNode(
            id=s.id,
            slug=s.slug,
            name=s.name,
            category=s.category,
            difficulty_tier=s.difficulty_tier,
            confidence=conf,
            target_confidence=1.0,
            status=status,
            topological_depth=depth_map.get(s.slug, 0),
            prerequisites_count=len(prereq_slugs),
            dependents_count=len(dep_slugs),
            prerequisites=prereq_slugs,
            dependents=dep_slugs
        ))
        
    edges: List[SkillGraphEdge] = []
    for p in db.query(SkillPrerequisite).all():
        s_obj = dag.skills_by_id.get(p.skill_id)
        prereq_obj = dag.skills_by_id.get(p.prerequisite_skill_id)
        if s_obj and prereq_obj:
            edges.append(SkillGraphEdge(
                source=prereq_obj.slug,
                target=s_obj.slug,
                is_mandatory=p.is_mandatory
            ))
            
    return SkillGraphOut(nodes=nodes, edges=edges)
