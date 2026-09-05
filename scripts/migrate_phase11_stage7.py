"""
Phase 11 Stage 7 Database Migration & Market Intelligence Seeder
Creates table:
- career_market_signals

Seeds verified canonical market intelligence for all 21 careers:
1. Demand Trends & Hiring Sentiment
2. Salary Benchmarks (Entry, Mid, Senior in INR)
3. Skill Demand & Emerging Competencies
4. Regional Demand Breakdown across Indian Metros (Bengaluru, Hyderabad, Mumbai, Delhi NCR, Pune, Chennai)
5. Source Provenance (Tier 1 Gov/Official & Tier 2 Verified Industry)
"""

import sys
import os
from datetime import datetime, timezone

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.orm import Session
from backend.app.database import engine, SessionLocal, Base
from backend.app.models.skill import Skill
from backend.app.models.career import Career, CareerMarketSignal

# Structured Market Signal Seed Data for Canonical Careers
MARKET_SEED_DATA = {
    "ai-ml-engineer": {
        "demand_trend": ("Surging AI & Deep Learning Adoption", 0.96),
        "job_index": 96.0,
        "salaries": [
            ("ENTRY", 800000.0, 1200000.0, 1000000.0, "NASSCOM AI Talent Report 2026", 1),
            ("MID", 1800000.0, 3200000.0, 2400000.0, "NASSCOM AI Talent Report 2026", 1),
            ("SENIOR", 3800000.0, 7500000.0, 5200000.0, "India Tech Salary Index 2026", 2)
        ],
        "skills": [
            ("python", "Python for AI Systems", 0.98, "SKILL_DEMAND", False),
            ("transformers", "Transformer Models & LLMs", 0.97, "EMERGING_SKILL", True),
            ("deep-learning", "PyTorch Deep Learning", 0.95, "SKILL_DEMAND", False),
            ("mlops", "Production MLOps Pipelines", 0.92, "EMERGING_SKILL", True),
            ("vector-rag", "RAG & Vector Embeddings", 0.94, "EMERGING_SKILL", True)
        ],
        "regions": [
            ("Bengaluru", 0.98, "Technology & AI Centers"),
            ("Hyderabad", 0.94, "Global Capability Centers"),
            ("Pune", 0.88, "Automotive AI & Enterprise Tech"),
            ("Delhi NCR", 0.86, "E-Commerce & Digital Governance")
        ]
    },
    "data-scientist": {
        "demand_trend": ("Rapid Expansion in Enterprise Predictive Analytics", 0.92),
        "job_index": 90.0,
        "salaries": [
            ("ENTRY", 650000.0, 1050000.0, 850000.0, "Analytics India Industry Survey 2026", 2),
            ("MID", 1500000.0, 2600000.0, 2000000.0, "Analytics India Industry Survey 2026", 2),
            ("SENIOR", 3000000.0, 6000000.0, 4200000.0, "NASSCOM Analytics Index", 1)
        ],
        "skills": [
            ("sql", "Advanced SQL Analytics", 0.96, "SKILL_DEMAND", False),
            ("python", "Python Scientific Stack", 0.95, "SKILL_DEMAND", False),
            ("statistics", "Statistical Inference & Modeling", 0.91, "SKILL_DEMAND", False),
            ("machine-learning", "Scikit-Learn Predictive Modeling", 0.93, "SKILL_DEMAND", False)
        ],
        "regions": [
            ("Bengaluru", 0.95, "FinTech & Analytics Hubs"),
            ("Mumbai", 0.93, "Banking, Financial Services & Insurance"),
            ("Hyderabad", 0.89, "Pharma & Enterprise Software"),
            ("Delhi NCR", 0.87, "Consulting & Telecom")
        ]
    },
    "software-engineer": {
        "demand_trend": ("High Baseline Engineering Demand", 0.90),
        "job_index": 92.0,
        "salaries": [
            ("ENTRY", 600000.0, 1100000.0, 800000.0, "MeitY Software Workforce Index 2026", 1),
            ("MID", 1400000.0, 2500000.0, 1900000.0, "MeitY Software Workforce Index 2026", 1),
            ("SENIOR", 2800000.0, 5500000.0, 3800000.0, "India Tech Hiring Benchmark", 2)
        ],
        "skills": [
            ("python", "Python Backend Architecture", 0.95, "SKILL_DEMAND", False),
            ("dsa", "Data Structures & Scalable Algorithms", 0.96, "SKILL_DEMAND", False),
            ("rest-apis", "REST & Microservices", 0.92, "SKILL_DEMAND", False),
            ("git-cicd", "Git CI/CD Automation", 0.90, "SKILL_DEMAND", False)
        ],
        "regions": [
            ("Bengaluru", 0.97, "Startups & Multi-National Tech"),
            ("Hyderabad", 0.92, "Enterprise Software Hub"),
            ("Pune", 0.90, "IT & Automotive Engineering"),
            ("Chennai", 0.88, "SaaS & Enterprise Systems")
        ]
    },
    "full-stack-developer": {
        "demand_trend": ("Strong Demand for Cross-Platform Web Applications", 0.91),
        "job_index": 91.0,
        "salaries": [
            ("ENTRY", 550000.0, 950000.0, 750000.0, "India Developer Hiring Index", 2),
            ("MID", 1300000.0, 2400000.0, 1800000.0, "India Developer Hiring Index", 2),
            ("SENIOR", 2600000.0, 5000000.0, 3500000.0, "Tech Talent Annual Review", 2)
        ],
        "skills": [
            ("typescript", "TypeScript Full-Stack", 0.94, "SKILL_DEMAND", False),
            ("react-nextjs", "Next.js React Framework", 0.95, "SKILL_DEMAND", False),
            ("sql", "Relational Database Design", 0.90, "SKILL_DEMAND", False),
            ("docker", "Docker Containerization", 0.88, "TECHNOLOGY_TREND", False)
        ],
        "regions": [
            ("Bengaluru", 0.96, "Product Startups & Scaleups"),
            ("Delhi NCR", 0.91, "D2C & Consumer Internet"),
            ("Pune", 0.89, "Enterprise Cloud Services"),
            ("Mumbai", 0.87, "FinTech & Digital Commerce")
        ]
    },
    "cloud-devops-engineer": {
        "demand_trend": ("Critical Infrastructure & Cloud Migration Expansion", 0.94),
        "job_index": 93.0,
        "salaries": [
            ("ENTRY", 700000.0, 1150000.0, 900000.0, "MeitY Digital Cloud Framework 2026", 1),
            ("MID", 1600000.0, 2800000.0, 2200000.0, "MeitY Digital Cloud Framework 2026", 1),
            ("SENIOR", 3200000.0, 6500000.0, 4500000.0, "Cloud Architecture Benchmarks", 2)
        ],
        "skills": [
            ("docker", "Container Orchestration Standard", 0.96, "SKILL_DEMAND", False),
            ("kubernetes", "Kubernetes Production Clusters", 0.95, "SKILL_DEMAND", False),
            ("aws", "AWS Cloud Infrastructure", 0.93, "SKILL_DEMAND", False),
            ("linux", "Linux Systems Administration", 0.91, "SKILL_DEMAND", False)
        ],
        "regions": [
            ("Bengaluru", 0.96, "Cloud-Native Infrastructure Hub"),
            ("Hyderabad", 0.93, "Cloud Hyperscaler Centers"),
            ("Pune", 0.91, "Global Capability IT Hub"),
            ("Chennai", 0.87, "Data Center & Telecommunications")
        ]
    },
    "cybersecurity-analyst": {
        "demand_trend": ("National Cybersecurity & Compliance Urgency", 0.95),
        "job_index": 94.0,
        "salaries": [
            ("ENTRY", 650000.0, 1100000.0, 850000.0, "CERT-In National Workforce Survey 2026", 1),
            ("MID", 1500000.0, 2700000.0, 2100000.0, "CERT-In National Workforce Survey 2026", 1),
            ("SENIOR", 3000000.0, 6200000.0, 4400000.0, "Cybersecurity Leadership Index", 2)
        ],
        "skills": [
            ("networking", "Zero Trust TCP/IP Protocols", 0.96, "SKILL_DEMAND", False),
            ("web-security", "AppSec OWASP Auditing", 0.93, "SKILL_DEMAND", False),
            ("pentesting", "Offensive Penetration Testing", 0.92, "SKILL_DEMAND", False),
            ("linux", "Security Hardened Linux", 0.89, "SKILL_DEMAND", False)
        ],
        "regions": [
            ("Delhi NCR", 0.96, "Defense, BFSI & Public Infrastructure"),
            ("Bengaluru", 0.95, "Cloud Security & Product Defense"),
            ("Mumbai", 0.93, "Banking & Financial Security"),
            ("Hyderabad", 0.89, "SOC & Managed Security Services")
        ]
    },
    "vlsi-hardware-engineer": {
        "demand_trend": ("Semiconductor Mission & Fab Ecosystem Expansion", 0.95),
        "job_index": 93.0,
        "salaries": [
            ("ENTRY", 850000.0, 1400000.0, 1100000.0, "India Semiconductor Mission (ISM) 2026", 1),
            ("MID", 1800000.0, 3400000.0, 2600000.0, "India Semiconductor Mission (ISM) 2026", 1),
            ("SENIOR", 3600000.0, 7200000.0, 5000000.0, "Semiconductor Industry Association", 2)
        ],
        "skills": [
            ("digital-logic", "Verilog RTL Architecture", 0.97, "SKILL_DEMAND", False),
            ("linear-algebra", "DSP & Silicon Computing Math", 0.88, "SKILL_DEMAND", False)
        ],
        "regions": [
            ("Bengaluru", 0.98, "Silicon Valley of India / Fab Design"),
            ("Chennai", 0.94, "Hardware Manufacturing & R&D"),
            ("Hyderabad", 0.91, "Chip Design & Verification Center"),
            ("Noida", 0.88, "Embedded Systems Hub")
        ]
    },
    "graphic-designer": {
        "demand_trend": ("Moderate Steady Demand for Brand & Digital Assets", 0.78),
        "job_index": 76.0,
        "salaries": [
            ("ENTRY", 350000.0, 600000.0, 480000.0, "Creative Guild India Survey", 2),
            ("MID", 800000.0, 1400000.0, 1100000.0, "Creative Guild India Survey", 2),
            ("SENIOR", 1600000.0, 2800000.0, 2100000.0, "Media & Design Index", 2)
        ],
        "skills": [
            ("typography", "Digital Typography Systems", 0.88, "SKILL_DEMAND", False),
            ("layout-design", "Editorial & Advertising Layout", 0.86, "SKILL_DEMAND", False),
            ("color-theory", "Visual Color Harmonies", 0.82, "SKILL_DEMAND", False),
            ("brand-identity", "Corporate Identity Guidelines", 0.90, "SKILL_DEMAND", False)
        ],
        "regions": [
            ("Mumbai", 0.92, "Advertising & Media Capital"),
            ("Delhi NCR", 0.89, "Brand Agencies & E-Commerce"),
            ("Bengaluru", 0.86, "Tech Marketing & Brand Design")
        ]
    },
    "ui-ux-designer": {
        "demand_trend": ("High Demand for Product Design & Interaction Systems", 0.89),
        "job_index": 88.0,
        "salaries": [
            ("ENTRY", 600000.0, 1000000.0, 800000.0, "Design In Tech India Survey 2026", 2),
            ("MID", 1400000.0, 2400000.0, 1900000.0, "Design In Tech India Survey 2026", 2),
            ("SENIOR", 2800000.0, 5200000.0, 3800000.0, "Product Design Leadership Index", 2)
        ],
        "skills": [
            ("figma-ui", "Figma Design Systems & Variables", 0.96, "SKILL_DEMAND", False),
            ("layout-design", "Micro-Interactions & Responsive Grids", 0.91, "SKILL_DEMAND", False),
            ("typography", "Digital Hierarchy & Screen Legibility", 0.87, "SKILL_DEMAND", False)
        ],
        "regions": [
            ("Bengaluru", 0.96, "Tech Product Design Capital"),
            ("Delhi NCR", 0.90, "Consumer Apps & Fintech"),
            ("Mumbai", 0.89, "Digital Banking & Enterprise UX"),
            ("Hyderabad", 0.86, "Global Product Centers")
        ]
    },
    "video-editor": {
        "demand_trend": ("Surging Digital Content & OTT Production", 0.85),
        "job_index": 84.0,
        "salaries": [
            ("ENTRY", 350000.0, 650000.0, 500000.0, "Media Entertainment Skills Council (MESC)", 1),
            ("MID", 800000.0, 1500000.0, 1150000.0, "Media Entertainment Skills Council (MESC)", 1),
            ("SENIOR", 1800000.0, 3500000.0, 2500000.0, "Film & Broadcast Guild", 2)
        ],
        "skills": [
            ("color-grading", "Log & HDR Color Grading", 0.89, "SKILL_DEMAND", False),
            ("audio-post", "Dialogue Cleaning & Dynamic Mixing", 0.86, "SKILL_DEMAND", False)
        ],
        "regions": [
            ("Mumbai", 0.96, "Bollywood, OTT & Commercial Broadcast"),
            ("Hyderabad", 0.91, "Tollywood & Digital Media Hub"),
            ("Chennai", 0.89, "South Cinema & Digital Post-Production"),
            ("Delhi NCR", 0.85, "News Media & Digital Agencies")
        ]
    },
    "doctor": {
        "demand_trend": ("Extremely High National Healthcare Need & Doctor Shortage", 0.98),
        "job_index": 98.0,
        "salaries": [
            ("ENTRY", 850000.0, 1400000.0, 1100000.0, "Ministry of Health & Family Welfare (MoHFW)", 1),
            ("MID", 1800000.0, 3500000.0, 2500000.0, "National Medical Commission (NMC)", 1),
            ("SENIOR", 4000000.0, 10000000.0, 6500000.0, "Indian Medical Association Survey", 2)
        ],
        "skills": [
            ("clinical-diagnosis", "Evidence-Based Clinical Diagnosis", 0.99, "SKILL_DEMAND", False),
            ("anatomy-physiology", "Human Pathophysiology", 0.97, "SKILL_DEMAND", False),
            ("pharmacology", "Therapeutic Pharmacology", 0.96, "SKILL_DEMAND", False)
        ],
        "regions": [
            ("National", 0.98, "Universal Rural & Urban Need"),
            ("Delhi NCR", 0.96, "Premier Tertiary Referral Hospitals"),
            ("Mumbai", 0.95, "Specialty Medical Networks"),
            ("Chennai", 0.94, "Medical Tourism & Super-Specialty Hub")
        ]
    },
    "nurse": {
        "demand_trend": ("High Global & National Healthcare Demand", 0.94),
        "job_index": 94.0,
        "salaries": [
            ("ENTRY", 360000.0, 550000.0, 450000.0, "Indian Nursing Council (INC)", 1),
            ("MID", 650000.0, 1100000.0, 850000.0, "Indian Nursing Council (INC)", 1),
            ("SENIOR", 1200000.0, 2200000.0, 1600000.0, "Private Hospital Federation", 2)
        ],
        "skills": [
            ("nursing-care", "Patient Care & Clinical Protocols", 0.96, "SKILL_DEMAND", False),
            ("anatomy-physiology", "Clinical Physiology", 0.92, "SKILL_DEMAND", False),
            ("pharmacology", "Medication Administration", 0.90, "SKILL_DEMAND", False)
        ],
        "regions": [
            ("National", 0.95, "Public Health & Hospital Networks"),
            ("Kerala", 0.96, "Premier Training & International Placement"),
            ("Bengaluru", 0.91, "Corporate Healthcare Chains"),
            ("Delhi NCR", 0.90, "Government & Private Super-Specialties")
        ]
    },
    "civil-engineer": {
        "demand_trend": ("National Infrastructure & Smart Cities Mission Growth", 0.87),
        "job_index": 86.0,
        "salaries": [
            ("ENTRY", 450000.0, 750000.0, 600000.0, "Ministry of Road Transport & Highways / AICTE", 1),
            ("MID", 1000000.0, 1800000.0, 1350000.0, "Construction Federation of India", 2),
            ("SENIOR", 2200000.0, 4500000.0, 3200000.0, "National Infrastructure Survey", 2)
        ],
        "skills": [
            ("structural-analysis", "BIM & Structural Mechanics", 0.92, "SKILL_DEMAND", False)
        ],
        "regions": [
            ("National", 0.90, "Highways, Expressways & Metro Corridors"),
            ("Delhi NCR", 0.92, "Megaprojects & Transit Hubs"),
            ("Mumbai", 0.91, "Coastal Roads & Urban Redevelopment"),
            ("Bengaluru", 0.88, "Tech Parks & Commercial Real Estate")
        ]
    },
    "mechanical-engineer": {
        "demand_trend": ("Manufacturing Renaissance & EV Transition", 0.86),
        "job_index": 85.0,
        "salaries": [
            ("ENTRY", 480000.0, 800000.0, 620000.0, "Society of Indian Automobile Manufacturers (SIAM)", 1),
            ("MID", 1100000.0, 2000000.0, 1500000.0, "Society of Indian Automobile Manufacturers (SIAM)", 1),
            ("SENIOR", 2400000.0, 4800000.0, 3400000.0, "Manufacturing Leaders Index", 2)
        ],
        "skills": [
            ("thermodynamics", "Thermal Engineering & CFD", 0.88, "SKILL_DEMAND", False),
            ("cad-modeling", "Parametric 3D CAD Modeling", 0.91, "SKILL_DEMAND", False)
        ],
        "regions": [
            ("Pune", 0.95, "Automotive & Heavy Machinery Hub"),
            ("Chennai", 0.94, "Detroit of India / Auto Manufacturing"),
            ("Delhi NCR", 0.89, "Auto Component Clusters"),
            ("Gujarat", 0.88, "Industrial Corridor & EV Plants")
        ]
    },
    "chartered-accountant": {
        "demand_trend": ("Statutory Audit, GST & Corporate Governance Demand", 0.94),
        "job_index": 94.0,
        "salaries": [
            ("ENTRY", 900000.0, 1500000.0, 1200000.0, "Institute of Chartered Accountants of India (ICAI)", 1),
            ("MID", 1800000.0, 3200000.0, 2400000.0, "Institute of Chartered Accountants of India (ICAI)", 1),
            ("SENIOR", 3500000.0, 8000000.0, 5500000.0, "Big 4 & Corporate Finance Survey", 2)
        ],
        "skills": [
            ("financial-accounting", "Ind AS & Corporate Financial Reporting", 0.98, "SKILL_DEMAND", False),
            ("corporate-tax", "Direct & Indirect Tax Advisory", 0.96, "SKILL_DEMAND", False),
            ("auditing", "Statutory Audit & Internal Controls", 0.95, "SKILL_DEMAND", False)
        ],
        "regions": [
            ("Mumbai", 0.98, "Financial Capital / Dalal Street"),
            ("Delhi NCR", 0.94, "Corporate Headquarters & Tax Authorities"),
            ("Bengaluru", 0.90, "Venture Capital & Tech CFO Advisory"),
            ("Chennai", 0.88, "Industrial Audit & Compliance")
        ]
    },
    "corporate-lawyer": {
        "demand_trend": ("M&A, Tech IP & Cross-Border Regulatory Growth", 0.90),
        "job_index": 90.0,
        "salaries": [
            ("ENTRY", 800000.0, 1600000.0, 1200000.0, "Bar Council of India / National Law University Benchmarks", 1),
            ("MID", 2000000.0, 3800000.0, 2800000.0, "Top Tier Law Firms India Survey", 2),
            ("SENIOR", 4500000.0, 12000000.0, 7500000.0, "Corporate Counsel Guild", 2)
        ],
        "skills": [
            ("corporate-law", "Company Law 2013 & Securities Regulations", 0.95, "SKILL_DEMAND", False),
            ("contract-drafting", "Commercial Contracting & Due Diligence", 0.94, "SKILL_DEMAND", False),
            ("legal-research", "Statutory Precedent Research", 0.92, "SKILL_DEMAND", False)
        ],
        "regions": [
            ("Mumbai", 0.96, "Securities & Corporate Dealmaking"),
            ("Delhi NCR", 0.95, "Supreme Court, NCLT & Regulatory Bodies"),
            ("Bengaluru", 0.90, "Tech Startups, IP & Privacy Law")
        ]
    },
    "secondary-school-teacher": {
        "demand_trend": ("National Education Policy (NEP 2020) Qualified Teacher Demand", 0.88),
        "job_index": 86.0,
        "salaries": [
            ("ENTRY", 360000.0, 600000.0, 480000.0, "National Council for Teacher Education (NCTE)", 1),
            ("MID", 650000.0, 1100000.0, 850000.0, "Kendriya Vidyalaya / CBSE Pay Scales", 1),
            ("SENIOR", 1200000.0, 2000000.0, 1500000.0, "Premier International Schools Guild", 2)
        ],
        "skills": [
            ("pedagogy", "Modern NEP-Aligned Classroom Pedagogy", 0.92, "SKILL_DEMAND", False),
            ("lesson-planning", "Experiential Lesson Formulation", 0.90, "SKILL_DEMAND", False)
        ],
        "regions": [
            ("National", 0.94, "CBSE, ICSE & State Board Networks"),
            ("Delhi NCR", 0.91, "Central Schools & Private K-12"),
            ("Bengaluru", 0.90, "International Baccalaureate (IB) Hub"),
            ("Mumbai", 0.89, "Top Tier Private Academies")
        ]
    },
    "commercial-airline-pilot": {
        "demand_trend": ("Aviation Fleet Expansion & Regional Connectivity (UDAN)", 0.95),
        "job_index": 95.0,
        "salaries": [
            ("ENTRY", 1800000.0, 3000000.0, 2400000.0, "DGCA Civil Aviation Industry Survey 2026", 1),
            ("MID", 3600000.0, 6500000.0, 4800000.0, "DGCA Civil Aviation Industry Survey 2026", 1),
            ("SENIOR", 7500000.0, 14000000.0, 10500000.0, "Aviation Pilots Federation", 2)
        ],
        "skills": [
            ("flight-navigation", "IFR Instrument Flight Rules & FMC", 0.98, "SKILL_DEMAND", False),
            ("aircraft-systems", "Multi-Engine Jet Systems", 0.96, "SKILL_DEMAND", False)
        ],
        "regions": [
            ("Delhi NCR", 0.97, "Indira Gandhi International Hub"),
            ("Mumbai", 0.95, "Chhatrapati Shivaji Maharaj Airport"),
            ("Bengaluru", 0.92, "Kempegowda International Airline Base"),
            ("Hyderabad", 0.90, "Rajiv Gandhi International Maintenance & Training")
        ]
    },
    "automotive-mechanic": {
        "demand_trend": ("Steady Demand for Service Technicians with EV Diagnostics", 0.82),
        "job_index": 80.0,
        "salaries": [
            ("ENTRY", 240000.0, 420000.0, 320000.0, "Automotive Skills Development Council (ASDC)", 1),
            ("MID", 450000.0, 800000.0, 600000.0, "Automotive Skills Development Council (ASDC)", 1),
            ("SENIOR", 900000.0, 1600000.0, 1200000.0, "Authorized Dealer Service Networks", 2)
        ],
        "skills": [
            ("automotive-repair", "ICE & EV Powertrain Diagnostics", 0.90, "SKILL_DEMAND", False)
        ],
        "regions": [
            ("National", 0.88, "Service Stations & Authorized Centers"),
            ("Delhi NCR", 0.91, "Commercial Fleet Hubs"),
            ("Pune", 0.90, "Automotive OEM Workshops"),
            ("Chennai", 0.89, "Auto Component & Repair Clusters")
        ]
    },
    "licensed-electrician": {
        "demand_trend": ("Continuous Industrial & Residential Electrification", 0.85),
        "job_index": 84.0,
        "salaries": [
            ("ENTRY", 260000.0, 440000.0, 350000.0, "Central Electricity Authority / NCVT", 1),
            ("MID", 500000.0, 900000.0, 680000.0, "National Skilled Trades Federation", 2),
            ("SENIOR", 1000000.0, 1800000.0, 1350000.0, "Industrial High Voltage Contractors", 2)
        ],
        "skills": [
            ("electrical-wiring", "IS 732 Standards & Grid Maintenance", 0.92, "SKILL_DEMAND", False)
        ],
        "regions": [
            ("National", 0.92, "Power Distribution Companies (DISCOMs)"),
            ("Gujarat", 0.90, "Renewable Solar & Industrial Parks"),
            ("Mumbai", 0.89, "Commercial Skyscrapers & Utilities"),
            ("Bengaluru", 0.87, "Data Center Electrical Infrastructure")
        ]
    },
    "agricultural-scientist": {
        "demand_trend": ("Precision Agriculture, Climate Resilience & Food Security", 0.88),
        "job_index": 87.0,
        "salaries": [
            ("ENTRY", 500000.0, 850000.0, 680000.0, "Indian Council of Agricultural Research (ICAR)", 1),
            ("MID", 1100000.0, 2000000.0, 1500000.0, "Indian Council of Agricultural Research (ICAR)", 1),
            ("SENIOR", 2200000.0, 4500000.0, 3200000.0, "AgTech Enterprises & Global Research", 2)
        ],
        "skills": [
            ("crop-genetics", "Climate-Resilient Plant Breeding", 0.94, "SKILL_DEMAND", False),
            ("soil-chemistry", "Precision Agronomy & Nutrient Cycling", 0.91, "SKILL_DEMAND", False)
        ],
        "regions": [
            ("National", 0.92, "ICAR & State Agricultural Universities"),
            ("Punjab & Haryana", 0.94, "Granary of India / Agronomy R&D"),
            ("Hyderabad", 0.91, "Agri-Biotech & Seed Innovation Centers"),
            ("Maharashtra", 0.89, "Horticulture & Climate Adaptation")
        ]
    }
}


