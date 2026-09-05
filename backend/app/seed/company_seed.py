"""
Stage 1 - Enterprise Companies & Roles Catalog (Phase 12 Stage 1)
Curated multi-domain enterprise dataset of 250+ top companies across India and Global sectors:
- Technology, Software, AI/ML, Cloud
- Indian IT Services & Global Consulting
- Indian Tech Unicorns & FinTech
- Semiconductor, VLSI, Electronics & Hardware
- Finance, Investment Banking & Capital Markets
- Healthcare, Pharma, Biotech & Medical Devices
- Automotive, EV, Aerospace & Heavy Engineering
- Management Consulting & Decision Analytics
"""

COMPANIES_SEED = [
    # ----------------------------------------------------
    # 1. GLOBAL BIG TECH & SOFTWARE PLATFORMS
    # ----------------------------------------------------
    {
        "slug": "google",
        "canonical_name": "Google LLC",
        "display_name": "Google",
        "aliases": ["Google", "Alphabet", "Google India", "Google LLC"],
        "website": "https://about.google",
        "careers_url": "https://careers.google.com",
        "industry": "Technology & Software",
        "company_type": "PRODUCT",
        "headquarters_country": "United States",
        "headquarters_region": "Mountain View, CA",
        "operating_countries": ["United States", "India", "United Kingdom", "Germany", "Global"],
        "operating_regions": ["Bengaluru", "Hyderabad", "Gurugram", "Mountain View"],
        "description": "Multinational technology leader specializing in search algorithms, cloud infrastructure, AI models (Gemini), Android, and consumer electronics.",
        "status": "ACTIVE",
        "is_verified": True,
        "verification_status": "VERIFIED",
        "source": "Corporate Filings & Employer Registry",
        "roles": [
            {
                "role_slug": "software-engineer",
                "canonical_role_name": "Software Engineer",
                "display_name": "Software Engineer (SWE)",
                "aliases": ["SWE", "L3 Software Engineer", "L4 Software Engineer", "Backend Software Engineer"],
                "career_slug": "software-engineer",
                "employment_type": "FULL_TIME",
                "experience_level": "ENTRY_LEVEL",
                "location_scope": "National",
                "remote_type": "HYBRID",
                "dsa_relevance": "VERY_HIGH",
                "cs_fundamentals_relevance": {"os": "HIGH", "dbms": "HIGH", "networks": "HIGH", "system_design": "HIGH"},
                "description": "Designs and develops distributed software architectures, highly scalable backend services, and algorithmic systems powering billions of queries."
            },
            {
                "role_slug": "ai-ml-engineer",
                "canonical_role_name": "AI/ML Engineer",
                "display_name": "Machine Learning Engineer",
                "aliases": ["MLE", "Research Engineer", "Applied AI Engineer"],
                "career_slug": "ai-ml-engineer",
                "employment_type": "FULL_TIME",
                "experience_level": "ENTRY_LEVEL",
                "location_scope": "National",
                "remote_type": "HYBRID",
                "dsa_relevance": "VERY_HIGH",
                "cs_fundamentals_relevance": {"os": "MEDIUM", "dbms": "MEDIUM", "networks": "MEDIUM", "system_design": "HIGH"},
                "description": "Builds and deploys state-of-the-art transformer architectures, LLM inference pipelines, and machine learning infrastructure."
            }
        ]
    },
    {
        "slug": "microsoft",
        "canonical_name": "Microsoft Corporation",
        "display_name": "Microsoft",
        "aliases": ["Microsoft", "Microsoft India", "MSFT"],
        "website": "https://www.microsoft.com",
        "careers_url": "https://careers.microsoft.com",
        "industry": "Technology & Software",
        "company_type": "PRODUCT",
        "headquarters_country": "United States",
        "headquarters_region": "Redmond, WA",
        "operating_countries": ["United States", "India", "Global"],
        "operating_regions": ["Bengaluru", "Hyderabad", "Noida", "Redmond"],
        "description": "Global enterprise technology corporation developing Azure cloud computing, Windows OS, Microsoft 365, and enterprise AI copilot solutions.",
        "status": "ACTIVE",
        "is_verified": True,
        "verification_status": "VERIFIED",
        "source": "Corporate Filings & Employer Registry",
        "roles": [
            {
                "role_slug": "software-engineer",
                "canonical_role_name": "Software Engineer",
                "display_name": "Software Engineer (Level 59/60)",
                "aliases": ["SDE", "SWE", "Cloud Engineer"],
                "career_slug": "software-engineer",
                "employment_type": "FULL_TIME",
                "experience_level": "ENTRY_LEVEL",
                "location_scope": "National",
                "remote_type": "HYBRID",
                "dsa_relevance": "VERY_HIGH",
                "cs_fundamentals_relevance": {"os": "HIGH", "dbms": "HIGH", "networks": "HIGH", "system_design": "HIGH"},
                "description": "Develops core Azure cloud services, distributed synchronization protocols, and enterprise productivity software."
            }
        ]
    },
    {
        "slug": "amazon",
        "canonical_name": "Amazon.com, Inc.",
        "display_name": "Amazon",
        "aliases": ["Amazon", "AWS", "Amazon India"],
        "website": "https://www.aboutamazon.com",
        "careers_url": "https://www.amazon.jobs",
        "industry": "Technology & Software",
        "company_type": "PRODUCT",
        "headquarters_country": "United States",
        "headquarters_region": "Seattle, WA",
        "operating_countries": ["United States", "India", "Global"],
        "operating_regions": ["Bengaluru", "Hyderabad", "Chennai", "Seattle"],
        "description": "Global e-commerce and cloud computing pioneer operating Amazon Web Services (AWS), consumer retail logistics, and voice assistant Alexa.",
        "status": "ACTIVE",
        "is_verified": True,
        "verification_status": "VERIFIED",
        "source": "Corporate Filings & Employer Registry",
        "roles": [
            {
                "role_slug": "sde-1",
                "canonical_role_name": "Software Engineer",
                "display_name": "Software Development Engineer I (SDE 1)",
                "aliases": ["SDE-1", "Software Development Engineer", "AWS SDE"],
                "career_slug": "software-engineer",
                "employment_type": "FULL_TIME",
                "experience_level": "ENTRY_LEVEL",
                "location_scope": "National",
                "remote_type": "HYBRID",
                "dsa_relevance": "VERY_HIGH",
                "cs_fundamentals_relevance": {"os": "HIGH", "dbms": "HIGH", "networks": "MEDIUM", "system_design": "HIGH"},
                "description": "Designs fault-tolerant cloud microservices, transactional databases, and algorithmic inventory management services."
            },
            {
                "role_slug": "cloud-devops-engineer",
                "canonical_role_name": "Cloud / DevOps Engineer",
                "display_name": "Cloud Support Associate / DevOps Engineer",
                "aliases": ["DevOps", "SysOps", "Cloud Engineer"],
                "career_slug": "cloud-devops-engineer",
                "employment_type": "FULL_TIME",
                "experience_level": "ENTRY_LEVEL",
                "location_scope": "National",
                "remote_type": "HYBRID",
                "dsa_relevance": "MEDIUM",
                "cs_fundamentals_relevance": {"os": "VERY_HIGH", "dbms": "HIGH", "networks": "VERY_HIGH", "system_design": "HIGH"},
                "description": "Architects infrastructure automation, CI/CD deployment pipelines, and multi-region AWS cloud availability."
            }
        ]
    },
    {
        "slug": "apple",
        "canonical_name": "Apple Inc.",
        "display_name": "Apple",
        "aliases": ["Apple", "Apple India"],
        "website": "https://www.apple.com",
        "careers_url": "https://www.apple.com/careers",
        "industry": "Technology & Software",
        "company_type": "PRODUCT",
        "headquarters_country": "United States",
        "headquarters_region": "Cupertino, CA",
        "operating_countries": ["United States", "India", "Global"],
        "operating_regions": ["Bengaluru", "Hyderabad", "Cupertino"],
        "description": "Consumer electronics, computer operating systems (iOS, macOS), and digital services innovator.",
        "status": "ACTIVE",
        "is_verified": True,
        "verification_status": "VERIFIED",
        "source": "Corporate Filings & Employer Registry",
        "roles": [
            {
                "role_slug": "software-engineer",
                "canonical_role_name": "Software Engineer",
                "display_name": "Software Engineer - System Software",
                "aliases": ["Core OS Engineer", "iOS Systems Engineer"],
                "career_slug": "software-engineer",
                "employment_type": "FULL_TIME",
                "experience_level": "ENTRY_LEVEL",
                "location_scope": "National",
                "remote_type": "ONSITE",
                "dsa_relevance": "VERY_HIGH",
                "cs_fundamentals_relevance": {"os": "VERY_HIGH", "dbms": "MEDIUM", "networks": "HIGH", "system_design": "HIGH"},
                "description": "Implements low-level kernel abstractions, concurrency primitives, and hardware-accelerated user space frameworks."
            }
        ]
    },
    {
        "slug": "meta",
        "canonical_name": "Meta Platforms, Inc.",
        "display_name": "Meta",
        "aliases": ["Meta", "Facebook", "Meta India", "Instagram", "WhatsApp"],
        "website": "https://about.meta.com",
        "careers_url": "https://www.metacareers.com",
        "industry": "Technology & Software",
        "company_type": "PRODUCT",
        "headquarters_country": "United States",
        "headquarters_region": "Menlo Park, CA",
        "operating_countries": ["United States", "India", "Global"],
        "operating_regions": ["Bengaluru", "Gurugram", "Menlo Park"],
        "description": "Pioneer in social media networking, open-source AI frameworks (PyTorch, Llama), and virtual reality platforms.",
        "status": "ACTIVE",
        "is_verified": True,
        "verification_status": "VERIFIED",
        "source": "Corporate Filings & Employer Registry",
        "roles": [
            {
                "role_slug": "software-engineer",
                "canonical_role_name": "Software Engineer",
                "display_name": "Software Engineer (E3/E4)",
                "aliases": ["Production Engineer", "Systems SWE"],
                "career_slug": "software-engineer",
                "employment_type": "FULL_TIME",
                "experience_level": "ENTRY_LEVEL",
                "location_scope": "National",
                "remote_type": "HYBRID",
                "dsa_relevance": "VERY_HIGH",
                "cs_fundamentals_relevance": {"os": "HIGH", "dbms": "HIGH", "networks": "HIGH", "system_design": "HIGH"},
                "description": "Develops massive-scale distributed graph databases, real-time messaging backends, and low-latency cache layers."
            }
        ]
    },
    {
        "slug": "netflix",
        "canonical_name": "Netflix, Inc.",
        "display_name": "Netflix",
        "aliases": ["Netflix", "Netflix India"],
        "website": "https://about.netflix.com",
        "careers_url": "https://jobs.netflix.com",
        "industry": "Technology & Software",
        "company_type": "PRODUCT",
        "headquarters_country": "United States",
        "headquarters_region": "Los Gatos, CA",
        "operating_countries": ["United States", "India", "Global"],
        "operating_regions": ["Mumbai", "Los Gatos"],
        "description": "World-leading entertainment and streaming subscription network with state-of-the-art distributed microservices.",
        "status": "ACTIVE",
        "is_verified": True,
        "verification_status": "VERIFIED",
        "source": "Corporate Filings & Employer Registry",
        "roles": [
            {
                "role_slug": "software-engineer",
                "canonical_role_name": "Software Engineer",
                "display_name": "Senior Software Engineer / Platform Engineer",
                "aliases": ["Platform Engineer", "Distributed Systems Engineer"],
                "career_slug": "software-engineer",
                "employment_type": "FULL_TIME",
                "experience_level": "MID_LEVEL",
                "location_scope": "National",
                "remote_type": "HYBRID",
                "dsa_relevance": "VERY_HIGH",
                "cs_fundamentals_relevance": {"os": "HIGH", "dbms": "VERY_HIGH", "networks": "VERY_HIGH", "system_design": "VERY_HIGH"},
                "description": "Architects resilient edge routing, high-concurrency video delivery networks, and fault-injection chaos engineering frameworks."
            }
        ]
    },
    {
        "slug": "adobe",
        "canonical_name": "Adobe Inc.",
        "display_name": "Adobe",
        "aliases": ["Adobe", "Adobe India", "Adobe Systems"],
        "website": "https://www.adobe.com",
        "careers_url": "https://www.adobe.com/careers",
        "industry": "Technology & Software",
        "company_type": "PRODUCT",
        "headquarters_country": "United States",
        "headquarters_region": "San Jose, CA",
        "operating_countries": ["United States", "India", "Global"],
        "operating_regions": ["Bengaluru", "Noida", "San Jose"],
        "description": "Global software innovator in digital creative media (Photoshop, Illustrator), PDF documents, and enterprise digital experience marketing.",
        "status": "ACTIVE",
        "is_verified": True,
        "verification_status": "VERIFIED",
        "source": "Corporate Filings & Employer Registry",
        "roles": [
            {
                "role_slug": "software-engineer",
                "canonical_role_name": "Software Engineer",
                "display_name": "Software Engineer (MTS-1)",
                "aliases": ["Member of Technical Staff", "SDE"],
                "career_slug": "software-engineer",
                "employment_type": "FULL_TIME",
                "experience_level": "ENTRY_LEVEL",
                "location_scope": "National",
                "remote_type": "HYBRID",
                "dsa_relevance": "VERY_HIGH",
                "cs_fundamentals_relevance": {"os": "HIGH", "dbms": "HIGH", "networks": "MEDIUM", "system_design": "HIGH"},
                "description": "Develops high-performance 2D/3D graphics rendering engines, cloud collaboration sync engines, and generative AI models."
            }
        ]
    },
    {
        "slug": "oracle",
        "canonical_name": "Oracle Corporation",
        "display_name": "Oracle",
        "aliases": ["Oracle", "Oracle India", "OCI"],
        "website": "https://www.oracle.com",
        "careers_url": "https://www.oracle.com/careers",
        "industry": "Technology & Software",
        "company_type": "PRODUCT",
        "headquarters_country": "United States",
        "headquarters_region": "Austin, TX",
        "operating_countries": ["United States", "India", "Global"],
        "operating_regions": ["Bengaluru", "Hyderabad", "Pune", "Austin"],
        "description": "Enterprise database and cloud infrastructure corporation powering Oracle Cloud Infrastructure (OCI) and enterprise applications.",
        "status": "ACTIVE",
        "is_verified": True,
        "verification_status": "VERIFIED",
        "source": "Corporate Filings & Employer Registry",
        "roles": [
            {
                "role_slug": "software-engineer",
                "canonical_role_name": "Software Engineer",
                "display_name": "Software Developer 1 (IC-1)",
                "aliases": ["OCI Developer", "Database Engineer"],
                "career_slug": "software-engineer",
                "employment_type": "FULL_TIME",
                "experience_level": "ENTRY_LEVEL",
                "location_scope": "National",
                "remote_type": "HYBRID",
                "dsa_relevance": "VERY_HIGH",
                "cs_fundamentals_relevance": {"os": "VERY_HIGH", "dbms": "VERY_HIGH", "networks": "HIGH", "system_design": "HIGH"},
                "description": "Implements relational database internals, B-tree indexing algorithms, and OCI bare-metal virtualization infrastructure."
            }
        ]
    },
    {
        "slug": "salesforce",
        "canonical_name": "Salesforce, Inc.",
        "display_name": "Salesforce",
        "aliases": ["Salesforce", "Salesforce India", "SFDC"],
        "website": "https://www.salesforce.com",
        "careers_url": "https://www.salesforce.com/company/careers",
        "industry": "Technology & Software",
        "company_type": "PRODUCT",
        "headquarters_country": "United States",
        "headquarters_region": "San Francisco, CA",
        "operating_countries": ["United States", "India", "Global"],
        "operating_regions": ["Hyderabad", "Bengaluru", "San Francisco"],
        "description": "World leader in customer relationship management (CRM) software, multi-tenant enterprise cloud platforms, and Agentforce AI workflows.",
        "status": "ACTIVE",
        "is_verified": True,
        "verification_status": "VERIFIED",
        "source": "Corporate Filings & Employer Registry",
        "roles": [
            {
                "role_slug": "software-engineer",
                "canonical_role_name": "Software Engineer",
                "display_name": "Associate Member of Technical Staff (AMTS)",
                "aliases": ["AMTS", "MTS", "Software Engineer"],
                "career_slug": "software-engineer",
                "employment_type": "FULL_TIME",
                "experience_level": "ENTRY_LEVEL",
                "location_scope": "National",
                "remote_type": "HYBRID",
                "dsa_relevance": "VERY_HIGH",
                "cs_fundamentals_relevance": {"os": "HIGH", "dbms": "VERY_HIGH", "networks": "HIGH", "system_design": "HIGH"},
                "description": "Builds multi-tenant database microservices, declarative metadata application frameworks, and automated CRM pipelines."
            }
        ]
    },
    {
        "slug": "nvidia",
        "canonical_name": "NVIDIA Corporation",
        "display_name": "Nvidia",
        "aliases": ["Nvidia", "NVIDIA India"],
        "website": "https://www.nvidia.com",
        "careers_url": "https://www.nvidia.com/careers",
        "industry": "Semiconductor & Hardware",
        "company_type": "SEMICONDUCTOR",
        "headquarters_country": "United States",
        "headquarters_region": "Santa Clara, CA",
        "operating_countries": ["United States", "India", "Global"],
        "operating_regions": ["Bengaluru", "Pune", "Hyderabad", "Santa Clara"],
        "description": "Global leader in accelerated graphics computing, CUDA architecture, AI supercomputers, and deep learning silicon hardware.",
        "status": "ACTIVE",
        "is_verified": True,
        "verification_status": "VERIFIED",
        "source": "Corporate Filings & Employer Registry",
        "roles": [
            {
                "role_slug": "vlsi-hardware-engineer",
                "canonical_role_name": "VLSI Hardware Engineer",
                "display_name": "ASIC Design / Verification Engineer",
                "aliases": ["ASIC Engineer", "Hardware Engineer", "RTL Verification Engineer"],
                "career_slug": "vlsi-hardware-engineer",
                "employment_type": "FULL_TIME",
                "experience_level": "ENTRY_LEVEL",
                "location_scope": "National",
                "remote_type": "HYBRID",
                "dsa_relevance": "MEDIUM",
                "cs_fundamentals_relevance": {"os": "HIGH", "dbms": "LOW", "networks": "MEDIUM", "system_design": "MEDIUM"},
                "description": "Verifies GPU execution blocks, RTL logic synthesis using SystemVerilog/UVM, and static timing constraints."
            },
            {
                "role_slug": "software-engineer",
                "canonical_role_name": "Software Engineer",
                "display_name": "System Software Engineer (CUDA / AI)",
                "aliases": ["CUDA Engineer", "Compiler Engineer"],
                "career_slug": "software-engineer",
                "employment_type": "FULL_TIME",
                "experience_level": "ENTRY_LEVEL",
                "location_scope": "National",
                "remote_type": "HYBRID",
                "dsa_relevance": "VERY_HIGH",
                "cs_fundamentals_relevance": {"os": "VERY_HIGH", "dbms": "LOW", "networks": "HIGH", "system_design": "HIGH"},
                "description": "Builds high-performance parallel computation libraries (cuDNN, TensorRT), LLVM compiler backends, and low-level GPU device drivers."
            }
        ]
    },

    # ----------------------------------------------------
    # 2. INDIAN IT SERVICES & GLOBAL CONSULTING
    # ----------------------------------------------------
    {
        "slug": "tcs",
        "canonical_name": "Tata Consultancy Services Limited",
        "display_name": "TCS",
        "aliases": ["TCS", "Tata Consultancy Services", "TCS Ltd"],
        "website": "https://www.tcs.com",
        "careers_url": "https://www.tcs.com/careers",
        "industry": "IT Services & Consulting",
        "company_type": "SERVICES",
        "headquarters_country": "India",
        "headquarters_region": "Mumbai, Maharashtra",
        "operating_countries": ["India", "United States", "United Kingdom", "Global"],
        "operating_regions": ["Mumbai", "Bengaluru", "Hyderabad", "Chennai", "Pune", "Kolkata", "Delhi"],
        "description": "India's largest multinational information technology services, consulting, and business solutions enterprise operating in 50+ countries.",
        "status": "ACTIVE",
        "is_verified": True,
        "verification_status": "VERIFIED",
        "source": "Corporate Filings & Employer Registry",
        "roles": [
            {
                "role_slug": "assistant-system-engineer",
                "canonical_role_name": "Software Engineer",
                "display_name": "Assistant System Engineer (Ninja / Digital / Prime)",
                "aliases": ["ASE", "TCS Digital Engineer", "TCS Ninja", "TCS Prime Developer"],
                "career_slug": "software-engineer",
                "employment_type": "FULL_TIME",
                "experience_level": "ENTRY_LEVEL",
                "location_scope": "National",
                "remote_type": "HYBRID",
                "dsa_relevance": "HIGH",
                "cs_fundamentals_relevance": {"os": "HIGH", "dbms": "VERY_HIGH", "networks": "MEDIUM", "system_design": "MEDIUM"},
                "description": "Builds enterprise applications, integration layers, database services, and cloud modernization solutions for global enterprise clients."
            }
        ]
    },
    {
        "slug": "infosys",
        "canonical_name": "Infosys Limited",
        "display_name": "Infosys",
        "aliases": ["Infosys", "Infosys Ltd", "Infy"],
        "website": "https://www.infosys.com",
        "careers_url": "https://www.infosys.com/careers",
        "industry": "IT Services & Consulting",
        "company_type": "SERVICES",
        "headquarters_country": "India",
        "headquarters_region": "Bengaluru, Karnataka",
        "operating_countries": ["India", "United States", "Global"],
        "operating_regions": ["Bengaluru", "Mysuru", "Pune", "Hyderabad", "Chennai", "Bhubaneswar"],
        "description": "Global leader in next-generation digital services, cloud consulting (Infosys Cobalt), and AI solutions (Infosys Topaz).",
        "status": "ACTIVE",
        "is_verified": True,
        "verification_status": "VERIFIED",
        "source": "Corporate Filings & Employer Registry",
        "roles": [
            {
                "role_slug": "systems-engineer",
                "canonical_role_name": "Software Engineer",
                "display_name": "Systems Engineer / Specialist Programmer (DSE/SP)",
                "aliases": ["SE", "Specialist Programmer", "Digital Specialist Engineer"],
                "career_slug": "software-engineer",
                "employment_type": "FULL_TIME",
                "experience_level": "ENTRY_LEVEL",
                "location_scope": "National",
                "remote_type": "HYBRID",
                "dsa_relevance": "VERY_HIGH",
                "cs_fundamentals_relevance": {"os": "HIGH", "dbms": "HIGH", "networks": "MEDIUM", "system_design": "MEDIUM"},
                "description": "Designs modern full-stack web applications, REST APIs, microservices, and enterprise automation pipelines."
            }
        ]
    },
    {
        "slug": "wipro",
        "canonical_name": "Wipro Limited",
        "display_name": "Wipro",
        "aliases": ["Wipro", "Wipro Technologies"],
        "website": "https://www.wipro.com",
        "careers_url": "https://careers.wipro.com",
        "industry": "IT Services & Consulting",
        "company_type": "SERVICES",
        "headquarters_country": "India",
        "headquarters_region": "Bengaluru, Karnataka",
        "operating_countries": ["India", "United States", "Global"],
        "operating_regions": ["Bengaluru", "Hyderabad", "Chennai", "Pune"],
        "description": "Leading technology services and consulting enterprise specializing in cloud modernization, cognitive AI, and cybersecurity transformation.",
        "status": "ACTIVE",
        "is_verified": True,
        "verification_status": "VERIFIED",
        "source": "Corporate Filings & Employer Registry",
        "roles": [
            {
                "role_slug": "project-engineer",
                "canonical_role_name": "Software Engineer",
                "display_name": "Project Engineer (Elite / Turbo)",
                "aliases": ["Project Engineer", "Wipro Turbo", "Wipro Elite"],
                "career_slug": "software-engineer",
                "employment_type": "FULL_TIME",
                "experience_level": "ENTRY_LEVEL",
                "location_scope": "National",
                "remote_type": "HYBRID",
                "dsa_relevance": "HIGH",
                "cs_fundamentals_relevance": {"os": "HIGH", "dbms": "HIGH", "networks": "MEDIUM", "system_design": "MEDIUM"},
                "description": "Develops enterprise software components, handles cloud deployments, and implements automated test suites."
            }
        ]
    },

    # ----------------------------------------------------
    # 3. INDIAN TECH UNICORNS & FINTECH
    # ----------------------------------------------------
    {
        "slug": "flipkart",
        "canonical_name": "Flipkart Private Limited",
        "display_name": "Flipkart",
        "aliases": ["Flipkart", "Walmart Flipkart"],
        "website": "https://www.flipkart.com",
        "careers_url": "https://www.flipkartcareers.com",
        "industry": "Technology & Software",
        "company_type": "PRODUCT",
        "headquarters_country": "India",
        "headquarters_region": "Bengaluru, Karnataka",
        "operating_countries": ["India"],
        "operating_regions": ["Bengaluru"],
        "description": "India's leading consumer e-commerce marketplace backed by Walmart, handling billions of orders with cutting-edge supply chain tech.",
        "status": "ACTIVE",
        "is_verified": True,
        "verification_status": "VERIFIED",
        "source": "Corporate Filings & Employer Registry",
        "roles": [
            {
                "role_slug": "software-development-engineer-1",
                "canonical_role_name": "Software Engineer",
                "display_name": "Software Development Engineer I (SDE-1)",
                "aliases": ["SDE-1", "SDE 1", "Backend Developer"],
                "career_slug": "software-engineer",
                "employment_type": "FULL_TIME",
                "experience_level": "ENTRY_LEVEL",
                "location_scope": "National",
                "remote_type": "HYBRID",
                "dsa_relevance": "VERY_HIGH",
                "cs_fundamentals_relevance": {"os": "HIGH", "dbms": "VERY_HIGH", "networks": "HIGH", "system_design": "HIGH"},
                "description": "Engineers high-throughput checkout microservices, catalog search indices, and real-time inventory locking mechanisms."
            },
            {
                "role_slug": "ui-ux-designer",
                "canonical_role_name": "UI/UX Designer",
                "display_name": "Product Designer 1",
                "aliases": ["Product Designer", "UX Designer"],
                "career_slug": "ui-ux-designer",
                "employment_type": "FULL_TIME",
                "experience_level": "ENTRY_LEVEL",
                "location_scope": "National",
                "remote_type": "HYBRID",
                "dsa_relevance": "NOT_APPLICABLE",
                "cs_fundamentals_relevance": {},
                "description": "Designs intuitive consumer checkout interfaces, vernacular search flows, and mobile-first e-commerce experiences."
            }
        ]
    },
    {
        "slug": "swiggy",
        "canonical_name": "Swiggy Limited",
        "display_name": "Swiggy",
        "aliases": ["Swiggy", "Bundl Technologies"],
        "website": "https://www.swiggy.com",
        "careers_url": "https://careers.swiggy.com",
        "industry": "Technology & Software",
        "company_type": "PRODUCT",
        "headquarters_country": "India",
        "headquarters_region": "Bengaluru, Karnataka",
        "operating_countries": ["India"],
        "operating_regions": ["Bengaluru"],
        "description": "India's pioneer on-demand food delivery and Instamart quick-commerce platform powered by algorithmic logistics routing.",
        "status": "ACTIVE",
        "is_verified": True,
        "verification_status": "VERIFIED",
        "source": "Corporate Filings & Employer Registry",
        "roles": [
            {
                "role_slug": "software-engineer",
                "canonical_role_name": "Software Engineer",
                "display_name": "Software Development Engineer (SDE-1)",
                "aliases": ["SDE-1", "Backend Engineer"],
                "career_slug": "software-engineer",
                "employment_type": "FULL_TIME",
                "experience_level": "ENTRY_LEVEL",
                "location_scope": "National",
                "remote_type": "HYBRID",
                "dsa_relevance": "VERY_HIGH",
                "cs_fundamentals_relevance": {"os": "HIGH", "dbms": "VERY_HIGH", "networks": "HIGH", "system_design": "HIGH"},
                "description": "Builds sub-second hyper-local dispatch engines, routing optimization algorithms, and high-concurrency order placement queues."
            }
        ]
    },
    {
        "slug": "razorpay",
        "canonical_name": "Razorpay Software Private Limited",
        "display_name": "Razorpay",
        "aliases": ["Razorpay"],
        "website": "https://razorpay.com",
        "careers_url": "https://razorpay.com/jobs",
        "industry": "Financial Services & FinTech",
        "company_type": "PRODUCT",
        "headquarters_country": "India",
        "headquarters_region": "Bengaluru, Karnataka",
        "operating_countries": ["India", "Southeast Asia"],
        "operating_regions": ["Bengaluru"],
        "description": "Full-stack financial services and payments platform simplifying payment gateways, neo-banking, and corporate payroll across India.",
        "status": "ACTIVE",
        "is_verified": True,
        "verification_status": "VERIFIED",
        "source": "Corporate Filings & Employer Registry",
        "roles": [
            {
                "role_slug": "software-engineer",
                "canonical_role_name": "Software Engineer",
                "display_name": "Software Development Engineer I (SDE 1)",
                "aliases": ["SDE 1", "FinTech SDE"],
                "career_slug": "software-engineer",
                "employment_type": "FULL_TIME",
                "experience_level": "ENTRY_LEVEL",
                "location_scope": "National",
                "remote_type": "HYBRID",
                "dsa_relevance": "VERY_HIGH",
                "cs_fundamentals_relevance": {"os": "HIGH", "dbms": "VERY_HIGH", "networks": "HIGH", "system_design": "HIGH"},
                "description": "Develops mission-critical payment settlement ledgers, automated webhook delivery engines, and UPI 2.0 integration microservices."
            }
        ]
    },
    {
        "slug": "zerodha",
        "canonical_name": "Zerodha Broking Limited",
        "display_name": "Zerodha",
        "aliases": ["Zerodha", "Kite"],
        "website": "https://zerodha.com",
        "careers_url": "https://zerodha.com/careers",
        "industry": "Financial Services & FinTech",
        "company_type": "PRODUCT",
        "headquarters_country": "India",
        "headquarters_region": "Bengaluru, Karnataka",
        "operating_countries": ["India"],
        "operating_regions": ["Bengaluru"],
        "description": "India's biggest discount retail stock brokerage firm, pioneer of zero-brokerage trading and ultra-fast Kite trading technology.",
        "status": "ACTIVE",
        "is_verified": True,
        "verification_status": "VERIFIED",
        "source": "Corporate Filings & Employer Registry",
        "roles": [
            {
                "role_slug": "software-engineer",
                "canonical_role_name": "Software Engineer",
                "display_name": "Systems / Backend Engineer",
                "aliases": ["Go Developer", "Backend Engineer"],
                "career_slug": "software-engineer",
                "employment_type": "FULL_TIME",
                "experience_level": "ENTRY_LEVEL",
                "location_scope": "National",
                "remote_type": "ONSITE",
                "dsa_relevance": "VERY_HIGH",
                "cs_fundamentals_relevance": {"os": "VERY_HIGH", "dbms": "VERY_HIGH", "networks": "VERY_HIGH", "system_design": "VERY_HIGH"},
                "description": "Builds high-frequency tick parsing engines, WebSocket streaming protocols, and ultra-reliable trading order execution systems in Go and Python."
            }
        ]
    },

    # ----------------------------------------------------
    # 4. SEMICONDUCTOR & VLSI LEADERS
    # ----------------------------------------------------
    {
        "slug": "qualcomm-india",
        "canonical_name": "Qualcomm India Private Limited",
        "display_name": "Qualcomm India",
        "aliases": ["Qualcomm India", "Qualcomm"],
        "website": "https://www.qualcomm.com",
        "careers_url": "https://www.qualcomm.com/company/careers",
        "industry": "Semiconductor & Hardware",
        "company_type": "SEMICONDUCTOR",
        "headquarters_country": "India",
        "headquarters_region": "Hyderabad, Telangana",
        "operating_countries": ["India"],
        "operating_regions": ["Hyderabad", "Bengaluru", "Chennai"],
        "description": "Premier engineering center architecting Snapdragon SoCs, 5G RF modem basebands, and edge AI microarchitectures.",
        "status": "ACTIVE",
        "is_verified": True,
        "verification_status": "VERIFIED",
        "source": "Corporate Filings & Employer Registry",
        "roles": [
            {
                "role_slug": "vlsi-engineer",
                "canonical_role_name": "VLSI Hardware Engineer",
                "display_name": "Associate Hardware Engineer (VLSI / ASIC)",
                "aliases": ["ASIC Design Engineer", "Design Verification Engineer"],
                "career_slug": "vlsi-hardware-engineer",
                "employment_type": "FULL_TIME",
                "experience_level": "ENTRY_LEVEL",
                "location_scope": "National",
                "remote_type": "ONSITE",
                "dsa_relevance": "MEDIUM",
                "cs_fundamentals_relevance": {"os": "HIGH", "dbms": "LOW", "networks": "HIGH", "system_design": "MEDIUM"},
                "description": "Implements RTL microarchitecture, synthesis constraints, formal verification, and clock domain crossing verification."
            }
        ]
    },
    {
        "slug": "texas-instruments",
        "canonical_name": "Texas Instruments India",
        "display_name": "Texas Instruments",
        "aliases": ["TI", "Texas Instruments", "TI India"],
        "website": "https://www.ti.com",
        "careers_url": "https://careers.ti.com",
        "industry": "Semiconductor & Hardware",
        "company_type": "SEMICONDUCTOR",
        "headquarters_country": "United States",
        "headquarters_region": "Dallas, TX",
        "operating_countries": ["United States", "India", "Global"],
        "operating_regions": ["Bengaluru", "Dallas"],
        "description": "Global designer and manufacturer of analog and embedded processing semiconductor chips with historical Bengaluru R&D presence.",
        "status": "ACTIVE",
        "is_verified": True,
        "verification_status": "VERIFIED",
        "source": "Corporate Filings & Employer Registry",
        "roles": [
            {
                "role_slug": "digital-design-engineer",
                "canonical_role_name": "VLSI Hardware Engineer",
                "display_name": "Digital Design & Verification Engineer",
                "aliases": ["Digital Design Engineer", "Analog Layout Engineer"],
                "career_slug": "vlsi-hardware-engineer",
                "employment_type": "FULL_TIME",
                "experience_level": "ENTRY_LEVEL",
                "location_scope": "National",
                "remote_type": "ONSITE",
                "dsa_relevance": "MEDIUM",
                "cs_fundamentals_relevance": {"os": "MEDIUM", "dbms": "LOW", "networks": "MEDIUM", "system_design": "MEDIUM"},
                "description": "Designs mixed-signal interfaces, microcontroller peripheral logic, and power management IC verification testbenches."
            }
        ]
    },

    # ----------------------------------------------------
    # 5. GLOBAL FINANCE & INVESTMENT BANKING
    # ----------------------------------------------------
    {
        "slug": "goldman-sachs",
        "canonical_name": "Goldman Sachs Group, Inc.",
        "display_name": "Goldman Sachs",
        "aliases": ["Goldman Sachs", "GS", "Goldman Sachs Services"],
        "website": "https://www.goldmansachs.com",
        "careers_url": "https://www.goldmansachs.com/careers",
        "industry": "Financial Services & FinTech",
        "company_type": "FINANCIAL_SERVICES",
        "headquarters_country": "United States",
        "headquarters_region": "New York, NY",
        "operating_countries": ["United States", "India", "Global"],
        "operating_regions": ["Bengaluru", "Hyderabad", "New York"],
        "description": "Global investment banking, securities, and investment management firm with premier engineering operations in India.",
        "status": "ACTIVE",
        "is_verified": True,
        "verification_status": "VERIFIED",
        "source": "Corporate Filings & Employer Registry",
        "roles": [
            {
                "role_slug": "software-engineer",
                "canonical_role_name": "Software Engineer",
                "display_name": "Engineering Analyst (Software Engineer)",
                "aliases": ["Analyst", "Software Engineer", "Quant Developer"],
                "career_slug": "software-engineer",
                "employment_type": "FULL_TIME",
                "experience_level": "ENTRY_LEVEL",
                "location_scope": "National",
                "remote_type": "HYBRID",
                "dsa_relevance": "VERY_HIGH",
                "cs_fundamentals_relevance": {"os": "HIGH", "dbms": "VERY_HIGH", "networks": "HIGH", "system_design": "HIGH"},
                "description": "Builds high-frequency trading platforms, risk calculation engines, and quantitative investment analytics systems."
            }
        ]
    },
    {
        "slug": "jpmorgan-chase",
        "canonical_name": "JPMorgan Chase & Co.",
        "display_name": "J.P. Morgan",
        "aliases": ["JPMorgan", "JPMorgan Chase", "JPMC"],
        "website": "https://www.jpmorganchase.com",
        "careers_url": "https://careers.jpmorgan.com",
        "industry": "Financial Services & FinTech",
        "company_type": "FINANCIAL_SERVICES",
        "headquarters_country": "United States",
        "headquarters_region": "New York, NY",
        "operating_countries": ["United States", "India", "Global"],
        "operating_regions": ["Bengaluru", "Hyderabad", "Mumbai", "New York"],
        "description": "Largest financial institution in the US delivering corporate and investment banking, commercial banking, and treasury services.",
        "status": "ACTIVE",
        "is_verified": True,
        "verification_status": "VERIFIED",
        "source": "Corporate Filings & Employer Registry",
        "roles": [
            {
                "role_slug": "software-engineer",
                "canonical_role_name": "Software Engineer",
                "display_name": "Software Engineer (SEP Program)",
                "aliases": ["SEP Analyst", "Software Engineer 1"],
                "career_slug": "software-engineer",
                "employment_type": "FULL_TIME",
                "experience_level": "ENTRY_LEVEL",
                "location_scope": "National",
                "remote_type": "HYBRID",
                "dsa_relevance": "VERY_HIGH",
                "cs_fundamentals_relevance": {"os": "HIGH", "dbms": "VERY_HIGH", "networks": "HIGH", "system_design": "HIGH"},
                "description": "Develops enterprise cloud microservices, payment transaction routers, and automated regulatory compliance pipelines."
            }
        ]
    }
]

# Script to load remaining companies procedurally to reach 250+ enterprise companies
def get_all_companies():
    from scripts.build_company_seed import generate_catalog
    raw_list = generate_catalog()
    
    # Existing slug map
    existing_map = {c["slug"]: c for c in COMPANIES_SEED}
    
    for item in raw_list:
        slug = item[0]
        if slug in existing_map:
            continue
        
        comp = {
            "slug": slug,
            "canonical_name": item[1],
            "display_name": item[2],
            "aliases": item[3],
            "website": item[4],
            "careers_url": item[5],
            "industry": item[6],
            "company_type": item[7],
            "headquarters_country": item[8],
            "headquarters_region": item[9],
            "operating_countries": item[10],
            "operating_regions": item[11],
            "description": item[12],
            "status": "ACTIVE",
            "is_verified": True,
            "verification_status": "VERIFIED",
            "source": "Corporate Filings & Employer Registry",
            "roles": []
        }
        COMPANIES_SEED.append(comp)
    
    return COMPANIES_SEED
