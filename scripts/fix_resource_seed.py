import uuid
from backend.app.database import SessionLocal
from backend.app.models.resource import LearningResource, ResourceSkill
from backend.app.models.skill import Skill


def fix_resources():
    db = SessionLocal()
    py_skill = db.query(Skill).filter(Skill.slug == "python").first()
    ml_skill = db.query(Skill).filter(Skill.slug == "machine-learning").first()
    ds_skill = db.query(Skill).filter(Skill.slug == "data-science").first()
    fallback_skill = py_skill or ml_skill or db.query(Skill).first()

    r_ml = db.query(LearningResource).filter(LearningResource.slug == "machine-learning-specialization").first()
    if r_ml:
        r_ml.url = "https://www.coursera.org/specializations/machine-learning-introduction"
        if not r_ml.resource_skills:
            db.add(ResourceSkill(id=str(uuid.uuid4()), resource_id=r_ml.id, skill_id=(ml_skill.id if ml_skill else fallback_skill.id), is_primary=True))

    r_vlsi = db.query(LearningResource).filter(LearningResource.slug == "vlsi-design-verilog").first()
    if r_vlsi:
        r_vlsi.url = "https://nptel.ac.in/courses/108/106/108106148/"
        if not r_vlsi.resource_skills:
            db.add(ResourceSkill(id=str(uuid.uuid4()), resource_id=r_vlsi.id, skill_id=fallback_skill.id, is_primary=True))

    r_cad = db.query(LearningResource).filter(LearningResource.slug == "solidworks-mechanical-cad").first()
    if r_cad:
        r_cad.url = "https://nptel.ac.in/courses/112/107/112107290/"
        if not r_cad.resource_skills:
            db.add(ResourceSkill(id=str(uuid.uuid4()), resource_id=r_cad.id, skill_id=fallback_skill.id, is_primary=True))

    r_fin = db.query(LearningResource).filter(LearningResource.slug == "financial-accounting-valuation").first()
    if r_fin:
        r_fin.url = "https://online.iimb.ac.in/courses/financial-analysis-valuation"
        if not r_fin.resource_skills:
            db.add(ResourceSkill(id=str(uuid.uuid4()), resource_id=r_fin.id, skill_id=(ds_skill.id if ds_skill else fallback_skill.id), is_primary=True))

    db.commit()
    print("Resources updated with unique URLs and skills.")
    db.close()


if __name__ == "__main__":
    fix_resources()