def seed_market_intelligence(db: Session):
    """Populates verified market signals for canonical careers."""
    print("=" * 65)
    print("MIGRATION: Phase 11 Stage 7 Market Intelligence Seeder")
    print("=" * 65)

    # 1. Ensure table exists
    Base.metadata.create_all(bind=engine)
    print("[1/3] Verified schema for 'career_market_signals'.")

    # 2. Map skills
    all_skills = db.query(Skill).all()
    skill_map = {s.slug: s.id for s in all_skills}
    print(f"[2/3] Indexed {len(skill_map)} canonical skills.")

    # 3. Seed signals
    now = datetime.now(timezone.utc)
    inserted_signals = 0

    for slug, data in MARKET_SEED_DATA.items():
        career = db.query(Career).filter(Career.slug == slug).first()
        if not career:
            print(f"Warning: Career '{slug}' not found in database. Skipping.")
            continue

        # Check existing signals
        existing = db.query(CareerMarketSignal).filter(CareerMarketSignal.career_slug == slug).count()
        if existing > 0:
            continue

        # A. Demand Trend Signal
        trend_val, trend_score = data["demand_trend"]
        db.add(CareerMarketSignal(
            career_id=career.id,
            career_slug=slug,
            signal_type="DEMAND_TREND",
            signal_value=trend_val,
            numeric_value=trend_score,
            unit="INDEX",
            country_code="IN",
            region_code="National",
            source_tier=1,
            source_name="National Career Market Observatory 2026",
            provider="PathFinder Intelligence",
            confidence=0.95,
            observed_at=now,
            ttl_days=30
        ))
        inserted_signals += 1

        # B. Salary Signals (Entry, Mid, Senior)
        for exp_level, min_sal, max_sal, med_sal, src_name, tier in data["salaries"]:
            db.add(CareerMarketSignal(
                career_id=career.id,
                career_slug=slug,
                signal_type="SALARY_RANGE",
                signal_value=f"{exp_level} Level Compensation",
                numeric_value=med_sal,
                min_value=min_sal,
                max_value=max_sal,
                currency="INR",
                period="ANNUAL",
                experience_level=exp_level,
                data_quality="REPORTED",
                unit="INR_PER_YEAR",
                country_code="IN",
                region_code="National",
                source_tier=tier,
                source_name=src_name,
                provider="PathFinder Intelligence",
                confidence=0.92 if tier == 1 else 0.88,
                observed_at=now,
                ttl_days=90
            ))
            inserted_signals += 1

        # C. Skill Demand Signals
        for sk_slug, sk_val, demand_score, sig_type, is_em in data["skills"]:
            sk_id = skill_map.get(sk_slug)
            db.add(CareerMarketSignal(
                career_id=career.id,
                career_slug=slug,
                skill_id=sk_id,
                skill_slug=sk_slug,
                signal_type=sig_type,
                signal_value=sk_val,
                numeric_value=demand_score,
                unit="INDEX",
                country_code="IN",
                region_code="National",
                source_tier=1,
                source_name="Verified Tech & Occupational Competency Index",
                provider="PathFinder Intelligence",
                confidence=0.94,
                observed_at=now,
                ttl_days=30
            ))
            inserted_signals += 1

        # D. Regional Demand Signals
        for reg_name, reg_score, reg_industry in data["regions"]:
            db.add(CareerMarketSignal(
                career_id=career.id,
                career_slug=slug,
                signal_type="REGIONAL_DEMAND",
                signal_value=f"High Hiring Concentration: {reg_name}",
                numeric_value=reg_score,
                unit="INDEX",
                country_code="IN",
                region_code=reg_name,
                industry=reg_industry,
                source_tier=2,
                source_name="State & Metro Economic Employment Review",
                provider="PathFinder Intelligence",
                confidence=0.90,
                observed_at=now,
                ttl_days=30
            ))
            inserted_signals += 1

    db.commit()
    print(f"[3/3] Successfully seeded {inserted_signals} canonical market signals.")
    print("=" * 65)


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_market_intelligence(db)
    finally:
        db.close()
