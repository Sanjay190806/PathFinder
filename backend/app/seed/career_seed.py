"""
Authoritative Global Career Taxonomy Seed Catalog (Phase 11 Stage 1)
Curated multi-domain dataset spanning Technology, Engineering, Healthcare, Science,
Business, Finance, Law, Education, Design, Media, Agriculture, Aviation, Public Service,
and Skilled Trades.
"""

from typing import List, Dict, Any, Tuple

# ---------------------------------------------------------------------------
# 1. CAREER DOMAINS
# ---------------------------------------------------------------------------
CAREER_DOMAINS = [
    {
        "slug": "technology-computing",
        "name": "Technology & Computing",
        "description": "Software systems, artificial intelligence, cloud architectures, algorithms, and cybersecurity.",
        "order": 1,
        "icon": "Laptop"
    },
    {
        "slug": "electronics-semiconductor",
        "name": "Electronics & Semiconductor",
        "description": "VLSI design, embedded microcontrollers, FPGA synthesis, and silicon architectures.",
        "order": 2,
        "icon": "Cpu"
    },
    {
        "slug": "engineering-infrastructure",
        "name": "Engineering & Infrastructure",
        "description": "Civil structural design, mechanical machinery, electrical grids, and physical engineering systems.",
        "order": 3,
        "icon": "Wrench"
    },
    {
        "slug": "healthcare-medicine",
        "name": "Healthcare & Medicine",
        "description": "Clinical diagnosis, surgical care, nursing, therapeutics, pharmacology, and patient healthcare.",
        "order": 4,
        "icon": "Activity"
    },
    {
        "slug": "science-research",
        "name": "Science & Research",
        "description": "Pure and applied scientific investigation, biotechnology, genomics, and laboratory research.",
        "order": 5,
        "icon": "Microscope"
    },
    {
        "slug": "finance-accounting",
        "name": "Finance & Accounting",
        "description": "Chartered accountancy, auditing, financial modeling, capital markets, and fiscal compliance.",
        "order": 6,
        "icon": "DollarSign"
    },
    {
        "slug": "business-management",
        "name": "Business & Management",
        "description": "Corporate strategy, operations, product management, entrepreneurship, and consulting.",
        "order": 7,
        "icon": "Briefcase"
    },
    {
        "slug": "law-legal",
        "name": "Law & Legal",
        "description": "Corporate jurisprudence, constitutional law, litigation, contract advisory, and statutory compliance.",
        "order": 8,
        "icon": "Scale"
    },
    {
        "slug": "education-academia",
        "name": "Education & Academia",
        "description": "Pedagogy, K-12 instruction, university professorship, curriculum architecture, and educational technology.",
        "order": 9,
        "icon": "GraduationCap"
    },
    {
        "slug": "design-creative",
        "name": "Design & Creative",
        "description": "Visual identity, user interface, user experience, typography, animation, and industrial design.",
        "order": 10,
        "icon": "Palette"
    },
    {
        "slug": "media-film-entertainment",
        "name": "Media, Film & Entertainment",
        "description": "Video editing, cinematography, narrative direction, motion graphics, and digital media production.",
        "order": 11,
        "icon": "Video"
    },
    {
        "slug": "marketing-communications",
        "name": "Marketing & Communications",
        "description": "Digital growth, performance marketing, brand strategy, content distribution, and public relations.",
        "order": 12,
        "icon": "Megaphone"
    },
    {
        "slug": "agriculture-food",
        "name": "Agriculture & Food",
        "description": "Agronomy, precision farming, crop protection, soil science, and sustainable agricultural systems.",
        "order": 13,
        "icon": "Leaf"
    },
    {
        "slug": "aviation-aerospace",
        "name": "Aviation & Aerospace",
        "description": "Commercial flight operations, aeronautical navigation, aircraft maintenance, and aerospace avionics.",
        "order": 14,
        "icon": "Navigation"
    },
    {
        "slug": "public-service-governance",
        "name": "Public Service & Governance",
        "description": "Civil administration, public policy implementation, urban planning, and governmental governance.",
        "order": 15,
        "icon": "Shield"
    },
    {
        "slug": "skilled-trades-vocational",
        "name": "Skilled Trades & Vocational",
        "description": "Automotive repair, industrial electrical installation, plumbing, machining, and technical maintenance.",
        "order": 16,
        "icon": "Tool"
    }
]

# ---------------------------------------------------------------------------
# 2. CAREER FAMILIES
# ---------------------------------------------------------------------------
CAREER_FAMILIES = [
    # Technology
    {"slug": "software-engineering", "domain_slug": "technology-computing", "name": "Software Engineering", "order": 1},
    {"slug": "ai-data", "domain_slug": "technology-computing", "name": "AI & Data Science", "order": 2},
    {"slug": "cybersecurity-family", "domain_slug": "technology-computing", "name": "Cybersecurity & Information Defense", "order": 3},
    {"slug": "cloud-devops", "domain_slug": "technology-computing", "name": "Cloud, Infrastructure & DevOps", "order": 4},
    # Electronics
    {"slug": "vlsi-semiconductor", "domain_slug": "electronics-semiconductor", "name": "VLSI & Chip Design", "order": 1},
    {"slug": "embedded-systems-family", "domain_slug": "electronics-semiconductor", "name": "Embedded Systems & Firmware", "order": 2},
    # Engineering
    {"slug": "civil-structural", "domain_slug": "engineering-infrastructure", "name": "Civil & Structural Engineering", "order": 1},
    {"slug": "mechanical-systems", "domain_slug": "engineering-infrastructure", "name": "Mechanical Engineering & Robotics", "order": 2},
    {"slug": "electrical-power", "domain_slug": "engineering-infrastructure", "name": "Electrical & Power Systems", "order": 3},
    # Healthcare
    {"slug": "clinical-medicine", "domain_slug": "healthcare-medicine", "name": "Clinical Medicine & Surgery", "order": 1},
    {"slug": "nursing-patient-care", "domain_slug": "healthcare-medicine", "name": "Nursing & Critical Patient Care", "order": 2},
    {"slug": "pharmacy-therapeutics", "domain_slug": "healthcare-medicine", "name": "Pharmacy & Therapeutics", "order": 3},
    # Science
    {"slug": "applied-sciences", "domain_slug": "science-research", "name": "Applied & Interdisciplinary Research", "order": 1},
    {"slug": "biotechnology-family", "domain_slug": "science-research", "name": "Biotechnology & Life Sciences", "order": 2},
    # Finance
    {"slug": "accounting-audit", "domain_slug": "finance-accounting", "name": "Chartered Accounting & Audit", "order": 1},
    {"slug": "financial-analysis", "domain_slug": "finance-accounting", "name": "Financial Analysis & Wealth Management", "order": 2},
    # Law
    {"slug": "corporate-commercial-law", "domain_slug": "law-legal", "name": "Corporate & Commercial Law", "order": 1},
    # Education
    {"slug": "teaching-pedagogy", "domain_slug": "education-academia", "name": "Teaching & Academic Pedagogy", "order": 1},
    # Design
    {"slug": "graphic-visual-design", "domain_slug": "design-creative", "name": "Graphic & Visual Communication", "order": 1},
    {"slug": "ui-ux-product-design", "domain_slug": "design-creative", "name": "UI/UX & Product Design", "order": 2},
    {"slug": "3d-game-art", "domain_slug": "design-creative", "name": "3D Art & Computer Graphics", "order": 3},
    # Media
    {"slug": "video-editing-post", "domain_slug": "media-film-entertainment", "name": "Video Editing & Post-Production", "order": 1},
    # Marketing
    {"slug": "digital-growth-marketing", "domain_slug": "marketing-communications", "name": "Digital Marketing & Growth", "order": 1},
    # Agriculture
    {"slug": "agronomy-soil", "domain_slug": "agriculture-food", "name": "Agronomy & Crop Management", "order": 1},
    # Aviation
    {"slug": "commercial-piloting", "domain_slug": "aviation-aerospace", "name": "Flight Operations & Piloting", "order": 1},
    # Public Service
    {"slug": "civil-administration", "domain_slug": "public-service-governance", "name": "Civil Administration & Public Governance", "order": 1},
    # Skilled Trades
    {"slug": "automotive-trade", "domain_slug": "skilled-trades-vocational", "name": "Automotive Diagnostics & Repair", "order": 1},
    {"slug": "electrical-trade", "domain_slug": "skilled-trades-vocational", "name": "Electrical Trade & Industrial Wiring", "order": 2}
]

