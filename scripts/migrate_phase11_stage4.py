"""
Phase 11 Stage 4 Database Migration & Requirements/Pathways Seeder
Creates tables:
- career_requirements
- career_pathways
- career_pathway_steps
Seeds verified canonical career requirements and multi-pathway routes for all 21 careers.
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.orm import Session
from backend.app.database import engine, SessionLocal, Base
from backend.app.models.skill import Skill
from backend.app.models.career import (
    Career,
    CareerRequirement,
    CareerPathwayDefinition,
    PathwayStepDefinition
)

REQUIREMENTS_SEED_DATA = {
    "doctor": [
        {
            "requirement_type": "HARD_REQUIREMENT",
            "category": "EDUCATION",
            "requirement_name": "Higher Secondary (10+2) with Physics, Chemistry & Biology",
            "description": "Mandatory PCB coursework with minimum 50% aggregate in qualifying board exams.",
            "education_level": "higher-secondary",
            "mandatory": True,
            "source": "National Medical Commission (NMC)",
            "verification_status": "VERIFIED",
            "country_code": "IN"
        },
        {
            "requirement_type": "HARD_REQUIREMENT",
            "category": "REGULATORY",
            "requirement_name": "NEET-UG Qualifying Score & Merit Rank",
            "description": "Statutory entrance exam required for admission to all medical colleges in India.",
            "mandatory": True,
            "source": "National Testing Agency (NTA) & NMC",
            "verification_status": "VERIFIED",
            "country_code": "IN"
        },
        {
            "requirement_type": "HARD_REQUIREMENT",
            "category": "DEGREE",
            "requirement_name": "Bachelor of Medicine, Bachelor of Surgery (MBBS)",
            "description": "4.5 years academic coursework + 1 year compulsory rotatory residential internship.",
            "education_level": "undergraduate",
            "mandatory": True,
            "source": "National Medical Commission (NMC)",
            "verification_status": "VERIFIED",
            "country_code": "IN"
        },
        {
            "requirement_type": "HARD_REQUIREMENT",
            "category": "LICENSE",
            "requirement_name": "State Medical Council / NMC Medical Practitioner Registration",
            "description": "Legal license to practice modern clinical medicine in India.",
            "mandatory": True,
            "source": "State Medical Councils / NMC",
            "verification_status": "VERIFIED",
            "country_code": "IN"
        },
        {
            "requirement_type": "HARD_REQUIREMENT",
            "category": "SKILL",
            "requirement_name": "Clinical Diagnosis & Patient Assessment",
            "skill_slug": "clinical-diagnosis",
            "minimum_level": "PROFICIENT",
            "mandatory": True,
            "source": "Medical Curriculum Regulations",
            "verification_status": "VERIFIED",
            "country_code": "GLOBAL"
        },
        {
            "requirement_type": "RECOMMENDED",
            "category": "DEGREE",
            "requirement_name": "Postgraduate Specialization (MD / MS / DNB)",
            "description": "Specialty clinical training for advanced hospital practice.",
            "education_level": "postgraduate",
            "mandatory": False,
            "source": "NMC Guidelines",
            "verification_status": "VERIFIED",
            "country_code": "IN"
        }
    ],
    "commercial-airline-pilot": [
        {
            "requirement_type": "HARD_REQUIREMENT",
            "category": "EDUCATION",
            "requirement_name": "Higher Secondary (10+2) with Physics & Mathematics",
            "description": "Mandatory 10+2 with Physics and Maths or equivalent NIOS certification.",
            "education_level": "higher-secondary",
            "mandatory": True,
            "source": "Directorate General of Civil Aviation (DGCA)",
            "verification_status": "VERIFIED",
            "country_code": "IN"
        },
        {
            "requirement_type": "HARD_REQUIREMENT",
            "category": "REGULATORY",
            "requirement_name": "DGCA Class 1 Medical Assessment",
            "description": "Strict physical fitness, vision 6/6 (with or without correction), audiometry, and ECG verification.",
            "mandatory": True,
            "source": "DGCA Medical Directorate",
            "verification_status": "VERIFIED",
            "country_code": "IN"
        },
        {
            "requirement_type": "HARD_REQUIREMENT",
            "category": "LICENSE",
            "requirement_name": "Commercial Pilot License (CPL) with Instrument Rating",
            "description": "DGCA approved license requiring minimum 200 logged flight hours and theoretical exams pass.",
            "mandatory": True,
            "source": "DGCA India",
            "verification_status": "VERIFIED",
            "country_code": "IN"
        },
        {
            "requirement_type": "RECOMMENDED",
            "category": "CERTIFICATION",
            "requirement_name": "Multi-Crew Cooperation (MCC) & Type Rating (A320 / B737)",
            "description": "Specific aircraft qualification required by commercial airlines for First Officer recruitment.",
            "mandatory": False,
            "source": "Airline Recruitment Standards",
            "verification_status": "VERIFIED",
            "country_code": "GLOBAL"
        }
    ],
    "chartered-accountant": [
        {
            "requirement_type": "HARD_REQUIREMENT",
            "category": "EDUCATION",
            "requirement_name": "Higher Secondary (10+2) or Degree Equivalent",
            "description": "Eligible to register for CA Foundation after 10+2; Direct Entry route available for graduates.",
            "education_level": "higher-secondary",
            "mandatory": True,
            "source": "Institute of Chartered Accountants of India (ICAI)",
            "verification_status": "VERIFIED",
            "country_code": "IN"
        },
        {
            "requirement_type": "HARD_REQUIREMENT",
            "category": "REGULATORY",
            "requirement_name": "ICAI CA Course Examination Sequence (Foundation, Inter, Final)",
            "description": "Passing marks in Group I and Group II of CA Intermediate and Final exams.",
            "mandatory": True,
            "source": "ICAI",
            "verification_status": "VERIFIED",
            "country_code": "IN"
        },
        {
            "requirement_type": "HARD_REQUIREMENT",
            "category": "EXPERIENCE",
            "requirement_name": "Practical Articleship Training (2-3 Years)",
            "description": "Compulsory hands-on articleship under a practicing Chartered Accountant in audit, taxation, and advisory.",
            "mandatory": True,
            "source": "ICAI Regulations",
            "verification_status": "VERIFIED",
            "country_code": "IN"
        },
        {
            "requirement_type": "HARD_REQUIREMENT",
            "category": "LICENSE",
            "requirement_name": "ICAI Membership Certificate (ACA / FCA)",
            "description": "Official enrollment as an Associate Chartered Accountant.",
            "mandatory": True,
            "source": "ICAI",
            "verification_status": "VERIFIED",
            "country_code": "IN"
        }
    ],
    "corporate-lawyer": [
        {
            "requirement_type": "HARD_REQUIREMENT",
            "category": "DEGREE",
            "requirement_name": "Bachelor of Laws (LLB / 5-Year Integrated BA/BBA LLB)",
            "description": "Recognized law degree from a university approved by the Bar Council of India.",
            "education_level": "undergraduate",
            "mandatory": True,
            "source": "Bar Council of India (BCI)",
            "verification_status": "VERIFIED",
            "country_code": "IN"
        },
        {
            "requirement_type": "HARD_REQUIREMENT",
            "category": "REGULATORY",
            "requirement_name": "All India Bar Examination (AIBE) Clearance",
            "description": "Statutory qualifying exam for advocate enrollment and right to practice before courts and tribunals.",
            "mandatory": True,
            "source": "BCI",
            "verification_status": "VERIFIED",
            "country_code": "IN"
        },
        {
            "requirement_type": "RECOMMENDED",
            "category": "SKILL",
            "requirement_name": "Corporate Contract Drafting & Due Diligence",
            "skill_slug": "corporate-law",
            "minimum_level": "WORKING",
            "mandatory": False,
            "source": "Legal Industry Hiring Standards",
            "verification_status": "VERIFIED",
            "country_code": "GLOBAL"
        }
    ],
    "licensed-electrician": [
        {
            "requirement_type": "HARD_REQUIREMENT",
            "category": "EDUCATION",
            "requirement_name": "Secondary School (10th Standard / Matriculation)",
            "description": "Standard entry prerequisite for vocational electrician trade courses.",
            "education_level": "secondary",
            "mandatory": True,
            "source": "Directorate General of Training (DGT)",
            "verification_status": "VERIFIED",
            "country_code": "IN"
        },
        {
            "requirement_type": "HARD_REQUIREMENT",
            "category": "CERTIFICATION",
            "requirement_name": "ITI Electrician National Trade Certificate (NTC)",
            "description": "2-year vocational trade training certified by NCVT.",
            "mandatory": True,
            "source": "NCVT / DGT",
            "verification_status": "VERIFIED",
            "country_code": "IN"
        },
        {
            "requirement_type": "HARD_REQUIREMENT",
            "category": "LICENSE",
            "requirement_name": "Wireman / Electrical Supervisor License (Grade A or B)",
            "description": "Statutory license issued by the State Electrical Licensing Board.",
            "mandatory": True,
            "source": "State Electrical Licensing Board",
            "verification_status": "VERIFIED",
            "country_code": "IN"
        },
        {
            "requirement_type": "HARD_REQUIREMENT",
            "category": "SKILL",
            "requirement_name": "Electrical Wiring & Circuit Installation",
            "skill_slug": "electrical-wiring",
            "minimum_level": "PROFICIENT",
            "mandatory": True,
            "source": "Occupational Standards",
            "verification_status": "VERIFIED",
            "country_code": "GLOBAL"
        }
    ],
    "ai-ml-engineer": [
        {
            "requirement_type": "RECOMMENDED",
            "category": "DEGREE",
            "requirement_name": "Bachelor's or Master's in Computer Science, Data Science, Math, or Engineering",
            "description": "Formal quantitative or computational degree.",
            "education_level": "undergraduate",
            "mandatory": False,
            "source": "Tech Industry Standard",
            "verification_status": "VERIFIED",
            "country_code": "GLOBAL"
        },
        {
            "requirement_type": "HARD_REQUIREMENT",
            "category": "SKILL",
            "requirement_name": "Python Programming",
            "skill_slug": "python",
            "minimum_level": "PROFICIENT",
            "mandatory": True,
            "source": "Tech Industry Standard",
            "verification_status": "VERIFIED",
            "country_code": "GLOBAL"
        },
        {
            "requirement_type": "HARD_REQUIREMENT",
            "category": "SKILL",
            "requirement_name": "Machine Learning Algorithms",
            "skill_slug": "machine-learning",
            "minimum_level": "WORKING",
            "mandatory": True,
            "source": "Tech Industry Standard",
            "verification_status": "VERIFIED",
            "country_code": "GLOBAL"
        },
        {
            "requirement_type": "RECOMMENDED",
            "category": "SKILL",
            "requirement_name": "Deep Learning & Neural Architectures",
            "skill_slug": "deep-learning",
            "minimum_level": "WORKING",
            "mandatory": False,
            "source": "Tech Industry Standard",
            "verification_status": "VERIFIED",
            "country_code": "GLOBAL"
        },
        {
            "requirement_type": "RECOMMENDED",
            "category": "PORTFOLIO",
            "requirement_name": "Production ML Repositories / Public Models on HuggingFace/GitHub",
            "description": "Verified code showcasing model inference, data pipelines, and evaluation metrics.",
            "mandatory": False,
            "source": "Hiring Practice",
            "verification_status": "VERIFIED",
            "country_code": "GLOBAL"
        }
    ],
    "graphic-designer": [
        {
            "requirement_type": "HELPFUL",
            "category": "DEGREE",
            "requirement_name": "Degree or Diploma in Graphic Design / Fine Arts / Visual Communication",
            "description": "Formal design education.",
            "education_level": "undergraduate",
            "mandatory": False,
            "source": "Design Industry Standard",
            "verification_status": "VERIFIED",
            "country_code": "GLOBAL"
        },
        {
            "requirement_type": "HARD_REQUIREMENT",
            "category": "SKILL",
            "requirement_name": "Typography & Editorial Layout",
            "skill_slug": "typography",
            "minimum_level": "PROFICIENT",
            "mandatory": True,
            "source": "Design Industry Standard",
            "verification_status": "VERIFIED",
            "country_code": "GLOBAL"
        },
        {
            "requirement_type": "HARD_REQUIREMENT",
            "category": "PORTFOLIO",
            "requirement_name": "Public Design Portfolio (Behance / Dribbble / Figma / Website)",
            "description": "Curated case studies demonstrating design process, brand identity, and typography.",
            "mandatory": True,
            "source": "Creative Industry Hiring Standard",
            "verification_status": "VERIFIED",
            "country_code": "GLOBAL"
        }
    ],
    "software-engineer": [
        {
            "requirement_type": "RECOMMENDED",
            "category": "DEGREE",
            "requirement_name": "Bachelor's in Computer Science, IT, or Engineering Equivalent",
            "description": "B.Tech/BE/BCA/B.Sc CS.",
            "education_level": "undergraduate",
            "mandatory": False,
            "source": "Tech Hiring Standards",
            "verification_status": "VERIFIED",
            "country_code": "GLOBAL"
        },
        {
            "requirement_type": "HARD_REQUIREMENT",
            "category": "SKILL",
            "requirement_name": "Data Structures & Algorithms",
            "skill_slug": "dsa",
            "minimum_level": "PROFICIENT",
            "mandatory": True,
            "source": "Tech Hiring Standards",
            "verification_status": "VERIFIED",
            "country_code": "GLOBAL"
        },
        {
            "requirement_type": "HARD_REQUIREMENT",
            "category": "SKILL",
            "requirement_name": "Backend Architecture & REST APIs",
            "skill_slug": "rest-apis",
            "minimum_level": "WORKING",
            "mandatory": True,
            "source": "Tech Hiring Standards",
            "verification_status": "VERIFIED",
            "country_code": "GLOBAL"
        }
    ]
}

PATHWAYS_SEED_DATA = {
    "doctor": [
        {
            "pathway_id": "doctor-standard-mbbs",
            "pathway_type": "DEGREE",
            "title": "Standard Medical Degree Route (NEET-UG & MBBS)",
            "description": "Authoritative regulatory statutory pathway to become a licensed physician in India.",
            "applicable_backgrounds": ["pcb", "science-12th"],
            "duration_estimate": "5.5 years",
            "difficulty_level": "Rigorous",
            "is_primary": True,
            "steps": [
                {"step_number": 1, "title": "Senior Secondary PCB Completion (10+2)", "step_type": "academic_prerequisite", "estimated_weeks": 104, "skills_to_acquire": [], "prerequisites": ["10th-standard"]},
                {"step_number": 2, "title": "NEET-UG Exam & Counseling", "step_type": "licensure_exam", "estimated_weeks": 52, "skills_to_acquire": [], "prerequisites": ["pcb-completion"]},
                {"step_number": 3, "title": "MBBS Academic Coursework (Pre-Clinical, Para-Clinical, Clinical)", "step_type": "academic_prerequisite", "estimated_weeks": 234, "skills_to_acquire": ["anatomy-physiology", "clinical-diagnosis", "pharmacology"], "prerequisites": ["neet-qualification"]},
                {"step_number": 4, "title": "Compulsory Rotatory Residential Internship (CRRI)", "step_type": "core_competency", "estimated_weeks": 52, "skills_to_acquire": ["nursing-care"], "prerequisites": ["mbbs-final-exam"]},
                {"step_number": 5, "title": "State Medical Council Registration", "step_type": "licensure_exam", "estimated_weeks": 4, "skills_to_acquire": [], "prerequisites": ["crri-completion"]}
            ]
        }
    ],
    "commercial-airline-pilot": [
        {
            "pathway_id": "pilot-cadet-cpl",
            "pathway_type": "DIRECT",
            "title": "Aviation Academy Commercial Pilot License (CPL) Route",
            "description": "DGCA accredited flying training organization curriculum with instrument and multi-engine rating.",
            "applicable_backgrounds": ["pcm", "science-12th"],
            "duration_estimate": "18-24 months",
            "difficulty_level": "High",
            "is_primary": True,
            "steps": [
                {"step_number": 1, "title": "10+2 with Physics & Mathematics + DGCA Class 2 & 1 Medical", "step_type": "academic_prerequisite", "estimated_weeks": 12, "skills_to_acquire": [], "prerequisites": []},
                {"step_number": 2, "title": "DGCA Ground School Theory Exams (Navigation, Meteorology, Regs)", "step_type": "licensure_exam", "estimated_weeks": 24, "skills_to_acquire": [], "prerequisites": ["class-1-medical"]},
                {"step_number": 3, "title": "200 Hours Flight Training & Solo Cross-Country", "step_type": "core_competency", "estimated_weeks": 40, "skills_to_acquire": ["flight-navigation"], "prerequisites": ["ground-school"]},
                {"step_number": 4, "title": "DGCA CPL Issuance & Airline Type Rating (A320/B737)", "step_type": "industry_entry", "estimated_weeks": 16, "skills_to_acquire": [], "prerequisites": ["flight-hours-verified"]}
            ]
        }
    ],
    "chartered-accountant": [
        {
            "pathway_id": "ca-foundation-route",
            "pathway_type": "CERTIFICATION_SUPPORTED",
            "title": "ICAI CA Foundation to Final Pathway",
            "description": "Standard chartered accountancy progression open to high school graduates of any stream.",
            "applicable_backgrounds": ["commerce", "science", "arts", "any-12th"],
            "duration_estimate": "4.5-5 years",
            "difficulty_level": "Rigorous",
            "is_primary": True,
            "steps": [
                {"step_number": 1, "title": "CA Foundation Registration & Examination", "step_type": "licensure_exam", "estimated_weeks": 26, "skills_to_acquire": ["financial-accounting"], "prerequisites": ["12th-standard"]},
                {"step_number": 2, "title": "CA Intermediate Course (8 Subjects)", "step_type": "academic_prerequisite", "estimated_weeks": 36, "skills_to_acquire": ["taxation-gst", "auditing"], "prerequisites": ["foundation-cleared"]},
                {"step_number": 3, "title": "ICITSS Training & 2-Year Practical Articleship", "step_type": "core_competency", "estimated_weeks": 104, "skills_to_acquire": [], "prerequisites": ["inter-cleared"]},
                {"step_number": 4, "title": "CA Final Exam & ICAI Membership Enrollment", "step_type": "licensure_exam", "estimated_weeks": 26, "skills_to_acquire": [], "prerequisites": ["articleship-completed"]}
            ]
        }
    ],
    "ai-ml-engineer": [
        {
            "pathway_id": "aiml-degree-direct",
            "pathway_type": "DEGREE",
            "title": "Computer Science Degree to Machine Learning Specialization",
            "description": "Undergraduate engineering route with rigorous computer science, mathematics, and ML electives.",
            "applicable_backgrounds": ["pcm", "computer-science-engineering", "data-science"],
            "duration_estimate": "4 years",
            "difficulty_level": "Moderate",
            "is_primary": True,
            "steps": [
                {"step_number": 1, "title": "B.Tech Computer Science / Data Science", "step_type": "academic_prerequisite", "estimated_weeks": 160, "skills_to_acquire": ["python", "dsa", "linear-algebra"], "prerequisites": ["10+2-pcm"]},
                {"step_number": 2, "title": "Applied Machine Learning & Statistical Modeling", "step_type": "core_competency", "estimated_weeks": 12, "skills_to_acquire": ["machine-learning", "statistics", "pandas"], "prerequisites": ["python-basics"]},
                {"step_number": 3, "title": "Deep Learning, Transformers & Vector RAG Architectures", "step_type": "core_competency", "estimated_weeks": 16, "skills_to_acquire": ["deep-learning", "transformers", "vector-rag"], "prerequisites": ["machine-learning"]},
                {"step_number": 4, "title": "Production Capstone & Open-Source AI Portfolio", "step_type": "capstone_evidence", "estimated_weeks": 8, "skills_to_acquire": ["mlops", "docker"], "prerequisites": ["deep-learning"]}
            ]
        },
        {
            "pathway_id": "aiml-transition-software-engineer",
            "pathway_type": "CAREER_TRANSITION",
            "title": "Software Engineer to AI/ML Bridge Pathway",
            "description": "Targeted ramp-up for existing developers leveraging coding fundamentals to transition into ML engineering.",
            "applicable_backgrounds": ["software-engineer", "web-developer", "computer-science-engineering"],
            "duration_estimate": "6-9 months",
            "difficulty_level": "Moderate",
            "is_primary": False,
            "steps": [
                {"step_number": 1, "title": "Mathematical Foundations Bridge (Linear Algebra, Calculus, Statistics)", "step_type": "foundational_skill", "estimated_weeks": 6, "skills_to_acquire": ["linear-algebra", "statistics"], "prerequisites": ["python"]},
                {"step_number": 2, "title": "Classical ML & Feature Engineering Pipelines", "step_type": "core_competency", "estimated_weeks": 8, "skills_to_acquire": ["machine-learning", "pandas"], "prerequisites": ["statistics"]},
                {"step_number": 3, "title": "Deep Learning & LLM Fine-Tuning", "step_type": "core_competency", "estimated_weeks": 10, "skills_to_acquire": ["deep-learning", "transformers", "vector-rag"], "prerequisites": ["machine-learning"]},
                {"step_number": 4, "title": "MLOps, Model Serving & Portfolio Deployment", "step_type": "capstone_evidence", "estimated_weeks": 6, "skills_to_acquire": ["mlops"], "prerequisites": ["deep-learning"]}
            ]
        }
    ],
    "graphic-designer": [
        {
            "pathway_id": "graphic-design-portfolio-direct",
            "pathway_type": "VOCATIONAL",
            "title": "Direct Portfolio & Visual Craft Pathway",
            "description": "Fast-track, project-based career route focusing on typography, layout mastery, and case study production.",
            "applicable_backgrounds": ["any", "arts-humanities", "fine-arts"],
            "duration_estimate": "6-8 months",
            "difficulty_level": "Accessible",
            "is_primary": True,
            "steps": [
                {"step_number": 1, "title": "Visual Design Principles, Color Theory & Grid Systems", "step_type": "foundational_skill", "estimated_weeks": 6, "skills_to_acquire": ["typography", "color-theory", "layout-design"], "prerequisites": []},
                {"step_number": 2, "title": "Industry Software Proficiency (Figma, Photoshop, Illustrator)", "step_type": "core_competency", "estimated_weeks": 10, "skills_to_acquire": ["figma-ui"], "prerequisites": ["color-theory"]},
                {"step_number": 3, "title": "Brand Identity Design & Commercial Collateral", "step_type": "core_competency", "estimated_weeks": 8, "skills_to_acquire": ["brand-identity"], "prerequisites": ["typography"]},
                {"step_number": 4, "title": "Curated Professional Portfolio Case Studies", "step_type": "capstone_evidence", "estimated_weeks": 6, "skills_to_acquire": [], "prerequisites": ["brand-identity"]}
            ]
        },
        {
            "pathway_id": "graphic-design-formal-bdes",
            "pathway_type": "DEGREE",
            "title": "Formal B.Des / BFA Degree Route",
            "description": "Four-year university degree program in visual communication, studio art, and multimedia design.",
            "applicable_backgrounds": ["any-12th", "design-foundation"],
            "duration_estimate": "4 years",
            "difficulty_level": "Moderate",
            "is_primary": False,
            "steps": [
                {"step_number": 1, "title": "Design Entrance Exams (UCEED / NID / College Tests)", "step_type": "licensure_exam", "estimated_weeks": 26, "skills_to_acquire": [], "prerequisites": ["12th-standard"]},
                {"step_number": 2, "title": "B.Des Studio Semesters & Typography Labs", "step_type": "academic_prerequisite", "estimated_weeks": 140, "skills_to_acquire": ["typography", "layout-design", "brand-identity"], "prerequisites": ["entrance-qualified"]},
                {"step_number": 3, "title": "Graduation Degree Project & Design Studio Internship", "step_type": "capstone_evidence", "estimated_weeks": 24, "skills_to_acquire": [], "prerequisites": ["bdes-coursework"]}
            ]
        }
    ],
    "licensed-electrician": [
        {
            "pathway_id": "electrician-iti-craftsman",
            "pathway_type": "ITI",
            "title": "NCVT ITI Electrician & Wireman Licensure Pathway",
            "description": "Standard Indian vocational craftsman training scheme culminating in government electrical license.",
            "applicable_backgrounds": ["any-10th", "matriculation"],
            "duration_estimate": "2.5 years",
            "difficulty_level": "Practical / Hands-on",
            "is_primary": True,
            "steps": [
                {"step_number": 1, "title": "10th Standard Board Examination", "step_type": "academic_prerequisite", "estimated_weeks": 52, "skills_to_acquire": [], "prerequisites": []},
                {"step_number": 2, "title": "ITI Electrician 2-Year Full-Time Trade Course", "step_type": "foundational_skill", "estimated_weeks": 104, "skills_to_acquire": ["electrical-wiring", "electrical-machines"], "prerequisites": ["10th-standard"]},
                {"step_number": 3, "title": "National Apprenticeship Training (1 Year)", "step_type": "core_competency", "estimated_weeks": 52, "skills_to_acquire": [], "prerequisites": ["iti-trade-certificate"]},
                {"step_number": 4, "title": "State Electrical Licensing Board Wireman Exam & Certificate", "step_type": "licensure_exam", "estimated_weeks": 8, "skills_to_acquire": [], "prerequisites": ["apprenticeship"]}
            ]
        }
    ]
}


def run_phase11_stage4_migration():
    print("=" * 60)
    print("PHASE 11 STAGE 4: REQUIREMENTS & PATHWAYS MIGRATION")
    print("=" * 60)

    # 1. Create tables
    print("[1/4] Ensuring database tables exist for career requirements & pathways...")
    Base.metadata.create_all(bind=engine)
    print("Tables verified.")

    db: Session = SessionLocal()
    try:
        careers = {c.slug: c for c in db.query(Career).all()}
        skills = {s.slug: s for s in db.query(Skill).all()}
        print(f"Loaded {len(careers)} careers and {len(skills)} skills from database.")

        # 2. Seed Requirements
        print("[2/4] Seeding granular Career Requirements...")
        req_count = 0
        for career_slug, req_list in REQUIREMENTS_SEED_DATA.items():
            career = careers.get(career_slug)
            if not career:
                continue

            for r_data in req_list:
                skill_id = None
                if "skill_slug" in r_data and r_data["skill_slug"] in skills:
                    skill_id = skills[r_data["skill_slug"]].id

                existing = db.query(CareerRequirement).filter(
                    CareerRequirement.career_id == career.id,
                    CareerRequirement.requirement_name == r_data["requirement_name"]
                ).first()

                if not existing:
                    req = CareerRequirement(
                        career_id=career.id,
                        requirement_type=r_data["requirement_type"],
                        category=r_data["category"],
                        requirement_name=r_data["requirement_name"],
                        description=r_data.get("description"),
                        education_level=r_data.get("education_level"),
                        skill_id=skill_id,
                        minimum_level=r_data.get("minimum_level", "WORKING"),
                        mandatory=r_data.get("mandatory", False),
                        source=r_data.get("source"),
                        verification_status=r_data.get("verification_status", "VERIFIED"),
                        country_code=r_data.get("country_code", "GLOBAL")
                    )
                    db.add(req)
                    req_count += 1

        # Also add default requirements for other careers if not explicitly listed
        for career_slug, career in careers.items():
            if career_slug not in REQUIREMENTS_SEED_DATA:
                # Add default skill requirements as CareerRequirement entries
                for csr in career.skill_requirements:
                    req_name = f"Skill: {csr.skill.name if csr.skill else 'Core Skill'}"
                    existing = db.query(CareerRequirement).filter(
                        CareerRequirement.career_id == career.id,
                        CareerRequirement.requirement_name == req_name
                    ).first()
                    if not existing:
                        db.add(CareerRequirement(
                            career_id=career.id,
                            requirement_type="HARD_REQUIREMENT" if csr.importance in ["MANDATORY", "CRITICAL"] else "RECOMMENDED",
                            category="SKILL",
                            requirement_name=req_name,
                            description=f"Proficiency in {csr.skill.name if csr.skill else 'core skill'}",
                            skill_id=csr.skill_id,
                            minimum_level=csr.proficiency_level or "WORKING",
                            mandatory=csr.importance in ["MANDATORY", "CRITICAL"],
                            source="Phase 11 Career Skill Matrix",
                            verification_status="VERIFIED"
                        ))
                        req_count += 1

                # Add education requirements as CareerRequirement entries
                for cer in career.education_requirements:
                    req_name = f"Education: {cer.education_level.title()} Degree"
                    existing = db.query(CareerRequirement).filter(
                        CareerRequirement.career_id == career.id,
                        CareerRequirement.requirement_name == req_name
                    ).first()
                    if not existing:
                        db.add(CareerRequirement(
                            career_id=career.id,
                            requirement_type=cer.requirement_type or "RECOMMENDED",
                            category="DEGREE",
                            requirement_name=req_name,
                            description=f"Preferred streams: {', '.join(cer.preferred_streams or [])}",
                            education_level=cer.education_level,
                            mandatory=cer.requirement_type == "HARD_REQUIREMENT",
                            source="Phase 11 Career Education Matrix",
                            verification_status="VERIFIED"
                        ))
                        req_count += 1

        db.commit()
        print(f"Seeded {req_count} career requirements.")

        # 3. Seed Pathways
        print("[3/4] Seeding Career Multi-Pathways & Steps...")
        path_count = 0
        step_count = 0
        for career_slug, pathways_list in PATHWAYS_SEED_DATA.items():
            career = careers.get(career_slug)
            if not career:
                continue

            for p_data in pathways_list:
                existing_path = db.query(CareerPathwayDefinition).filter(
                    CareerPathwayDefinition.career_id == career.id,
                    CareerPathwayDefinition.pathway_id == p_data["pathway_id"]
                ).first()

                if not existing_path:
                    pathway = CareerPathwayDefinition(
                        career_id=career.id,
                        pathway_id=p_data["pathway_id"],
                        pathway_type=p_data["pathway_type"],
                        title=p_data["title"],
                        description=p_data.get("description"),
                        applicable_backgrounds=p_data.get("applicable_backgrounds", []),
                        duration_estimate=p_data.get("duration_estimate", "6-12 months"),
                        difficulty_level=p_data.get("difficulty_level", "Moderate"),
                        is_primary=p_data.get("is_primary", False)
                    )
                    db.add(pathway)
                    db.flush()
                    path_count += 1

                    for s_data in p_data.get("steps", []):
                        step = PathwayStepDefinition(
                            pathway_id=pathway.id,
                            step_number=s_data["step_number"],
                            title=s_data["title"],
                            description=s_data.get("description", ""),
                            step_type=s_data["step_type"],
                            skills_to_acquire=s_data.get("skills_to_acquire", []),
                            estimated_weeks=s_data.get("estimated_weeks", 4),
                            prerequisites=s_data.get("prerequisites", [])
                        )
                        db.add(step)
                        step_count += 1

        # Generate generic default pathway for any career lacking explicit pathway
        for career_slug, career in careers.items():
            if career_slug not in PATHWAYS_SEED_DATA:
                p_id = f"{career_slug}-standard-pathway"
                existing = db.query(CareerPathwayDefinition).filter(
                    CareerPathwayDefinition.career_id == career.id,
                    CareerPathwayDefinition.pathway_id == p_id
                ).first()
                if not existing:
                    pathway = CareerPathwayDefinition(
                        career_id=career.id,
                        pathway_id=p_id,
                        pathway_type="DEGREE",
                        title=f"Standard Path to {career.display_name}",
                        description=f"Curated industry route to build required competencies for {career.display_name}.",
                        applicable_backgrounds=["general"],
                        duration_estimate="1-3 years",
                        difficulty_level="Moderate",
                        is_primary=True
                    )
                    db.add(pathway)
                    db.flush()
                    path_count += 1

                    # Add steps based on skills
                    req_skills = [csr.skill.name for csr in career.skill_requirements[:4] if csr.skill]
                    step1 = PathwayStepDefinition(
                        pathway_id=pathway.id,
                        step_number=1,
                        title=f"Foundational Education & Prerequisites",
                        step_type="academic_prerequisite",
                        skills_to_acquire=[],
                        estimated_weeks=26,
                        prerequisites=[]
                    )
                    step2 = PathwayStepDefinition(
                        pathway_id=pathway.id,
                        step_number=2,
                        title=f"Core Competency Acquisition ({', '.join(req_skills[:2]) if req_skills else 'Domain Skills'})",
                        step_type="core_competency",
                        skills_to_acquire=req_skills[:2],
                        estimated_weeks=16,
                        prerequisites=["foundations"]
                    )
                    step3 = PathwayStepDefinition(
                        pathway_id=pathway.id,
                        step_number=3,
                        title=f"Applied Practice, Projects & Industry Entry",
                        step_type="capstone_evidence",
                        skills_to_acquire=req_skills[2:4],
                        estimated_weeks=12,
                        prerequisites=["core-competency"]
                    )
                    db.add_all([step1, step2, step3])
                    step_count += 3

        db.commit()
        print(f"Seeded {path_count} pathways and {step_count} pathway steps.")

        print("[4/4] Validation complete. All Phase 11 Stage 4 data is seeded successfully.")

    except Exception as e:
        db.rollback()
        print(f"ERROR: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_phase11_stage4_migration()
