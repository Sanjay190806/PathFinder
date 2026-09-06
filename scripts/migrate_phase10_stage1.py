"""
Phase 10 Stage 1: Syllabus Intelligence Seeding & Migration Script
Seeds authoritative, multi-domain syllabus structures into pathfinder.db.
"""

from backend.app.database import SessionLocal
from backend.app.models.resource import LearningResource
from backend.app.models.syllabus import CourseSyllabus
from backend.app.syllabus.syllabus_engine import SyllabusEngine
from backend.app.schemas.syllabus import CourseSyllabusCreate
from backend.app.core.syllabus_catalog import MULTI_DOMAIN_SYLLABUS_REGISTRY


def seed_syllabuses():
    db = SessionLocal()
    engine = SyllabusEngine(db)

    print("--- Starting Phase 10 Stage 1 Syllabus Seeding ---")

    # 1. Seed syllabuses from MULTI_DOMAIN_SYLLABUS_REGISTRY
    for item in MULTI_DOMAIN_SYLLABUS_REGISTRY:
        slug = item["course_slug"]
        # Find or create placeholder resource if not exists
        resource = db.query(LearningResource).filter(LearningResource.slug == slug).first()
        if not resource:
            # Check by first matching resource or create course resource
            resource = LearningResource(
                title=item["title"],
                slug=slug,
                description=item["description"],
                provider=item["provider"],
                url="https://nptel.ac.in/courses",
                resource_type="course",
                difficulty="Intermediate",
                estimated_hours=sum(m["estimated_learning_hours"] for m in item["modules"]),
                quality_score=0.92,
                language=item["language"],
                price_type="GENUINELY_FREE",
                verification_status="VERIFIED"
            )
            db.add(resource)
            db.commit()
            db.refresh(resource)

        # Check if active syllabus already exists
        existing = engine.get_active_syllabus(resource.id)
        if not existing:
            syllabus_payload = {
                "course_id": resource.id,
                "title": item["title"],
                "description": item["description"],
                "version": 1,
                "language": item["language"],
                "source": item["source"],
                "provider": item["provider"],
                "verification_status": item["verification_status"],
                "modules": item["modules"]
            }
            syllabus_create = CourseSyllabusCreate.model_validate(syllabus_payload)
            new_syl, is_val, errors = engine.create_syllabus(syllabus_create)
            print(f"Seeded syllabus for '{resource.title}' (Version: {new_syl.version}, Valid: {is_val})")
            if errors:
                print(f"  Warnings: {errors}")

    # 2. Seed syllabus for python-data-science-bootcamp if not already present
    py_course = db.query(LearningResource).filter(LearningResource.slug == "python-data-science-bootcamp").first()
    if py_course and not engine.get_active_syllabus(py_course.id):
        py_payload = {
            "course_id": py_course.id,
            "title": "Python for Data Science Master Curriculum",
            "description": "Comprehensive curriculum spanning Python fundamentals, NumPy, Pandas, visualization, and exploratory data analysis.",
            "version": 1,
            "language": "English",
            "source": "OFFICIAL_PROVIDER",
            "provider": py_course.provider or "Udemy / Pierian Data",
            "verification_status": "VERIFIED",
            "modules": [
                {
                    "title": "Module 1: Python Programming Core",
                    "description": "Variables, data structures, control flow, functions, OOP",
                    "order_index": 1,
                    "weight": 25.0,
                    "estimated_learning_hours": 8.0,
                    "topics": [
                        {
                            "title": "Control Flow and Functions",
                            "description": "Loops, conditionals, lambda expressions, map and filter",
                            "order_index": 1,
                            "weight": 50.0,
                            "difficulty": "Beginner",
                            "estimated_learning_hours": 4.0,
                            "subtopics": [],
                            "objectives": [
                                {"objective": "Write modular functions and lambda expressions", "objective_type": "IMPLEMENT", "skill_ids": ["python"], "difficulty": "Beginner", "importance": "HIGH"}
                            ],
                            "skills": [{"skill_id": "python", "relationship_type": "REQUIRED", "importance": 1.0, "confidence": 0.95}]
                        },
                        {
                            "title": "Object-Oriented Programming (OOP)",
                            "description": "Classes, inheritance, encapsulation, magic methods",
                            "order_index": 2,
                            "weight": 50.0,
                            "difficulty": "Intermediate",
                            "estimated_learning_hours": 4.0,
                            "subtopics": [],
                            "objectives": [
                                {"objective": "Design reusable object-oriented class hierarchies", "objective_type": "DESIGN", "skill_ids": ["python"], "difficulty": "Intermediate", "importance": "HIGH"}
                            ],
                            "skills": [{"skill_id": "python", "relationship_type": "REQUIRED", "importance": 1.0, "confidence": 0.9}]
                        }
                    ]
                },
                {
                    "title": "Module 2: NumPy & Numerical Computing",
                    "description": "Multidimensional arrays, broadcasting, vectorization, linear algebra",
                    "order_index": 2,
                    "weight": 25.0,
                    "estimated_learning_hours": 7.0,
                    "topics": [
                        {
                            "title": "Ndarrays and Array Operations",
                            "description": "Indexing, slicing, broadcasting rules, matrix math",
                            "order_index": 1,
                            "weight": 100.0,
                            "difficulty": "Intermediate",
                            "estimated_learning_hours": 7.0,
                            "subtopics": [],
                            "objectives": [
                                {"objective": "Perform vector and matrix operations with NumPy broadcasting", "objective_type": "APPLY", "skill_ids": ["numpy", "python"], "difficulty": "Intermediate", "importance": "HIGH"}
                            ],
                            "skills": [{"skill_id": "numpy", "relationship_type": "REQUIRED", "importance": 1.0, "confidence": 0.9}]
                        }
                    ]
                },
                {
                    "title": "Module 3: Data Wrangling with Pandas",
                    "description": "Series, DataFrames, group-by, merging, pivot tables, missing data",
                    "order_index": 3,
                    "weight": 30.0,
                    "estimated_learning_hours": 10.0,
                    "topics": [
                        {
                            "title": "DataFrame Manipulation and Aggregation",
                            "description": "Row/column filtering, groupby aggregations, merge/join",
                            "order_index": 1,
                            "weight": 100.0,
                            "difficulty": "Intermediate",
                            "estimated_learning_hours": 10.0,
                            "subtopics": [],
                            "objectives": [
                                {"objective": "Clean and transform messy data tables using Pandas pipelines", "objective_type": "IMPLEMENT", "skill_ids": ["pandas", "python"], "difficulty": "Intermediate", "importance": "HIGH"}
                            ],
                            "skills": [{"skill_id": "pandas", "relationship_type": "REQUIRED", "importance": 1.0, "confidence": 0.95}]
                        }
                    ]
                },
                {
                    "title": "Module 4: Exploratory Data Visualization",
                    "description": "Matplotlib and Seaborn statistical plotting",
                    "order_index": 4,
                    "weight": 20.0,
                    "estimated_learning_hours": 5.0,
                    "topics": [
                        {
                            "title": "Statistical Graphics & Insights",
                            "description": "Histograms, scatterplots, heatmaps, boxplots",
                            "order_index": 1,
                            "weight": 100.0,
                            "difficulty": "Beginner",
                            "estimated_learning_hours": 5.0,
                            "subtopics": [],
                            "objectives": [
                                {"objective": "Generate exploratory heatmaps and distribution plots", "objective_type": "APPLY", "skill_ids": ["matplotlib", "seaborn"], "difficulty": "Beginner", "importance": "MEDIUM"}
                            ],
                            "skills": [{"skill_id": "matplotlib", "relationship_type": "REQUIRED", "importance": 0.8, "confidence": 0.85}]
                        }
                    ]
                }
            ]
        }
        py_syl = CourseSyllabusCreate.model_validate(py_payload)
        new_syl, is_val, errs = engine.create_syllabus(py_syl)
        print(f"Seeded syllabus for 'python-data-science-bootcamp' (Version: {new_syl.version}, Valid: {is_val})")

    # 3. Ensure ALL resources across all domains have active syllabi
    print("--- Ensuring all remaining resources have active syllabi ---")
    new_count = engine.ensure_all_resources_have_syllabi()
    print(f"Provisioned active syllabi for {new_count} courses across all domains.")

    db.close()
    print("--- Phase 10 Stage 1 Syllabus Seeding Completed ---")


if __name__ == "__main__":
    seed_syllabuses()