# ---------------------------------------------------------------------------
# 3. MULTI-DOMAIN CANONICAL SKILLS TO SEED INTO `skills` TABLE
# ---------------------------------------------------------------------------
ADDITIONAL_SKILLS_FOR_CAREERS = [
    # Design & Creative
    ("Typography & Font Pairing", "typography", "Design", "Letterform anatomy, hierarchical scale, readability, and font pairings", "Beginner"),
    ("Layout & Grid Systems", "layout-design", "Design", "Modular grids, white space, visual hierarchy, and publication layout principles", "Beginner"),
    ("Color Theory & Palettes", "color-theory", "Design", "Color harmony, contrast ratios, accessibility compliance, and gamut spaces", "Beginner"),
    ("Figma & Design Systems", "figma-ui", "Design", "Auto-layout, reusable components, variants, token architecture, and prototyping", "Intermediate"),
    ("Brand Identity Design", "brand-identity", "Design", "Logo mark development, brand guidelines, stationery, and visual asset systems", "Intermediate"),
    # Media & Video
    ("Non-Linear Video Editing", "video-editing", "Media", "Timeline pacing, multi-track cutting, J/L cuts, transition design, and Premier/DaVinci", "Beginner"),
    ("Audio Post & Sound Design", "audio-post", "Media", "Equalization, noise gating, loudness normalization, Foley, and multitrack mixing", "Intermediate"),
    ("Color Grading & Correction", "color-grading", "Media", "LUTs, waveform scopes, skin tone vectors, contrast balance, and cinematic color palettes", "Intermediate"),
    ("Motion Graphics & Keyframing", "motion-graphics", "Media", "Graph editor easing, kinetic typography, shape animations, and After Effects workflows", "Intermediate"),
    # Healthcare
    ("Human Anatomy & Physiology", "anatomy-physiology", "Healthcare", "Cardiovascular, musculoskeletal, neurological, and metabolic biological systems", "Intermediate"),
    ("Clinical Diagnostic Methodologies", "clinical-diagnosis", "Healthcare", "Patient history examination, differential diagnosis, vital telemetry, and lab evaluation", "Advanced"),
    ("Pharmacology & Pharmacokinetics", "pharmacology", "Healthcare", "Drug mechanisms of action, half-life, interactions, dosage calculation, and therapeutics", "Advanced"),
    ("Nursing Care & Patient Vitals", "nursing-care", "Healthcare", "Infection control, IV administration, catheterization, triage, and bedside telemetry", "Intermediate"),
    # Engineering & Hardware
    ("Computer-Aided Design (CAD)", "cad-modeling", "Engineering", "Parametric 3D solid modeling, engineering drafting, GD&T, and SolidWorks/AutoCAD", "Beginner"),
    ("Structural Analysis & Mechanics", "structural-analysis", "Engineering", "Bending moments, shear forces, deflection, stress tensors, and finite element modeling", "Intermediate"),
    ("Thermodynamics & Fluid Dynamics", "thermodynamics", "Engineering", "First & second laws, heat transfer, Bernoulli equations, and thermodynamic cycles", "Intermediate"),
    ("Embedded C & Microcontrollers", "embedded-c", "Hardware", "Register manipulation, UART/SPI/I2C buses, timers, interrupts, and ARM Cortex", "Intermediate"),
    ("Digital Logic & Verilog RTL", "verilog-rtl", "Hardware", "Combinational logic, finite state machines, synthesizable RTL, testbenches, and timing closure", "Intermediate"),
    # Finance & Accounting
    ("Financial Accounting & IFRS", "financial-accounting", "Finance", "Balance sheet reconciliation, profit/loss recognition, ledger audits, and statutory statements", "Intermediate"),
    ("Corporate Finance & Valuation", "corporate-finance", "Finance", "Discounted cash flow, weighted average cost of capital, capital budgeting, and M&A", "Intermediate"),
    ("Financial Modeling in Excel", "financial-modeling", "Finance", "Dynamic scenario planning, three-statement integration, and sensitivity matrix analysis", "Intermediate"),
    # Law
    ("Legal Research & Statutory Analysis", "legal-research", "Law", "Case law indexing, judicial precedent analysis, Manupatra/Westlaw citation, and jurisprudence", "Intermediate"),
    ("Contract Drafting & Advisory", "contract-drafting", "Law", "Indemnity clauses, warranties, dispute resolution, covenants, and non-disclosure governance", "Intermediate"),
    # Education
    ("Curriculum Design & Pedagogy", "pedagogy", "Education", "Instructional scaffolding, Bloom taxonomy alignment, formative evaluation, and active learning", "Intermediate"),
    # Agriculture
    ("Agronomy & Crop Management", "agronomy", "Agriculture", "Crop phenology, irrigation scheduling, integrated pest management, and yield forecasting", "Intermediate"),
    ("Soil Science & Nutrient Chemistry", "soil-science", "Agriculture", "pH testing, nitrogen-phosphorus-potassium assays, organic amendments, and drainage", "Intermediate"),
    # Aviation
    ("Aeronautical Navigation & Meteorology", "flight-navigation", "Aviation", "VOR/GPS waypoints, airspace classification, METAR decoding, altimetry, and flight planning", "Advanced"),
    ("Aircraft Systems & Aerodynamics", "aerodynamics", "Aviation", "Airfoil lift/drag mechanics, stall characteristics, turbine propulsion, and hydraulic systems", "Intermediate"),
    # Skilled Trades
    ("Automotive Engine Diagnostics", "automotive-repair", "Skilled Trades", "OBD-II scanner telemetry, internal combustion mechanics, brake hydraulics, and suspension", "Intermediate"),
    ("Electrical Wiring & National Code", "electrical-wiring", "Skilled Trades", "Conduit bending, circuit breaker panels, single/three-phase distribution, and safety earthing", "Intermediate")
]

