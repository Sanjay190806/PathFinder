from typing import Dict, List, Tuple
from sqlalchemy.orm import Session

from backend.app.core.security import hash_password
from backend.app.core.logger import logger
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal
from backend.app.models.skill import Skill, SkillPrerequisite, LearnerSkill
from backend.app.models.resource import LearningResource, ResourceSkill, ResourcePrerequisite
from backend.app.models.assessment import Assessment, AssessmentQuestion
from backend.app.models.progress import Progress
from backend.app.models.feedback import Feedback
from backend.app.engine.embedding_service import EmbeddingService
from backend.app.seed.catalog_data import SKILLS_DATA, PREREQUISITES_DATA, RESOURCES_CATALOG
from backend.app.seed.validator import validate_seed_data

def seed_database(db: Session):
    existing_skills = db.query(Skill).all()
    skill_map: Dict[str, Skill] = {s.slug: s for s in existing_skills}
    embed_svc = EmbeddingService()

    # 1. SEED SKILLS
    if not existing_skills:
        logger.info("Seeding Skills...")
        for name, slug, cat, desc, diff in SKILLS_DATA:
            s = Skill(name=name, slug=slug, category=cat, description=desc, difficulty_tier=diff)
            db.add(s)
            skill_map[slug] = s
        db.flush()

        logger.info("Seeding Skill Prerequisites...")
        for target_slug, prereq_slug, p_type, is_mandatory in PREREQUISITES_DATA:
            if target_slug in skill_map and prereq_slug in skill_map:
                db.add(SkillPrerequisite(
                    skill_id=skill_map[target_slug].id,
                    prerequisite_skill_id=skill_map[prereq_slug].id,
                    prerequisite_type=p_type,
                    is_mandatory=is_mandatory
                ))
        db.flush()

    # 2. SEED RESOURCES
    existing_resources = db.query(LearningResource).count()
    if existing_resources < 50:
        logger.info("Seeding 55+ Curated Learning Resources...")
        db.query(ResourceSkill).delete()
        db.query(ResourcePrerequisite).delete()
        db.query(LearningResource).delete()
        db.flush()

        for title, slug, desc, prov, url, r_type, diff, hrs, qual, career, fmt, taught_slugs, prereq_slugs in RESOURCES_CATALOG:
            emb_text = embed_svc.create_resource_embedding_text(title, desc, taught_slugs, career, fmt)
            emb_payload = embed_svc.generate_embedding(emb_text)

            res = LearningResource(
                title=title,
                slug=slug,
                description=desc,
                provider=prov,
                url=url,
                resource_type=r_type,
                difficulty=diff,
                estimated_hours=hrs,
                quality_score=qual,
                career_relevance=career,
                format=fmt,
                status="active",
                embedding=emb_payload["vector"],
                embedding_model=emb_payload["model"],
                embedding_model_version=emb_payload["model_version"],
                embedding_dimension=emb_payload["dimension"]
            )
            db.add(res)
            db.flush()

            for s_slug in taught_slugs:
                if s_slug in skill_map:
                    db.add(ResourceSkill(
                        resource_id=res.id,
                        skill_id=skill_map[s_slug].id,
                        relevance_weight=1.0,
                        coverage_level="comprehensive",
                        is_primary=True
                    ))

            for p_slug in prereq_slugs:
                if p_slug in skill_map:
                    db.add(ResourcePrerequisite(
                        resource_id=res.id,
                        skill_id=skill_map[p_slug].id,
                        is_mandatory=True
                    ))

        db.flush()

    # 3. SEED ASSESSMENTS
    existing_assessments = db.query(Assessment).count()
    if existing_assessments == 0:
        logger.info("Seeding Diagnostic Assessments...")
        ai_assessment = Assessment(
            title="AI & Machine Learning Readiness Diagnostic",
            domain="AI/ML",
            target_skill_ids=[skill_map["python"].id, skill_map["linear-algebra"].id, skill_map["machine-learning"].id]
        )
        db.add(ai_assessment)
        db.flush()

        questions = [
            (skill_map["python"].id, "In Python, what is the output of `[x**2 for x in range(4) if x % 2 == 0]`?",
             ["[0, 4]", "[0, 1, 4, 9]", "[4]", "[0, 2, 4]"], 0,
             "Range(4) produces 0, 1, 2, 3. The even numbers are 0 and 2. Squaring them gives 0 and 4.", 0.3),

            (skill_map["linear-algebra"].id, "What does the dot product of two normalized unit vectors equal to 0 indicate?",
             ["Vectors are parallel", "Vectors are orthogonal (perpendicular)", "Vectors have opposite directions", "Vectors have zero length"], 1,
             "When the dot product of two non-zero vectors is 0, the angle between them is 90 degrees (orthogonal).", 0.4),

            (skill_map["machine-learning"].id, "Which technique is specifically used to prevent overfitting in decision tree algorithms?",
             ["Increasing tree depth", "Cost-complexity pruning", "Removing all regularizations", "Multiplying input features"], 1,
             "Pruning removes branches that provide little predictive power on validation datasets, reducing overfitting.", 0.5),

            (skill_map["deep-learning"].id, "Why do modern deep networks commonly use the ReLU activation function over Sigmoid for hidden layers?",
             ["ReLU eliminates negative inputs", "ReLU mitigates the vanishing gradient problem", "ReLU is bounded between 0 and 1", "ReLU requires matrix inversion"], 1,
             "ReLU has a constant derivative of 1 for positive inputs, preventing gradients from vanishing through deep layers.", 0.6)
        ]

        for s_id, q_text, opts, c_idx, expl, d_wt in questions:
            db.add(AssessmentQuestion(
                assessment_id=ai_assessment.id,
                skill_id=s_id,
                question_text=q_text,
                options=opts,
                correct_option_index=c_idx,
                explanation=expl,
                difficulty_weight=d_wt
            ))
        db.flush()

    # 4. SEED DEMO USER
    demo_user = db.query(User).filter(User.email == "alex@pathfinder.demo").first()
    if not demo_user:
        logger.info("Seeding Demo Learner 'Alex Mercer'...")
        demo_user = User(
            email="alex@pathfinder.demo",
            hashed_password=hash_password("demo12345"),
            full_name="Alex Mercer",
            is_demo=True
        )
        db.add(demo_user)
        db.flush()

        demo_profile = LearnerProfile(
            user_id=demo_user.id,
            education_level="Undergraduate (3rd Year CS)",
            field_of_study="Computer Science & Data",
            experience_level="Intermediate",
            weekly_hours=10,
            preferred_formats=["video", "hands-on", "projects"],
            learning_objective="Placement / Career Goal",
            skill_confidence_map={
                "python": 0.65,
                "linear-algebra": 0.30,
                "machine-learning": 0.35,
                "sql": 0.60,
                "deep-learning": 0.20,
                "transformers": 0.10,
                "mlops": 0.15
            },
            velocity_score=1.1,
            difficulty_tolerance=0.55
        )
        db.add(demo_profile)
        db.flush()

        demo_goal = Goal(
            profile_id=demo_profile.id,
            title="Become an AI/ML Engineer",
            target_role="AI/ML Engineer",
            description="Master modern deep learning, LLM systems, and end-to-end model deployment to secure an AI Engineering role.",
            target_skills=["python", "linear-algebra", "machine-learning", "deep-learning", "transformers", "langchain-agents", "vector-rag", "mlops"],
            is_primary=True,
            status="active"
        )
        db.add(demo_goal)
        db.flush()

    db.commit()

    # 5. VALIDATE
    validation_report = validate_seed_data(db)
    logger.info(f"Seed Data Quality Verified: {validation_report['resources_count']} resources, {validation_report['skills_count']} skills, Acyclic DAG: {validation_report['is_acyclic']}")
    return validation_report
