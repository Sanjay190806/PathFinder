"""
JanSahay / SIH26101 Indian Education Taxonomy Core Service
Hierarchical structure:
Education Stage -> Stream / Domain -> Specialization -> Qualification -> Current Role
"""

from typing import Dict, List, Any, Optional

EDUCATION_STAGES = [
    {"id": "school", "label": "School Education (Classes 1–10)", "short_label": "School (1–10)"},
    {"id": "higher_secondary", "label": "Higher Secondary (Classes 11–12)", "short_label": "11th & 12th (+2)"},
    {"id": "vocational", "label": "Vocational / Skill Education (ITI & NSQF)", "short_label": "ITI / Vocational"},
    {"id": "diploma", "label": "Polytechnic / Diploma", "short_label": "Diploma / Polytechnic"},
    {"id": "undergraduate", "label": "Undergraduate Degree (Bachelor's)", "short_label": "Undergraduate"},
    {"id": "postgraduate", "label": "Postgraduate Degree (Master's)", "short_label": "Postgraduate"},
    {"id": "doctoral", "label": "Doctoral / Research (PhD)", "short_label": "Doctoral / PhD"},
    {"id": "professional", "label": "Professional Qualifications (CA, CS, CFA)", "short_label": "Professional Certs"},
    {"id": "working_professional", "label": "Government / Working Professional", "short_label": "Working Professional"}
]

CANONICAL_DOMAINS = [
    "School Education",
    "Science (Pure, Life & Environmental)",
    "Engineering & Technology",
    "Computer Science & IT / Data",
    "Medicine & Health Sciences",
    "Agriculture & Allied Sciences",
    "Commerce & Finance",
    "Business & Management",
    "Arts & Humanities",
    "Social Sciences & Psychology",
    "Law & Legal Studies",
    "Education & Pedagogy",
    "Architecture & Planning",
    "Design & Creative Arts",
    "Media & Communication",
    "Hospitality & Tourism",
    "Vocational & Skill Education (NSQF / ITI)",
    "Sports & Physical Education",
    "Official Statistics & Government (SIH26101 Focus)"
]

CURRENT_ROLES = [
    "Student / Fresher",
    "Government Employee / Officer",
    "Statistical Officer (JSO / SSO)",
    "Data Analyst / BI Specialist",
    "Statistician / Quantitative Analyst",
    "Economist / Economic Researcher",
    "Researcher / Academician",
    "Teacher / Trainer / Faculty",
    "Administrator / Policy Officer",
    "IT / Software Professional",
    "Engineering Specialist",
    "Consultant / Corporate Analyst",
    "Other"
]

WORK_DOMAINS = [
    "Official Statistics & Census",
    "Data Analysis & Business Intelligence",
    "Artificial Intelligence & Machine Learning",
    "Economics & Market Research",
    "Survey Design & Sampling",
    "Public Policy & Administration",
    "Software Engineering & IT",
    "Banking, Finance & Insurance",
    "Healthcare & Life Sciences",
    "Education & Academic Research",
    "Manufacturing & Industrial Operations",
    "Agriculture & Rural Development",
    "Other"
]

def get_taxonomy_summary() -> Dict[str, Any]:
    return {
        "country": "India",
        "taxonomy_version": "JanSahay-SIH26101-v1.0",
        "stages": EDUCATION_STAGES,
        "canonical_domains": CANONICAL_DOMAINS,
        "current_roles": CURRENT_ROLES,
        "work_domains": WORK_DOMAINS
    }
