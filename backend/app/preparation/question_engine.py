from typing import List, Dict, Any, Optional
import uuid
from sqlalchemy.orm import Session

from backend.app.models.opportunity import Opportunity
from backend.app.models.profile import LearnerProfile
from backend.app.core.career_catalog import resolve_target_skills_for_role


QUESTION_BANK = {
    "TECHNICAL": {
        "BEGINNER": [
            {
                "prompt": "Explain the difference between mutable and immutable data structures in your primary programming language. How does it affect memory management?",
                "target_skills": ["python", "programming-fundamentals"],
                "rubric": {
                    "keywords": ["memory", "reference", "copy", "tuple", "list", "id", "hashable"],
                    "key_concepts": "Explaining pass-by-reference/assignment, in-place modification vs creating a new object.",
                },
            },
            {
                "prompt": "How does an HTTP GET request differ from a POST request, and what are the security and idempotency implications of each?",
                "target_skills": ["rest-api", "networking"],
                "rubric": {
                    "keywords": ["idempotent", "body", "query params", "caching", "safe", "ssl"],
                    "key_concepts": "Idempotency guarantee of GET, request body usage in POST, URL query parameters visibility.",
                },
            },
            {
                "prompt": "What is the time and space complexity of searching in a sorted array using binary search versus linear search?",
                "target_skills": ["dsa", "algorithms"],
                "rubric": {
                    "keywords": ["log n", "o(1)", "o(n)", "divide and conquer", "sorted"],
                    "key_concepts": "O(log n) time complexity, comparison of iterative vs recursive space.",
                },
            },
        ],
        "INTERMEDIATE": [
            {
                "prompt": "How do database indexes (e.g. B-Trees) optimize query execution, and what are the write-time tradeoffs when adding indexes to a write-heavy table?",
                "target_skills": ["sql", "databases", "backend"],
                "rubric": {
                    "keywords": ["b-tree", "lookup", "write amplification", "disk io", "leaf nodes", "composite index"],
                    "key_concepts": "B-Tree tree traversals, O(log N) lookups, overhead on INSERT/UPDATE operations.",
                },
            },
            {
                "prompt": "Explain the mechanics of connection pooling in an asynchronous backend service (e.g., FastAPI + asyncpg / SQLAlchemy). What happens under high concurrency?",
                "target_skills": ["backend", "python", "fastapi", "concurrency"],
                "rubric": {
                    "keywords": ["pool size", "max overflow", "exhaustion", "event loop", "blocking", "semaphore"],
                    "key_concepts": "Connection reuse, pool exhaustion handling, timeout management, non-blocking coroutines.",
                },
            },
            {
                "prompt": "Describe how tokenization and embedding generation work in a modern Transformer-based Large Language Model (LLM) pipeline.",
                "target_skills": ["ai/ml", "nlp", "transformers"],
                "rubric": {
                    "keywords": ["bpe", "subword", "dense vector", "high dimensional", "cosine similarity", "attention"],
                    "key_concepts": "Byte-pair encoding, token IDs to vector space mapping, semantic clustering.",
                },
            },
        ],
        "ADVANCED": [
            {
                "prompt": "How would you design a distributed rate limiter that handles 500,000 requests per second across 20 server instances without race conditions?",
                "target_skills": ["system-design", "distributed-systems", "redis"],
                "rubric": {
                    "keywords": ["token bucket", "leaky bucket", "redis", "lua script", "sliding window", "atomic"],
                    "key_concepts": "Sliding window log/counter, Redis Lua script atomicity, memory footprint tradeoffs.",
                },
            },
            {
                "prompt": "How do you detect and mitigate data drift and concept drift in a production machine learning pipeline serving real-time predictions?",
                "target_skills": ["mlops", "ai/ml", "data-engineering"],
                "rubric": {
                    "keywords": ["ks test", "psi", "wasserstein distance", "ground truth latency", "retraining trigger", "monitoring"],
                    "key_concepts": "Statistical distribution divergence tests, feature drift vs label drift, automated canary rollback.",
                },
            },
        ],
        "EXPERT": [
            {
                "prompt": "Walk through the architectural tradeoffs between event-driven eventual consistency (using Kafka/Event Sourcing) and distributed 2-Phase Commit (2PC) in financial microservices.",
                "target_skills": ["distributed-systems", "architecture", "microservices"],
                "rubric": {
                    "keywords": ["saga pattern", "orchestration", "choreography", "cap theorem", "compensation", "idempotency key"],
                    "key_concepts": "Saga pattern with compensating transactions, avoiding 2PC blocking locks, at-least-once deduplication.",
                },
            },
        ],
    },
    "SYSTEM_DESIGN": {
        "INTERMEDIATE": [
            {
                "prompt": "Design a scalable URL shortener service (like bit.ly). Walk through capacity estimation, API endpoints, schema design, and hash collision handling.",
                "target_skills": ["system-design", "backend", "databases"],
                "rubric": {
                    "keywords": ["base62", "md5", "distributed id generator", "cache", "redis", "read-heavy", "301 vs 302"],
                    "key_concepts": "Base62 encoding, 301 vs 302 redirect analytics, Redis cache layer for popular links.",
                },
            },
        ],
        "ADVANCED": [
            {
                "prompt": "Design a real-time notification service supporting SMS, Push, and Email with strict per-user preference controls and deduplication during peak flash sales.",
                "target_skills": ["system-design", "queues", "kafka", "resilience"],
                "rubric": {
                    "keywords": ["kafka", "priority queue", "dlq", "rate limiting", "circuit breaker", "idempotent consumer"],
                    "key_concepts": "Decoupled workers, dead-letter queues, exponential backoff, priority routing.",
                },
            },
        ],
        "EXPERT": [
            {
                "prompt": "Design an India-scale Unified Payments Interface (UPI) switch architecture capable of handling 50,000 TPS with sub-200ms latency, zero duplicate settlements, and NPCI protocol compliance.",
                "target_skills": ["system-design", "fintech", "distributed-systems", "high-throughput"],
                "rubric": {
                    "keywords": ["npci", "idempotency", "active-active", "p99", "in-memory datagrid", "ledger", "double entry"],
                    "key_concepts": "Active-active multi-region replication, strict idempotency token handling, double-entry immutable audit ledger.",
                },
            },
        ],
    },
    "BEHAVIORAL": {
        "INTERMEDIATE": [
            {
                "prompt": "Tell me about a time you had a technical disagreement with a team member or mentor regarding architecture or implementation. How did you resolve it?",
                "target_skills": ["communication", "teamwork", "conflict-resolution"],
                "rubric": {
                    "keywords": ["star method", "listening", "data driven", "prototype", "benchmarking", "alignment", "respect"],
                    "key_concepts": "Using STAR format, depersonalizing disagreement through objective data or proof-of-concept tests.",
                },
            },
            {
                "prompt": "Describe a project where you faced an unexpected technical roadblock or breaking change right before a deadline. What actions did you take?",
                "target_skills": ["problem-solving", "resilience", "prioritization"],
                "rubric": {
                    "keywords": ["star", "triage", "stakeholder communication", "scope reduction", "root cause", "post-mortem"],
                    "key_concepts": "Triage mindset, proactive stakeholder communication, delivering an MVP workaround.",
                },
            },
        ],
        "ADVANCED": [
            {
                "prompt": "Give an example of when you had to balance technical debt against urgent feature delivery. How did you document and track the remediation?",
                "target_skills": ["engineering-leadership", "tradeoffs", "quality"],
                "rubric": {
                    "keywords": ["tech debt", "refactoring", "jira ticket", "code quality", "latency", "test coverage", "negotiation"],
                    "key_concepts": "Pragmatic balance, technical debt budgeting, measurable engineering ROI.",
                },
            },
        ],
    },
    "INDIA_MARKET": {
        "INTERMEDIATE": [
            {
                "prompt": "How do you design mobile and web applications to perform reliably under intermittent 3G/4G connectivity and high-latency mobile networks common in Tier-2/3 Indian cities?",
                "target_skills": ["offline-first", "network-optimization", "performance"],
                "rubric": {
                    "keywords": ["offline-first", "service worker", "indexeddb", "payload compression", "optimistic ui", "cdn"],
                    "key_concepts": "Optimistic UI updates, local cache fallback with background sync, payload size reduction.",
                },
            },
            {
                "prompt": "India's Digital Personal Data Protection Act (DPDP Act 2023) establishes strict rules on consent and data localization. How would you architect user data pipelines to comply?",
                "target_skills": ["compliance", "security", "dpdp", "data-privacy"],
                "rubric": {
                    "keywords": ["dpdp", "consent manager", "data principal", "audit logging", "retention", "anonymization", "right to erasure"],
                    "key_concepts": "Explicit purpose limitation, consent audit trails, verifiable data erasure mechanisms.",
                },
            },
        ],
        "ADVANCED": [
            {
                "prompt": "Explain the architectural components and transaction flow of Open Network for Digital Commerce (ONDC) and how Beckn protocol handles buyer-seller discovery.",
                "target_skills": ["ondc", "beckn-protocol", "fintech", "e-commerce"],
                "rubric": {
                    "keywords": ["beckn", "bap", "bpp", "gateway", "search", "select", "init", "confirm", "decentralized"],
                    "key_concepts": "BAP (Buyer App) to BPP (Seller App) protocol exchange, Gateway routing, cryptographic signing.",
                },
            },
        ],
    },
    "RESUME_DEEP_DIVE": {
        "INTERMEDIATE": [
            {
                "prompt": "Looking at your listed projects, explain the specific technical tradeoffs you made when choosing your backend framework and database storage engine.",
                "target_skills": ["architecture", "decision-making", "project-ownership"],
                "rubric": {
                    "keywords": ["tradeoff", "latency", "scalability", "typing", "ecosystem", "throughput", "schema"],
                    "key_concepts": "Clear ownership, justification of technology choices based on workload characteristics rather than hype.",
                },
            },
            {
                "prompt": "In your practical lab implementations, how did you verify that your code handled edge cases, error conditions, and unexpected null or malformed payloads?",
                "target_skills": ["testing", "quality-assurance", "defensive-programming"],
                "rubric": {
                    "keywords": ["unit tests", "pytest", "boundary testing", "validation", "pydantic", "mocking", "coverage"],
                    "key_concepts": "Automated regression suites, defensive schema validation, negative test coverage.",
                },
            },
        ],
    },
}


