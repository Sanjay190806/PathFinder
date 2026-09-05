"""
Phase 12 Stage 3 Migration & Seeding Script: Company -> Role -> Skill Mapping & Grounded Requirement Intelligence
Creates role_skill_requirements, role_dsa_requirements, role_technology_requirements, role_interview_topics
and seeds verified requirements for key enterprise roles.
"""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.database import SessionLocal, engine, Base
from backend.app.models.company import Company, CompanyRole
from backend.app.models.skill import Skill
from backend.app.models.company_requirements import (
    RoleSkillRequirement,
    RoleDSARequirement,
    RoleTechnologyRequirement,
    RoleInterviewTopic,
)

def run_migration():
    print("Starting Phase 12 Stage 3 Migration...")

    # Create tables
    Base.metadata.create_all(
        bind=engine,
        tables=[
            RoleSkillRequirement.__table__,
            RoleDSARequirement.__table__,
            RoleTechnologyRequirement.__table__,
            RoleInterviewTopic.__table__,
        ]
    )
    print("Created Stage 3 requirement tables.")

    db = SessionLocal()
    try:
        # Load skills map by slug
        skills = db.query(Skill).all()
        skill_map = {s.slug.lower(): s.id for s in skills}

        # Query company roles
        roles = db.query(CompanyRole).join(Company).all()
        role_map = {(r.company.slug, r.role_slug): r for r in roles}

        print(f"Seeding verified requirements across {len(role_map)} existing enterprise roles...")

        # ----------------------------------------------------
        # 1. Google - Software Engineer
        # ----------------------------------------------------
        if ("google", "software-engineer") in role_map:
            role = role_map[("google", "software-engineer")]
            
            # Skills
            for sk_slug in ["python", "golang", "sql"]:
                if sk_slug in skill_map:
                    if not db.query(RoleSkillRequirement).filter(RoleSkillRequirement.role_id == role.id, RoleSkillRequirement.skill_id == skill_map[sk_slug]).first():
                        db.add(RoleSkillRequirement(
                            role_id=role.id,
                            skill_id=skill_map[sk_slug],
                            requirement_type="REQUIRED" if sk_slug in ["python", "golang"] else "PREFERRED",
                            importance="HIGH",
                            minimum_level="PROFICIENT",
                            source="Verified Employer Job Specification (Google Engineering)",
                            verification_status="VERIFIED",
                            version=1
                        ))

            # DSA Requirements
            for dsa_slug, name, diff in [
                ("arrays", "Arrays & Dynamic Arrays", "HARD"),
                ("binary-trees", "Binary Trees & Traversals", "HARD"),
                ("graphs", "Graph Algorithms & BFS/DFS", "HARD"),
                ("dp-2d", "2D Dynamic Programming", "HARD"),
                ("binary-search", "Binary Search & Space Reduction", "MEDIUM")
            ]:
                if not db.query(RoleDSARequirement).filter(RoleDSARequirement.role_id == role.id, RoleDSARequirement.dsa_topic_slug == dsa_slug).first():
                    db.add(RoleDSARequirement(
                        role_id=role.id,
                        dsa_topic_slug=dsa_slug,
                        dsa_topic_name=name,
                        importance="HIGH",
                        difficulty_target=diff,
                        requirement_type="REQUIRED",
                        source="Google Technical Interview Blueprint (L3/L4)"
                    ))

            # Tech Requirements
            for cat, tech, is_mand in [
                ("PROGRAMMING_LANGUAGE", "C++", False),
                ("PROGRAMMING_LANGUAGE", "Java", False),
                ("PROGRAMMING_LANGUAGE", "Python", False),
                ("PROGRAMMING_LANGUAGE", "Go", False),
                ("CLOUD", "Google Cloud Platform (GCP)", False),
                ("TOOL", "Git", True),
                ("TOOL", "Bazel", False)
            ]:
                if not db.query(RoleTechnologyRequirement).filter(RoleTechnologyRequirement.role_id == role.id, RoleTechnologyRequirement.technology_name == tech).first():
                    db.add(RoleTechnologyRequirement(
                        role_id=role.id,
                        category=cat,
                        technology_name=tech,
                        is_mandatory=is_mand,
                        importance="HIGH" if is_mand else "MEDIUM",
                        requirement_type="REQUIRED" if is_mand else "PREFERRED"
                    ))

            # Interview Topics
            for t_name, cat, wt, focus in [
                ("Coding & Algorithmic Problem Solving", "DSA", 2.0, ["Edge case handling", "Time/Space analysis", "Clean modular code"]),
                ("Distributed Systems & Architecture", "SYSTEM_DESIGN", 1.5, ["Scalability", "Fault tolerance", "Caching and replication"]),
                ("Googlyness & Cultural Leadership", "BEHAVIORAL", 1.0, ["Collaboration", "Ambiguity navigation", "Ethical decision making"])
            ]:
                if not db.query(RoleInterviewTopic).filter(RoleInterviewTopic.role_id == role.id, RoleInterviewTopic.topic_name == t_name).first():
                    db.add(RoleInterviewTopic(
                        role_id=role.id,
                        topic_name=t_name,
                        topic_category=cat,
                        weight=wt,
                        focus_areas=focus
                    ))

        # ----------------------------------------------------
        # 2. Google - AI/ML Engineer
        # ----------------------------------------------------
        if ("google", "ai-ml-engineer") in role_map:
            role = role_map[("google", "ai-ml-engineer")]
            for sk_slug in ["python", "machine-learning", "deep-learning", "linear-algebra"]:
                if sk_slug in skill_map:
                    if not db.query(RoleSkillRequirement).filter(RoleSkillRequirement.role_id == role.id, RoleSkillRequirement.skill_id == skill_map[sk_slug]).first():
                        db.add(RoleSkillRequirement(
                            role_id=role.id,
                            skill_id=skill_map[sk_slug],
                            requirement_type="REQUIRED",
                            importance="HIGH",
                            minimum_level="PROFICIENT",
                            source="Google Research & AI Hiring Specification",
                            verification_status="VERIFIED"
                        ))

            for dsa_slug, name, diff in [
                ("arrays", "Vector Math & Array Operations", "MEDIUM"),
                ("recursion", "Recursion & Trees", "MEDIUM"),
                ("dp-1d", "Dynamic Programming Foundations", "MEDIUM")
            ]:
                if not db.query(RoleDSARequirement).filter(RoleDSARequirement.role_id == role.id, RoleDSARequirement.dsa_topic_slug == dsa_slug).first():
                    db.add(RoleDSARequirement(
                        role_id=role.id,
                        dsa_topic_slug=dsa_slug,
                        dsa_topic_name=name,
                        importance="MEDIUM",
                        difficulty_target=diff,
                        requirement_type="REQUIRED",
                        source="Google ML Interview Guidelines"
                    ))

            for cat, tech, is_mand in [
                ("FRAMEWORK", "PyTorch", False),
                ("FRAMEWORK", "JAX", False),
                ("FRAMEWORK", "TensorFlow", False),
                ("PROGRAMMING_LANGUAGE", "Python", True)
            ]:
                if not db.query(RoleTechnologyRequirement).filter(RoleTechnologyRequirement.role_id == role.id, RoleTechnologyRequirement.technology_name == tech).first():
                    db.add(RoleTechnologyRequirement(
                        role_id=role.id,
                        category=cat,
                        technology_name=tech,
                        is_mandatory=is_mand,
                        importance="HIGH",
                        requirement_type="REQUIRED" if is_mand else "PREFERRED"
                    ))

            for t_name, cat, wt, focus in [
                ("Machine Learning Problem Solving", "DOMAIN_SPECIFIC", 2.0, ["Model selection", "Overfitting prevention", "Metric choice"]),
                ("ML Systems Architecture & Data Pipelines", "SYSTEM_DESIGN", 1.5, ["Inference latency", "Feature stores", "Distributed training"]),
                ("Googlyness & Collaboration", "BEHAVIORAL", 1.0, ["Teamwork", "Research ethics"])
            ]:
                if not db.query(RoleInterviewTopic).filter(RoleInterviewTopic.role_id == role.id, RoleInterviewTopic.topic_name == t_name).first():
                    db.add(RoleInterviewTopic(
                        role_id=role.id,
                        topic_name=t_name,
                        topic_category=cat,
                        weight=wt,
                        focus_areas=focus
                    ))

        # ----------------------------------------------------
        # 3. Amazon - SDE 1
        # ----------------------------------------------------
        if ("amazon", "sde-1") in role_map:
            role = role_map[("amazon", "sde-1")]
            for sk_slug in ["python", "typescript", "sql"]:
                if sk_slug in skill_map:
                    if not db.query(RoleSkillRequirement).filter(RoleSkillRequirement.role_id == role.id, RoleSkillRequirement.skill_id == skill_map[sk_slug]).first():
                        db.add(RoleSkillRequirement(
                            role_id=role.id,
                            skill_id=skill_map[sk_slug],
                            requirement_type="REQUIRED" if sk_slug != "typescript" else "PREFERRED",
                            importance="HIGH",
                            minimum_level="WORKING",
                            source="Amazon SDE Bar Raiser Specification",
                            verification_status="VERIFIED"
                        ))

            for dsa_slug, name, diff in [
                ("binary-trees", "Binary Trees & BFS/DFS", "MEDIUM"),
                ("graphs", "Graph Algorithms", "MEDIUM"),
                ("heaps", "Priority Queues & Top K", "MEDIUM"),
                ("two-pointers", "Two Pointers & Sliding Window", "MEDIUM")
            ]:
                if not db.query(RoleDSARequirement).filter(RoleDSARequirement.role_id == role.id, RoleDSARequirement.dsa_topic_slug == dsa_slug).first():
                    db.add(RoleDSARequirement(
                        role_id=role.id,
                        dsa_topic_slug=dsa_slug,
                        dsa_topic_name=name,
                        importance="HIGH",
                        difficulty_target=diff,
                        requirement_type="REQUIRED",
                        source="Amazon Technical Hiring Guidelines"
                    ))

            for cat, tech, is_mand in [
                ("PROGRAMMING_LANGUAGE", "Java", False),
                ("PROGRAMMING_LANGUAGE", "Python", False),
                ("PROGRAMMING_LANGUAGE", "C++", False),
                ("CLOUD", "Amazon Web Services (AWS)", False)
            ]:
                if not db.query(RoleTechnologyRequirement).filter(RoleTechnologyRequirement.role_id == role.id, RoleTechnologyRequirement.technology_name == tech).first():
                    db.add(RoleTechnologyRequirement(
                        role_id=role.id,
                        category=cat,
                        technology_name=tech,
                        is_mandatory=is_mand,
                        importance="HIGH",
                        requirement_type="PREFERRED"
                    ))

            for t_name, cat, wt, focus in [
                ("DSA Coding Rounds", "DSA", 2.0, ["Data structures", "Complexity analysis", "Clean implementation"]),
                ("Object-Oriented Design (LLD)", "TECHNICAL", 1.5, ["Design patterns", "SOLID principles", "Class modeling"]),
                ("Amazon Leadership Principles (LP)", "BEHAVIORAL", 2.0, ["Customer Obsession", "Ownership", "Bias for Action", "Deep Dive"])
            ]:
                if not db.query(RoleInterviewTopic).filter(RoleInterviewTopic.role_id == role.id, RoleInterviewTopic.topic_name == t_name).first():
                    db.add(RoleInterviewTopic(
                        role_id=role.id,
                        topic_name=t_name,
                        topic_category=cat,
                        weight=wt,
                        focus_areas=focus
                    ))

        # ----------------------------------------------------
        # 4. Zerodha - Software Engineer
        # ----------------------------------------------------
        if ("zerodha", "software-engineer") in role_map:
            role = role_map[("zerodha", "software-engineer")]
            for sk_slug in ["golang", "python", "sql"]:
                if sk_slug in skill_map:
                    if not db.query(RoleSkillRequirement).filter(RoleSkillRequirement.role_id == role.id, RoleSkillRequirement.skill_id == skill_map[sk_slug]).first():
                        db.add(RoleSkillRequirement(
                            role_id=role.id,
                            skill_id=skill_map[sk_slug],
                            requirement_type="REQUIRED" if sk_slug == "golang" else "PREFERRED",
                            importance="HIGH",
                            minimum_level="PROFICIENT",
                            source="Zerodha Tech Hiring Blueprint",
                            verification_status="VERIFIED"
                        ))

            for dsa_slug, name, diff in [
                ("arrays", "High-Throughput Ring Buffers", "MEDIUM"),
                ("hash-tables", "Concurrent Hash Maps", "MEDIUM"),
                ("queues", "Lock-Free Queues & Channels", "MEDIUM")
            ]:
                if not db.query(RoleDSARequirement).filter(RoleDSARequirement.role_id == role.id, RoleDSARequirement.dsa_topic_slug == dsa_slug).first():
                    db.add(RoleDSARequirement(
                        role_id=role.id,
                        dsa_topic_slug=dsa_slug,
                        dsa_topic_name=name,
                        importance="HIGH",
                        difficulty_target=diff,
                        requirement_type="REQUIRED",
                        source="Zerodha Systems Engineering Guide"
                    ))

            for cat, tech, is_mand in [
                ("PROGRAMMING_LANGUAGE", "Go", True),
                ("PROGRAMMING_LANGUAGE", "Python", False),
                ("DATABASE", "PostgreSQL", True),
                ("DATABASE", "Redis", True),
                ("TOOL", "Kafka", False)
            ]:
                if not db.query(RoleTechnologyRequirement).filter(RoleTechnologyRequirement.role_id == role.id, RoleTechnologyRequirement.technology_name == tech).first():
                    db.add(RoleTechnologyRequirement(
                        role_id=role.id,
                        category=cat,
                        technology_name=tech,
                        is_mandatory=is_mand,
                        importance="HIGH",
                        requirement_type="REQUIRED" if is_mand else "PREFERRED"
                    ))

            for t_name, cat, wt, focus in [
                ("Go Systems Programming & Concurrency", "TECHNICAL", 2.0, ["Goroutines", "Channels", "Race conditions", "Memory allocation"]),
                ("Low-Latency Architecture & WebSockets", "SYSTEM_DESIGN", 1.5, ["Tick broadcasting", "Message queues", "Connection pooling"]),
                ("Open Source Philosophy & Engineering Culture", "BEHAVIORAL", 1.0, ["Pragmatism", "Self-direction", "Minimal dependencies"])
            ]:
                if not db.query(RoleInterviewTopic).filter(RoleInterviewTopic.role_id == role.id, RoleInterviewTopic.topic_name == t_name).first():
                    db.add(RoleInterviewTopic(
                        role_id=role.id,
                        topic_name=t_name,
                        topic_category=cat,
                        weight=wt,
                        focus_areas=focus
                    ))

        # ----------------------------------------------------
        # 5. Nvidia - VLSI Hardware Engineer
        # ----------------------------------------------------
        if ("nvidia", "vlsi-hardware-engineer") in role_map:
            role = role_map[("nvidia", "vlsi-hardware-engineer")]
            for sk_slug in ["python"]:
                if sk_slug in skill_map:
                    if not db.query(RoleSkillRequirement).filter(RoleSkillRequirement.role_id == role.id, RoleSkillRequirement.skill_id == skill_map[sk_slug]).first():
                        db.add(RoleSkillRequirement(
                            role_id=role.id,
                            skill_id=skill_map[sk_slug],
                            requirement_type="PREFERRED",
                            importance="MEDIUM",
                            minimum_level="WORKING",
                            source="NVIDIA Silicon Architecture Specification",
                            verification_status="VERIFIED"
                        ))

            for dsa_slug, name, diff in [
                ("bit-manipulation", "Bit Manipulation & Arithmetic Logic", "HARD"),
                ("arrays", "Register Array Buffers", "EASY")
            ]:
                if not db.query(RoleDSARequirement).filter(RoleDSARequirement.role_id == role.id, RoleDSARequirement.dsa_topic_slug == dsa_slug).first():
                    db.add(RoleDSARequirement(
                        role_id=role.id,
                        dsa_topic_slug=dsa_slug,
                        dsa_topic_name=name,
                        importance="HIGH",
                        difficulty_target=diff,
                        requirement_type="REQUIRED",
                        source="NVIDIA ASIC Interview Blueprint"
                    ))

            for cat, tech, is_mand in [
                ("HARDWARE_LANGUAGE", "SystemVerilog", True),
                ("HARDWARE_LANGUAGE", "Verilog", True),
                ("EDA_TOOL", "Synopsys Design Compiler", False),
                ("EDA_TOOL", "Cadence Innovus", False)
            ]:
                if not db.query(RoleTechnologyRequirement).filter(RoleTechnologyRequirement.role_id == role.id, RoleTechnologyRequirement.technology_name == tech).first():
                    db.add(RoleTechnologyRequirement(
                        role_id=role.id,
                        category=cat,
                        technology_name=tech,
                        is_mandatory=is_mand,
                        importance="HIGH",
                        requirement_type="REQUIRED" if is_mand else "PREFERRED"
                    ))

            for t_name, cat, wt, focus in [
                ("RTL Design & SystemVerilog/UVM", "DOMAIN_SPECIFIC", 2.0, ["Finite State Machines", "Clock Domain Crossing", "UVM Testbenches"]),
                ("Static Timing Analysis & Logic Synthesis", "TECHNICAL", 1.5, ["Setup/Hold timing", "Clock skew", "Power optimization"]),
                ("Behavioral & Team Alignment", "BEHAVIORAL", 1.0, ["Cross-functional debugging", "Attention to detail"])
            ]:
                if not db.query(RoleInterviewTopic).filter(RoleInterviewTopic.role_id == role.id, RoleInterviewTopic.topic_name == t_name).first():
                    db.add(RoleInterviewTopic(
                        role_id=role.id,
                        topic_name=t_name,
                        topic_category=cat,
                        weight=wt,
                        focus_areas=focus
                    ))

        db.commit()
        print("Stage 3 requirements seeded successfully!")

        # Verification
        total_sk_reqs = db.query(RoleSkillRequirement).count()
        total_dsa_reqs = db.query(RoleDSARequirement).count()
        total_tech_reqs = db.query(RoleTechnologyRequirement).count()
        total_int_topics = db.query(RoleInterviewTopic).count()

        print(f"Verification - Total in DB: {total_sk_reqs} Skill Requirements, {total_dsa_reqs} DSA Requirements, {total_tech_reqs} Tech Requirements, {total_int_topics} Interview Topics.")

    except Exception as e:
        db.rollback()
        print(f"Migration error: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    run_migration()
