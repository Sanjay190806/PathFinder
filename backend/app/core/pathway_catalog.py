"""
Authoritative Career Requirements & Pathway Definitions Catalog (Phase 9 Stage 3)
Defines structured entry requirements, mandatory/recommended skills, and multi-route pathways
for all registered PathFinder career roles.
"""

from typing import Dict, List, Optional, Any
from enum import Enum
from pydantic import BaseModel, Field

class RequirementType(str, Enum):
    HARD_REQUIREMENT = "HARD_REQUIREMENT"
    RECOMMENDED = "RECOMMENDED"
    HELPFUL = "HELPFUL"
    OPTIONAL = "OPTIONAL"
    BRIDGE_REQUIRED = "BRIDGE_REQUIRED"

class PathwayType(str, Enum):
    DIRECT_PATH = "DIRECT_PATH"
    DEGREE_PATH = "DEGREE_PATH"
    DIPLOMA_PATH = "DIPLOMA_PATH"
    POSTGRADUATE_PATH = "POSTGRADUATE_PATH"
    CERTIFICATION_SUPPORTED_PATH = "CERTIFICATION_SUPPORTED_PATH"
    BRIDGE_PATH = "BRIDGE_PATH"
    CAREER_TRANSITION_PATH = "CAREER_TRANSITION_PATH"
    ADJACENT_SKILL_PATH = "ADJACENT_SKILL_PATH"
    ALTERNATIVE_ACADEMIC_PATH = "ALTERNATIVE_ACADEMIC_PATH"

class PathwayMilestone(BaseModel):
    step_number: int
    title: str
    description: str
    milestone_type: str  # academic_prerequisite, foundational_skill, core_competency, capstone_evidence, industry_entry
    skills_to_acquire: List[str] = Field(default_factory=list)
    estimated_weeks: int = 4

class CareerPathway(BaseModel):
    pathway_id: str
    pathway_type: PathwayType
    title: str
    description: str
    applicable_backgrounds: List[str] = Field(default_factory=list)  # e.g. ["pcm", "computer-science-engineering", "diploma"]
    duration_estimate: str
    difficulty_level: str  # Moderate, Challenging, Comprehensive
    milestones: List[PathwayMilestone]
    is_primary: bool = True

class CareerRequirements(BaseModel):
    career_slug: str
    career_role: str
    domain_category: str
    mandatory_skills: List[str]
    recommended_skills: List[str]
    helpful_skills: List[str] = Field(default_factory=list)
    accepted_education_levels: List[str]
    preferred_streams: List[str]
    subject_prerequisites: List[str]
    bridge_prerequisites: List[str] = Field(default_factory=list)
    pathways: List[CareerPathway]

