# -*- coding: utf-8 -*-
import os

seed_content = """import uuid
from typing import Dict, List
from sqlalchemy.orm import Session

from backend.app.core.security import hash_password
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal
from backend.app.models.skill import Skill, SkillPrerequisite, LearnerSkill
from backend.app.models.resource import LearningResource, ResourceSkill
from backend.app.models.assessment import Assessment, AssessmentQuestion
from backend.app.models.progress import Progress
from backend.app.models.feedback import Feedback
from backend.app.engine.adaptive import generate_or_adapt_roadmap

def seed_database(db: Session):
    # Check if already seeded
    existing_user = db.query(User).filter(User.email == "alex@pathfinder.demo").first()
    if existing_user:
        print("Database already seeded with demo user.")
        return

    print("Seeding Skills...")
    skills_data = [
        # AI / ML
        ("Python Programming", "python", "Programming", "Core Python syntax, data structures and idioms", "Beginner"),
        ("Linear Algebra & Probability", "linear-algebra", "Mathematics", "Vectors, matrices, calculus, probability and statistical distributions", "Beginner"),
        ("Data Manipulation with Pandas", "pandas", "Data Science", "DataFrames, cleaning, grouping and exploratory data analysis", "Beginner"),
        ("Machine Learning Foundations", "machine-learning", "AI/ML", "Supervised, unsupervised algorithms and feature engineering", "Intermediate"),
        ("Deep Learning & PyTorch", "deep-learning", "AI/ML", "Multi-layer perceptrons, backpropagation and PyTorch frameworks", "Intermediate"),
        ("Computer Vision & CNNs", "computer-vision", "AI/ML", "Convolutions, image classification, object detection and segmentation", "Advanced"),
        ("Natural Language Processing", "nlp", "AI/ML", "Tokenization, embeddings, sequence models and sentiment analysis", "Intermediate"),
        ("Transformers & Attention", "transformers", "AI/ML", "Self-attention, BERT, GPT architectures and Hugging Face pipelines", "Advanced"),
        ("LLM Prompt Engineering", "prompt-engineering", "AI/ML", "Zero-shot, few-shot, chain-of-thought, and reasoning systems", "Beginner"),
        ("LangChain & AI Agents", "langchain-agents", "AI/ML", "Tool calling, autonomous agents, memory and retrieval pipelines", "Intermediate"),
        ("Vector Databases & RAG", "vector-rag", "AI/ML", "pgvector, Pinecone, chunking strategies and hybrid retrieval", "Intermediate"),
        ("MLOps & Model Serving", "mlops", "DevOps", "FastAPI inference services, Docker containerization, MLflow", "Intermediate"),

        # Data Science
        ("SQL & Relational Databases", "sql", "Data Science", "Complex joins, indexing, window functions and schema design", "Beginner"),
        ("Exploratory Data Analysis", "eda", "Data Science", "Visual data discovery, outlier detection and hypothesis testing", "Beginner"),
        ("Statistical Inference", "statistics", "Mathematics", "A/B testing, hypothesis testing, confidence intervals", "Intermediate"),
        ("Big Data with PySpark", "pyspark", "Data Science", "Distributed computing, RDDs, Spark SQL and big data pipelines", "Advanced"),

        # Full Stack Web
        ("JavaScript & TypeScript", "typescript", "Web Development", "Async programming, ES6+, strong static typing and modules", "Beginner"),
        ("React & Next.js", "react-nextjs", "Web Development", "Server Components, App Router, hooks, state management", "Intermediate"),
        ("Tailwind CSS & UI Design", "tailwind", "Web Development", "Responsive design, modern CSS, component libraries", "Beginner"),
        ("REST API Design", "rest-apis", "Web Development", "HTTP protocols, OpenAPI/Swagger, authentication and pagination", "Beginner"),
        ("GraphQL & WebSockets", "graphql-websockets", "Web Development", "Real-time subscriptions, query schemas and resolvers", "Advanced"),

        # Cloud & DevOps
        ("Linux System Administration", "linux", "DevOps", "Shell scripting, process management, permissions and networking", "Beginner"),
        ("Git & CI/CD Pipelines", "git-cicd", "DevOps", "GitHub Actions, automated testing, semantic versioning", "Beginner"),
        ("Docker Containerization", "docker", "DevOps", "Dockerfiles, multi-stage builds, compose and image optimization", "Beginner"),
        ("Kubernetes Orchestration", "kubernetes", "DevOps", "Pods, deployments, services, ingress and Helm charts", "Advanced"),
        ("AWS Cloud Infrastructure", "aws", "Cloud", "EC2, S3, RDS, Lambda, IAM and serverless architecture", "Intermediate"),

        # Cybersecurity
        ("Networking Protocols", "networking", "Cybersecurity", "TCP/IP, DNS, TLS/SSL, routing and network traffic inspection", "Beginner"),
        ("Web Security & OWASP", "web-security", "Cybersecurity", "XSS, SQLi, CSRF, secure headers and vulnerability scanning", "Intermediate"),
        ("Cryptography Basics", "cryptography", "Cybersecurity", "Symmetric, asymmetric encryption, hashing, RSA and AES", "Intermediate"),
        ("Penetration Testing", "pentesting", "Cybersecurity", "Reconnaissance, exploitation frameworks and Kali Linux tools", "Advanced"),

        # Software Engineering
        ("Data Structures & Algorithms", "dsa", "Computer Science", "Trees, graphs, dynamic programming and algorithmic complexity", "Intermediate"),
        ("System Design & Architecture", "system-design", "Computer Science", "Scalability, caching, load balancers and microservices", "Advanced")
    ]

    skill_map: Dict[str, Skill] = {}
    for name, slug, cat, desc, diff in skills_data:
        s = Skill(
            name=name,
            slug=slug,
            category=cat,
            description=desc,
            difficulty_tier=diff
        )
        db.add(s)
        skill_map[slug] = s
    db.flush()

    print("Seeding Skill Prerequisites...")
    prereqs = [
        ("machine-learning", "python", True),
        ("machine-learning", "linear-algebra", True),
        ("pandas", "python", True),
        ("deep-learning", "machine-learning", True),
        ("deep-learning", "linear-algebra", True),
        ("computer-vision", "deep-learning", True),
        ("transformers", "deep-learning", True),
        ("transformers", "nlp", False),
        ("langchain-agents", "python", True),
        ("langchain-agents", "prompt-engineering", True),
        ("vector-rag", "python", True),
        ("vector-rag", "sql", False),
        ("mlops", "python", True),
        ("mlops", "docker", True),
        ("react-nextjs", "typescript", True),
        ("react-nextjs", "tailwind", False),
        ("graphql-websockets", "typescript", True),
        ("docker", "linux", True),
        ("kubernetes", "docker", True),
        ("web-security", "networking", True),
        ("web-security", "rest-apis", True),
        ("pentesting", "networking", True),
        ("pentesting", "linux", True),
        ("system-design", "dsa", True),
        ("system-design", "rest-apis", True)
    ]

    for target_slug, prereq_slug, is_mandatory in prereqs:
        if target_slug in skill_map and prereq_slug in skill_map:
            db.add(SkillPrerequisite(
                skill_id=skill_map[target_slug].id,
                prerequisite_skill_id=skill_map[prereq_slug].id,
                is_mandatory=is_mandatory
            ))
    db.flush()

    print("Seeding 50+ Realistic Learning Resources...")
    resources_data = [
        # AI/ML Track
        ("Python for Data Science and Machine Learning", "python-data-science-bootcamp", "Comprehensive Python masterclass covering NumPy, Pandas, Matplotlib, and Scikit-Learn with real-world case studies.", "Coursera", "https://www.coursera.org/learn/python-data-analysis", "course", "Beginner", 8.0, 0.95, ["ai-ml-engineer", "data-scientist"], "hands-on", ["python", "pandas"]),
        ("Mathematics for Machine Learning: Linear Algebra & Calculus", "math-for-ml-specialization", "Deep mathematical foundations covering vector spaces, eigenvalues, matrix decompositions, and gradient descent.", "Imperial College / Coursera", "https://www.coursera.org/specializations/mathematics-machine-learning", "course", "Beginner", 10.0, 0.94, ["ai-ml-engineer", "data-scientist"], "theory", ["linear-algebra"]),
        ("Hands-On Machine Learning with Scikit-Learn & PyTorch", "hands-on-ml-scikit-pytorch", "Step-by-step practical guide to regression, classification, random forests, clustering, and neural networks.", "O'Reilly", "https://www.oreilly.com/library/view/hands-on-machine-learning/9781098125967/", "course", "Intermediate", 12.0, 0.96, ["ai-ml-engineer", "data-scientist"], "hands-on", ["machine-learning", "python"]),
        ("Deep Learning Specialization: Neural Networks & Backprop", "deep-learning-specialization-andrew-ng", "Foundational deep learning curriculum by Andrew Ng teaching deep neural networks, hyperparameter tuning, and PyTorch.", "DeepLearning.AI", "https://www.deeplearning.ai/courses/deep-learning-specialization/", "course", "Intermediate", 14.0, 0.98, ["ai-ml-engineer"], "video", ["deep-learning", "machine-learning"]),
        ("Convolutional Neural Networks for Visual Recognition", "cs231n-computer-vision", "Stanford's premier course on image classification, CNN architectures (ResNet, ConvNeXt), object detection, and visual embeddings.", "Stanford CS231n", "https://cs231n.stanford.edu/", "course", "Advanced", 15.0, 0.97, ["ai-ml-engineer"], "project", ["computer-vision", "deep-learning"]),
        ("Natural Language Processing with Transformers", "huggingface-nlp-course", "Practical NLP guide utilizing the Hugging Face ecosystem, tokenizers, BERT, GPT, and custom fine-tuning pipelines.", "Hugging Face", "https://huggingface.co/learn/nlp-course", "tutorial", "Intermediate", 9.0, 0.96, ["ai-ml-engineer"], "hands-on", ["nlp", "transformers"]),
        ("Transformer Architecture & LLM Pre-Training from Scratch", "transformers-from-scratch-karpathy", "Build GPT from scratch with Andrej Karpathy: Multi-head self-attention, positional encoding, and residual connections.", "YouTube / Karpathy", "https://www.youtube.com/watch?v=kCc8FmEb1nY", "video", "Advanced", 6.0, 0.99, ["ai-ml-engineer"], "hands-on", ["transformers", "deep-learning"]),
        ("Prompt Engineering for Developers & Generative AI", "chatgpt-prompt-engineering", "Learn prompt patterns, system prompts, structured outputs, Chain-of-Thought, and guardrails with LLMs.", "DeepLearning.AI", "https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/", "course", "Beginner", 3.0, 0.92, ["ai-ml-engineer", "full-stack-developer"], "interactive", ["prompt-engineering"]),
        ("Building Autonomous AI Agents with LangChain & LangGraph", "langchain-agent-architectures", "Build multi-agent workflows, tool routing, long-term memory, and self-correcting code generation agents.", "LangChain Academy", "https://academy.langchain.com/", "course", "Intermediate", 8.0, 0.94, ["ai-ml-engineer"], "project", ["langchain-agents", "prompt-engineering"]),
        ("Production RAG: Vector Search & Hybrid Retrieval Systems", "production-rag-vector-db", "Design resilient Retrieval-Augmented Generation systems using chunking, hybrid keyword/vector search, and re-ranking.", "Pinecone Learn", "https://www.pinecone.io/learn/series/rag/", "article", "Intermediate", 5.0, 0.93, ["ai-ml-engineer"], "hands-on", ["vector-rag"]),
        ("MLOps: Serving High-Performance ML APIs with FastAPI & Docker", "mlops-fastapi-docker-serving", "Package PyTorch and Scikit-Learn models into async FastAPI microservices with containerized CI/CD.", "Full Stack Deep Learning", "https://fullstackdeeplearning.com/", "tutorial", "Intermediate", 7.0, 0.95, ["ai-ml-engineer"], "hands-on", ["mlops", "docker"]),
        ("Capstone: End-to-End LLM-Powered Research Agent", "capstone-autonomous-research-agent", "Build and deploy a full-stack autonomous research assistant with vector retrieval, live tool execution, and stream UI.", "PathFinder Capstone", "https://github.com/pathfinder/llm-research-agent", "project", "Advanced", 20.0, 0.98, ["ai-ml-engineer"], "project", ["langchain-agents", "vector-rag", "mlops"]),

        # Data Science Track
        ("Complete SQL & Relational Database Mastery", "complete-sql-mastery", "Master complex queries, subqueries, indexing, execution plans, and analytical window functions.", "Datacamp", "https://www.datacamp.com/courses/sql-for-data-science", "course", "Beginner", 6.0, 0.93, ["data-scientist"], "interactive", ["sql"]),
        ("Practical Exploratory Data Analysis & Visualization", "practical-eda-seaborn-plotly", "Techniques for discovering underlying patterns, missing data imputation, and interactive plotting with Plotly.", "Kaggle Learn", "https://www.kaggle.com/learn/data-visualization", "tutorial", "Beginner", 4.0, 0.91, ["data-scientist"], "hands-on", ["eda", "pandas"]),
        ("Applied Statistical Inference & Experimentation", "applied-statistical-inference", "Hypothesis testing, permutation tests, bootstrap methods, and A/B testing design for product decision making.", "Udacity", "https://www.udacity.com/course/ab-testing--ud257", "course", "Intermediate", 8.0, 0.94, ["data-scientist"], "theory", ["statistics"]),
        ("Distributed Data Processing with Apache Spark & PySpark", "pyspark-big-data-architecture", "Process multi-gigabyte datasets with distributed DataFrames, Spark MLlib, and cluster optimization.", "Databricks Academy", "https://academy.databricks.com/", "course", "Advanced", 11.0, 0.95, ["data-scientist"], "hands-on", ["pyspark"]),
        ("Capstone: Customer Churn Prediction & Analytics Pipeline", "capstone-churn-analytics", "Complete end-to-end data science project: SQL extraction, EDA, ML modeling, and executive dashboard.", "PathFinder Capstone", "https://github.com/pathfinder/churn-analytics", "project", "Intermediate", 15.0, 0.95, ["data-scientist"], "project", ["sql", "eda", "machine-learning"]),

        # Full Stack Track
        ("TypeScript in Depth: From Fundamentals to Advanced Generics", "typescript-in-depth", "Master static types, interfaces, utility types, conditional types, and scalable architecture patterns.", "Frontend Masters", "https://frontendmasters.com/courses/typescript-v3/", "course", "Beginner", 7.0, 0.95, ["full-stack-developer"], "interactive", ["typescript"]),
        ("React 18 & Next.js 14 Complete Architecture Guide", "nextjs-complete-architecture", "Build modern SSR and client applications with Next.js App Router, React Server Components, and Server Actions.", "Vercel Academy", "https://nextjs.org/learn", "course", "Intermediate", 12.0, 0.97, ["full-stack-developer"], "hands-on", ["react-nextjs", "typescript"]),
        ("Modern UI Systems with Tailwind CSS & Shadcn/ui", "tailwind-shadcn-design-systems", "Construct accessible, themeable design systems and component libraries with Tailwind CSS and Radix UI.", "Tailwind Labs", "https://tailwindcss.com/resources", "tutorial", "Beginner", 5.0, 0.94, ["full-stack-developer"], "hands-on", ["tailwind"]),
        ("Production REST & GraphQL API Design with Node & Prisma", "rest-graphql-prisma-node", "Design secure, cached, and authenticated backend services using Express, GraphQL, and PostgreSQL with Prisma ORM.", "Prisma Learn", "https://www.prisma.io/docs/getting-started", "course", "Intermediate", 9.0, 0.94, ["full-stack-developer"], "hands-on", ["rest-apis", "sql"]),
        ("Capstone: Full-Stack Real-Time Collaborative Workspace", "capstone-collab-workspace", "Build a Notion-like collaborative editor featuring WebSockets, optimistic UI, auth, and cloud database.", "PathFinder Capstone", "https://github.com/pathfinder/collab-workspace", "project", "Advanced", 22.0, 0.98, ["full-stack-developer"], "project", ["react-nextjs", "typescript", "rest-apis"]),

        # Cloud & DevOps Track
        ("Linux Power User & Shell Scripting Bootcamp", "linux-power-user-bootcamp", "Master POSIX shells, Bash automation scripts, permissions, grep, awk, sed, and server management.", "Linux Foundation", "https://training.linuxfoundation.org/", "course", "Beginner", 6.0, 0.93, ["cloud-engineer"], "hands-on", ["linux"]),
        ("Git Mastery & Automated CI/CD with GitHub Actions", "git-cicd-github-actions", "Branching workflows, rebase strategies, automated testing, container build pipelines, and release workflows.", "GitHub Skills", "https://skills.github.com/", "tutorial", "Beginner", 4.0, 0.94, ["cloud-engineer", "full-stack-developer"], "hands-on", ["git-cicd"]),
        ("Docker Containerization: From Local Dev to Production", "docker-mastery-bootcamp", "Containerize full-stack apps, write multi-stage Dockerfiles, configure networks, volumes, and compose stacks.", "Docker Captains", "https://www.docker.com/101-tutorial/", "course", "Beginner", 7.0, 0.96, ["cloud-engineer"], "hands-on", ["docker"]),
        ("Kubernetes in Production: Deploying & Scaling Microservices", "kubernetes-production-mastery", "Orchestrate resilient clusters with Deployments, StatefulSets, Ingress Controllers, and Helm charts.", "CNCF / Linux Foundation", "https://www.cncf.io/training/", "course", "Advanced", 14.0, 0.97, ["cloud-engineer"], "hands-on", ["kubernetes", "docker"]),
        ("AWS Cloud Practitioner & Serverless Architecture", "aws-cloud-practitioner-serverless", "Deploy scalable cloud infrastructure with VPC, EC2, S3, RDS, Lambda, API Gateway, and CloudFront.", "AWS Skill Builder", "https://explore.skillbuilder.aws/", "course", "Intermediate", 10.0, 0.95, ["cloud-engineer"], "hands-on", ["aws"]),

        # Cybersecurity Track
        ("Computer Networking Protocols & Traffic Analysis", "networking-protocols-wireshark", "Deep dive into OSI layers, TCP three-way handshake, DNS queries, and Wireshark packet capture analysis.", "Cisco Networking Academy", "https://www.netacad.com/", "course", "Beginner", 8.0, 0.94, ["cybersecurity-engineer"], "hands-on", ["networking"]),
        ("Web Application Security: Defending the OWASP Top 10", "owasp-top-10-web-security", "Understand and prevent SQL injections, Cross-Site Scripting (XSS), CSRF, and broken authentication.", "PortSwigger Web Security Academy", "https://portswigger.net/web-security", "course", "Intermediate", 10.0, 0.97, ["cybersecurity-engineer"], "interactive", ["web-security", "networking"]),
        ("Practical Cryptography & Network Encryption", "practical-cryptography-encryption", "Implement modern ciphers, public-key cryptography (RSA/ECC), digital signatures, and TLS 1.3 handshakes.", "Stanford Online", "https://online.stanford.edu/courses/crypto-i", "course", "Intermediate", 9.0, 0.95, ["cybersecurity-engineer"], "theory", ["cryptography"]),
        ("Hands-On Penetration Testing & Ethical Hacking", "penetration-testing-kali-metasploit", "Practical ethical hacking, port scanning with Nmap, vulnerability assessment, and Metasploit exploitation.", "TryHackMe / HackTheBox", "https://tryhackme.com/", "course", "Advanced", 15.0, 0.96, ["cybersecurity-engineer"], "interactive", ["pentesting", "linux"]),

        # Software Engineering Track
        ("Data Structures & Algorithms in Practice", "dsa-in-practice", "Master algorithmic thinking, graph traversals (BFS/DFS), dynamic programming, and LeetCode problem patterns.", "NeetCode", "https://neetcode.io/", "course", "Intermediate", 16.0, 0.97, ["software-engineer"], "hands-on", ["dsa"]),
        ("System Design for Scalable Distributed Systems", "system-design-scalable-systems", "Architect large-scale services: database sharding, caching strategies, rate limiting, and message queues.", "ByteByteGo", "https://bytebytego.com/", "course", "Advanced", 12.0, 0.98, ["software-engineer", "ai-ml-engineer"], "theory", ["system-design"])
    ]

    for title, slug, desc, prov, url, r_type, diff, hrs, qual, career, fmt, taught_slugs in resources_data:
        res = LearningResource(
            title=title,
            slug=slug,
            description=desc,
            provider=prov,
            url=url,
            resource_type=r_type,
            difficulty=diff,
            estimated_hours=hrs,
            quality_score=qual,
            career_relevance=career,
            format=fmt
        )
        db.add(res)
        db.flush()

        for s_slug in taught_slugs:
            if s_slug in skill_map:
                db.add(ResourceSkill(
                    resource_id=res.id,
                    skill_id=skill_map[s_slug].id,
                    relevance_weight=1.0
                ))
    db.flush()

    print("Seeding Diagnostic Assessments...")
    ai_assessment = Assessment(
        title="AI & Machine Learning Readiness Diagnostic",
        domain="AI/ML",
        target_skill_ids=[skill_map["python"].id, skill_map["linear-algebra"].id, skill_map["machine-learning"].id]
    )
    db.add(ai_assessment)
    db.flush()

    q1 = AssessmentQuestion(
        assessment_id=ai_assessment.id,
        skill_id=skill_map["python"].id,
        question_text="In Python, what is the output of `[x**2 for x in range(4) if x % 2 == 0]`?",
        options=["[0, 4]", "[0, 1, 4, 9]", "[4]", "[0, 2, 4]"],
        correct_option_index=0,
        explanation="Range(4) produces 0, 1, 2, 3. The even numbers are 0 and 2. Squaring them gives 0 and 4.",
        difficulty_weight=0.3
    )
    q2 = AssessmentQuestion(
        assessment_id=ai_assessment.id,
        skill_id=skill_map["linear-algebra"].id,
        question_text="What does the dot product of two normalized unit vectors equal to 0 indicate?",
        options=["Vectors are parallel", "Vectors are orthogonal (perpendicular)", "Vectors have opposite directions", "Vectors have zero length"],
        correct_option_index=1,
        explanation="When the dot product of two non-zero vectors is 0, the angle between them is 90 degrees (orthogonal).",
        difficulty_weight=0.4
    )
    q3 = AssessmentQuestion(
        assessment_id=ai_assessment.id,
        skill_id=skill_map["machine-learning"].id,
        question_text="Which technique is specifically used to prevent overfitting in decision tree algorithms?",
        options=["Increasing tree depth", "Cost-complexity pruning", "Removing all regularizations", "Multiplying input features"],
        correct_option_index=1,
        explanation="Pruning removes branches that provide little predictive power on validation datasets, reducing overfitting.",
        difficulty_weight=0.5
    )
    q4 = AssessmentQuestion(
        assessment_id=ai_assessment.id,
        skill_id=skill_map["deep-learning"].id,
        question_text="Why do modern deep networks commonly use the ReLU activation function over Sigmoid for hidden layers?",
        options=["ReLU eliminates negative inputs", "ReLU mitigates the vanishing gradient problem", "ReLU is bounded between 0 and 1", "ReLU requires matrix inversion"],
        correct_option_index=1,
        explanation="ReLU has a constant derivative of 1 for positive inputs, preventing gradients from vanishing through deep layers.",
        difficulty_weight=0.6
    )
    db.add_all([q1, q2, q3, q4])
    db.flush()

    print("Seeding Demo Learner 'Alex'...")
    demo_user = User(
        email="alex@pathfinder.demo",
        hashed_password=hash_password("demo12345"),
        full_name="Alex Mercer",
        is_demo=True
    )
    db.add(demo_user)
    db.flush()

    demo_profile = LearnerProfile(
        user_id=demo_user.id,
        education_level="Undergraduate (3rd Year CS)",
        field_of_study="Computer Science & Data",
        experience_level="Intermediate",
        weekly_hours=10,
        preferred_formats=["video", "hands-on", "projects"],
        learning_objective="Placement / Career Goal",
        skill_confidence_map={
            "python": 0.65,
            "linear-algebra": 0.30,
            "machine-learning": 0.35,
            "sql": 0.60,
            "deep-learning": 0.20,
            "transformers": 0.10,
            "mlops": 0.15
        },
        velocity_score=1.1,
        difficulty_tolerance=0.55
    )
    db.add(demo_profile)
    db.flush()

    # Add LearnerSkills
    db.add(LearnerSkill(profile_id=demo_profile.id, skill_id=skill_map["python"].id, self_rating="Intermediate", assessed_confidence=0.65))
    db.add(LearnerSkill(profile_id=demo_profile.id, skill_id=skill_map["linear-algebra"].id, self_rating="Beginner", assessed_confidence=0.30))
    db.add(LearnerSkill(profile_id=demo_profile.id, skill_id=skill_map["machine-learning"].id, self_rating="Beginner", assessed_confidence=0.35))
    db.add(LearnerSkill(profile_id=demo_profile.id, skill_id=skill_map["sql"].id, self_rating="Intermediate", assessed_confidence=0.60))
    db.flush()

    # Primary Goal
    demo_goal = Goal(
        profile_id=demo_profile.id,
        title="Become an AI/ML Engineer",
        target_role="AI/ML Engineer",
        description="Master modern deep learning, LLM systems, and end-to-end model deployment to secure an AI Engineering role.",
        target_skills=["python", "linear-algebra", "machine-learning", "deep-learning", "transformers", "langchain-agents", "vector-rag", "mlops"],
        is_primary=True,
        status="active"
    )
    db.add(demo_goal)
    db.flush()

    # Generate initial roadmap Version 1 for Alex
    print("Generating Initial Roadmap for Alex...")
    learning_path, version, _ = generate_or_adapt_roadmap(
        profile=demo_profile,
        goal=demo_goal,
        trigger="initial_generation",
        change_reason="Initial personalized learning path generated for AI/ML Engineer goal.",
        db=db,
        idempotency_key=f"demo-init-{demo_profile.id}"
    )

    # Mark first item as completed and second as in-progress
    if version.items:
        first_item = version.items[0]
        first_item.is_completed = True
        db.add(Progress(
            profile_id=demo_profile.id,
            resource_id=first_item.resource_id,
            status="completed",
            time_spent_minutes=480,
            completion_percentage=100.0
        ))
        db.add(Feedback(
            profile_id=demo_profile.id,
            resource_id=first_item.resource_id,
            feedback_type="helpful",
            rating=5,
            comment="Great foundation in NumPy and Pandas, paced well for 10h/week!"
        ))
        if len(version.items) > 1:
            second_item = version.items[1]
            db.add(Progress(
                profile_id=demo_profile.id,
                resource_id=second_item.resource_id,
                status="in_progress",
                time_spent_minutes=180,
                completion_percentage=40.0
            ))

    db.commit()
    print("Database seeding completed successfully!")
"""

with open('backend/app/seed/seed_data.py', 'w', encoding='utf-8') as f:
    f.write(seed_content)

print("Created backend/app/seed/seed_data.py")