# ---------------------------------------------------------------------------
# 4. CANONICAL CAREERS SPECIFICATION
# ---------------------------------------------------------------------------
CANONICAL_CAREERS = [
    # 1. AI/ML Engineer (Historical preserved)
    {
        "slug": "ai-ml-engineer",
        "canonical_name": "AI/ML Engineer",
        "display_name": "AI/ML Engineer",
        "domain_slug": "technology-computing",
        "family_slug": "ai-data",
        "specialization": "Applied Artificial Intelligence",
        "short_description": "Designs, trains, deploys, and optimizes machine learning and deep learning neural models in production.",
        "long_description": "AI/ML Engineers bridge research and scalable systems. They train transformer architectures, implement retrieval-augmented generation (RAG) agentic pipelines, optimize inference latency, and maintain MLOps infrastructure.",
        "aliases": ["Machine Learning Engineer", "ML Engineer", "AI Developer", "Deep Learning Specialist"],
        "keywords": ["ai", "ml", "python", "pytorch", "transformers", "rag", "neural-networks"],
        "is_emerging": True,
        "emergence_source": "Rapid enterprise LLM and generative AI proliferation",
        "is_regulated": False,
        "remote_compatibility": "HIGH",
        "work_environment": "Tech Office / Remote",
        "typical_tasks": [
            "Train deep neural models using PyTorch and Hugging Face",
            "Build autonomous agent workflows with vector search RAG",
            "Deploy low-latency inference APIs with FastAPI and Docker",
            "Implement continuous model monitoring and drift detection"
        ],
        "tools": ["Python", "PyTorch", "Hugging Face", "LangChain", "Docker", "MLflow", "FastAPI"],
        "portfolio_expectations": "End-to-end deployed AI application, GitHub repository, model benchmark report.",
        "experience_levels": ["Junior", "Mid", "Senior", "Staff"],
        "mandatory_skills": ["python", "linear-algebra", "machine-learning", "deep-learning"],
        "recommended_skills": ["transformers", "langchain-agents", "vector-rag", "mlops"],
        "specializations": [
            {"slug": "machine-learning-engineer", "name": "Machine Learning Engineer", "focus_areas": ["Scikit-Learn", "Feature Engineering", "Tabular Models"]},
            {"slug": "deep-learning-engineer", "name": "Deep Learning Engineer", "focus_areas": ["PyTorch", "CNNs", "Transformers"]},
            {"slug": "nlp-engineer", "name": "NLP Engineer", "focus_areas": ["LLMs", "Tokenization", "RAG"]},
            {"slug": "computer-vision-engineer", "name": "Computer Vision Engineer", "focus_areas": ["YOLO", "Segmentation", "Object Detection"]},
            {"slug": "mlops-engineer", "name": "MLOps Engineer", "focus_areas": ["CI/CD for ML", "Model Serving", "Drift Monitoring"]}
        ],
        "education_requirements": [
            {
                "education_level": "undergraduate",
                "preferred_streams": ["computer-science-engineering", "data-science", "artificial-intelligence", "electronics-telecommunication"],
                "subject_prerequisites": ["Mathematics", "Physics", "Computer Science"],
                "requirement_type": "RECOMMENDED",
                "notes": "B.Tech/B.S. in computing or quantitative STEM discipline recommended; self-taught/bridge portfolio pathways accepted."
            }
        ]
    },
    # 2. Data Scientist (Historical preserved)
    {
        "slug": "data-scientist",
        "canonical_name": "Data Scientist",
        "display_name": "Data Scientist",
        "domain_slug": "technology-computing",
        "family_slug": "ai-data",
        "specialization": "Statistical Modeling & Predictive Analytics",
        "short_description": "Extracts actionable predictive intelligence from complex datasets through statistics and machine learning.",
        "long_description": "Data Scientists use rigorous hypothesis testing, exploratory data analysis, machine learning algorithms, and distributed data pipelines to solve core business and scientific challenges.",
        "aliases": ["Data Science Specialist", "Analytics Scientist", "Decision Scientist"],
        "keywords": ["data", "statistics", "pandas", "sql", "predictive-modeling", "pyspark"],
        "is_emerging": False,
        "is_regulated": False,
        "remote_compatibility": "HIGH",
        "work_environment": "Office / Remote",
        "typical_tasks": [
            "Formulate statistical hypotheses and design A/B experimentation frameworks",
            "Extract and transform relational and distributed data via SQL and PySpark",
            "Train predictive classification and regression models"
        ],
        "tools": ["Python", "Pandas", "SQL", "Scikit-Learn", "PySpark", "Plotly"],
        "portfolio_expectations": "Exploratory analysis case study, statistical experimentation notebook, interactive dashboard.",
        "experience_levels": ["Junior", "Mid", "Senior", "Lead"],
        "mandatory_skills": ["python", "pandas", "sql", "statistics", "machine-learning"],
        "recommended_skills": ["eda", "pyspark", "linear-algebra"],
        "specializations": [
            {"slug": "product-data-scientist", "name": "Product Data Scientist", "focus_areas": ["A/B Testing", "Cohort Retention", "Funnel Optimization"]},
            {"slug": "quantitative-analyst", "name": "Quantitative Analyst", "focus_areas": ["Time Series", "Risk Modeling", "Stochastic Calculus"]}
        ],
        "education_requirements": [
            {
                "education_level": "undergraduate",
                "preferred_streams": ["computer-science-engineering", "statistics", "mathematics", "economics", "data-science"],
                "subject_prerequisites": ["Mathematics", "Statistics"],
                "requirement_type": "RECOMMENDED"
            }
        ]
    },
    # 3. Software Engineer (Historical preserved)
    {
        "slug": "software-engineer",
        "canonical_name": "Software Engineer",
        "display_name": "Software Engineer",
        "domain_slug": "technology-computing",
        "family_slug": "software-engineering",
        "specialization": "Distributed Microservices & Systems",
        "short_description": "Designs, implements, tests, and maintains robust, scalable software architectures and services.",
        "long_description": "Software Engineers architect distributed services, optimize algorithms and data structures, build RESTful microservices, and design resilient backends.",
        "aliases": ["SDE", "Software Development Engineer", "Application Developer", "Backend Developer"],
        "keywords": ["coding", "dsa", "backend", "system-design", "algorithms", "microservices"],
        "is_emerging": False,
        "is_regulated": False,
        "remote_compatibility": "HIGH",
        "work_environment": "Office / Remote",
        "typical_tasks": [
            "Implement high-throughput REST APIs and microservices",
            "Optimize database queries, indexing, and distributed caching",
            "Write comprehensive automated unit and integration tests"
        ],
        "tools": ["Python", "TypeScript", "Go", "Docker", "PostgreSQL", "Redis", "Git"],
        "portfolio_expectations": "Open-source contributions, clean microservice system design with automated tests.",
        "experience_levels": ["Junior", "Mid", "Senior", "Principal"],
        "mandatory_skills": ["python", "dsa", "rest-apis", "sql"],
        "recommended_skills": ["system-design", "docker", "git-cicd"],
        "specializations": [
            {"slug": "backend-engineer", "name": "Backend Systems Engineer", "focus_areas": ["Distributed Systems", "Concurrency", "Database Optimization"]},
            {"slug": "frontend-engineer", "name": "Frontend Web Engineer", "focus_areas": ["React", "State Architecture", "Web Performance"]}
        ],
        "education_requirements": [
            {
                "education_level": "undergraduate",
                "preferred_streams": ["computer-science-engineering", "information-technology", "electrical-electronics"],
                "subject_prerequisites": ["Mathematics", "Computer Science"],
                "requirement_type": "RECOMMENDED"
            }
        ]
    },
    # 4. Full Stack Developer (Historical preserved)
    {
        "slug": "full-stack-developer",
        "canonical_name": "Full Stack Developer",
        "display_name": "Full Stack Developer",
        "domain_slug": "technology-computing",
        "family_slug": "software-engineering",
        "specialization": "Web Application Architecture",
        "short_description": "Builds end-to-end web applications covering user interfaces, server endpoints, and databases.",
        "long_description": "Full Stack Developers create modern responsive frontends with React/Next.js and pair them with high-performance backend APIs and relational data layers.",
        "aliases": ["Full Stack Engineer", "Web Application Developer"],
        "keywords": ["frontend", "backend", "react", "nextjs", "typescript", "api", "database"],
        "is_emerging": False,
        "is_regulated": False,
        "remote_compatibility": "HIGH",
        "work_environment": "Office / Remote",
        "typical_tasks": [
            "Build dynamic React client interfaces and design systems",
            "Develop authenticated REST and GraphQL backend services",
            "Configure Docker container builds and continuous deployments"
        ],
        "tools": ["TypeScript", "React", "Next.js", "Tailwind CSS", "FastAPI", "PostgreSQL", "Docker"],
        "portfolio_expectations": "Full-stack web application with authentication, database CRUD, and live URL.",
        "experience_levels": ["Junior", "Mid", "Senior"],
        "mandatory_skills": ["typescript", "react-nextjs", "rest-apis", "sql"],
        "recommended_skills": ["tailwind", "docker", "graphql-websockets"],
        "specializations": [
            {"slug": "web-platform-developer", "name": "Web Platform Developer", "focus_areas": ["Next.js", "Server Components", "Performance"]}
        ],
        "education_requirements": [
            {
                "education_level": "undergraduate",
                "preferred_streams": ["computer-science-engineering", "information-technology", "bca", "mca"],
                "subject_prerequisites": ["Mathematics", "Computer Science"],
                "requirement_type": "RECOMMENDED"
            }
        ]
    },
    # 5. Cloud / DevOps Engineer (Historical preserved)
    {
        "slug": "cloud-devops-engineer",
        "canonical_name": "Cloud / DevOps Engineer",
        "display_name": "Cloud / DevOps Engineer",
        "domain_slug": "technology-computing",
        "family_slug": "cloud-devops",
        "specialization": "Infrastructure as Code & CI/CD",
        "short_description": "Automates deployment pipelines, cloud provisioning, and containerized infrastructure.",
        "long_description": "Cloud & DevOps Engineers ensure zero-downtime reliability through Linux system administration, Kubernetes cluster management, AWS cloud architectures, and Git-driven CI/CD.",
        "aliases": ["DevOps Engineer", "Site Reliability Engineer", "SRE", "Cloud Architect"],
        "keywords": ["cloud", "devops", "kubernetes", "docker", "aws", "ci-cd", "linux"],
        "is_emerging": False,
        "is_regulated": False,
        "remote_compatibility": "HIGH",
        "work_environment": "Office / Remote",
        "typical_tasks": [
            "Author Infrastructure as Code configurations (Terraform / CloudFormation)",
            "Orchestrate containerized services on Kubernetes clusters",
            "Establish automated GitHub Actions CI/CD release pipelines"
        ],
        "tools": ["Linux", "Docker", "Kubernetes", "AWS", "Terraform", "GitHub Actions"],
        "portfolio_expectations": "Automated deployment repo with Docker, K8s manifests, and CI/CD workflow.",
        "experience_levels": ["Junior", "Mid", "Senior"],
        "mandatory_skills": ["linux", "docker", "git-cicd", "aws"],
        "recommended_skills": ["kubernetes", "networking"],
        "specializations": [
            {"slug": "sre", "name": "Site Reliability Engineer", "focus_areas": ["SLAs", "Observability", "Chaos Engineering"]}
        ],
        "education_requirements": [
            {
                "education_level": "undergraduate",
                "preferred_streams": ["computer-science-engineering", "information-technology", "electronics"],
                "subject_prerequisites": ["Computer Science"],
                "requirement_type": "RECOMMENDED"
            }
        ]
    },
    # 6. Cybersecurity Analyst (Historical preserved)
    {
        "slug": "cybersecurity-analyst",
        "canonical_name": "Cybersecurity Analyst",
        "display_name": "Cybersecurity Analyst",
        "domain_slug": "technology-computing",
        "family_slug": "cybersecurity-family",
        "specialization": "Threat Intelligence & Security Hardening",
        "short_description": "Protects organizational networks, software, and data from unauthorized infiltration and threats.",
        "long_description": "Cybersecurity Analysts monitor telemetry, investigate vulnerabilities, conduct web application penetration testing, and apply cryptographic defenses.",
        "aliases": ["Security Analyst", "Information Security Specialist", "SOC Analyst", "Penetration Tester"],
        "keywords": ["security", "cyber", "infosec", "penetration-testing", "cryptography", "owasp"],
        "is_emerging": False,
        "is_regulated": False,
        "remote_compatibility": "HIGH",
        "work_environment": "Security Operations Center / Office / Remote",
        "typical_tasks": [
            "Identify and patch OWASP Top 10 vulnerabilities in web services",
            "Analyze network traffic packets with Wireshark to locate malicious anomalies",
            "Conduct penetration assessments and author vulnerability remediation reports"
        ],
        "tools": ["Wireshark", "Burp Suite", "Kali Linux", "Metasploit", "Nmap", "Linux"],
        "portfolio_expectations": "Vulnerability assessment audit report, Capture-The-Flag (CTF) write-ups.",
        "experience_levels": ["Junior", "Mid", "Senior"],
        "mandatory_skills": ["networking", "linux", "web-security", "cryptography"],
        "recommended_skills": ["pentesting", "python"],
        "specializations": [
            {"slug": "soc-analyst", "name": "SOC Analyst", "focus_areas": ["SIEM", "Incident Response", "Log Telemetry"]},
            {"slug": "ethical-hacker", "name": "Ethical Hacker / Pentester", "focus_areas": ["Exploit Testing", "Red Teaming", "AppSec"]}
        ],
        "education_requirements": [
            {
                "education_level": "undergraduate",
                "preferred_streams": ["cybersecurity", "computer-science-engineering", "information-technology"],
                "subject_prerequisites": ["Computer Science", "Mathematics"],
                "requirement_type": "RECOMMENDED"
            }
        ]
    },
    # 7. VLSI Hardware Engineer (Historical preserved)
    {
        "slug": "vlsi-hardware-engineer",
        "canonical_name": "VLSI Hardware Engineer",
        "display_name": "VLSI Hardware Engineer",
        "domain_slug": "electronics-semiconductor",
        "family_slug": "vlsi-semiconductor",
        "specialization": "RTL Synthesis & ASIC Modeling",
        "short_description": "Designs and validates digital integrated circuits, silicon microarchitectures, and FPGA designs.",
        "long_description": "VLSI Hardware Engineers author synthesizable Verilog/VHDL RTL, optimize CMOS timing closures, verify digital circuits, and tape out silicon microchips.",
        "aliases": ["ASIC Design Engineer", "RTL Engineer", "Silicon Design Engineer", "FPGA Engineer"],
        "keywords": ["vlsi", "verilog", "asic", "fpga", "rtl", "semiconductor", "hardware"],
        "is_emerging": False,
        "is_regulated": False,
        "remote_compatibility": "LOW",
        "work_environment": "Semiconductor Lab / Engineering Office",
        "typical_tasks": [
            "Write synthesizable Verilog RTL models for digital processing units",
            "Perform static timing analysis (STA) and timing closure verification",
            "Simulate behavioral testbenches to validate functional correctness"
        ],
        "tools": ["Verilog", "VHDL", "ModelSim", "Synopsys Design Compiler", "Vivado", "Cadence"],
        "portfolio_expectations": "Verilog processor/ALU core with testbench waveform analysis.",
        "experience_levels": ["Entry", "Mid", "Senior"],
        "mandatory_skills": ["verilog-rtl", "linear-algebra", "dsa"],
        "recommended_skills": ["embedded-c", "python"],
        "specializations": [
            {"slug": "rtl-design-engineer", "name": "RTL Design Engineer", "focus_areas": ["Microarchitecture", "Verilog", "Synthesis"]},
            {"slug": "physical-design-engineer", "name": "Physical Design Engineer", "focus_areas": ["Floorplanning", "Clock Tree", "Routing"]}
        ],
        "education_requirements": [
            {
                "education_level": "undergraduate",
                "preferred_streams": ["electronics-communication-engineering", "electrical-electronics", "vlsi-design"],
                "subject_prerequisites": ["Physics", "Mathematics", "Digital Electronics"],
                "requirement_type": "HARD",
                "notes": "Formal degree in Electronics, Electrical, or VLSI Engineering required for physical silicon tape-out roles."
            }
        ]
    },
    # 8. Graphic Designer (Design domain)
    {
        "slug": "graphic-designer",
        "canonical_name": "Graphic Designer",
        "display_name": "Graphic Designer",
        "domain_slug": "design-creative",
        "family_slug": "graphic-visual-design",
        "specialization": "Visual Communication & Brand Identity",
        "short_description": "Creates compelling visual concepts, brand identities, publication layouts, and visual communication assets.",
        "long_description": "Graphic Designers synthesize typography, grid systems, color theory, and digital illustration to create impactful visual communications across digital and print media.",
        "aliases": ["Visual Designer", "Communication Designer", "Graphic Artist", "Brand Designer"],
        "keywords": ["design", "graphics", "typography", "branding", "illustration", "layout", "visual"],
        "is_emerging": False,
        "is_regulated": False,
        "remote_compatibility": "HIGH",
        "work_environment": "Design Studio / Remote",
        "typical_tasks": [
            "Establish comprehensive brand identity systems, logos, and guidelines",
            "Design editorial layouts, packaging graphics, and marketing collaterals",
            "Apply modular grid hierarchies and color harmonies across print and digital media"
        ],
        "tools": ["Adobe Photoshop", "Adobe Illustrator", "Figma", "Adobe InDesign"],
        "portfolio_expectations": "Curated Behance/Dribbble portfolio demonstrating 3-5 brand identity or editorial case studies.",
        "experience_levels": ["Junior", "Mid", "Senior", "Art Director"],
        "mandatory_skills": ["typography", "layout-design", "color-theory", "brand-identity"],
        "recommended_skills": ["figma-ui", "motion-graphics"],
        "specializations": [
            {"slug": "brand-identity-designer", "name": "Brand Identity Designer", "focus_areas": ["Logo Design", "Style Guides", "Brand Systems"]},
            {"slug": "publication-designer", "name": "Publication Designer", "focus_areas": ["Editorial", "Magazine Layout", "Typography"]},
            {"slug": "packaging-designer", "name": "Packaging Designer", "focus_areas": ["Dielines", "3D Mockups", "Print Production"]}
        ],
        "education_requirements": [
            {
                "education_level": "higher-secondary",
                "preferred_streams": ["arts-humanities", "design-communication", "commerce", "science"],
                "subject_prerequisites": [],
                "requirement_type": "RECOMMENDED",
                "notes": "Portfolio and proven design craft are the primary qualification; degree in Fine Arts/Design recommended but flexible."
            }
        ]
    },
    # 9. UI/UX Designer (Design domain)
    {
        "slug": "ui-ux-designer",
        "canonical_name": "UI/UX Designer",
        "display_name": "UI/UX Designer",
        "domain_slug": "design-creative",
        "family_slug": "ui-ux-product-design",
        "specialization": "User Interface & Experience Design",
        "short_description": "Designs intuitive, accessible digital product user experiences, interactions, and design systems.",
        "long_description": "UI/UX Designers conduct user research, create wireframes, test usability, and build responsive design systems in Figma that guide product engineering teams.",
        "aliases": ["Product Designer", "User Experience Designer", "Interaction Designer"],
        "keywords": ["ui", "ux", "figma", "wireframing", "prototyping", "product-design", "usability"],
        "is_emerging": False,
        "is_regulated": False,
        "remote_compatibility": "HIGH",
        "work_environment": "Tech Office / Remote",
        "typical_tasks": [
            "Conduct user interviews, map customer journeys, and create empathy maps",
            "Build interactive clickable prototypes and component libraries in Figma",
            "Run usability testing sessions and iterate based on quantitative feedback"
        ],
        "tools": ["Figma", "FigJam", "Miro", "Framer", "Protopie"],
        "portfolio_expectations": "2-3 comprehensive end-to-end UX case studies detailing problem statement, user research, wireframes, and final UI.",
        "experience_levels": ["Junior", "Mid", "Senior", "Lead"],
        "mandatory_skills": ["figma-ui", "typography", "layout-design", "color-theory"],
        "recommended_skills": ["tailwind", "brand-identity"],
        "specializations": [
            {"slug": "interaction-designer", "name": "Interaction Designer", "focus_areas": ["Micro-interactions", "Prototyping", "Animation"]},
            {"slug": "ux-researcher", "name": "UX Researcher", "focus_areas": ["User Testing", "Heuristic Audits", "Card Sorting"]}
        ],
        "education_requirements": [
            {
                "education_level": "undergraduate",
                "preferred_streams": ["design", "human-computer-interaction", "computer-science", "psychology"],
                "subject_prerequisites": [],
                "requirement_type": "RECOMMENDED"
            }
        ]
    },
    # 10. Video Editor (Media domain)
    {
        "slug": "video-editor",
        "canonical_name": "Video Editor",
        "display_name": "Video Editor",
        "domain_slug": "media-film-entertainment",
        "family_slug": "video-editing-post",
        "specialization": "Cinematic Storytelling & Post-Production",
        "short_description": "Crafts compelling narratives through footage sequencing, sound design, color grading, and pacing.",
        "long_description": "Video Editors assemble raw camera footage into engaging visual stories. They balance narrative pacing, audio equalization, cinematic color grading, and dynamic motion graphics.",
        "aliases": ["Post-Production Editor", "Film Editor", "Content Video Editor", "Video Producer"],
        "keywords": ["video", "editing", "premiere", "davinci", "sound-design", "post-production", "film"],
        "is_emerging": False,
        "is_regulated": False,
        "remote_compatibility": "HIGH",
        "work_environment": "Editing Suite / Studio / Remote",
        "typical_tasks": [
            "Cut and sequence multi-camera dialogue and narrative scenes",
            "Perform audio leveling, Foley effects, and sound mixing",
            "Color grade footage using log curves, LUTs, and color scopes"
        ],
        "tools": ["Adobe Premiere Pro", "DaVinci Resolve", "Final Cut Pro", "After Effects"],
        "portfolio_expectations": "Showreel video demonstrating pacing, sound design, and color grading across varied content genres.",
        "experience_levels": ["Entry", "Mid", "Senior"],
        "mandatory_skills": ["video-editing", "audio-post", "color-grading"],
        "recommended_skills": ["motion-graphics", "typography"],
        "specializations": [
            {"slug": "film-editor", "name": "Narrative Film Editor", "focus_areas": ["Feature Films", "Documentaries", "Dramatic Pacing"]},
            {"slug": "commercial-editor", "name": "Commercial Video Editor", "focus_areas": ["Ad Campaigns", "Promos", "Fast Cuts"]},
            {"slug": "youtube-content-editor", "name": "Digital Content Editor", "focus_areas": ["Retention Editing", "Sound Effects", "Thumbnails"]}
        ],
        "education_requirements": [
            {
                "education_level": "higher-secondary",
                "preferred_streams": ["mass-communication", "film-studies", "any"],
                "subject_prerequisites": [],
                "requirement_type": "RECOMMENDED",
                "notes": "Editing portfolio and showreel are the decisive hiring criteria."
            }
        ]
    },
    # 11. General Physician / Doctor (Healthcare domain - Regulated)
    {
        "slug": "doctor",
        "canonical_name": "General Physician / Doctor",
        "display_name": "General Physician / Doctor",
        "domain_slug": "healthcare-medicine",
        "family_slug": "clinical-medicine",
        "specialization": "Clinical Medicine & Patient Diagnosis",
        "short_description": "Diagnoses illnesses, prescribes therapeutic treatments, and delivers comprehensive patient healthcare.",
        "long_description": "Medical Doctors evaluate symptoms, order and interpret diagnostic laboratory tests, prescribe pharmaceutical treatments, and manage acute and chronic medical conditions.",
        "aliases": ["Medical Practitioner", "Physician", "MBBS Doctor", "Medical Doctor"],
        "keywords": ["medical", "doctor", "medicine", "clinical", "diagnosis", "healthcare", "mbbs"],
        "is_emerging": False,
        "is_regulated": True,
        "regulation_country": "India / Global",
        "regulatory_requirement": "Mandatory MBBS degree from an accredited medical university, completion of 1-year rotating internship, and active registration with National Medical Commission (NMC) or state medical council.",
        "qualification_requirement": "MBBS Degree + NMC / State Medical Council Registration",
        "country_scope": "GLOBAL",
        "remote_compatibility": "LOW",
        "work_environment": "Hospital / Clinic / Outpatient Department",
        "typical_tasks": [
            "Perform comprehensive clinical examinations and differential diagnoses",
            "Prescribe evidence-based therapeutic regimens and medications",
            "Coordinate with medical specialists and monitor patient recovery"
        ],
        "tools": ["Stethoscope", "Electronic Health Records (EHR)", "Diagnostic Labs", "ECG", "Imaging Scans"],
        "portfolio_expectations": "Clinical internship logbook and certified medical licensing credentials.",
        "experience_levels": ["Resident", "Junior Doctor", "Senior Consultant"],
        "mandatory_skills": ["anatomy-physiology", "clinical-diagnosis", "pharmacology"],
        "recommended_skills": [],
        "specializations": [
            {"slug": "general-practitioner", "name": "General Practitioner", "focus_areas": ["Primary Care", "Preventive Medicine"]},
            {"slug": "internal-medicine-specialist", "name": "Internal Medicine Specialist", "focus_areas": ["Complex Chronic Care", "Hospital Medicine"]}
        ],
        "education_requirements": [
            {
                "education_level": "undergraduate",
                "preferred_streams": ["pcb", "medicine-surgery-mbbs"],
                "subject_prerequisites": ["Physics", "Chemistry", "Biology"],
                "requirement_type": "HARD",
                "notes": "Strict statutory requirement: 10+2 with Physics, Chemistry, Biology + NEET-UG + 5.5-year MBBS."
            }
        ],
        "regional_metadata": [
            {
                "country_code": "IN",
                "regulatory_body": "National Medical Commission (NMC)",
                "statutory_exam": "NEET-UG, NExT / FMGE",
                "notes": "Regulated under the National Medical Commission Act, 2019."
            }
        ]
    },
    # 12. Registered Nurse (Healthcare domain - Regulated)
    {
        "slug": "nurse",
        "canonical_name": "Registered Nurse",
        "display_name": "Registered Nurse",
        "domain_slug": "healthcare-medicine",
        "family_slug": "nursing-patient-care",
        "specialization": "Patient Care & Clinical Nursing",
        "short_description": "Administers clinical care, monitors vital signs, and supports patient treatment and recovery.",
        "long_description": "Registered Nurses provide hands-on clinical care in hospitals and clinics. They administer medications, manage IV therapies, coordinate emergency triage, and educate patients on recovery.",
        "aliases": ["Staff Nurse", "Clinical Nurse", "Nursing Officer"],
        "keywords": ["nurse", "nursing", "patient-care", "clinical", "hospital", "vitals"],
        "is_emerging": False,
        "is_regulated": True,
        "regulation_country": "India / Global",
        "regulatory_requirement": "B.Sc. Nursing or General Nursing and Midwifery (GNM) with registration under State Nursing Council / Indian Nursing Council.",
        "qualification_requirement": "B.Sc. Nursing / GNM + Registered Nurse (RN) License",
        "country_scope": "GLOBAL",
        "remote_compatibility": "LOW",
        "work_environment": "Hospital Ward / Intensive Care Unit / Clinic",
        "typical_tasks": [
            "Monitor and record patient vital signs and telemetry",
            "Administer physician-prescribed medications and intravenous infusions",
            "Coordinate emergency triage and surgical preparation"
        ],
        "tools": ["Infusion Pumps", "Vital Monitors", "Catheters", "EHR Software"],
        "portfolio_expectations": "Certified nursing clinical hours and RN registry license.",
        "experience_levels": ["Staff Nurse", "Charge Nurse", "Nursing Supervisor"],
        "mandatory_skills": ["anatomy-physiology", "nursing-care", "pharmacology"],
        "recommended_skills": ["clinical-diagnosis"],
        "specializations": [
            {"slug": "critical-care-nurse", "name": "Critical Care / ICU Nurse", "focus_areas": ["Ventilators", "Hemodynamic Monitoring"]},
            {"slug": "pediatric-nurse", "name": "Pediatric Nurse", "focus_areas": ["Neonatal Care", "Pediatric Dosages"]}
        ],
        "education_requirements": [
            {
                "education_level": "undergraduate",
                "preferred_streams": ["pcb", "nursing"],
                "subject_prerequisites": ["Physics", "Chemistry", "Biology"],
                "requirement_type": "HARD",
                "notes": "Statutory requirement: B.Sc. Nursing or GNM diploma with state council license."
            }
        ],
        "regional_metadata": [
            {
                "country_code": "IN",
                "regulatory_body": "Indian Nursing Council (INC)",
                "statutory_exam": "Nursing Entrance / State Licensing",
                "notes": "Regulated under Indian Nursing Council Act."
            }
        ]
    },
    # 13. Civil Engineer (Engineering domain)
    {
        "slug": "civil-engineer",
        "canonical_name": "Civil Engineer",
        "display_name": "Civil Engineer",
        "domain_slug": "engineering-infrastructure",
        "family_slug": "civil-structural",
        "specialization": "Structural Design & Infrastructure Planning",
        "short_description": "Plans, designs, and oversees construction of structural infrastructure including bridges, roads, and buildings.",
        "long_description": "Civil Engineers calculate structural loads, analyze soil mechanics, review environmental compliance, and oversee construction site execution.",
        "aliases": ["Structural Engineer", "Site Engineer", "Construction Engineer"],
        "keywords": ["civil", "structural", "construction", "cad", "infrastructure", "surveying"],
        "is_emerging": False,
        "is_regulated": False,
        "remote_compatibility": "LOW",
        "work_environment": "Construction Site / Engineering Design Office",
        "typical_tasks": [
            "Perform structural calculations and finite element stress simulations",
            "Create CAD building and civil infrastructure schematics",
            "Inspect site construction quality, safety compliance, and material standards"
        ],
        "tools": ["AutoCAD", "STAAD.Pro", "ETABS", "Revit", "Surveying Instruments"],
        "portfolio_expectations": "Structural calculation reports, CAD drawings, and project execution documentation.",
        "experience_levels": ["Junior Site Engineer", "Design Engineer", "Project Manager"],
        "mandatory_skills": ["structural-analysis", "cad-modeling", "linear-algebra"],
        "recommended_skills": ["python"],
        "specializations": [
            {"slug": "structural-engineer", "name": "Structural Design Engineer", "focus_areas": ["Reinforced Concrete", "Steel Structures"]},
            {"slug": "geotechnical-engineer", "name": "Geotechnical Engineer", "focus_areas": ["Soil Mechanics", "Foundation Engineering"]}
        ],
        "education_requirements": [
            {
                "education_level": "undergraduate",
                "preferred_streams": ["civil-engineering", "structural-engineering"],
                "subject_prerequisites": ["Physics", "Mathematics"],
                "requirement_type": "HARD",
                "notes": "B.Tech/B.E. or Diploma in Civil Engineering required for licensed structural approvals."
            }
        ]
    },
    # 14. Mechanical Engineer (Engineering domain)
    {
        "slug": "mechanical-engineer",
        "canonical_name": "Mechanical Engineer",
        "display_name": "Mechanical Engineer",
        "domain_slug": "engineering-infrastructure",
        "family_slug": "mechanical-systems",
        "specialization": "Mechanical Systems & Thermal Design",
        "short_description": "Designs, analyzes, and manufactures mechanical machinery, thermal engines, and robotic mechanisms.",
        "long_description": "Mechanical Engineers design 3D solid machine components, simulate fluid and thermodynamic flows, and automate manufacturing processes.",
        "aliases": ["Mechanical Design Engineer", "Machine Design Specialist"],
        "keywords": ["mechanical", "cad", "thermodynamics", "machinery", "robotics", "solidworks"],
        "is_emerging": False,
        "is_regulated": False,
        "remote_compatibility": "LOW",
        "work_environment": "Manufacturing Plant / R&D Lab / Design Office",
        "typical_tasks": [
            "Model mechanical assemblies in SolidWorks and evaluate tolerance stacks",
            "Perform thermal heat transfer and CFD simulations",
            "Design prototyping fabrication and machining blueprints"
        ],
        "tools": ["SolidWorks", "ANSYS", "AutoCAD", "MATLAB", "3D Printers", "CNC"],
        "portfolio_expectations": "3D CAD mechanical assembly model with simulation analysis and Bill of Materials.",
        "experience_levels": ["Junior", "Mid", "Senior", "Chief Engineer"],
        "mandatory_skills": ["cad-modeling", "thermodynamics", "structural-analysis"],
        "recommended_skills": ["python"],
        "specializations": [
            {"slug": "thermal-systems-engineer", "name": "Thermal Systems Engineer", "focus_areas": ["HVAC", "Heat Exchangers"]},
            {"slug": "mechatronics-engineer", "name": "Mechatronics & Robotics Engineer", "focus_areas": ["Actuators", "Sensors", "Kinematics"]}
        ],
        "education_requirements": [
            {
                "education_level": "undergraduate",
                "preferred_streams": ["mechanical-engineering", "mechatronics", "production-engineering"],
                "subject_prerequisites": ["Physics", "Mathematics"],
                "requirement_type": "HARD"
            }
        ]
    },
    # 15. Chartered Accountant (Finance domain - Regulated)
    {
        "slug": "chartered-accountant",
        "canonical_name": "Chartered Accountant",
        "display_name": "Chartered Accountant",
        "domain_slug": "finance-accounting",
        "family_slug": "accounting-audit",
        "specialization": "Auditing, Taxation & Financial Compliance",
        "short_description": "Provides authoritative statutory auditing, corporate tax advisory, and strategic financial governance.",
        "long_description": "Chartered Accountants audit financial ledgers, ensure compliance with statutory tax codes and IFRS standards, and guide corporate fiscal restructuring.",
        "aliases": ["CA", "Certified Public Accountant", "CPA", "Statutory Auditor"],
        "keywords": ["ca", "accounting", "audit", "tax", "ifrs", "finance", "gst"],
        "is_emerging": False,
        "is_regulated": True,
        "regulation_country": "India / Global",
        "regulatory_requirement": "Completion of CA Foundation, Intermediate, Articleship Training, and CA Final examination conducted by the Institute of Chartered Accountants of India (ICAI).",
        "qualification_requirement": "Associate Member of ICAI (ACA / FCA)",
        "country_scope": "GLOBAL",
        "remote_compatibility": "HIGH",
        "work_environment": "Accounting Firm / Corporate Headquarters / Advisory Office",
        "typical_tasks": [
            "Perform statutory and internal corporate audits in compliance with IFRS/IndAS",
            "Formulate corporate taxation strategies and file regulatory statutory returns",
            "Prepare certified financial audit reports for regulatory authorities"
        ],
        "tools": ["Tally ERP", "SAP FICO", "Excel Financial Models", "Audit Software"],
        "portfolio_expectations": "Articleship completion certificate and ICAI membership registry credentials.",
        "experience_levels": ["Articleship Trainee", "Qualified CA", "Audit Partner"],
        "mandatory_skills": ["financial-accounting", "corporate-finance", "financial-modeling"],
        "recommended_skills": [],
        "specializations": [
            {"slug": "statutory-auditor", "name": "Statutory Auditor", "focus_areas": ["Audit Assurance", "Internal Controls"]},
            {"slug": "tax-consultant", "name": "Corporate Tax Consultant", "focus_areas": ["Direct Tax", "GST", "International Tax"]}
        ],
        "education_requirements": [
            {
                "education_level": "higher-secondary",
                "preferred_streams": ["commerce", "science", "arts"],
                "subject_prerequisites": ["Accountancy", "Mathematics"],
                "requirement_type": "HARD",
                "notes": "Entry through ICAI CA Foundation exam post-12th or direct entry for graduates."
            }
        ],
        "regional_metadata": [
            {
                "country_code": "IN",
                "regulatory_body": "Institute of Chartered Accountants of India (ICAI)",
                "statutory_exam": "CA Foundation, Intermediate, Final",
                "notes": "Established under the Chartered Accountants Act, 1949."
            }
        ]
    },
    # 16. Corporate Lawyer (Law domain - Regulated)
    {
        "slug": "corporate-lawyer",
        "canonical_name": "Corporate Lawyer",
        "display_name": "Corporate Lawyer",
        "domain_slug": "law-legal",
        "family_slug": "corporate-commercial-law",
        "specialization": "Commercial Contracts & Corporate Jurisprudence",
        "short_description": "Advises corporations on commercial transactions, contract law, mergers, and legal compliance.",
        "long_description": "Corporate Lawyers draft complex commercial agreements, advise on regulatory compliance, structure corporate mergers and acquisitions, and represent corporate clients in legal dispute negotiations.",
        "aliases": ["Corporate Attorney", "Legal Counsel", "Commercial Lawyer", "In-House Legal Advisor"],
        "keywords": ["law", "legal", "lawyer", "attorney", "contracts", "corporate-law", "llb"],
        "is_emerging": False,
        "is_regulated": True,
        "regulation_country": "India / Global",
        "regulatory_requirement": "LL.B. (3-year or 5-year integrated BA/BBA LL.B.) from a BCI-recognized law faculty and enrollment with the Bar Council of India (BCI) / All India Bar Examination (AIBE).",
        "qualification_requirement": "LL.B. Degree + Bar Council Enrollment",
        "country_scope": "GLOBAL",
        "remote_compatibility": "MEDIUM",
        "work_environment": "Law Firm / Corporate Legal Department / Arbitration Center",
        "typical_tasks": [
            "Draft and negotiate commercial non-disclosure, vendor, and equity agreements",
            "Conduct legal due diligence for corporate acquisitions and investments",
            "Perform case law jurisprudence research and author legal advisory opinions"
        ],
        "tools": ["Manupatra", "SCC Online", "Westlaw", "LexisNexis", "DocuSign"],
        "portfolio_expectations": "Sample redacted contract drafts, moot court achievements, and legal research memos.",
        "experience_levels": ["Legal Associate", "Senior Associate", "Partner / General Counsel"],
        "mandatory_skills": ["legal-research", "contract-drafting"],
        "recommended_skills": [],
        "specializations": [
            {"slug": "ma-lawyer", "name": "Mergers & Acquisitions Specialist", "focus_areas": ["Due Diligence", "Share Purchase Agreements"]},
            {"slug": "ip-lawyer", "name": "Intellectual Property Lawyer", "focus_areas": ["Patents", "Trademarks", "Licensing"]}
        ],
        "education_requirements": [
            {
                "education_level": "undergraduate",
                "preferred_streams": ["law-llb", "ba-llb", "bba-llb"],
                "subject_prerequisites": [],
                "requirement_type": "HARD",
                "notes": "Statutory degree in Law (LL.B.) required for professional practice."
            }
        ],
        "regional_metadata": [
            {
                "country_code": "IN",
                "regulatory_body": "Bar Council of India (BCI)",
                "statutory_exam": "CLAT, All India Bar Examination (AIBE)",
                "notes": "Regulated under the Advocates Act, 1961."
            }
        ]
    },
    # 17. Secondary School Teacher (Education domain)
    {
        "slug": "secondary-school-teacher",
        "canonical_name": "Secondary School Teacher",
        "display_name": "Secondary School Teacher",
        "domain_slug": "education-academia",
        "family_slug": "teaching-pedagogy",
        "specialization": "Instructional Pedagogy & Curriculum Delivery",
        "short_description": "Instructs secondary school students across academic disciplines and assesses learning development.",
        "long_description": "Secondary School Teachers develop lesson plans, facilitate classroom learning, evaluate student comprehension through formative assessments, and foster intellectual development.",
        "aliases": ["High School Teacher", "Educator", "TGT / PGT Teacher"],
        "keywords": ["teaching", "education", "teacher", "pedagogy", "curriculum", "school"],
        "is_emerging": False,
        "is_regulated": True,
        "regulation_country": "India / Global",
        "regulatory_requirement": "Bachelor of Education (B.Ed.) degree and passing the Teacher Eligibility Test (TET / CTET) for government/aided schools.",
        "qualification_requirement": "Bachelor's Degree in subject + B.Ed. + CTET/TET",
        "country_scope": "GLOBAL",
        "remote_compatibility": "MEDIUM",
        "work_environment": "School Classroom / Educational Institution",
        "typical_tasks": [
            "Design instructional lesson plans aligned with educational board standards",
            "Deliver interactive classroom instruction and facilitate inquiry-based discussions",
            "Assess student homework, projects, and standardized examinations"
        ],
        "tools": ["Google Classroom", "Learning Management Systems", "Interactive Whiteboards"],
        "portfolio_expectations": "Sample curriculum unit plan, formative assessment rubric, and teaching philosophy statement.",
        "experience_levels": ["Trainee Teacher", "Subject Teacher", "Department Head"],
        "mandatory_skills": ["pedagogy"],
        "recommended_skills": [],
        "specializations": [
            {"slug": "science-teacher", "name": "Secondary Science Teacher", "focus_areas": ["Physics", "Chemistry", "Biology Experiments"]},
            {"slug": "math-teacher", "name": "Secondary Mathematics Teacher", "focus_areas": ["Algebra", "Geometry", "Calculus Foundations"]}
        ],
        "education_requirements": [
            {
                "education_level": "undergraduate",
                "preferred_streams": ["bachelor-of-education-bed", "bsc", "ba"],
                "subject_prerequisites": [],
                "requirement_type": "HARD",
                "notes": "Subject graduation + B.Ed. required for formal secondary school teaching appointments."
            }
        ]
    },
    # 18. Commercial Airline Pilot (Aviation domain - Regulated)
    {
        "slug": "commercial-airline-pilot",
        "canonical_name": "Commercial Airline Pilot",
        "display_name": "Commercial Airline Pilot",
        "domain_slug": "aviation-aerospace",
        "family_slug": "commercial-piloting",
        "specialization": "Flight Operations & Transport Aviation",
        "short_description": "Navigates and operates multi-engine commercial aircraft safely across passenger and cargo routes.",
        "long_description": "Airline Pilots conduct pre-flight inspections, coordinate flight navigation with Air Traffic Control, manage cockpit avionics, and handle in-flight emergency operations.",
        "aliases": ["Airline Pilot", "First Officer", "Captain", "Aviator"],
        "keywords": ["pilot", "aviation", "aircraft", "flying", "cpl", "navigation", "dgca"],
        "is_emerging": False,
        "is_regulated": True,
        "regulation_country": "India / Global",
        "regulatory_requirement": "Commercial Pilot License (CPL) issued by Directorate General of Civil Aviation (DGCA / FAA) including Class 1 Medical clearance and instrument rating.",
        "qualification_requirement": "Commercial Pilot License (CPL) + Multi-Engine Rating + Class 1 Medical",
        "country_scope": "GLOBAL",
        "remote_compatibility": "LOW",
        "work_environment": "Aircraft Cockpit / International Airports",
        "typical_tasks": [
            "Perform pre-flight safety inspections, weight-and-balance, and fuel checks",
            "Navigate multi-engine passenger aircraft across designated airway flight corridors",
            "Maintain communication with Air Traffic Control (ATC) during all flight phases"
        ],
        "tools": ["Fly-by-wire Cockpit Avionics", "Flight Management System (FMS)", "Weather Radar"],
        "portfolio_expectations": "Certified pilot logbook documenting 200+ authenticated flying hours and instrument checks.",
        "experience_levels": ["First Officer", "Senior First Officer", "Captain"],
        "mandatory_skills": ["flight-navigation", "aerodynamics"],
        "recommended_skills": [],
        "specializations": [
            {"slug": "airline-transport-pilot", "name": "Airline Transport Pilot", "focus_areas": ["Boeing/Airbus Type Rating", "International Routes"]}
        ],
        "education_requirements": [
            {
                "education_level": "higher-secondary",
                "preferred_streams": ["pcm"],
                "subject_prerequisites": ["Physics", "Mathematics"],
                "requirement_type": "HARD",
                "notes": "Statutory DGCA requirement: 10+2 with Physics and Mathematics + Class 1 medical."
            }
        ],
        "regional_metadata": [
            {
                "country_code": "IN",
                "regulatory_body": "Directorate General of Civil Aviation (DGCA)",
                "statutory_exam": "DGCA CPL Theory Exams & Radio Telephony (RTR-A)",
                "notes": "Regulated under the Aircraft Rules, 1937."
            }
        ]
    },
    # 19. Automotive Mechanic (Skilled Trades domain)
    {
        "slug": "automotive-mechanic",
        "canonical_name": "Automotive Mechanic",
        "display_name": "Automotive Mechanic",
        "domain_slug": "skilled-trades-vocational",
        "family_slug": "automotive-trade",
        "specialization": "Engine Diagnostics & Automotive Repair",
        "short_description": "Diagnoses, services, and repairs internal combustion engines, electrical systems, and vehicle transmissions.",
        "long_description": "Automotive Mechanics troubleshoot engine fault codes using electronic OBD-II scanners, overhaul transmissions, inspect hydraulic brake systems, and conduct preventive vehicle maintenance.",
        "aliases": ["Auto Technician", "Vehicle Mechanic", "Motor Mechanic"],
        "keywords": ["mechanic", "automotive", "car-repair", "engine", "iti", "trades", "vehicle"],
        "is_emerging": False,
        "is_regulated": False,
        "remote_compatibility": "LOW",
        "work_environment": "Automotive Workshop / Service Center",
        "typical_tasks": [
            "Diagnose powertrain trouble codes via electronic diagnostic scanners",
            "Replace worn brake assemblies, suspension struts, and drive belts",
            "Perform scheduled vehicle engine fluid flush and tune-up procedures"
        ],
        "tools": ["OBD-II Diagnostic Scanner", "Hydraulic Lifts", "Torque Wrenches", "Multimeters"],
        "portfolio_expectations": "Apprenticeship logbook or ITI Mechanic certificate.",
        "experience_levels": ["Apprentice", "Journeyman Mechanic", "Master Technician"],
        "mandatory_skills": ["automotive-repair"],
        "recommended_skills": ["electrical-wiring"],
        "specializations": [
            {"slug": "diesel-mechanic", "name": "Heavy Vehicle / Diesel Mechanic", "focus_areas": ["Trucks", "Hydraulics", "Diesel Injection"]},
            {"slug": "ev-technician", "name": "Electric Vehicle (EV) Technician", "focus_areas": ["High Voltage Batteries", "Electric Drivetrains"]}
        ],
        "education_requirements": [
            {
                "education_level": "iti-vocational",
                "preferred_streams": ["iti-motor-mechanic", "diploma-automobile"],
                "subject_prerequisites": [],
                "requirement_type": "RECOMMENDED",
                "notes": "ITI Mechanic (Motor Vehicle) certificate or vocational apprenticeship provides direct entry."
            }
        ]
    },
    # 20. Licensed Electrician (Skilled Trades domain)
    {
        "slug": "licensed-electrician",
        "canonical_name": "Licensed Electrician",
        "display_name": "Licensed Electrician",
        "domain_slug": "skilled-trades-vocational",
        "family_slug": "electrical-trade",
        "specialization": "Industrial & Residential Electrical Installation",
        "short_description": "Installs, tests, and maintains electrical wiring, circuit distribution panels, and power equipment.",
        "long_description": "Electricians read blueprints, bend conduit, wire distribution panels, troubleshoot electrical shorts, and ensure installations comply with national electrical safety codes.",
        "aliases": ["Electrician", "Wireman", "Electrical Technician"],
        "keywords": ["electrician", "wiring", "electrical", "circuits", "power", "iti", "trades"],
        "is_emerging": False,
        "is_regulated": True,
        "regulation_country": "India / Global",
        "regulatory_requirement": "ITI Wireman / Electrician certificate + State Electrical Licensing Board wireman/supervisor permit.",
        "qualification_requirement": "ITI Electrician Certificate + Wireman License",
        "country_scope": "GLOBAL",
        "remote_compatibility": "LOW",
        "work_environment": "Construction Site / Industrial Plant / Residential",
        "typical_tasks": [
            "Install electrical distribution panels, conduit, and three-phase wiring",
            "Test electrical circuits with digital multimeters and insulation testers",
            "Diagnose and repair electrical shorts, ground faults, and tripped breakers"
        ],
        "tools": ["Digital Multimeter", "Conduit Bender", "Insulation Tester (Megger)", "Wire Strippers"],
        "portfolio_expectations": "Apprenticeship completion certificate and Wireman license.",
        "experience_levels": ["Apprentice", "Licensed Electrician", "Master Electrician"],
        "mandatory_skills": ["electrical-wiring"],
        "recommended_skills": [],
        "specializations": [
            {"slug": "industrial-electrician", "name": "Industrial Electrician", "focus_areas": ["Motors", "PLCs", "High Voltage Switchgear"]}
        ],
        "education_requirements": [
            {
                "education_level": "iti-vocational",
                "preferred_streams": ["iti-electrician", "diploma-electrical"],
                "subject_prerequisites": [],
                "requirement_type": "HARD",
                "notes": "ITI Electrician diploma + state Wireman license required for authorized electrical sign-off."
            }
        ]
    },
    # 21. Agricultural Scientist (Agriculture domain)
    {
        "slug": "agricultural-scientist",
        "canonical_name": "Agricultural Scientist / Agronomist",
        "display_name": "Agricultural Scientist",
        "domain_slug": "agriculture-food",
        "family_slug": "agronomy-soil",
        "specialization": "Crop Yield Optimization & Soil Chemistry",
        "short_description": "Researches crop productivity, soil health, pest resistance, and sustainable agricultural techniques.",
        "long_description": "Agricultural Scientists conduct agronomic field trials, optimize soil fertility and irrigation, engineer disease-resistant crop strains, and promote precision farming practices.",
        "aliases": ["Agronomist", "Crop Scientist", "Agricultural Specialist"],
        "keywords": ["agriculture", "crops", "farming", "soil", "agronomy", "botany", "food"],
        "is_emerging": False,
        "is_regulated": False,
        "remote_compatibility": "LOW",
        "work_environment": "Agricultural Research Station / Field / Lab",
        "typical_tasks": [
            "Conduct field trials on crop hybrids and drought-resilient seed varieties",
            "Analyze soil chemical profiles and author nutrient enrichment recommendations",
            "Formulate integrated pest management programs with minimum ecological impact"
        ],
        "tools": ["Soil Spectrometers", "GIS Mapping", "Precision Drones", "Weather Stations"],
        "portfolio_expectations": "Agronomic field trial research paper or crop optimization case study.",
        "experience_levels": ["Junior Researcher", "Agronomist", "Principal Scientist"],
        "mandatory_skills": ["agronomy", "soil-science"],
        "recommended_skills": ["statistics"],
        "specializations": [
            {"slug": "soil-scientist", "name": "Soil Fertility Specialist", "focus_areas": ["Soil Chemistry", "Microbiome"]},
            {"slug": "precision-agriculture-specialist", "name": "Precision Agriculture Specialist", "focus_areas": ["Drones", "IoT Soil Sensors"]}
        ],
        "education_requirements": [
            {
                "education_level": "undergraduate",
                "preferred_streams": ["agriculture-bsc", "botany", "biotechnology"],
                "subject_prerequisites": ["Biology", "Chemistry"],
                "requirement_type": "RECOMMENDED"
            }
        ]
    }
]