class QuestionEngine:
    """
    Adaptive question generator that dynamically matches difficulty
    to learner readiness and career/opportunity domain requirements.
    """

    def __init__(self, db: Session):
        self.db = db

    def generate_questions(
        self,
        learner_id: str,
        category: str = "TECHNICAL",
        difficulty: Optional[str] = None,
        career_id: Optional[str] = None,
        opportunity_id: Optional[str] = None,
        count: int = 5,
    ) -> Dict[str, Any]:
        cat_key = category.upper() if category else "TECHNICAL"
        if cat_key not in QUESTION_BANK:
            cat_key = "TECHNICAL"

        # Determine difficulty
        recommended_diff = self._resolve_difficulty(learner_id, difficulty)
        
        # Get target skills from opportunity or career target
        focus_skills = []
        if opportunity_id:
            opp = self.db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
            if opp and opp.required_skills:
                focus_skills = opp.required_skills
        elif career_id:
            focus_skills = resolve_target_skills_for_role(career_id)

        # Retrieve questions matching difficulty or neighboring difficulties
        pool = []
        cat_dict = QUESTION_BANK[cat_key]
        
        # Priority to exact recommended difficulty
        if recommended_diff in cat_dict:
            pool.extend(cat_dict[recommended_diff])
        
        # Fallback to other difficulties if pool is smaller than count
        for diff, q_list in cat_dict.items():
            if diff != recommended_diff:
                pool.extend(q_list)

        # Mix in questions from other relevant categories if count > pool
        if len(pool) < count:
            for other_cat, other_diffs in QUESTION_BANK.items():
                if other_cat != cat_key:
                    for d_items in other_diffs.values():
                        pool.extend(d_items)
                        if len(pool) >= count * 2:
                            break

        # Select items up to count
        selected = pool[:count]
        result_questions = []
        for idx, item in enumerate(selected):
            q_id = f"q-{uuid.uuid4().hex[:8]}"
            result_questions.append({
                "id": q_id,
                "category": cat_key,
                "difficulty": recommended_diff,
                "prompt": item["prompt"],
                "context": f"Targeting competency in {', '.join(item.get('target_skills', focus_skills[:2]))}",
                "target_skills": item.get("target_skills", focus_skills),
                "rubric": item.get("rubric", {}),
            })

        return {
            "questions": result_questions,
            "recommended_difficulty": recommended_diff,
            "focus_areas": focus_skills[:4] if focus_skills else ["core-engineering", "problem-solving"],
        }

    def _resolve_difficulty(self, learner_id: str, requested: Optional[str]) -> str:
        if requested and requested.upper() in ("BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"):
            return requested.upper()

        profile = self.db.query(LearnerProfile).filter(LearnerProfile.user_id == learner_id).first()
        if not profile:
            return "INTERMEDIATE"

        # Adaptive difficulty scaling
        total_skills = len(profile.learner_skills) if profile.learner_skills else 0
        if total_skills >= 8:
            return "ADVANCED"
        elif total_skills >= 3:
            return "INTERMEDIATE"
        else:
            return "BEGINNER"
