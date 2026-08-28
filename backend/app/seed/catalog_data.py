from typing import List, Tuple, Dict, Any

SKILLS_DATA: List[Tuple[str, str, str, str, str]] = [
    # (name, slug, category, description, difficulty_tier)
    ("Python Programming", "python", "Programming", "Core Python syntax, OOP, iterators, generators, and idioms", "Beginner"),
    ("JavaScript & TypeScript", "typescript", "Programming", "Async programming, ES6+, strong static typing, interfaces and generics", "Beginner"),
    ("Go Systems Programming", "golang", "Programming", "Goroutines, channels, interfaces, microservices and concurrency", "Intermediate"),

    ("Linear Algebra & Probability", "linear-algebra", "Mathematics", "Vectors, matrices, eigenvalues, multivariate calculus, and probability distributions", "Beginner"),
    ("Statistical Inference & Experimentation", "statistics", "Mathematics", "Hypothesis testing, confidence intervals, A/B testing, and Bayesian methods", "Intermediate"),

    ("Data Manipulation with Pandas & NumPy", "pandas", "Data Science", "DataFrames, aggregation, cleaning, time-series, and multidimensional arrays", "Beginner"),
    ("SQL & Relational Database Design", "sql", "Data Science", "Complex joins, indexing, execution plans, window functions, and schema normalization", "Beginner"),
    ("Exploratory Data Analysis & Visualization", "eda", "Data Science", "Plotly, Seaborn, outlier detection, and data distribution discovery", "Beginner"),
    ("Big Data Processing with PySpark", "pyspark", "Data Science", "Distributed compute, Resilient Distributed Datasets, and Spark SQL pipelines", "Advanced"),

    ("Machine Learning Foundations", "machine-learning", "AI/ML", "Supervised, unsupervised algorithms, regularization, cross-validation, and Scikit-Learn", "Intermediate"),
    ("Deep Learning & PyTorch", "deep-learning", "AI/ML", "Multi-layer perceptrons, backpropagation, autograd, and PyTorch tensors", "Intermediate"),
    ("Computer Vision & CNNs", "computer-vision", "AI/ML", "Convolutions, ResNet, object detection (YOLO), and image segmentation", "Advanced"),
    ("Natural Language Processing", "nlp", "AI/ML", "Tokenization, text normalization, word embeddings (Word2Vec), and sentiment analysis", "Intermediate"),
    ("Transformers & Attention Mechanisms", "transformers", "AI/ML", "Self-attention, BERT, GPT architectures, positional encoding, and Hugging Face", "Advanced"),
    ("LLM Prompt Engineering", "prompt-engineering", "AI/ML", "Zero-shot, few-shot, Chain-of-Thought, ReAct prompting, and guardrails", "Beginner"),
    ("LangChain & Autonomous AI Agents", "langchain-agents", "AI/ML", "Tool calling, LangGraph workflows, memory management, and agentic loops", "Intermediate"),
    ("Vector Databases & Production RAG", "vector-rag", "AI/ML", "Dense retrieval, pgvector, hybrid search, chunking strategies, and re-ranking", "Intermediate"),
    ("MLOps & Model Serving Pipelines", "mlops", "AI/ML", "FastAPI inference services, MLflow tracking, Docker containerization, and model monitoring", "Intermediate"),
    ("Reinforcement Learning", "reinforcement-learning", "AI/ML", "Markov decision processes, Q-learning, policy gradients, and PPO", "Advanced"),

    ("React & Next.js Architecture", "react-nextjs", "Web Development", "Server Components, App Router, React 18 hooks, SSR, and client state", "Intermediate"),
    ("Tailwind CSS & Design Systems", "tailwind", "Web Development", "Utility-first styling, responsive layouts, theme tokens, and Radix UI", "Beginner"),
    ("REST & GraphQL API Design", "rest-apis", "Web Development", "OpenAPI schemas, status codes, JWT authentication, pagination, and GraphQL resolvers", "Beginner"),
    ("Real-Time WebSockets & Event Streams", "graphql-websockets", "Web Development", "Bidirectional sockets, Redis pub/sub, SSE, and real-time collaboration", "Advanced"),

    ("Linux System Administration", "linux", "DevOps", "Bash scripting, process management, POSIX permissions, and cron automation", "Beginner"),
    ("Git Mastery & CI/CD Pipelines", "git-cicd", "DevOps", "Branching workflows, GitHub Actions, semantic releases, and automated linting", "Beginner"),
    ("Docker Containerization", "docker", "DevOps", "Multi-stage Dockerfiles, image minimization, Docker Compose, and volume mounts", "Beginner"),
    ("Kubernetes Orchestration", "kubernetes", "DevOps", "Pods, Deployments, Services, Ingress controllers, ConfigMaps, and Helm charts", "Advanced"),
    ("AWS Cloud Infrastructure", "aws", "DevOps", "EC2, S3, RDS, AWS Lambda, IAM policies, VPCs, and serverless architectures", "Intermediate"),

    ("Networking Protocols & Packet Analysis", "networking", "Cybersecurity", "OSI model, TCP/IP, TLS handshakes, DNS, and Wireshark inspection", "Beginner"),
    ("Web Application Security & OWASP", "web-security", "Cybersecurity", "SQLi, XSS, CSRF, CORS policies, secure cookies, and header hardening", "Intermediate"),
    ("Cryptography & Public Key Infrastructure", "cryptography", "Cybersecurity", "Symmetric AES, asymmetric RSA/ECC, hashing, digital signatures, and TLS 1.3", "Intermediate"),
    ("Penetration Testing & Exploitation", "pentesting", "Cybersecurity", "Nmap reconnaissance, Metasploit exploitation, and Kali Linux toolkits", "Advanced"),

    ("Data Structures & Algorithms", "dsa", "Software Engineering", "Trees, graphs, dynamic programming, sorting, and Big-O computational complexity", "Intermediate"),
    ("System Design & Distributed Architecture", "system-design", "Software Engineering", "Sharding, caching with Redis, load balancers, rate limiting, and CAP theorem", "Advanced")
]

