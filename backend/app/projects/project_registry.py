from typing import List, Dict, Any

CURATED_PROJECTS: List[Dict[str, Any]] = [
    {
        "slug": "production-rag-agent",
        "title": "Enterprise Retrieval-Augmented Generation (RAG) Microservice",
        "description": "Architect and deploy an enterprise-grade RAG pipeline with hybrid search, reranking, and citation provenance.",
        "career_roles": ["AI/ML Engineer", "Software Engineer"],
        "difficulty": "Advanced",
        "project_level": "Advanced Engineering Project",
        "estimated_hours": 16.0,
        "skills": ["python", "deep-learning", "transformers", "vector-rag", "mlops"],
        "prerequisites": ["python", "deep-learning"],
        "deliverables": ["GitHub Repository", "OpenAPI Documentation", "Benchmark Latency Report"],
        "tools": ["FastAPI", "Qdrant", "PyTorch", "Docker"],
        "portfolio_value": 0.95,
        "milestones": [
            ("Requirements & Vector Schema", "Design the chunking strategy and embedding collection schemas."),
            ("Hybrid Ingestion Pipeline", "Implement dense + sparse hybrid vector indexing."),
            ("Reranking & Citation Layer", "Add cross-encoder reranking and strict citation guards."),
            ("Dockerization & Benchmark", "Containerize the FastAPI service and run load tests.")
        ]
    },
    {
        "slug": "soc-incident-response-pipeline",
        "title": "Automated Security Operations Center (SOC) Log Monitor",
        "description": "Build an automated threat detection and log analysis pipeline parsing auth logs for brute-force attacks.",
        "career_roles": ["Cybersecurity Analyst", "Cloud / DevOps Engineer"],
        "difficulty": "Intermediate",
        "project_level": "Applied Project",
        "estimated_hours": 12.0,
        "skills": ["networking", "linux", "web-security", "pentesting"],
        "prerequisites": ["networking", "linux"],
        "deliverables": ["Detection Parser Script", "Incident Playbook Document"],
        "tools": ["Python", "Wireshark", "Syslog", "Suricata"],
        "portfolio_value": 0.90,
        "milestones": [
            ("Log Parser Architecture", "Parse auth.log and nginx access logs for anomalous bursts."),
            ("Rule Engine Implementation", "Implement rule-based alert triggering for IP anomaly detection."),
            ("Automated Mitigation Script", "Generate automated iptables isolation commands on alert.")
        ]
    },
    {
        "slug": "distributed-task-queue",
        "title": "Scalable Distributed Background Task Queue",
        "description": "Construct an asynchronous worker queue supporting retries, dead-letter exchanges, and rate limiting.",
        "career_roles": ["Full Stack Developer", "Software Engineer", "Cloud / DevOps Engineer"],
        "difficulty": "Advanced",
        "project_level": "Advanced Engineering Project",
        "estimated_hours": 14.0,
        "skills": ["typescript", "rest-apis", "docker", "dsa", "system-design"],
        "prerequisites": ["typescript", "docker"],
        "deliverables": ["NPM Package / Repo", "Concurrency Stress Test Suite"],
        "tools": ["Node.js", "Redis", "TypeScript", "Docker"],
        "portfolio_value": 0.92,
        "milestones": [
            ("Queue Protocol & Schema", "Define serialized job message formats and Redis stream semantics."),
            ("Worker Concurrency Engine", "Implement multi-threaded worker polling with heartbeat acknowledgment."),
            ("Dead-Letter Queue & Retries", "Implement exponential backoff retry scheduling and failure triage.")
        ]
    },
    {
        "slug": "rtl-pipelined-multiplier",
        "title": "Pipelined 32-Bit Floating Point Arithmetic Unit",
        "description": "Design and verify an IEEE 754 floating-point multiplier in synthesizable Verilog HDL.",
        "career_roles": ["VLSI Hardware Engineer"],
        "difficulty": "Advanced",
        "project_level": "Capstone Project",
        "estimated_hours": 20.0,
        "skills": ["linear-algebra", "python", "dsa"],
        "prerequisites": ["linear-algebra"],
        "deliverables": ["Synthesizable Verilog Source", "SystemVerilog Testbench Report"],
        "tools": ["Verilog", "ModelSim", "Yosys"],
        "portfolio_value": 0.96,
        "milestones": [
            ("Architecture Specification", "Define 4-stage pipeline timing diagrams and corner cases."),
            ("Synthesizable RTL Implementation", "Implement mantissa multiplication and exponent bias addition."),
            ("Self-Checking Testbench", "Verify corner case precision against reference Python model.")
        ]
    }
]
