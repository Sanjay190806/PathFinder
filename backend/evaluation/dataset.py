from typing import List, Dict, Any

EVALUATION_PERSONAS: List[Dict[str, Any]] = [
    {
        "id": "persona_1_beginner_ai",
        "name": "Beginner AI Enthusiast",
        "target_role": "AI/ML Engineer",
        "education_level": "Undergraduate",
        "weekly_hours": 10,
        "preferred_formats": ["video", "hands-on"],
        "known_skills": {"python": 0.20},
        "target_skills": ["python", "linear-algebra", "machine-learning", "deep-learning", "transformers"]
    },
    {
        "id": "persona_2_python_dev_to_ml",
        "name": "Intermediate Python Dev Transitioning to ML",
        "target_role": "AI/ML Engineer",
        "education_level": "Bachelor in CS",
        "weekly_hours": 15,
        "preferred_formats": ["hands-on", "project"],
        "known_skills": {"python": 0.85, "sql": 0.70},
        "target_skills": ["machine-learning", "deep-learning", "mlops", "transformers"]
    },
    {
        "id": "persona_3_math_grad_to_ds",
        "name": "Math Graduate targeting Data Science",
        "target_role": "Data Scientist",
        "education_level": "Master in Mathematics",
        "weekly_hours": 12,
        "preferred_formats": ["theory", "hands-on"],
        "known_skills": {"linear-algebra": 0.95, "statistics": 0.90},
        "target_skills": ["python", "pandas", "sql", "eda", "machine-learning"]
    },
    {
        "id": "persona_4_cold_start",
        "name": "Cold-Start Learner",
        "target_role": "Full Stack Developer",
        "education_level": "High School",
        "weekly_hours": 8,
        "preferred_formats": ["video", "interactive"],
        "known_skills": {},
        "target_skills": ["typescript", "react-nextjs", "tailwind", "rest-apis"]
    },
    {
        "id": "persona_5_bootcamper_high_hours",
        "name": "High-Availability Bootcamper",
        "target_role": "Cloud / DevOps Engineer",
        "education_level": "Bootcamp Graduate",
        "weekly_hours": 35,
        "preferred_formats": ["hands-on", "projects"],
        "known_skills": {"linux": 0.60, "git-cicd": 0.60},
        "target_skills": ["docker", "kubernetes", "aws", "linux"]
    },
    {
        "id": "persona_6_working_pro_low_hours",
        "name": "Low-Availability Professional",
        "target_role": "Cybersecurity Analyst",
        "education_level": "Professional",
        "weekly_hours": 4,
        "preferred_formats": ["article", "tutorial"],
        "known_skills": {"networking": 0.40, "linux": 0.50},
        "target_skills": ["networking", "linux", "web-security", "cryptography", "pentesting"]
    },
    {
        "id": "persona_7_systems_to_mlops",
        "name": "Advanced Systems Engineer targeting MLOps",
        "target_role": "AI/ML Engineer",
        "education_level": "Senior Engineer",
        "weekly_hours": 10,
        "preferred_formats": ["project", "hands-on"],
        "known_skills": {"docker": 0.90, "linux": 0.90, "python": 0.80},
        "target_skills": ["python", "machine-learning", "deep-learning", "mlops"]
    },
    {
        "id": "persona_8_weak_prereqs",
        "name": "Learner with Weak Prerequisites",
        "target_role": "AI/ML Engineer",
        "education_level": "Self-Taught",
        "weekly_hours": 10,
        "preferred_formats": ["video"],
        "known_skills": {"python": 0.30, "linear-algebra": 0.10},
        "target_skills": ["python", "linear-algebra", "machine-learning", "deep-learning"]
    },
    {
        "id": "persona_9_positive_explorer",
        "name": "Fast Learner with High Engagement",
        "target_role": "Data Scientist",
        "education_level": "Undergraduate",
        "weekly_hours": 20,
        "preferred_formats": ["hands-on", "interactive"],
        "known_skills": {"python": 0.70, "sql": 0.70, "pandas": 0.70},
        "target_skills": ["pandas", "sql", "eda", "machine-learning", "pyspark"]
    },
    {
        "id": "persona_10_struggling_learner",
        "name": "Learner Struggling with Deep Learning",
        "target_role": "AI/ML Engineer",
        "education_level": "Undergraduate",
        "weekly_hours": 10,
        "preferred_formats": ["video", "hands-on"],
        "known_skills": {"python": 0.60, "machine-learning": 0.40, "deep-learning": 0.20},
        "target_skills": ["python", "machine-learning", "deep-learning", "transformers"]
    }
]