PREREQUISITES_DATA: List[Tuple[str, str, str, bool]] = [
    # (dependent_skill, prerequisite_skill, type, is_mandatory)
    ("machine-learning", "python", "mandatory", True),
    ("machine-learning", "linear-algebra", "mandatory", True),
    ("pandas", "python", "mandatory", True),
    ("eda", "pandas", "mandatory", True),
    ("statistics", "linear-algebra", "mandatory", True),
    ("deep-learning", "machine-learning", "mandatory", True),
    ("deep-learning", "linear-algebra", "mandatory", True),
    ("computer-vision", "deep-learning", "mandatory", True),
    ("nlp", "deep-learning", "mandatory", True),
    ("transformers", "deep-learning", "mandatory", True),
    ("transformers", "nlp", "recommended", False),
    ("langchain-agents", "python", "mandatory", True),
    ("langchain-agents", "prompt-engineering", "mandatory", True),
    ("vector-rag", "python", "mandatory", True),
    ("vector-rag", "sql", "recommended", False),
    ("mlops", "python", "mandatory", True),
    ("mlops", "docker", "mandatory", True),
    ("reinforcement-learning", "deep-learning", "mandatory", True),
    ("pyspark", "python", "mandatory", True),
    ("pyspark", "sql", "mandatory", True),
    ("react-nextjs", "typescript", "mandatory", True),
    ("react-nextjs", "tailwind", "recommended", False),
    ("graphql-websockets", "typescript", "mandatory", True),
    ("graphql-websockets", "rest-apis", "mandatory", True),
    ("docker", "linux", "mandatory", True),
    ("kubernetes", "docker", "mandatory", True),
    ("aws", "linux", "mandatory", True),
    ("web-security", "networking", "mandatory", True),
    ("web-security", "rest-apis", "mandatory", True),
    ("cryptography", "linear-algebra", "recommended", False),
    ("pentesting", "networking", "mandatory", True),
    ("pentesting", "linux", "mandatory", True),
    ("system-design", "dsa", "mandatory", True),
    ("system-design", "rest-apis", "mandatory", True)
]