# Authoritative Career Pathways & Requirements Registry
CAREER_REQUIREMENTS_REGISTRY: Dict[str, CareerRequirements] = {
    "ai-ml-engineer": CareerRequirements(
        career_slug="ai-ml-engineer",
        career_role="AI/ML Engineer",
        domain_category="Artificial Intelligence",
        mandatory_skills=["python", "linear-algebra", "machine-learning", "deep-learning"],
        recommended_skills=["transformers", "langchain-agents", "vector-rag", "mlops"],
        helpful_skills=["docker", "rest-apis"],
        accepted_education_levels=["higher-secondary", "undergraduate", "postgraduate", "diploma-polytechnic", "other"],
        preferred_streams=["engineering-technology", "computer-it", "pure-sciences", "science"],
        subject_prerequisites=["Mathematics", "Linear Algebra", "Calculus", "Basic Programming"],
        bridge_prerequisites=["Foundational Python & NumPy", "Linear Algebra for Machine Learning"],
        pathways=[
            CareerPathway(
                pathway_id="ai-ml-direct-ug",
                pathway_type=PathwayType.DIRECT_PATH,
                title="Direct Undergraduate Engineering / CS Route",
                description="Class 12 (PCM) -> B.Tech CSE/AI/ECE with rigorous machine learning and deep learning mastery.",
                applicable_backgrounds=["pcm", "computer-science-engineering", "artificial-intelligence-machine-learning", "electronics-communication-engineering"],
                duration_estimate="6-12 months intensive prep",
                difficulty_level="Challenging",
                is_primary=True,
                milestones=[
                    PathwayMilestone(step_number=1, title="Mathematical & Algorithmic Foundations", description="Master Python programming, linear algebra, vector spaces, and calculus.", milestone_type="foundational_skill", skills_to_acquire=["python", "linear-algebra"], estimated_weeks=6),
                    PathwayMilestone(step_number=2, title="Classical Machine Learning & Statistical Modeling", description="Implement Scikit-Learn regression, classification, clustering, and cross-validation.", milestone_type="core_competency", skills_to_acquire=["machine-learning"], estimated_weeks=8),
                    PathwayMilestone(step_number=3, title="Deep Learning & Neural Architectures", description="Build PyTorch CNNs, RNNs, and custom transformer attention heads.", milestone_type="core_competency", skills_to_acquire=["deep-learning", "transformers"], estimated_weeks=10),
                    PathwayMilestone(step_number=4, title="Production Agents & MLOps Deployment", description="Deploy LangChain multi-agent workflows, vector search RAG, and containerized FastAPI pipelines.", milestone_type="capstone_evidence", skills_to_acquire=["langchain-agents", "vector-rag", "mlops"], estimated_weeks=8)
                ]
            ),
            CareerPathway(
                pathway_id="ai-ml-pure-science-alternative",
                pathway_type=PathwayType.ALTERNATIVE_ACADEMIC_PATH,
                title="Mathematical Sciences to AI Route",
                description="B.Sc Mathematics / Statistics / Physics -> Data & AI Modeling pathway leveraging quantitative strengths.",
                applicable_backgrounds=["mathematics", "statistics", "physics", "pure-sciences"],
                duration_estimate="8-14 months",
                difficulty_level="Moderate",
                is_primary=False,
                milestones=[
                    PathwayMilestone(step_number=1, title="Computational Bridging", description="Translate pure math and matrix proofs into vectorized Python code.", milestone_type="academic_prerequisite", skills_to_acquire=["python"], estimated_weeks=6),
                    PathwayMilestone(step_number=2, title="Supervised & Unsupervised Learning", description="Mathematical foundations of loss functions, gradients, and optimization.", milestone_type="core_competency", skills_to_acquire=["machine-learning"], estimated_weeks=8),
                    PathwayMilestone(step_number=3, title="Deep Representations & GenAI", description="Modern neural architectures and embedding models.", milestone_type="core_competency", skills_to_acquire=["deep-learning", "transformers"], estimated_weeks=10)
                ]
            ),
            CareerPathway(
                pathway_id="ai-ml-bridge-cross-domain",
                pathway_type=PathwayType.BRIDGE_PATH,
                title="Cross-Domain Technical Bridge Route",
                description="For Electrical, Mechanical, Commerce, or Self-taught learners transitioning into AI through structured bridging.",
                applicable_backgrounds=["mechanical-engineering", "civil-engineering", "commerce-with-mathematics", "b-com", "other"],
                duration_estimate="12-18 months",
                difficulty_level="Comprehensive",
                is_primary=False,
                milestones=[
                    PathwayMilestone(step_number=1, title="Python & Quantitative Bridge", description="Bridge programming literacy, functions, loops, and applied matrices.", milestone_type="academic_prerequisite", skills_to_acquire=["python", "linear-algebra"], estimated_weeks=8),
                    PathwayMilestone(step_number=2, title="Core ML Algorithms", description="Master feature engineering, tabular modeling, and model evaluation.", milestone_type="core_competency", skills_to_acquire=["machine-learning"], estimated_weeks=10),
                    PathwayMilestone(step_number=3, title="Applied AI Applications", description="Portfolio capstone demonstrating real-world problem solving.", milestone_type="capstone_evidence", skills_to_acquire=["deep-learning", "vector-rag"], estimated_weeks=12)
                ]
            )
        ]
    ),

    "data-scientist": CareerRequirements(
        career_slug="data-scientist",
        career_role="Data Scientist",
        domain_category="Data Science",
        mandatory_skills=["python", "pandas", "sql", "machine-learning"],
        recommended_skills=["eda", "statistics", "pyspark"],
        helpful_skills=["linear-algebra", "docker"],
        accepted_education_levels=["higher-secondary", "undergraduate", "postgraduate", "diploma-polytechnic", "other"],
        preferred_streams=["computer-it", "engineering-technology", "pure-sciences", "commerce-finance", "science"],
        subject_prerequisites=["Statistics", "Probability", "SQL Basics", "Python"],
        bridge_prerequisites=["Python for Data Analysis", "Exploratory Data Analysis"],
        pathways=[
            CareerPathway(
                pathway_id="ds-direct-path",
                pathway_type=PathwayType.DIRECT_PATH,
                title="Direct Computing / Statistics Degree Route",
                description="B.Sc Data Science / BCA / B.Tech CSE with emphasis on predictive analytics and big data.",
                applicable_backgrounds=["data-science", "computer-science-engineering", "statistics", "mathematics", "bca"],
                duration_estimate="6-9 months",
                difficulty_level="Moderate",
                is_primary=True,
                milestones=[
                    PathwayMilestone(step_number=1, title="Relational Data & Python Wrangling", description="Write complex SQL queries and manipulate large datasets using Pandas.", milestone_type="foundational_skill", skills_to_acquire=["python", "pandas", "sql"], estimated_weeks=6),
                    PathwayMilestone(step_number=2, title="Statistical Experimentation & EDA", description="Hypothesis testing, distributions, A/B testing, and exploratory visualization.", milestone_type="core_competency", skills_to_acquire=["eda", "statistics"], estimated_weeks=6),
                    PathwayMilestone(step_number=3, title="Machine Learning & Big Data Scalability", description="Predictive models and distributed data processing with PySpark.", milestone_type="core_competency", skills_to_acquire=["machine-learning", "pyspark"], estimated_weeks=10)
                ]
            ),
            CareerPathway(
                pathway_id="ds-commerce-finance-route",
                pathway_type=PathwayType.ALTERNATIVE_ACADEMIC_PATH,
                title="Commerce & Business Analytics Route",
                description="B.Com / BBA / Economics background translated into high-impact Financial Analytics and Data Science.",
                applicable_backgrounds=["b-com", "commerce-with-mathematics", "economics", "accounting"],
                duration_estimate="8-12 months",
                difficulty_level="Moderate",
                is_primary=False,
                milestones=[
                    PathwayMilestone(step_number=1, title="SQL & Python for Business Analytics", description="Query relational databases and automate financial spreadsheets.", milestone_type="foundational_skill", skills_to_acquire=["python", "sql", "pandas"], estimated_weeks=8),
                    PathwayMilestone(step_number=2, title="Financial Modeling & Machine Learning", description="Risk scoring, customer churn prediction, and time series forecasting.", milestone_type="core_competency", skills_to_acquire=["machine-learning", "statistics"], estimated_weeks=10)
                ]
            )
        ]
    ),

    "full-stack-developer": CareerRequirements(
        career_slug="full-stack-developer",
        career_role="Full Stack Developer",
        domain_category="Software Engineering",
        mandatory_skills=["typescript", "react-nextjs", "tailwind", "rest-apis"],
        recommended_skills=["graphql-websockets", "docker"],
        helpful_skills=["python", "sql"],
        accepted_education_levels=["higher-secondary", "undergraduate", "diploma-polytechnic", "iti-industrial-training", "postgraduate", "other"],
        preferred_streams=["computer-it", "engineering-technology", "diploma-polytechnic", "science", "humanities-arts", "commerce-finance"],
        subject_prerequisites=["Web Development Basics", "HTML/CSS/JS", "REST Protocols"],
        bridge_prerequisites=["Modern JavaScript (ES6+)", "TypeScript Types"],
        pathways=[
            CareerPathway(
                pathway_id="fs-direct-degree",
                pathway_type=PathwayType.DIRECT_PATH,
                title="Direct Web Architecture Route",
                description="Full stack production mastery from modern frontends to robust server APIs and containers.",
                applicable_backgrounds=["computer-science-engineering", "information-technology", "bca", "pcm-computer-science"],
                duration_estimate="5-8 months",
                difficulty_level="Moderate",
                is_primary=True,
                milestones=[
                    PathwayMilestone(step_number=1, title="TypeScript & Modern UI Engine", description="Build performant interfaces with Next.js App Router and Tailwind CSS.", milestone_type="foundational_skill", skills_to_acquire=["typescript", "react-nextjs", "tailwind"], estimated_weeks=6),
                    PathwayMilestone(step_number=2, title="Backend Microservices & Real-Time APIs", description="Design OpenAPI REST services, WebSockets, and GraphQL interfaces.", milestone_type="core_competency", skills_to_acquire=["rest-apis", "graphql-websockets"], estimated_weeks=8),
                    PathwayMilestone(step_number=3, title="Production Deployment & Containerization", description="Containerize with Docker and set up CI/CD delivery pipelines.", milestone_type="capstone_evidence", skills_to_acquire=["docker"], estimated_weeks=4)
                ]
            ),
            CareerPathway(
                pathway_id="fs-polytechnic-iti-route",
                pathway_type=PathwayType.DIPLOMA_PATH,
                title="Polytechnic / ITI Lateral Web Development Route",
                description="Diploma in CS/IT or ITI COPA accelerating into full-stack web engineering.",
                applicable_backgrounds=["diploma-polytechnic", "iti-industrial-training", "copa", "computer-operator"],
                duration_estimate="6-10 months",
                difficulty_level="Moderate",
                is_primary=False,
                milestones=[
                    PathwayMilestone(step_number=1, title="Web Foundations & TypeScript", description="Advance from basic HTML/CSS to robust TypeScript and React.", milestone_type="foundational_skill", skills_to_acquire=["typescript", "react-nextjs", "tailwind"], estimated_weeks=8),
                    PathwayMilestone(step_number=2, title="Full Stack Integration & Database API", description="Connect frontend apps to PostgreSQL/FastAPI backends.", milestone_type="core_competency", skills_to_acquire=["rest-apis", "docker"], estimated_weeks=8)
                ]
            )
        ]
    ),

    "cloud-devops-engineer": CareerRequirements(
        career_slug="cloud-devops-engineer",
        career_role="Cloud / DevOps Engineer",
        domain_category="DevOps & Cloud",
        mandatory_skills=["linux", "git-cicd", "docker"],
        recommended_skills=["kubernetes", "aws"],
        helpful_skills=["python", "rest-apis"],
        accepted_education_levels=["diploma-polytechnic", "undergraduate", "postgraduate", "iti-industrial-training", "other"],
        preferred_streams=["engineering-technology", "computer-it", "diploma-polytechnic"],
        subject_prerequisites=["Operating Systems", "Networking", "Command Line"],
        bridge_prerequisites=["Linux Administration", "Bash Scripting"],
        pathways=[
            CareerPathway(
                pathway_id="cloud-direct-route",
                pathway_type=PathwayType.DIRECT_PATH,
                title="Direct Infrastructure as Code & Cloud Route",
                description="Comprehensive Linux systems administration, container orchestration, and automated CI/CD.",
                applicable_backgrounds=["computer-science-engineering", "information-technology", "electronics-communication-engineering", "diploma-polytechnic"],
                duration_estimate="5-8 months",
                difficulty_level="Challenging",
                is_primary=True,
                milestones=[
                    PathwayMilestone(step_number=1, title="Linux Systems & Automation", description="Master Linux bash scripting, file permissions, networking, and Git CI/CD.", milestone_type="foundational_skill", skills_to_acquire=["linux", "git-cicd"], estimated_weeks=6),
                    PathwayMilestone(step_number=2, title="Containerization & Cluster Orchestration", description="Multi-stage Docker builds and Kubernetes cluster administration.", milestone_type="core_competency", skills_to_acquire=["docker", "kubernetes"], estimated_weeks=8),
                    PathwayMilestone(step_number=3, title="Enterprise Cloud Infrastructure", description="Design resilient, scalable architectures on AWS using Terraform / IaC.", milestone_type="capstone_evidence", skills_to_acquire=["aws"], estimated_weeks=6)
                ]
            )
        ]
    ),

    "cybersecurity-analyst": CareerRequirements(
        career_slug="cybersecurity-analyst",
        career_role="Cybersecurity Analyst",
        domain_category="Cybersecurity",
        mandatory_skills=["networking", "linux", "web-security"],
        recommended_skills=["cryptography", "pentesting"],
        helpful_skills=["python", "docker"],
        accepted_education_levels=["higher-secondary", "undergraduate", "diploma-polytechnic", "postgraduate", "other"],
        preferred_streams=["computer-it", "engineering-technology", "diploma-polytechnic", "science"],
        subject_prerequisites=["Computer Networks", "TCP/IP Protocols", "Linux"],
        bridge_prerequisites=["Network Packet Analysis (Wireshark)", "Linux Hardening"],
        pathways=[
            CareerPathway(
                pathway_id="cyber-direct-route",
                pathway_type=PathwayType.DIRECT_PATH,
                title="Offensive & Defensive Security Route",
                description="Network packet forensics, OWASP vulnerabilities, and ethical penetration testing.",
                applicable_backgrounds=["computer-science-engineering", "information-technology", "cybersecurity", "electronics-communication-engineering"],
                duration_estimate="6-9 months",
                difficulty_level="Challenging",
                is_primary=True,
                milestones=[
                    PathwayMilestone(step_number=1, title="Network Architecture & Linux Security", description="TCP/IP routing, firewall configuration, and Linux server hardening.", milestone_type="foundational_skill", skills_to_acquire=["networking", "linux"], estimated_weeks=6),
                    PathwayMilestone(step_number=2, title="Web Vulnerabilities & Cryptography", description="Exploit and mitigate OWASP Top 10 flaws and implement AES/RSA/TLS.", milestone_type="core_competency", skills_to_acquire=["web-security", "cryptography"], estimated_weeks=8),
                    PathwayMilestone(step_number=3, title="Penetration Testing & Red Teaming", description="Execute authorized penetration tests and vulnerability assessments.", milestone_type="capstone_evidence", skills_to_acquire=["pentesting"], estimated_weeks=6)
                ]
            )
        ]
    ),

    "vlsi-hardware-engineer": CareerRequirements(
        career_slug="vlsi-hardware-engineer",
        career_role="VLSI Hardware Engineer",
        domain_category="Hardware Engineering",
        mandatory_skills=["linear-algebra", "python", "dsa"],
        recommended_skills=["networking", "linux"],
        helpful_skills=["docker"],
        accepted_education_levels=["undergraduate", "postgraduate", "diploma-polytechnic"],
        preferred_streams=["engineering-technology", "electronics-communication-engineering", "electrical-electronics-engineering"],
        subject_prerequisites=["Digital Logic Design", "Microprocessors", "Verilog/VHDL", "Semiconductor Physics"],
        bridge_prerequisites=["Digital Electronics Foundations", "RTL Coding Basics"],
        pathways=[
            CareerPathway(
                pathway_id="vlsi-ece-direct-route",
                pathway_type=PathwayType.DIRECT_PATH,
                title="ECE / Electrical RTL to ASIC Route",
                description="Digital logic design, Verilog RTL modeling, synthesis, and physical layout verification.",
                applicable_backgrounds=["electronics-communication-engineering", "electrical-electronics-engineering", "vlsi-microelectronics", "diploma-polytechnic"],
                duration_estimate="8-12 months",
                difficulty_level="Challenging",
                is_primary=True,
                milestones=[
                    PathwayMilestone(step_number=1, title="Digital Circuit Modeling & Mathematical Logic", description="Master boolean algebra, state machines, timing diagrams, and linear algebra.", milestone_type="foundational_skill", skills_to_acquire=["linear-algebra", "python"], estimated_weeks=6),
                    PathwayMilestone(step_number=2, title="RTL Design & Simulation Algorithms", description="Write synthesizable Verilog/SystemVerilog testbenches with structured algorithms.", milestone_type="core_competency", skills_to_acquire=["dsa"], estimated_weeks=8),
                    PathwayMilestone(step_number=3, title="FPGA Prototyping & ASIC Flow", description="Synthesize designs on Xilinx/Intel FPGAs and verify static timing.", milestone_type="capstone_evidence", skills_to_acquire=["linux"], estimated_weeks=8)
                ]
            )
        ]
    ),

    "software-engineer": CareerRequirements(
        career_slug="software-engineer",
        career_role="Software Engineer",
        domain_category="Software Engineering",
        mandatory_skills=["python", "dsa", "rest-apis"],
        recommended_skills=["system-design", "docker"],
        helpful_skills=["sql", "git-cicd"],
        accepted_education_levels=["higher-secondary", "undergraduate", "postgraduate", "diploma-polytechnic", "iti-industrial-training", "other"],
        preferred_streams=["engineering-technology", "computer-it", "science", "diploma-polytechnic", "other"],
        subject_prerequisites=["Object Oriented Programming", "Data Structures", "Algorithms"],
        bridge_prerequisites=["Algorithm Complexity Analysis (Big-O)", "Data Structures in Python"],
        pathways=[
            CareerPathway(
                pathway_id="swe-standard-path",
                pathway_type=PathwayType.DIRECT_PATH,
                title="Core Computer Science & Systems Route",
                description="Deep algorithmic problem solving, clean architecture, REST microservices, and system design.",
                applicable_backgrounds=["computer-science-engineering", "information-technology", "bca", "pcm", "diploma-polytechnic", "other"],
                duration_estimate="6-9 months",
                difficulty_level="Moderate",
                is_primary=True,
                milestones=[
                    PathwayMilestone(step_number=1, title="Advanced DSA & Complexity", description="Trees, graphs, dynamic programming, and greedy algorithms.", milestone_type="foundational_skill", skills_to_acquire=["python", "dsa"], estimated_weeks=8),
                    PathwayMilestone(step_number=2, title="Backend Architecture & Distributed Systems", description="RESTful microservices, caching, concurrency, and message queues.", milestone_type="core_competency", skills_to_acquire=["rest-apis", "system-design"], estimated_weeks=8),
                    PathwayMilestone(step_number=3, title="Containerized Production Delivery", description="Microservices containerization with Docker and automated testing.", milestone_type="capstone_evidence", skills_to_acquire=["docker"], estimated_weeks=4)
                ]
            )
        ]
    )
}

def get_career_requirements(career_slug: str) -> Optional[CareerRequirements]:
    """Retrieves authoritative requirements and pathways for a career slug."""
    cleaned = (career_slug or "").strip().lower()
    return CAREER_REQUIREMENTS_REGISTRY.get(cleaned)

def get_all_registered_career_requirements() -> List[CareerRequirements]:
    """Returns requirements for all registered careers."""
    return list(CAREER_REQUIREMENTS_REGISTRY.values())