# ---------------------------------------------------------------------------
# 5. INTER-CAREER RELATIONSHIPS (TRANSITION & ADJACENCY INTELLIGENCE)
# ---------------------------------------------------------------------------
CAREER_RELATIONSHIPS = [
    # Data Analyst / Scientist & AI/ML
    {
        "source": "data-scientist",
        "target": "ai-ml-engineer",
        "relationship_type": "TRANSITION",
        "notes": "Common career transition for data scientists moving into production deep learning and LLM engineering.",
        "transferable_skills": ["python", "machine-learning", "statistics", "pandas"],
        "bridge_skills": ["deep-learning", "transformers", "mlops", "docker"]
    },
    {
        "source": "software-engineer",
        "target": "ai-ml-engineer",
        "relationship_type": "TRANSITION",
        "notes": "Software engineers transitioning into AI leverage strong software fundamentals and ramp up mathematical/ML modeling.",
        "transferable_skills": ["python", "dsa", "rest-apis", "docker"],
        "bridge_skills": ["linear-algebra", "machine-learning", "deep-learning", "vector-rag"]
    },
    {
        "source": "software-engineer",
        "target": "full-stack-developer",
        "relationship_type": "ADJACENT",
        "notes": "Backend software engineers frequently expand horizontally into full stack development by mastering modern frontend frameworks.",
        "transferable_skills": ["rest-apis", "sql", "git-cicd"],
        "bridge_skills": ["typescript", "react-nextjs", "tailwind"]
    },
    {
        "source": "software-engineer",
        "target": "cloud-devops-engineer",
        "relationship_type": "ADJACENT",
        "notes": "Software engineers with infrastructure interest transition into cloud and DevOps.",
        "transferable_skills": ["linux", "git-cicd", "docker"],
        "bridge_skills": ["kubernetes", "aws", "networking"]
    },
    {
        "source": "graphic-designer",
        "target": "ui-ux-designer",
        "relationship_type": "TRANSITION",
        "notes": "Graphic designers possess strong visual foundation; transitioning to UI/UX requires mastering interaction design, Figma component systems, and usability research.",
        "transferable_skills": ["typography", "layout-design", "color-theory", "brand-identity"],
        "bridge_skills": ["figma-ui"]
    },
    {
        "source": "video-editor",
        "target": "graphic-designer",
        "relationship_type": "ADJACENT",
        "notes": "Video editors expand into motion graphics and graphic identity.",
        "transferable_skills": ["color-grading", "audio-post"],
        "bridge_skills": ["typography", "layout-design", "brand-identity"]
    },
    {
        "source": "nurse",
        "target": "doctor",
        "relationship_type": "PREDECESSOR",
        "notes": "Nursing background provides extensive clinical foundations for learners pursuing medical degrees.",
        "transferable_skills": ["anatomy-physiology", "nursing-care", "pharmacology"],
        "bridge_skills": ["clinical-diagnosis"]
    },
    {
        "source": "automotive-mechanic",
        "target": "licensed-electrician",
        "relationship_type": "ADJACENT",
        "notes": "Mechanics with strong auto-electrical skills can bridge into industrial electrical trades or EV technology.",
        "transferable_skills": ["automotive-repair"],
        "bridge_skills": ["electrical-wiring"]
    }
]