RESOURCES_CATALOG: List[Tuple[str, str, str, str, str, str, str, float, float, List[str], str, List[str], List[str]]] = [
    # (title, slug, desc, provider, url, r_type, diff, hours, qual, career, format, taught_skills, prereq_skills)
    
    # --- AI & MACHINE LEARNING (14) ---
    ("Python for Data Science and Machine Learning Masterclass", "python-data-science-bootcamp",
     "Comprehensive Python masterclass covering NumPy, Pandas, Matplotlib, and Scikit-Learn with real-world case studies.",
     "Coursera / DeepLearning.AI", "https://www.coursera.org/learn/python-data-analysis", "course", "Beginner", 8.0, 0.95,
     ["ai-ml-engineer", "data-scientist"], "hands-on", ["python", "pandas"], []),

    ("Mathematics for Machine Learning: Linear Algebra & Calculus", "math-for-ml-specialization",
     "Deep mathematical foundations covering vector spaces, eigenvalues, matrix decompositions, and gradient descent.",
     "Imperial College / Coursera", "https://www.coursera.org/specializations/mathematics-machine-learning", "course", "Beginner", 10.0, 0.94,
     ["ai-ml-engineer", "data-scientist"], "theory", ["linear-algebra"], []),

    ("Hands-On Machine Learning with Scikit-Learn & PyTorch", "hands-on-ml-scikit-pytorch",
     "Step-by-step practical guide to regression, classification, random forests, clustering, and neural networks.",
     "O'Reilly Media", "https://www.oreilly.com/library/view/hands-on-machine-learning/9781098125967/", "course", "Intermediate", 12.0, 0.96,
     ["ai-ml-engineer", "data-scientist"], "hands-on", ["machine-learning", "python"], ["python", "linear-algebra"]),

    ("Deep Learning Specialization: Neural Networks & Backprop", "deep-learning-specialization-andrew-ng",
     "Foundational deep learning curriculum by Andrew Ng teaching deep neural networks, hyperparameter tuning, and PyTorch.",
     "DeepLearning.AI", "https://www.deeplearning.ai/courses/deep-learning-specialization/", "course", "Intermediate", 14.0, 0.98,
     ["ai-ml-engineer"], "video", ["deep-learning", "machine-learning"], ["machine-learning", "linear-algebra"]),

    ("Convolutional Neural Networks for Visual Recognition (CS231n)", "cs231n-computer-vision",
     "Stanford's premier course on image classification, CNN architectures (ResNet, ConvNeXt), object detection, and visual embeddings.",
     "Stanford CS231n", "https://cs231n.stanford.edu/", "course", "Advanced", 15.0, 0.97,
     ["ai-ml-engineer"], "project", ["computer-vision", "deep-learning"], ["deep-learning"]),

    ("Natural Language Processing with Transformers & Tokenizers", "huggingface-nlp-course",
     "Practical NLP guide utilizing the Hugging Face ecosystem, tokenizers, BERT, GPT, and custom fine-tuning pipelines.",
     "Hugging Face", "https://huggingface.co/learn/nlp-course", "tutorial", "Intermediate", 9.0, 0.96,
     ["ai-ml-engineer"], "hands-on", ["nlp", "transformers"], ["deep-learning"]),

    ("Transformer Architecture & LLM Pre-Training from Scratch", "transformers-from-scratch-karpathy",
     "Build GPT from scratch with Andrej Karpathy: Multi-head self-attention, positional encoding, and residual connections.",
     "YouTube / Karpathy", "https://www.youtube.com/watch?v=kCc8FmEb1nY", "video", "Advanced", 6.0, 0.99,
     ["ai-ml-engineer"], "hands-on", ["transformers", "deep-learning"], ["deep-learning"]),

    ("Prompt Engineering for Developers & Generative AI Systems", "chatgpt-prompt-engineering",
     "Learn prompt patterns, system prompts, structured outputs, Chain-of-Thought, and guardrails with LLMs.",
     "DeepLearning.AI", "https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/", "course", "Beginner", 3.0, 0.92,
     ["ai-ml-engineer", "full-stack-developer"], "interactive", ["prompt-engineering"], []),

    ("Building Autonomous AI Agents with LangChain & LangGraph", "langchain-agent-architectures",
     "Build multi-agent workflows, tool routing, long-term memory, and self-correcting code generation agents.",
     "LangChain Academy", "https://academy.langchain.com/", "course", "Intermediate", 8.0, 0.94,
     ["ai-ml-engineer"], "project", ["langchain-agents", "prompt-engineering"], ["python", "prompt-engineering"]),

    ("Production RAG: Vector Search & Hybrid Retrieval Systems", "production-rag-vector-db",
     "Design resilient Retrieval-Augmented Generation systems using chunking, hybrid keyword/vector search, and re-ranking.",
     "Pinecone Learn", "https://www.pinecone.io/learn/series/rag/", "article", "Intermediate", 5.0, 0.93,
     ["ai-ml-engineer"], "hands-on", ["vector-rag"], ["python"]),

    ("MLOps: Serving High-Performance ML APIs with FastAPI & Docker", "mlops-fastapi-docker-serving",
     "Package PyTorch and Scikit-Learn models into async FastAPI microservices with containerized CI/CD.",
     "Full Stack Deep Learning", "https://fullstackdeeplearning.com/", "tutorial", "Intermediate", 7.0, 0.95,
     ["ai-ml-engineer"], "hands-on", ["mlops", "docker"], ["python", "docker"]),

    ("Deep Reinforcement Learning in PyTorch: Policy Gradients & PPO", "deep-rl-pytorch-ppo",
     "Implement actor-critic algorithms, Deep Q-Networks (DQN), and Proximal Policy Optimization for continuous control.",
     "OpenAI Spinning Up", "https://spinningup.openai.com/", "course", "Advanced", 14.0, 0.96,
     ["ai-ml-engineer"], "theory", ["reinforcement-learning", "deep-learning"], ["deep-learning"]),

    ("Hugging Face Diffusion Models Masterclass", "diffusion-models-masterclass",
     "Master stable diffusion architectures, noise scheduling, U-Nets, and conditioning techniques for generative media.",
     "Hugging Face Academy", "https://huggingface.co/learn/diffusion-course", "course", "Advanced", 11.0, 0.95,
     ["ai-ml-engineer"], "hands-on", ["deep-learning", "computer-vision"], ["deep-learning"]),

    ("Capstone: End-to-End Autonomous AI Research Assistant", "capstone-autonomous-research-agent",
     "Build and deploy a full-stack autonomous research assistant with vector retrieval, live tool execution, and stream UI.",
     "PathFinder Capstone Series", "https://github.com/pathfinder/llm-research-agent", "project", "Advanced", 20.0, 0.98,
     ["ai-ml-engineer"], "project", ["langchain-agents", "vector-rag", "mlops"], ["langchain-agents", "vector-rag", "mlops"]),

    # --- DATA SCIENCE TRACK (9) ---
    ("Complete SQL & Relational Database Mastery", "complete-sql-mastery",
     "Master complex queries, subqueries, indexing, execution plans, and analytical window functions.",
     "Datacamp", "https://www.datacamp.com/courses/sql-for-data-science", "course", "Beginner", 6.0, 0.93,
     ["data-scientist"], "interactive", ["sql"], []),

    ("Practical Exploratory Data Analysis & Visualization with Plotly", "practical-eda-seaborn-plotly",
     "Techniques for discovering underlying patterns, missing data imputation, and interactive plotting with Plotly.",
     "Kaggle Learn", "https://www.kaggle.com/learn/data-visualization", "tutorial", "Beginner", 4.0, 0.91,
     ["data-scientist"], "hands-on", ["eda", "pandas"], ["pandas"]),

    ("Applied Statistical Inference & Experimentation for Data Science", "applied-statistical-inference",
     "Hypothesis testing, permutation tests, bootstrap methods, and A/B testing design for product decision making.",
     "Udacity", "https://www.udacity.com/course/ab-testing--ud257", "course", "Intermediate", 8.0, 0.94,
     ["data-scientist"], "theory", ["statistics"], ["linear-algebra"]),

    ("Distributed Data Processing with Apache Spark & PySpark", "pyspark-big-data-architecture",
     "Process multi-gigabyte datasets with distributed DataFrames, Spark MLlib, and cluster optimization.",
     "Databricks Academy", "https://academy.databricks.com/", "course", "Advanced", 11.0, 0.95,
     ["data-scientist"], "hands-on", ["pyspark"], ["python", "sql"]),

    ("Feature Engineering & Data Pipeline Optimization", "feature-engineering-pipelines",
     "Categorical encodings, target encoding, dimensionality reduction (PCA, t-SNE), and automated feature synthesis.",
     "Kaggle Learn", "https://www.kaggle.com/learn/feature-engineering", "tutorial", "Intermediate", 5.0, 0.92,
     ["data-scientist"], "hands-on", ["pandas", "machine-learning"], ["pandas", "machine-learning"]),

    ("Time Series Analysis & Forecasting with Prophet and ARIMA", "time-series-forecasting-arima",
     "Decompose seasonality, stationarity transformations, Autoregressive Integrated Moving Average, and Facebook Prophet.",
     "Coursera", "https://www.coursera.org/learn/practical-time-series-analysis", "course", "Intermediate", 8.0, 0.93,
     ["data-scientist"], "hands-on", ["statistics", "pandas"], ["statistics"]),

    ("Data Storytelling & Executive Dashboard Design with Streamlit", "streamlit-data-storytelling",
     "Convert complex statistical modeling into interactive analytical dashboards with Streamlit and Plotly.",
     "Streamlit Academy", "https://docs.streamlit.io/get-started", "tutorial", "Beginner", 4.0, 0.90,
     ["data-scientist"], "project", ["eda", "python"], ["python"]),

    ("Practical Bayesian Statistics for Data Analysis", "practical-bayesian-statistics",
     "Prior distributions, Markov Chain Monte Carlo (MCMC), PyMC framework, and probabilistic programming.",
     "Duke University / Coursera", "https://www.coursera.org/learn/bayesian-statistics", "course", "Advanced", 10.0, 0.95,
     ["data-scientist"], "theory", ["statistics"], ["statistics"]),

    ("Capstone: Customer Churn Prediction & Analytics Pipeline", "capstone-churn-analytics",
     "Complete end-to-end data science project: SQL extraction, EDA, ML modeling, and executive dashboard.",
     "PathFinder Capstone Series", "https://github.com/pathfinder/churn-analytics", "project", "Intermediate", 15.0, 0.95,
     ["data-scientist"], "project", ["sql", "eda", "machine-learning"], ["sql", "machine-learning"]),

    # --- FULL STACK WEB DEVELOPMENT (9) ---
    ("TypeScript in Depth: From Fundamentals to Advanced Generics", "typescript-in-depth",
     "Master static types, interfaces, utility types, conditional types, and scalable architecture patterns.",
     "Frontend Masters", "https://frontendmasters.com/courses/typescript-v3/", "course", "Beginner", 7.0, 0.95,
     ["full-stack-developer"], "interactive", ["typescript"], []),

    ("React 18 & Next.js 14 Complete Architecture Guide", "nextjs-complete-architecture",
     "Build modern SSR and client applications with Next.js App Router, React Server Components, and Server Actions.",
     "Vercel Academy", "https://nextjs.org/learn", "course", "Intermediate", 12.0, 0.97,
     ["full-stack-developer"], "hands-on", ["react-nextjs", "typescript"], ["typescript"]),

    ("Modern UI Systems with Tailwind CSS & Radix UI", "tailwind-shadcn-design-systems",
     "Construct accessible, themeable design systems and component libraries with Tailwind CSS and Radix UI.",
     "Tailwind Labs", "https://tailwindcss.com/resources", "tutorial", "Beginner", 5.0, 0.94,
     ["full-stack-developer"], "hands-on", ["tailwind"], []),

    ("Production REST & GraphQL API Design with Node & Prisma", "rest-graphql-prisma-node",
     "Design secure, cached, and authenticated backend services using Express, GraphQL, and PostgreSQL with Prisma ORM.",
     "Prisma Learn", "https://www.prisma.io/docs/getting-started", "course", "Intermediate", 9.0, 0.94,
     ["full-stack-developer"], "hands-on", ["rest-apis", "sql"], ["typescript", "sql"]),

    ("Real-Time Applications with WebSockets & Redis Pub/Sub", "websockets-redis-realtime",
     "Architect low-latency collaborative features, presence channels, and chat rooms using WebSockets and Redis.",
     "Egghead.io", "https://egghead.io/courses/build-real-time-apps", "tutorial", "Intermediate", 6.0, 0.93,
     ["full-stack-developer"], "hands-on", ["graphql-websockets"], ["typescript", "rest-apis"]),

    ("Full-Stack Authentication & RBAC Security Masterclass", "fullstack-auth-security",
     "Implement JWT refresh token rotations, OAuth2 social logins, sessions, and role-based access control.",
     "Auth0 Academy", "https://auth0.com/learn", "tutorial", "Intermediate", 6.0, 0.95,
     ["full-stack-developer"], "hands-on", ["rest-apis", "web-security"], ["rest-apis"]),

    ("Modern State Management: Zustand, TanStack Query & Redux", "modern-state-management-react",
     "Server-state caching with TanStack React Query and lightweight client store architecture with Zustand.",
     "Frontend Masters", "https://frontendmasters.com/courses/react-state/", "course", "Intermediate", 6.0, 0.94,
     ["full-stack-developer"], "hands-on", ["react-nextjs"], ["react-nextjs"]),

    ("Building Serverless Full-Stack Apps on AWS & Vercel", "serverless-fullstack-aws",
     "Deploy edge Lambdas, DynamoDB tables, S3 asset buckets, and automated CI/CD for web apps.",
     "AWS Skill Builder", "https://aws.amazon.com/training/", "tutorial", "Intermediate", 7.0, 0.93,
     ["full-stack-developer"], "hands-on", ["aws", "react-nextjs"], ["react-nextjs", "aws"]),

    ("Capstone: Full-Stack Real-Time Collaborative Workspace", "capstone-collab-workspace",
     "Build a Notion-like collaborative editor featuring WebSockets, optimistic UI, auth, and cloud database.",
     "PathFinder Capstone Series", "https://github.com/pathfinder/collab-workspace", "project", "Advanced", 22.0, 0.98,
     ["full-stack-developer"], "project", ["react-nextjs", "typescript", "rest-apis"], ["react-nextjs", "graphql-websockets"]),

    # --- CLOUD & DEVOPS (8) ---
    ("Linux Power User & Shell Scripting Bootcamp", "linux-power-user-bootcamp",
     "Master POSIX shells, Bash automation scripts, permissions, grep, awk, sed, and server management.",
     "Linux Foundation", "https://training.linuxfoundation.org/", "course", "Beginner", 6.0, 0.93,
     ["cloud-engineer"], "hands-on", ["linux"], []),

    ("Git Mastery & Automated CI/CD with GitHub Actions", "git-cicd-github-actions",
     "Branching workflows, rebase strategies, automated testing, container build pipelines, and release workflows.",
     "GitHub Skills", "https://skills.github.com/", "tutorial", "Beginner", 4.0, 0.94,
     ["cloud-engineer", "full-stack-developer"], "hands-on", ["git-cicd"], []),

    ("Docker Containerization: From Local Dev to Production", "docker-mastery-bootcamp",
     "Containerize full-stack apps, write multi-stage Dockerfiles, configure networks, volumes, and compose stacks.",
     "Docker Captains", "https://www.docker.com/101-tutorial/", "course", "Beginner", 7.0, 0.96,
     ["cloud-engineer"], "hands-on", ["docker"], ["linux"]),

    ("Kubernetes in Production: Deploying & Scaling Microservices", "kubernetes-production-mastery",
     "Orchestrate resilient clusters with Deployments, StatefulSets, Ingress Controllers, and Helm charts.",
     "CNCF / Linux Foundation", "https://www.cncf.io/training/", "course", "Advanced", 14.0, 0.97,
     ["cloud-engineer"], "hands-on", ["kubernetes", "docker"], ["docker"]),

    ("AWS Cloud Solutions Architect & Serverless Architecture", "aws-cloud-practitioner-serverless",
     "Deploy scalable cloud infrastructure with VPC, EC2, S3, RDS, Lambda, API Gateway, and CloudFront.",
     "AWS Skill Builder", "https://explore.skillbuilder.aws/", "course", "Intermediate", 10.0, 0.95,
     ["cloud-engineer"], "hands-on", ["aws"], ["linux"]),

    ("Infrastructure as Code with Terraform & AWS", "terraform-infrastructure-as-code",
     "Provision declarative infrastructure, modular state management, and multi-region AWS cloud topologies.",
     "HashiCorp Learn", "https://developer.hashicorp.com/terraform/tutorials", "tutorial", "Intermediate", 8.0, 0.95,
     ["cloud-engineer"], "hands-on", ["aws", "git-cicd"], ["aws"]),

    ("Site Reliability Engineering & Observability with Prometheus & Grafana", "sre-observability-grafana",
     "Distributed tracing with OpenTelemetry, metrics aggregation with Prometheus, and alerting dashboards in Grafana.",
     "Google Cloud SRE", "https://sre.google/resources/", "book", "Advanced", 9.0, 0.94,
     ["cloud-engineer"], "theory", ["kubernetes", "linux"], ["kubernetes"]),

    ("Capstone: Automated Multi-Environment Kubernetes GitOps Pipeline", "capstone-gitops-k8s-pipeline",
     "Deploy an automated GitOps release pipeline using ArgoCD, GitHub Actions, Docker, and Kubernetes.",
     "PathFinder Capstone Series", "https://github.com/pathfinder/gitops-k8s-pipeline", "project", "Advanced", 18.0, 0.98,
     ["cloud-engineer"], "project", ["kubernetes", "docker", "git-cicd"], ["kubernetes", "git-cicd"]),

    # --- CYBERSECURITY (8) ---
    ("Computer Networking Protocols & Packet Traffic Analysis", "networking-protocols-wireshark",
     "Deep dive into OSI layers, TCP three-way handshake, DNS queries, and Wireshark packet capture analysis.",
     "Cisco Networking Academy", "https://www.netacad.com/", "course", "Beginner", 8.0, 0.94,
     ["cybersecurity-engineer"], "hands-on", ["networking"], []),

    ("Web Application Security: Defending the OWASP Top 10", "owasp-top-10-web-security",
     "Understand and prevent SQL injections, Cross-Site Scripting (XSS), CSRF, and broken authentication.",
     "PortSwigger Web Security Academy", "https://portswigger.net/web-security", "course", "Intermediate", 10.0, 0.97,
     ["cybersecurity-engineer"], "interactive", ["web-security", "networking"], ["networking", "rest-apis"]),

    ("Practical Cryptography & Network Encryption Standards", "practical-cryptography-encryption",
     "Implement modern ciphers, public-key cryptography (RSA/ECC), digital signatures, and TLS 1.3 handshakes.",
     "Stanford Online", "https://online.stanford.edu/courses/crypto-i", "course", "Intermediate", 9.0, 0.95,
     ["cybersecurity-engineer"], "theory", ["cryptography"], []),

    ("Hands-On Penetration Testing & Ethical Hacking", "penetration-testing-kali-metasploit",
     "Practical ethical hacking, port scanning with Nmap, vulnerability assessment, and Metasploit exploitation.",
     "TryHackMe / HackTheBox", "https://tryhackme.com/", "course", "Advanced", 15.0, 0.96,
     ["cybersecurity-engineer"], "interactive", ["pentesting", "linux"], ["networking", "linux"]),

    ("Cloud Security Fundamentals on AWS & Azure", "cloud-security-iam-hardening",
     "IAM privilege minimization, security groups, KMS key rotations, GuardDuty threat detection, and audit trails.",
     "SANS Institute", "https://www.sans.org/cyber-security-courses/", "tutorial", "Intermediate", 8.0, 0.94,
     ["cybersecurity-engineer", "cloud-engineer"], "hands-on", ["aws", "web-security"], ["aws"]),

    ("Linux Security & Kernel Hardening Masterclass", "linux-security-hardening",
     "AppArmor, SELinux policies, iptables firewalling, SSH hardening, and kernel exploit mitigation.",
     "Linux Foundation", "https://training.linuxfoundation.org/cybersecurity/", "course", "Intermediate", 7.0, 0.93,
     ["cybersecurity-engineer"], "hands-on", ["linux", "web-security"], ["linux"]),

    ("Reverse Engineering & Malware Analysis Foundations", "reverse-engineering-malware-analysis",
     "Disassemble binaries with Ghidra, analyze x86 assembly, detect shellcode, and sandbox malicious payloads.",
     "OpenSecurityTraining", "https://opensecuritytraining.info/", "course", "Advanced", 12.0, 0.95,
     ["cybersecurity-engineer"], "hands-on", ["pentesting"], ["pentesting"]),

    ("Capstone: Automated Vulnerability Assessment & Remediation Suite", "capstone-security-audit-suite",
     "Build an automated vulnerability scanner auditing web endpoints, TLS configurations, and dependency vulnerabilities.",
     "PathFinder Capstone Series", "https://github.com/pathfinder/security-audit-suite", "project", "Advanced", 16.0, 0.97,
     ["cybersecurity-engineer"], "project", ["web-security", "pentesting", "networking"], ["web-security", "pentesting"]),

    # --- SOFTWARE ENGINEERING & DISTRIBUTED SYSTEMS (7) ---
    ("Data Structures & Algorithms in Practice", "dsa-in-practice",
     "Master algorithmic thinking, graph traversals (BFS/DFS), dynamic programming, and LeetCode problem patterns.",
     "NeetCode", "https://neetcode.io/", "course", "Intermediate", 16.0, 0.97,
     ["software-engineer"], "hands-on", ["dsa"], []),

    ("System Design for Scalable Distributed Systems", "system-design-scalable-systems",
     "Architect large-scale services: database sharding, caching strategies, rate limiting, and message queues.",
     "ByteByteGo", "https://bytebytego.com/", "course", "Advanced", 12.0, 0.98,
     ["software-engineer", "ai-ml-engineer"], "theory", ["system-design"], ["dsa", "rest-apis"]),

    ("Go Microservices & High-Throughput Concurrency", "golang-concurrency-microservices",
     "Build low-latency microservices with Go channels, mutexes, gRPC, and structured logging.",
     "Ardan Labs", "https://www.ardanlabs.com/training/", "course", "Intermediate", 10.0, 0.95,
     ["software-engineer"], "hands-on", ["golang", "rest-apis"], ["rest-apis"]),

    ("Designing Data-Intensive Applications (DDIA Guide)", "designing-data-intensive-applications",
     "Master reliable, scalable, and maintainable systems: replication logs, partition topologies, and consensus (Raft/Paxos).",
     "O'Reilly Media", "https://dataintensive.net/", "book", "Advanced", 14.0, 0.99,
     ["software-engineer", "ai-ml-engineer"], "theory", ["system-design", "sql"], ["system-design"]),

    ("Clean Code, Refactoring & Test-Driven Development (TDD)", "clean-code-tdd-practices",
     "Write maintainable, decoupled code with SOLID principles, unit test mocking, and CI automated test suites.",
     "Pluralsight", "https://www.pluralsight.com/courses/clean-architecture-patterns", "course", "Intermediate", 8.0, 0.93,
     ["software-engineer"], "hands-on", ["python", "git-cicd"], ["python"]),

    ("Distributed Caching & Message Queuing with Redis & Kafka", "redis-kafka-event-driven",
     "Event-driven architecture with Apache Kafka partitions, consumer groups, and Redis distributed caching.",
     "Confluent Developer", "https://developer.confluent.io/", "tutorial", "Intermediate", 7.0, 0.94,
     ["software-engineer"], "hands-on", ["system-design"], ["system-design"]),

    ("Capstone: Distributed Real-Time Financial Ledger", "capstone-distributed-financial-ledger",
     "Architect an ACID-compliant, high-throughput distributed transaction processing engine with event sourcing.",
     "PathFinder Capstone Series", "https://github.com/pathfinder/distributed-financial-ledger", "project", "Advanced", 20.0, 0.98,
     ["software-engineer"], "project", ["system-design", "dsa", "sql"], ["system-design", "dsa"])
]
