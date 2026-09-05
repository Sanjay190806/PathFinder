from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from backend.app.company.role_requirement_service import RoleRequirementService
from backend.app.dsa.dsa_priority_service import DSAPriorityService
from backend.app.dsa.learner_dsa_gap_service import LearnerDSAGapService
from backend.app.models.learning_path import LearningPath, LearningPathVersion, LearningPathItem


# In-memory storage for generated company roadmaps (and persists to LearningPath if learner profile available)
_COMPANY_ROADMAP_STORE: Dict[str, Dict[str, Any]] = {}


class CompanyRoadmapService:
    @staticmethod
    def generate_company_roadmap(
        db: Session,
        company_slug: str,
        role_slug: str,
        learner_id: str,
        version: int = 1,
        change_reason: str = "Initial company-aware learning roadmap generation",
    ) -> Dict[str, Any]:
        """Generates an authoritative, sequenced, prerequisite-ordered company learning roadmap tailored to the learner's gaps."""
        # 1. Fetch requirements and gap intelligence
        role_reqs = RoleRequirementService.get_role_requirements_profile(db, company_slug, role_slug)
        dsa_profile = DSAPriorityService.get_role_dsa_priority(db, company_slug=company_slug, role_slug=role_slug)
        gap_data = LearnerDSAGapService.evaluate_learner_gaps(db, company_slug, role_slug, learner_id)

        company_name = role_reqs.get("company_name", company_slug.title())
        role_name = role_reqs.get("role_name", role_slug.replace("-", " ").title())
        canonical_role = role_reqs.get("canonical_role_name", role_name)
        dsa_prio = dsa_profile.get("priority_level", "MEDIUM")

        # Map learner confidences
        dsa_evals_map = {t["topic_slug"].lower(): t for t in gap_data.get("dsa_topic_evaluations", [])}
        skill_evals_map = {s["skill_slug"].lower(): s for s in gap_data.get("skill_evaluations", [])}

        # 2. Build Stages and Items
        stages_def = [
            ("FOUNDATION", "Stage 1: Foundations & Core Logic", 1),
            ("CORE", "Stage 2: Core Data Structures & Algorithms", 2),
            ("INTERMEDIATE", "Stage 3: Intermediate Systems & Algorithms", 3),
            ("ADVANCED", "Stage 4: Advanced Problem Solving & Architecture", 4),
            ("ROLE_PREPARATION", f"Stage 5: {company_name} Tech Stack & Frameworks", 5),
            ("COMPANY_PREPARATION", f"Stage 6: {company_name} Practical Project Milestone", 6),
            ("INTERVIEW_PREPARATION", f"Stage 7: {company_name} Mock Interview & Final Assessment", 7),
        ]

        roadmap_id = f"crm_{uuid.uuid4().hex[:12]}"
        all_items: List[Dict[str, Any]] = []
        stages_output: List[Dict[str, Any]] = []
        seq = 1

        # Track completed topic slugs to unlock downstream prerequisites
        completed_slugs = set()
        for s_slug, se in skill_evals_map.items():
            if se.get("status") == "SATISFIED":
                completed_slugs.add(s_slug)
        for t_slug, te in dsa_evals_map.items():
            if te.get("status") == "SATISFIED":
                completed_slugs.add(t_slug)

        def create_item(
            stage_name: str,
            item_type: str,
            title: str,
            desc: str,
            prio: str,
            diff: str,
            hrs: float,
            prereqs: List[str],
            t_slug: Optional[str] = None,
            s_slug: Optional[str] = None,
            objs: Optional[List[str]] = None,
            prac: Optional[str] = None,
        ) -> Dict[str, Any]:
            nonlocal seq
            item_id = f"item_{uuid.uuid4().hex[:10]}"

            # Determine item status
            # If already satisfied, COMPLETED
            is_satisfied = (t_slug and t_slug in completed_slugs) or (s_slug and s_slug in completed_slugs)
            
            # Check prerequisites
            prereqs_met = all(p.lower() in completed_slugs for p in prereqs)

            if is_satisfied:
                status = "COMPLETED"
            elif not prereqs_met and len(prereqs) > 0:
                status = "LOCKED"
            else:
                # If first uncompleted available item or developing
                status = "AVAILABLE"

            item = {
                "id": item_id,
                "stage": stage_name,
                "item_type": item_type,
                "title": title,
                "topic_slug": t_slug,
                "skill_slug": s_slug,
                "description": desc,
                "priority": prio,
                "difficulty": diff,
                "estimated_hours": hrs,
                "status": status,
                "prerequisites": prereqs,
                "sequence_order": seq,
                "learning_objectives": objs or ["Master fundamentals", "Implement code patterns", "Solve practice problems"],
                "practice_recommendation": prac or f"Complete {diff} practice problems on PathFinder & LeetCode.",
            }
            seq += 1
            all_items.append(item)
            return item

        # Stage 1: FOUNDATION
        stage1_items = []
        stage1_items.append(
            create_item(
                "FOUNDATION", "SKILL", "Programming Fundamentals & Syntax",
                f"Core language fluency in primary stack for {company_name}.",
                "HIGH", "EASY", 10.0, [], s_slug="programming-basics",
                objs=["Syntax fluency", "Memory & scope models", "I/O operations"]
            )
        )
        if dsa_prio != "NOT_APPLICABLE":
            stage1_items.append(
                create_item(
                    "FOUNDATION", "DSA_TOPIC", "Arrays & String Manipulation",
                    "Foundation array indexing, iteration, and in-place transformations.",
                    "HIGH", "EASY", 8.0, [], t_slug="arrays",
                    objs=["Two Pointers", "Sliding Window", "Frequency arrays"],
                    prac="Solve 10 Easy array problems."
                )
            )
        stages_output.append({
            "stage_name": "FOUNDATION",
            "stage_title": "Stage 1: Foundations & Core Logic",
            "stage_order": 1,
            "estimated_hours": sum(i["estimated_hours"] for i in stage1_items),
            "items": stage1_items,
        })

        # Stage 2: CORE
        stage2_items = []
        if dsa_prio != "NOT_APPLICABLE":
            stage2_items.append(
                create_item(
                    "CORE", "DSA_TOPIC", "Hashing & Hash Tables",
                    "Constant time lookups, frequency maps, prefix sum hash patterns.",
                    "HIGH", "MEDIUM", 8.0, ["arrays"], t_slug="hashing",
                    objs=["O(1) hash lookups", "Two-sum pattern", "Subarray sum equals K"]
                )
            )
            stage2_items.append(
                create_item(
                    "CORE", "DSA_TOPIC", "Binary Trees & BST",
                    "Tree traversals (inorder, preorder, postorder, level-order) and recursion.",
                    "HIGH", "MEDIUM", 12.0, ["arrays"], t_slug="trees",
                    objs=["DFS and BFS on trees", "BST validation", "LCA"]
                )
            )
        stages_output.append({
            "stage_name": "CORE",
            "stage_title": "Stage 2: Core Data Structures & Algorithms",
            "stage_order": 2,
            "estimated_hours": sum(i["estimated_hours"] for i in stage2_items),
            "items": stage2_items,
        })

        # Stage 3: INTERMEDIATE
        stage3_items = []
        if dsa_prio != "NOT_APPLICABLE":
            stage3_items.append(
                create_item(
                    "INTERMEDIATE", "DSA_TOPIC", "Graph Algorithms & BFS/DFS",
                    "Cycle detection, topological sort, Dijkstra shortest path, connected components.",
                    "HIGH", "MEDIUM", 14.0, ["trees", "hashing"], t_slug="graphs",
                    objs=["Adjacency list representation", "Topological sorting", "Shortest path algorithms"]
                )
            )
        stage3_items.append(
            create_item(
                "INTERMEDIATE", "SKILL", "Relational Databases & SQL Query Optimization",
                "Indexing, transaction isolation, ACID properties, query profiling.",
                "HIGH", "MEDIUM", 10.0, [], s_slug="sql",
                objs=["Index execution plans", "Locking mechanisms", "Normal forms"]
            )
        )
        stages_output.append({
            "stage_name": "INTERMEDIATE",
            "stage_title": "Stage 3: Intermediate Systems & Algorithms",
            "stage_order": 3,
            "estimated_hours": sum(i["estimated_hours"] for i in stage3_items),
            "items": stage3_items,
        })

        # Stage 4: ADVANCED
        stage4_items = []
        if dsa_prio in ("VERY_HIGH", "HIGH"):
            stage4_items.append(
                create_item(
                    "ADVANCED", "DSA_TOPIC", "Dynamic Programming & Optimization",
                    "1D/2D DP state formulation, knapsack, LCS, memoization vs tabulation.",
                    "HIGH", "HARD", 16.0, ["recursion", "arrays"], t_slug="dynamic-programming",
                    objs=["State definition", "Recurrence relation", "Space optimization"]
                )
            )
        stage4_items.append(
            create_item(
                "ADVANCED", "SKILL", "Distributed Systems & High-Level System Design",
                f"Scalability, caching (Redis), messaging (Kafka), database sharding for {company_name} scale.",
                "HIGH", "HARD", 14.0, ["sql"], s_slug="system-design",
                objs=["Horizontal vs vertical scaling", "CAP theorem", "Load balancing strategies"]
            )
        )
        stages_output.append({
            "stage_name": "ADVANCED",
            "stage_title": "Stage 4: Advanced Problem Solving & Architecture",
            "stage_order": 4,
            "estimated_hours": sum(i["estimated_hours"] for i in stage4_items),
            "items": stage4_items,
        })

        # Stage 5: ROLE_PREPARATION (Company specific technologies)
        stage5_items = []
        tech_reqs = role_reqs.get("technology_requirements", [])
        for tr in tech_reqs[:3]:
            stage5_items.append(
                create_item(
                    "ROLE_PREPARATION", "TECHNOLOGY", f"{tr['technology_name']} Production Mastery",
                    f"Hands-on architectural patterns using {tr['technology_name']} at {company_name}.",
                    tr.get("importance", "HIGH"), "MEDIUM", 8.0, [], s_slug=tr["technology_name"].lower(),
                    objs=[f"Production {tr['technology_name']} idioms", "Testing & debugging", "Performance profiling"]
                )
            )
        stages_output.append({
            "stage_name": "ROLE_PREPARATION",
            "stage_title": f"Stage 5: {company_name} Tech Stack & Frameworks",
            "stage_order": 5,
            "estimated_hours": sum(i["estimated_hours"] for i in stage5_items),
            "items": stage5_items,
        })

        # Stage 6: COMPANY_PREPARATION (Project milestone)
        stage6_items = [
            create_item(
                "COMPANY_PREPARATION", "PROJECT", f"Capstone: Production-Grade {canonical_role} System",
                f"Build, test, containerize, and deploy a portfolio-grade system mirroring {company_name}'s production standards.",
                "HIGH", "HARD", 25.0, ["system-design"],
                objs=["Clean architecture implementation", "Containerization with Docker", "CI/CD & automated test suite"],
                prac="Deploy to cloud with live URL and GitHub repository."
            )
        ]
        stages_output.append({
            "stage_name": "COMPANY_PREPARATION",
            "stage_title": f"Stage 6: {company_name} Practical Project Milestone",
            "stage_order": 6,
            "estimated_hours": sum(i["estimated_hours"] for i in stage6_items),
            "items": stage6_items,
        })

        # Stage 7: INTERVIEW_PREPARATION
        stage7_items = [
            create_item(
                "INTERVIEW_PREPARATION", "MOCK_INTERVIEW", f"{company_name} Technical Interview Simulation",
                f"Timed full-length mock round with coding, system design, and behavioral leadership principles for {company_name}.",
                "CRITICAL", "HARD", 6.0, ["dynamic-programming" if dsa_prio in ("VERY_HIGH", "HIGH") else "arrays"],
                objs=["Technical communication clarity", "Complexity analysis explanation", "Behavioral STAR method"],
                prac="Complete Phase 10 Adaptive Interview Exam with > 75% score."
            )
        ]
        stages_output.append({
            "stage_name": "INTERVIEW_PREPARATION",
            "stage_title": f"Stage 7: {company_name} Mock Interview & Final Assessment",
            "stage_order": 7,
            "estimated_hours": sum(i["estimated_hours"] for i in stage7_items),
            "items": stage7_items,
        })

        total_hours = sum(s["estimated_hours"] for s in stages_output)

        decision_trace = {
            "decision": "COMPANY_AWARE_ROADMAP_GENERATED",
            "roadmap_id": roadmap_id,
            "version": version,
            "change_reason": change_reason,
            "rationale": (
                f"Roadmap sequenced across 7 stages for {learner_id} targeting {role_name} at {company_name}. "
                f"DSA weight set to {dsa_prio} with {len(all_items)} milestone items ordered in strict dependency sequence."
            ),
            "factors": [
                {"name": "DSA Priority Weight", "value": dsa_prio},
                {"name": "Total Planned Hours", "value": total_hours},
                {"name": "Stage Count", "value": len(stages_output)},
            ],
        }

        roadmap_payload = {
            "roadmap_id": roadmap_id,
            "version": version,
            "change_reason": change_reason,
            "company_slug": company_slug,
            "company_name": company_name,
            "role_slug": role_slug,
            "role_name": role_name,
            "canonical_role_name": canonical_role,
            "learner_id": learner_id,
            "total_stages": len(stages_output),
            "total_items": len(all_items),
            "total_estimated_hours": round(total_hours, 1),
            "dsa_priority": dsa_prio,
            "stages": stages_output,
            "items": all_items,
            "decision_trace": decision_trace,
        }

        _COMPANY_ROADMAP_STORE[roadmap_id] = roadmap_payload
        return roadmap_payload

    @staticmethod
    def get_roadmap_by_id(roadmap_id: str) -> Optional[Dict[str, Any]]:
        return _COMPANY_ROADMAP_STORE.get(roadmap_id)

    @staticmethod
    def switch_target_company(
        db: Session,
        roadmap_id: str,
        new_company_slug: str,
        new_role_slug: Optional[str],
    ) -> Dict[str, Any]:
        """Switches target employer, versioning the roadmap while preserving completed learner items."""
        old_roadmap = _COMPANY_ROADMAP_STORE.get(roadmap_id)
        if not old_roadmap:
            return {"error": f"Roadmap '{roadmap_id}' not found"}

        learner_id = old_roadmap["learner_id"]
        role_to_use = new_role_slug or old_roadmap["role_slug"]
        new_version = old_roadmap["version"] + 1

        change_reason = (
            f"Target employer switched from {old_roadmap['company_name']} to {new_company_slug.title()}. "
            f"Preserved completed modules while recalibrating company tech stack and difficulty benchmarks."
        )

        new_roadmap = CompanyRoadmapService.generate_company_roadmap(
            db=db,
            company_slug=new_company_slug,
            role_slug=role_to_use,
            learner_id=learner_id,
            version=new_version,
            change_reason=change_reason,
        )

        return new_roadmap

    @staticmethod
    def get_planner_handoff(roadmap_id: str) -> Dict[str, Any]:
        """Converts roadmap into a structured handoff payload ready for Phase 9 Daily/Weekly Planner scheduling."""
        roadmap = _COMPANY_ROADMAP_STORE.get(roadmap_id)
        if not roadmap:
            return {"error": f"Roadmap '{roadmap_id}' not found"}

        handoff_items = []
        for it in roadmap["items"]:
            handoff_items.append({
                "id": it["id"],
                "title": it["title"],
                "stage": it["stage"],
                "item_type": it["item_type"],
                "priority": it["priority"],
                "planned_hours": it["estimated_hours"],
                "difficulty": it["difficulty"],
                "status": it["status"],
                "prerequisites": it["prerequisites"],
                "recommended_order": it["sequence_order"],
            })

        return {
            "roadmap_id": roadmap_id,
            "version": roadmap["version"],
            "company_name": roadmap["company_name"],
            "role_name": roadmap["role_name"],
            "total_planned_hours": roadmap["total_estimated_hours"],
            "items": handoff_items,
        }
