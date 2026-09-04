"""
Authoritative Single Source of Truth for India-Specific Education Taxonomy
Architecture matching PathFinder CareerCatalog design.
Supports normalized slugs, hierarchical cascading levels, aliases, and custom options.
"""

from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

class QualificationOption(BaseModel):
    id: str
    name: str
    abbr: Optional[str] = None

class SpecializationOption(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    aliases: List[str] = Field(default_factory=list)
    suggested_qualifications: List[str] = Field(default_factory=list)

class StreamOption(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    specializations: List[SpecializationOption] = Field(default_factory=list)
    default_qualifications: List[str] = Field(default_factory=list)

class EducationLevelOption(BaseModel):
    id: str
    name: str
    short_label: str
    description: str
    order: int
    streams: List[StreamOption] = Field(default_factory=list)

# Comprehensive Normalized India Education Catalog
EDUCATION_CATALOG: List[EducationLevelOption] = [
    # 1. Secondary School (9–10)
    EducationLevelOption(
        id="secondary-school",
        name="Secondary School (9–10)",
        short_label="Classes 9–10",
        description="NCF 2023 flexible curriculum focusing on broad subject areas rather than rigid streams.",
        order=1,
        streams=[
            StreamOption(
                id="secondary-general",
                name="General / Integrated",
                description="Holistic secondary curriculum across sciences, mathematics, humanities, and languages.",
                specializations=[
                    SpecializationOption(id="general-integrated", name="General / Integrated Studies", aliases=["General", "Integrated", "CBSE 10th", "ICSE 10th", "State 10th"]),
                    SpecializationOption(id="science-oriented", name="Science-oriented", aliases=["Science Focused", "Science Foundation"]),
                    SpecializationOption(id="mathematics-computational", name="Mathematics / Computational", aliases=["Maths", "Computational Thinking", "Coding Foundation"]),
                    SpecializationOption(id="social-science-humanities", name="Social Science / Humanities-oriented", aliases=["Social Studies", "History Civics Geography"]),
                    SpecializationOption(id="arts-education", name="Arts Education", aliases=["Art", "Visual Arts", "Craft"]),
                    SpecializationOption(id="physical-education-wellbeing", name="Physical Education & Well-being", aliases=["Sports", "PE", "Yoga"]),
                    SpecializationOption(id="vocational-education", name="Vocational Education", aliases=["Skill Subject", "NSQF Secondary"]),
                    SpecializationOption(id="interdisciplinary", name="Interdisciplinary", aliases=["Cross-disciplinary", "STEAM"]),
                    SpecializationOption(id="custom-secondary", name="Other / Custom", aliases=["Other", "Custom"])
                ],
                default_qualifications=["10th Standard / Matriculation", "CBSE Class 10 Certificate", "ICSE Certificate", "State Board SSC"]
            )
        ]
    ),

    # 2. Higher Secondary (11–12)
    EducationLevelOption(
        id="higher-secondary",
        name="Higher Secondary (11–12)",
        short_label="11th–12th (+2)",
        description="Traditional and interdisciplinary +2 subject combinations across Science, Commerce, Humanities, and Vocational.",
        order=2,
        streams=[
            StreamOption(
                id="science",
                name="Science",
                description="Core scientific, mathematical, computational, and technical combinations.",
                specializations=[
                    SpecializationOption(id="pcm", name="PCM (Physics + Chemistry + Mathematics)", aliases=["PCM", "Non-Medical", "Engineering Group"], suggested_qualifications=["Class 12 Science - PCM", "CBSE Class 12", "ISC Class 12", "State Board HSC"]),
                    SpecializationOption(id="pcm-computer-science", name="PCM + Computer Science", aliases=["PCM CS", "PCM with CS", "PCM with Computer Science", "Computer Science Engineering Group"], suggested_qualifications=["Class 12 Science + CS"]),
                    SpecializationOption(id="pcm-informatics-practices", name="PCM + Informatics Practices", aliases=["PCM IP", "PCM with IP"], suggested_qualifications=["Class 12 Science + IP"]),
                    SpecializationOption(id="pcm-electronics", name="PCM + Electronics", aliases=["PCM Electronics", "Vocational Electronics"], suggested_qualifications=["Class 12 Science + Electronics"]),
                    SpecializationOption(id="pcb", name="PCB (Physics + Chemistry + Biology)", aliases=["PCB", "Medical Group", "Pre-Med"], suggested_qualifications=["Class 12 Science - PCB"]),
                    SpecializationOption(id="pcb-mathematics", name="PCB + Mathematics", aliases=["PCB Math", "PCB with Math"], suggested_qualifications=["Class 12 Science - PCB+M"]),
                    SpecializationOption(id="pcb-psychology", name="PCB + Psychology", aliases=["PCB Psych", "PCB with Psychology"], suggested_qualifications=["Class 12 Science + Psychology"]),
                    SpecializationOption(id="pcb-biotechnology", name="PCB + Biotechnology", aliases=["PCB Biotech", "PCB with Biotechnology"], suggested_qualifications=["Class 12 Science + Biotech"]),
                    SpecializationOption(id="pcmb", name="PCMB (Physics + Chemistry + Mathematics + Biology)", aliases=["PCMB", "General Science Group", "Dual Eligible"], suggested_qualifications=["Class 12 Science - PCMB"]),
                    SpecializationOption(id="computer-informatics-oriented", name="Computer / Informatics-oriented", aliases=["Computer Science Stream", "Informatics Stream", "IT Stream"], suggested_qualifications=["Class 12 Computer Science"]),
                    SpecializationOption(id="ai-computational-oriented", name="AI / Computational-oriented", aliases=["AI Elective", "Artificial Intelligence Stream", "Data Science Elective"], suggested_qualifications=["Class 12 AI Elective"]),
                    SpecializationOption(id="other-science", name="Other Science Combination", aliases=["Custom Science", "Other Science"], suggested_qualifications=["Class 12 Science (Custom)"])
                ],
                default_qualifications=["CBSE Class 12 Science", "ISC 12th Science", "State Board HSC 12th"]
            ),
            StreamOption(
                id="commerce",
                name="Commerce",
                description="Accountancy, economics, business studies, mathematics, and entrepreneurship.",
                specializations=[
                    SpecializationOption(id="commerce-with-mathematics", name="Commerce with Mathematics", aliases=["Commerce Math", "Commerce with Applied Math", "CA Foundation Group"], suggested_qualifications=["Class 12 Commerce + Math"]),
                    SpecializationOption(id="commerce-without-mathematics", name="Commerce without Mathematics", aliases=["Commerce without Math", "Plain Commerce"], suggested_qualifications=["Class 12 Commerce"]),
                    SpecializationOption(id="accountancy", name="Accountancy & Auditing", aliases=["Accounts", "Bookkeeping"], suggested_qualifications=["Class 12 Commerce"]),
                    SpecializationOption(id="business-studies", name="Business Studies & Management", aliases=["BST", "Business Administration"], suggested_qualifications=["Class 12 Commerce"]),
                    SpecializationOption(id="economics", name="Economics & Quantitative", aliases=["Commerce Economics", "Eco"], suggested_qualifications=["Class 12 Commerce"]),
                    SpecializationOption(id="entrepreneurship", name="Entrepreneurship & Enterprise", aliases=["Entrep", "Business Venture"], suggested_qualifications=["Class 12 Commerce"]),
                    SpecializationOption(id="commerce-computer-informatics", name="Computer / Informatics Applications", aliases=["Commerce with IP", "Commerce with Computers"], suggested_qualifications=["Class 12 Commerce + IP"]),
                    SpecializationOption(id="other-commerce", name="Other Commerce Combination", aliases=["Custom Commerce", "Other Commerce"], suggested_qualifications=["Class 12 Commerce (Custom)"])
                ],
                default_qualifications=["CBSE Class 12 Commerce", "ISC 12th Commerce", "State Board HSC Commerce"]
            ),
            StreamOption(
                id="humanities-arts",
                name="Humanities / Arts",
                description="Social sciences, languages, philosophy, arts, and communication.",
                specializations=[
                    SpecializationOption(id="history", name="History & Civilization", aliases=["History", "Indian History"], suggested_qualifications=["Class 12 Arts"]),
                    SpecializationOption(id="political-science", name="Political Science & Governance", aliases=["Pol Sci", "Politics", "Civics"], suggested_qualifications=["Class 12 Arts"]),
                    SpecializationOption(id="geography", name="Geography & Geopolitics", aliases=["Geography", "Geo"], suggested_qualifications=["Class 12 Arts"]),
                    SpecializationOption(id="humanities-economics", name="Economics (Arts)", aliases=["Humanities Economics"], suggested_qualifications=["Class 12 Arts"]),
                    SpecializationOption(id="sociology", name="Sociology & Society", aliases=["Sociology"], suggested_qualifications=["Class 12 Arts"]),
                    SpecializationOption(id="psychology", name="Psychology & Behavioral Science", aliases=["Psychology", "Applied Psychology"], suggested_qualifications=["Class 12 Arts"]),
                    SpecializationOption(id="philosophy", name="Philosophy & Ethics", aliases=["Philosophy"], suggested_qualifications=["Class 12 Arts"]),
                    SpecializationOption(id="legal-studies", name="Legal Studies & Jurisprudence", aliases=["Law Studies", "Pre-Law"], suggested_qualifications=["Class 12 Arts"]),
                    SpecializationOption(id="fine-arts", name="Fine Arts & Visual Design", aliases=["Fine Arts", "Painting", "Drawing"], suggested_qualifications=["Class 12 Arts"]),
                    SpecializationOption(id="performing-arts", name="Performing Arts (Music / Dance / Theatre)", aliases=["Music", "Dance", "Theatre"], suggested_qualifications=["Class 12 Arts"]),
                    SpecializationOption(id="mass-media-communication", name="Mass Media / Communication", aliases=["Mass Media", "Media Studies", "Journalism"], suggested_qualifications=["Class 12 Arts"]),
                    SpecializationOption(id="languages-literature", name="Languages / Literature", aliases=["English Lit", "Hindi Lit", "Sanskrit", "Regional Languages"], suggested_qualifications=["Class 12 Arts"]),
                    SpecializationOption(id="other-humanities", name="Other Humanities Combination", aliases=["Custom Arts", "Other Humanities"], suggested_qualifications=["Class 12 Arts (Custom)"])
                ],
                default_qualifications=["CBSE Class 12 Humanities", "ISC 12th Arts", "State Board HSC Arts"]
            ),
            StreamOption(
                id="vocational-hs",
                name="Vocational",
                description="NSQF-aligned practical skill disciplines for employment and higher technical education.",
                specializations=[
                    SpecializationOption(id="voc-it-ites", name="IT / ITES", aliases=["Vocational IT", "Computer Tech"], suggested_qualifications=["Class 12 Vocational IT"]),
                    SpecializationOption(id="voc-healthcare", name="Healthcare & Patient Care", aliases=["Nursing Assistant", "Healthcare"], suggested_qualifications=["Class 12 Vocational Healthcare"]),
                    SpecializationOption(id="voc-agriculture", name="Agriculture & Organic Farming", aliases=["Voc Agriculture"], suggested_qualifications=["Class 12 Vocational Agriculture"]),
                    SpecializationOption(id="voc-engineering-related", name="Engineering-related Trades", aliases=["Technical Vocational"], suggested_qualifications=["Class 12 Vocational Engineering"]),
                    SpecializationOption(id="voc-retail", name="Retail & Store Operations", aliases=["Retail Operations"], suggested_qualifications=["Class 12 Vocational Retail"]),
                    SpecializationOption(id="voc-tourism", name="Tourism & Hospitality", aliases=["Travel Tourism"], suggested_qualifications=["Class 12 Vocational Tourism"]),
                    SpecializationOption(id="voc-media", name="Media & Digital Content", aliases=["Digital Media Vocational"], suggested_qualifications=["Class 12 Vocational Media"]),
                    SpecializationOption(id="voc-automotive", name="Automotive Maintenance", aliases=["Auto Tech"], suggested_qualifications=["Class 12 Vocational Auto"]),
                    SpecializationOption(id="voc-bfsi", name="Banking / Financial Services", aliases=["Banking Vocational", "BFSI"], suggested_qualifications=["Class 12 Vocational Banking"]),
                    SpecializationOption(id="voc-electronics", name="Electronics & Hardware", aliases=["Hardware Tech"], suggested_qualifications=["Class 12 Vocational Electronics"]),
                    SpecializationOption(id="other-vocational", name="Other Vocational Trade", aliases=["Custom Vocational"], suggested_qualifications=["Class 12 Vocational (Custom)"])
                ],
                default_qualifications=["Class 12 Vocational Certificate"]
            ),
            StreamOption(
                id="interdisciplinary-hs",
                name="Integrated / Interdisciplinary",
                description="Cross-disciplinary combinations bridging sciences, computing, commerce, and arts.",
                specializations=[
                    SpecializationOption(id="science-computing", name="Science + Computing", aliases=["Sci Comp", "Physics Math CS"], suggested_qualifications=["Class 12 Interdisciplinary"]),
                    SpecializationOption(id="science-economics", name="Science + Economics", aliases=["Sci Eco", "Physics Math Economics"], suggested_qualifications=["Class 12 Interdisciplinary"]),
                    SpecializationOption(id="commerce-computing", name="Commerce + Computing", aliases=["Comm Comp", "Commerce with CS/IP"], suggested_qualifications=["Class 12 Interdisciplinary"]),
                    SpecializationOption(id="humanities-computing", name="Humanities + Computing", aliases=["Arts Comp", "Humanities with Coding"], suggested_qualifications=["Class 12 Interdisciplinary"]),
                    SpecializationOption(id="arts-technology", name="Arts + Technology", aliases=["Digital Arts", "Design Tech"], suggested_qualifications=["Class 12 Interdisciplinary"]),
                    SpecializationOption(id="other-interdisciplinary-hs", name="Other Interdisciplinary Combination", aliases=["Custom Interdisciplinary"], suggested_qualifications=["Class 12 Custom Integrated"])
                ],
                default_qualifications=["Class 12 Integrated Certificate"]
            )
        ]
    ),

    # 3. Undergraduate / College
    EducationLevelOption(
        id="undergraduate",
        name="Undergraduate / College",
        short_label="Undergraduate",
        description="University Bachelor's degrees across AICTE, UGC, NMC, ICAR, and BCI accredited disciplines.",
        order=3,
        streams=[
            StreamOption(
                id="engineering-technology",
                name="Engineering & Technology",
                description="Core AICTE engineering and technical degree disciplines.",
                specializations=[
                    SpecializationOption(id="computer-science-engineering", name="Computer Science Engineering", aliases=["CSE", "Computer Science", "CS", "Comp Sci", "Software Engineering"], suggested_qualifications=["B.Tech CSE", "B.E. CSE", "B.Sc (Hons) Computer Science"]),
                    SpecializationOption(id="information-technology", name="Information Technology", aliases=["IT", "Info Tech", "Information Systems"], suggested_qualifications=["B.Tech IT", "B.E. IT"]),
                    SpecializationOption(id="artificial-intelligence-machine-learning", name="Artificial Intelligence & Machine Learning", aliases=["AI/ML", "AIML", "AI & ML", "Artificial Intelligence", "Machine Learning"], suggested_qualifications=["B.Tech AI/ML", "B.Tech AIML"]),
                    SpecializationOption(id="data-science", name="Data Science", aliases=["DS", "Data Science Engineering", "Data Analytics"], suggested_qualifications=["B.Tech Data Science", "B.Sc Data Science"]),
                    SpecializationOption(id="electronics-communication-engineering", name="Electronics & Communication Engineering", aliases=["ECE", "Electronics and Telecom", "ENTC"], suggested_qualifications=["B.Tech ECE", "B.E. ECE"]),
                    SpecializationOption(id="electrical-electronics-engineering", name="Electrical & Electronics Engineering", aliases=["EEE", "Triple E"], suggested_qualifications=["B.Tech EEE", "B.E. EEE"]),
                    SpecializationOption(id="electrical-engineering", name="Electrical Engineering", aliases=["EE", "Electrical"], suggested_qualifications=["B.Tech Electrical", "B.E. Electrical"]),
                    SpecializationOption(id="mechanical-engineering", name="Mechanical Engineering", aliases=["ME", "Mech", "Mechanical"], suggested_qualifications=["B.Tech Mechanical", "B.E. Mechanical"]),
                    SpecializationOption(id="civil-engineering", name="Civil Engineering", aliases=["CE", "Civil"], suggested_qualifications=["B.Tech Civil", "B.E. Civil"]),
                    SpecializationOption(id="chemical-engineering", name="Chemical Engineering", aliases=["Chem Eng", "Chemical"], suggested_qualifications=["B.Tech Chemical", "B.E. Chemical"]),
                    SpecializationOption(id="biotechnology-engineering", name="Biotechnology Engineering", aliases=["Biotech Eng", "Biotechnology"], suggested_qualifications=["B.Tech Biotech"]),
                    SpecializationOption(id="biomedical-engineering", name="Biomedical Engineering", aliases=["Biomedical", "Bio-medical"], suggested_qualifications=["B.Tech Biomedical"]),
                    SpecializationOption(id="aerospace-engineering", name="Aerospace Engineering", aliases=["Aerospace", "Aeronautical"], suggested_qualifications=["B.Tech Aerospace", "B.Tech Aeronautical"]),
                    SpecializationOption(id="automobile-engineering", name="Automobile Engineering", aliases=["Automobile", "Automotive"], suggested_qualifications=["B.Tech Automobile"]),
                    SpecializationOption(id="mechatronics", name="Mechatronics", aliases=["Mechatronics Engineering", "Robotics Mechatronics"], suggested_qualifications=["B.Tech Mechatronics"]),
                    SpecializationOption(id="instrumentation-control", name="Instrumentation & Control", aliases=["Instrumentation", "ICE", "E&I"], suggested_qualifications=["B.Tech Instrumentation"]),
                    SpecializationOption(id="robotics-automation", name="Robotics / Automation", aliases=["Robotics", "Automation"], suggested_qualifications=["B.Tech Robotics"]),
                    SpecializationOption(id="vlsi-microelectronics", name="VLSI / Microelectronics", aliases=["VLSI", "Semiconductors", "Microelectronics"], suggested_qualifications=["B.Tech VLSI"]),
                    SpecializationOption(id="metallurgical-materials-engineering", name="Metallurgical / Materials Engineering", aliases=["Metallurgy", "Materials Science Eng"], suggested_qualifications=["B.Tech Metallurgy"]),
                    SpecializationOption(id="environmental-engineering", name="Environmental Engineering", aliases=["Environmental Eng"], suggested_qualifications=["B.Tech Environmental"]),
                    SpecializationOption(id="mining-engineering", name="Mining Engineering", aliases=["Mining"], suggested_qualifications=["B.Tech Mining"]),
                    SpecializationOption(id="other-engineering", name="Other Engineering", aliases=["Custom Engineering"], suggested_qualifications=["B.Tech (Other)", "B.E. (Other)"])
                ],
                default_qualifications=["B.Tech", "B.E.", "B.Sc (Engg)"]
            ),
            StreamOption(
                id="computer-it",
                name="Computer / IT",
                description="Applied computer science, software applications, and IT systems.",
                specializations=[
                    SpecializationOption(id="bca", name="BCA (Bachelor of Computer Applications)", aliases=["BCA", "Computer Applications"], suggested_qualifications=["BCA"]),
                    SpecializationOption(id="computer-applications", name="Computer Applications", aliases=["B.Sc Computer Applications", "B.Sc CA"], suggested_qualifications=["B.Sc Computer Applications"]),
                    SpecializationOption(id="information-systems", name="Information Systems", aliases=["BIS", "Management Information Systems"], suggested_qualifications=["B.Sc Information Systems"]),
                    SpecializationOption(id="cybersecurity", name="Cybersecurity & Information Assurance", aliases=["Cyber Security", "InfoSec"], suggested_qualifications=["B.Sc Cybersecurity", "BCA Cybersecurity"]),
                    SpecializationOption(id="cloud-computing", name="Cloud Computing & DevOps", aliases=["Cloud Computing", "DevOps"], suggested_qualifications=["B.Sc Cloud Computing"]),
                    SpecializationOption(id="software-engineering-ug", name="Software Engineering", aliases=["Software Systems"], suggested_qualifications=["B.Sc Software Engineering"]),
                    SpecializationOption(id="ai-ml-computing", name="AI / ML", aliases=["Artificial Intelligence", "BCA AI"], suggested_qualifications=["BCA AI/ML", "B.Sc AI"]),
                    SpecializationOption(id="data-analytics-computing", name="Data Analytics", aliases=["Data Analysis", "BCA Data Science"], suggested_qualifications=["BCA Data Analytics"]),
                    SpecializationOption(id="other-computing", name="Other Computing", aliases=["Custom Computing"], suggested_qualifications=["B.Sc Computing", "BCA Custom"])
                ],
                default_qualifications=["BCA", "B.Sc Computer Science", "B.Sc IT"]
            ),
            StreamOption(
                id="pure-sciences",
                name="Pure Sciences",
                description="Physical, chemical, mathematical, and life sciences.",
                specializations=[
                    SpecializationOption(id="physics", name="Physics", aliases=["Physics Hons", "B.Sc Physics"], suggested_qualifications=["B.Sc Physics", "B.Sc (Hons) Physics"]),
                    SpecializationOption(id="chemistry", name="Chemistry", aliases=["Chemistry Hons", "B.Sc Chemistry"], suggested_qualifications=["B.Sc Chemistry"]),
                    SpecializationOption(id="mathematics", name="Mathematics", aliases=["Maths Hons", "B.Sc Mathematics", "Math"], suggested_qualifications=["B.Sc Mathematics", "B.Math (ISI)"]),
                    SpecializationOption(id="statistics", name="Statistics", aliases=["Stats Hons", "B.Sc Statistics", "Statistical Science"], suggested_qualifications=["B.Sc Statistics", "B.Stat (ISI)"]),
                    SpecializationOption(id="biology", name="Biology / Biological Sciences", aliases=["Biological Sciences"], suggested_qualifications=["B.Sc Biological Sciences"]),
                    SpecializationOption(id="botany", name="Botany", aliases=["Plant Science", "Botany Hons"], suggested_qualifications=["B.Sc Botany"]),
                    SpecializationOption(id="zoology", name="Zoology", aliases=["Animal Science", "Zoology Hons"], suggested_qualifications=["B.Sc Zoology"]),
                    SpecializationOption(id="biochemistry", name="Biochemistry", aliases=["Bio-chemistry"], suggested_qualifications=["B.Sc Biochemistry"]),
                    SpecializationOption(id="microbiology", name="Microbiology", aliases=["Micro-biology"], suggested_qualifications=["B.Sc Microbiology"]),
                    SpecializationOption(id="biotechnology-science", name="Biotechnology", aliases=["Biotech Science"], suggested_qualifications=["B.Sc Biotechnology"]),
                    SpecializationOption(id="environmental-science", name="Environmental Science", aliases=["EVS", "Environmental Studies"], suggested_qualifications=["B.Sc Environmental Science"]),
                    SpecializationOption(id="earth-science-geology", name="Earth Science / Geology", aliases=["Geology", "Geosciences"], suggested_qualifications=["B.Sc Geology"]),
                    SpecializationOption(id="other-natural-sciences", name="Other Natural Sciences", aliases=["Custom Science UG"], suggested_qualifications=["B.Sc General"])
                ],
                default_qualifications=["B.Sc", "B.Sc (Hons)", "BS-MS (IISER/IISc)"]
            ),
            StreamOption(
                id="commerce-finance",
                name="Commerce & Finance",
                description="Commercial accounts, banking, taxation, and financial analysis.",
                specializations=[
                    SpecializationOption(id="b-com", name="B.Com (General / Honours)", aliases=["B.Com", "BCom", "B.Com Hons"], suggested_qualifications=["B.Com (Hons)", "B.Com"]),
                    SpecializationOption(id="accounting", name="Accounting & Auditing", aliases=["Accountancy", "Corporate Accounting"], suggested_qualifications=["B.Com Accounting"]),
                    SpecializationOption(id="finance-ug", name="Finance & Capital Markets", aliases=["Corporate Finance", "Investment"], suggested_qualifications=["B.Sc Finance", "B.Com Finance"]),
                    SpecializationOption(id="banking", name="Banking & Insurance", aliases=["Banking Operations"], suggested_qualifications=["B.Com Banking"]),
                    SpecializationOption(id="economics-commerce", name="Economics", aliases=["Business Economics", "Eco Hons"], suggested_qualifications=["BA Economics (Hons)", "B.Sc Economics"]),
                    SpecializationOption(id="taxation", name="Taxation & GST", aliases=["Direct & Indirect Tax"], suggested_qualifications=["B.Com Taxation"]),
                    SpecializationOption(id="business-analytics-commerce", name="Business Analytics", aliases=["Commercial Analytics"], suggested_qualifications=["B.Com Business Analytics"]),
                    SpecializationOption(id="financial-analytics", name="Financial Analytics", aliases=["Fintech Analytics"], suggested_qualifications=["B.Sc Financial Analytics"]),
                    SpecializationOption(id="other-commerce-ug", name="Other Commerce", aliases=["Custom Commerce UG"], suggested_qualifications=["B.Com Custom"])
                ],
                default_qualifications=["B.Com", "B.Com (Hons)", "B.Sc Finance"]
            ),
            StreamOption(
                id="management",
                name="Management",
                description="Business administration, marketing, operations, and enterprise leadership.",
                specializations=[
                    SpecializationOption(id="bba", name="BBA (Bachelor of Business Administration)", aliases=["BBA", "Business Administration"], suggested_qualifications=["BBA"]),
                    SpecializationOption(id="business-administration", name="BMS (Bachelor of Management Studies)", aliases=["BMS", "Management Studies"], suggested_qualifications=["BMS"]),
                    SpecializationOption(id="marketing", name="Marketing & Brand Management", aliases=["Digital Marketing", "Marketing Management"], suggested_qualifications=["BBA Marketing"]),
                    SpecializationOption(id="finance-mgmt", name="Finance Management", aliases=["Managerial Finance"], suggested_qualifications=["BBA Finance"]),
                    SpecializationOption(id="human-resources", name="Human Resources (HR)", aliases=["HRM", "Personnel Management"], suggested_qualifications=["BBA HR"]),
                    SpecializationOption(id="operations", name="Operations & Supply Chain", aliases=["Operations Management", "Logistics"], suggested_qualifications=["BBA Operations"]),
                    SpecializationOption(id="international-business", name="International Business", aliases=["Global Business", "IB"], suggested_qualifications=["BBA International Business"]),
                    SpecializationOption(id="entrepreneurship-mgmt", name="Entrepreneurship", aliases=["Venture Development"], suggested_qualifications=["BBA Entrepreneurship"]),
                    SpecializationOption(id="business-analytics-mgmt", name="Business Analytics", aliases=["Data-driven Management"], suggested_qualifications=["BBA Business Analytics"])
                ],
                default_qualifications=["BBA", "BMS", "BBM"]
            ),
            StreamOption(
                id="humanities-social-sciences",
                name="Humanities & Social Sciences",
                description="Social structures, political philosophy, culture, and human behavior.",
                specializations=[
                    SpecializationOption(id="history-ug", name="History & Archaeology", aliases=["History", "Ancient History"], suggested_qualifications=["BA History"]),
                    SpecializationOption(id="political-science-ug", name="Political Science & IR", aliases=["Pol Sci", "International Relations"], suggested_qualifications=["BA Political Science"]),
                    SpecializationOption(id="sociology-ug", name="Sociology & Anthropology", aliases=["Sociology", "Social Studies"], suggested_qualifications=["BA Sociology"]),
                    SpecializationOption(id="psychology-ug", name="Psychology", aliases=["Applied Psychology", "Clinical Psychology"], suggested_qualifications=["BA Psychology", "B.Sc Psychology"]),
                    SpecializationOption(id="philosophy-ug", name="Philosophy", aliases=["Logic & Ethics"], suggested_qualifications=["BA Philosophy"]),
                    SpecializationOption(id="geography-ug", name="Geography & GIS", aliases=["Geography", "Spatial Analysis"], suggested_qualifications=["BA Geography", "B.Sc Geography"]),
                    SpecializationOption(id="anthropology", name="Anthropology", aliases=["Human Evolution", "Cultural Anthropology"], suggested_qualifications=["B.Sc Anthropology"]),
                    SpecializationOption(id="social-work", name="Social Work (BSW)", aliases=["BSW", "Social Welfare"], suggested_qualifications=["BSW"]),
                    SpecializationOption(id="public-administration", name="Public Administration", aliases=["Governance", "Civil Administration"], suggested_qualifications=["BA Public Administration"]),
                    SpecializationOption(id="international-relations", name="International Relations & Global Affairs", aliases=["IR", "Diplomacy"], suggested_qualifications=["BA International Relations"]),
                    SpecializationOption(id="economics-social", name="Economics", aliases=["Development Economics"], suggested_qualifications=["BA Economics"]),
                    SpecializationOption(id="other-social-sciences", name="Other Social Sciences", aliases=["Custom Social Science"], suggested_qualifications=["BA General"])
                ],
                default_qualifications=["BA", "BA (Hons)", "BSW"]
            ),
            StreamOption(
                id="languages-literature",
                name="Languages & Literature",
                description="Indian classical and modern languages, English, and foreign languages.",
                specializations=[
                    SpecializationOption(id="english", name="English Literature & Linguistics", aliases=["English", "English Hons"], suggested_qualifications=["BA English"]),
                    SpecializationOption(id="hindi", name="Hindi Literature", aliases=["Hindi", "Hindi Hons"], suggested_qualifications=["BA Hindi"]),
                    SpecializationOption(id="tamil", name="Tamil Literature", aliases=["Tamil", "Tamil Hons"], suggested_qualifications=["BA Tamil"]),
                    SpecializationOption(id="telugu", name="Telugu Literature", aliases=["Telugu"], suggested_qualifications=["BA Telugu"]),
                    SpecializationOption(id="kannada", name="Kannada Literature", aliases=["Kannada"], suggested_qualifications=["BA Kannada"]),
                    SpecializationOption(id="malayalam", name="Malayalam Literature", aliases=["Malayalam"], suggested_qualifications=["BA Malayalam"]),
                    SpecializationOption(id="marathi", name="Marathi Literature", aliases=["Marathi"], suggested_qualifications=["BA Marathi"]),
                    SpecializationOption(id="bengali", name="Bengali Literature", aliases=["Bengali"], suggested_qualifications=["BA Bengali"]),
                    SpecializationOption(id="gujarati", name="Gujarati Literature", aliases=["Gujarati"], suggested_qualifications=["BA Gujarati"]),
                    SpecializationOption(id="punjabi", name="Punjabi Literature", aliases=["Punjabi"], suggested_qualifications=["BA Punjabi"]),
                    SpecializationOption(id="urdu", name="Urdu Literature", aliases=["Urdu"], suggested_qualifications=["BA Urdu"]),
                    SpecializationOption(id="sanskrit", name="Sanskrit Studies", aliases=["Sanskrit", "Vedic Studies"], suggested_qualifications=["BA Sanskrit"]),
                    SpecializationOption(id="other-languages", name="Other Indian / Foreign Languages", aliases=["Foreign Languages", "German", "French", "Japanese"], suggested_qualifications=["BA Languages"])
                ],
                default_qualifications=["BA", "BA (Hons)"]
            ),
            StreamOption(
                id="law",
                name="Law & Legal Studies",
                description="Bar Council of India approved undergraduate law programs.",
                specializations=[
                    SpecializationOption(id="llb", name="LLB (3-Year Degree)", aliases=["LLB", "Bachelor of Laws"], suggested_qualifications=["LLB"]),
                    SpecializationOption(id="integrated-law", name="Integrated Law (BA LLB / BBA LLB / B.Com LLB)", aliases=["BA LLB", "BBA LLB", "BCom LLB", "B.Sc LLB", "5-Year Law"], suggested_qualifications=["BA LLB (Hons)", "BBA LLB (Hons)"]),
                    SpecializationOption(id="corporate-law", name="Corporate Law", aliases=["Company Law", "Commercial Law"], suggested_qualifications=["BA LLB (Corporate)"]),
                    SpecializationOption(id="criminal-law", name="Criminal Law & Criminology", aliases=["Criminal Law", "Forensic Law"], suggested_qualifications=["BA LLB (Criminal)"]),
                    SpecializationOption(id="constitutional-law", name="Constitutional Law", aliases=["Constitutional & Administrative Law"], suggested_qualifications=["BA LLB (Constitutional)"]),
                    SpecializationOption(id="other-legal-studies", name="Other Legal Studies", aliases=["Custom Law"], suggested_qualifications=["LLB (General)"])
                ],
                default_qualifications=["BA LLB", "BBA LLB", "LLB"]
            ),
            StreamOption(
                id="medicine-health-sciences",
                name="Medicine & Health Sciences",
                description="Medical, dental, pharmaceutical, nursing, and allied health programs.",
                specializations=[
                    SpecializationOption(id="mbbs", name="MBBS (Medicine & Surgery)", aliases=["MBBS", "Allopathic Medicine", "Medical Doctor"], suggested_qualifications=["MBBS"]),
                    SpecializationOption(id="bds", name="BDS (Dental Surgery)", aliases=["BDS", "Dentistry"], suggested_qualifications=["BDS"]),
                    SpecializationOption(id="nursing", name="Nursing (B.Sc Nursing)", aliases=["Nursing", "B.Sc Nursing", "GNM"], suggested_qualifications=["B.Sc Nursing"]),
                    SpecializationOption(id="pharmacy", name="Pharmacy (B.Pharm / Pharm.D)", aliases=["B.Pharm", "BPharm", "Pharm.D", "Pharmacy"], suggested_qualifications=["B.Pharm", "Pharm.D"]),
                    SpecializationOption(id="physiotherapy", name="Physiotherapy (BPT)", aliases=["BPT", "Physiotherapy"], suggested_qualifications=["BPT"]),
                    SpecializationOption(id="occupational-therapy", name="Occupational Therapy (BOT)", aliases=["BOT", "Occupational Therapy"], suggested_qualifications=["BOT"]),
                    SpecializationOption(id="allied-health-sciences", name="Allied Health Sciences (BMLT / Radiology / Optometry)", aliases=["BMLT", "Medical Lab Tech", "Radiology", "Optometry"], suggested_qualifications=["B.Sc MLT", "B.Optom"]),
                    SpecializationOption(id="public-health", name="Public Health & Community Medicine", aliases=["Community Health", "BPH"], suggested_qualifications=["B.Sc Public Health"]),
                    SpecializationOption(id="other-health-sciences", name="Other Health Sciences (AYUSH / Ayurveda / Homeopathy)", aliases=["BAMS", "BHMS", "BUMS", "BNYS", "AYUSH"], suggested_qualifications=["BAMS", "BHMS"])
                ],
                default_qualifications=["MBBS", "BDS", "B.Pharm", "B.Sc Nursing", "BPT"]
            ),
            StreamOption(
                id="agriculture-allied-sciences",
                name="Agriculture & Allied Sciences",
                description="ICAR-aligned agriculture, horticulture, dairy, and fisheries disciplines.",
                specializations=[
                    SpecializationOption(id="agriculture-ug", name="Agriculture (B.Sc Hons Agriculture)", aliases=["Agriculture", "B.Sc Agriculture"], suggested_qualifications=["B.Sc (Hons) Agriculture"]),
                    SpecializationOption(id="horticulture", name="Horticulture", aliases=["B.Sc Horticulture", "Fruit & Flower Tech"], suggested_qualifications=["B.Sc Horticulture"]),
                    SpecializationOption(id="forestry", name="Forestry & Wildlife Management", aliases=["Forestry", "B.Sc Forestry"], suggested_qualifications=["B.Sc Forestry"]),
                    SpecializationOption(id="dairy-science", name="Dairy Science & Technology", aliases=["Dairy Tech", "Dairy Engineering"], suggested_qualifications=["B.Tech Dairy Technology"]),
                    SpecializationOption(id="fisheries", name="Fisheries Science (BFSc)", aliases=["BFSc", "Fisheries"], suggested_qualifications=["BFSc"]),
                    SpecializationOption(id="food-technology", name="Food Technology & Processing", aliases=["Food Tech", "Food Science"], suggested_qualifications=["B.Tech Food Technology"]),
                    SpecializationOption(id="agricultural-biotechnology", name="Agricultural Biotechnology", aliases=["Agri Biotech"], suggested_qualifications=["B.Tech Agri Biotech"])
                ],
                default_qualifications=["B.Sc (Hons) Agriculture", "B.Tech Food Tech", "BFSc"]
            ),
            StreamOption(
                id="architecture-planning",
                name="Architecture & Planning",
                description="CoA approved architectural design, interior design, and urban planning.",
                specializations=[
                    SpecializationOption(id="architecture-ug", name="Architecture (B.Arch)", aliases=["B.Arch", "Architecture"], suggested_qualifications=["B.Arch"]),
                    SpecializationOption(id="urban-planning", name="Urban & Regional Planning (B.Plan)", aliases=["B.Plan", "Town Planning"], suggested_qualifications=["B.Plan"]),
                    SpecializationOption(id="interior-design-arch", name="Interior Design", aliases=["Interior Architecture"], suggested_qualifications=["B.Des Interior Design"]),
                    SpecializationOption(id="landscape-architecture", name="Landscape Architecture", aliases=["Landscape Design"], suggested_qualifications=["B.Arch Landscape"]),
                    SpecializationOption(id="planning-infra", name="Infrastructure Planning", aliases=["Smart City Planning"], suggested_qualifications=["B.Plan"])
                ],
                default_qualifications=["B.Arch", "B.Plan"]
            ),
            StreamOption(
                id="design-creative-arts",
                name="Design & Creative Arts",
                description="Industrial design, communication design, visual arts, and digital fashion.",
                specializations=[
                    SpecializationOption(id="fine-arts-ug", name="Fine Arts (BFA)", aliases=["BFA", "Painting", "Sculpture"], suggested_qualifications=["BFA"]),
                    SpecializationOption(id="graphic-design", name="Graphic Design & Visual Communication", aliases=["Graphic Design", "Communication Design"], suggested_qualifications=["B.Des Graphic Design"]),
                    SpecializationOption(id="ui-ux-design", name="UI/UX & Interaction Design", aliases=["UI/UX", "UX Design", "Interaction Design"], suggested_qualifications=["B.Des UI/UX"]),
                    SpecializationOption(id="animation-vfx", name="Animation, VFX & Game Design", aliases=["Animation", "Game Design", "VFX"], suggested_qualifications=["B.Des Animation", "B.Sc Animation"]),
                    SpecializationOption(id="film-production", name="Film & Television Production", aliases=["Filmmaking", "Direction", "Cinematography"], suggested_qualifications=["B.Des Film", "BA Film"]),
                    SpecializationOption(id="photography", name="Photography & Visual Media", aliases=["Commercial Photography"], suggested_qualifications=["BA Photography"]),
                    SpecializationOption(id="fashion-design", name="Fashion Design & Apparel (NIFT)", aliases=["Fashion Design", "NIFT Fashion", "Apparel Tech"], suggested_qualifications=["B.Des Fashion", "B.FTech"]),
                    SpecializationOption(id="industrial-design", name="Industrial & Product Design", aliases=["Product Design", "Automotive Design"], suggested_qualifications=["B.Des Product Design"]),
                    SpecializationOption(id="performing-arts-ug", name="Performing Arts", aliases=["Music Performance", "Theatre"], suggested_qualifications=["BPA"])
                ],
                default_qualifications=["B.Des", "BFA", "BPA"]
            ),
            StreamOption(
                id="media-communication",
                name="Media & Communication",
                description="Journalism, broadcasting, public relations, and advertising.",
                specializations=[
                    SpecializationOption(id="journalism", name="Journalism (Print / Broadcast / Digital)", aliases=["BJMC", "Journalism"], suggested_qualifications=["BJMC", "BA Journalism"]),
                    SpecializationOption(id="mass-communication", name="Mass Communication", aliases=["Mass Comm"], suggested_qualifications=["BA Mass Communication"]),
                    SpecializationOption(id="advertising", name="Advertising & Brand Strategy", aliases=["Ad & PR", "Advertising"], suggested_qualifications=["BA Advertising"]),
                    SpecializationOption(id="public-relations", name="Public Relations & Corporate Comm", aliases=["PR", "Corporate Communications"], suggested_qualifications=["BA PR"]),
                    SpecializationOption(id="digital-media", name="Digital Media & Content Creation", aliases=["Digital Journalism", "Social Media"], suggested_qualifications=["B.Sc Digital Media"]),
                    SpecializationOption(id="media-production", name="Media Production & Sound Engineering", aliases=["Sound Engineering", "Broadcast Tech"], suggested_qualifications=["B.Sc Sound Engineering"])
                ],
                default_qualifications=["BJMC", "BA Journalism", "B.Sc Mass Comm"]
            ),
            StreamOption(
                id="education",
                name="Education",
                description="Teacher education, pedagogy, and educational psychology.",
                specializations=[
                    SpecializationOption(id="elementary-education", name="Elementary Education (D.El.Ed / B.El.Ed)", aliases=["B.El.Ed", "D.El.Ed", "Primary Teacher"], suggested_qualifications=["B.El.Ed"]),
                    SpecializationOption(id="secondary-education", name="Secondary Education (B.Ed)", aliases=["B.Ed", "BEd", "Teacher Education"], suggested_qualifications=["B.Ed"]),
                    SpecializationOption(id="special-education", name="Special Education (Hearing / Visual / Learning)", aliases=["B.Ed Special Ed", "Inclusive Education"], suggested_qualifications=["B.Ed (Special Education)"]),
                    SpecializationOption(id="educational-psychology", name="Educational Psychology & Child Development", aliases=["Child Pedagogy"], suggested_qualifications=["BA Education"]),
                    SpecializationOption(id="other-education", name="Other Education Disciplines", aliases=["Custom Education"], suggested_qualifications=["BA Education"])
                ],
                default_qualifications=["B.Ed", "B.El.Ed", "D.El.Ed"]
            ),
            StreamOption(
                id="hospitality-tourism",
                name="Hospitality / Tourism",
                description="Hotel administration, culinary arts, airline hospitality, and tourism management.",
                specializations=[
                    SpecializationOption(id="hotel-management", name="Hotel Management & Catering (BHM)", aliases=["BHM", "Hotel Management", "NCHMCT"], suggested_qualifications=["BHM", "B.Sc Hospitality"]),
                    SpecializationOption(id="tourism-management", name="Tourism Management (BTTM)", aliases=["BTTM", "Tourism Administration"], suggested_qualifications=["BTTM"]),
                    SpecializationOption(id="culinary-arts", name="Culinary Arts & Bakery", aliases=["Culinary Chef", "Bakery Science"], suggested_qualifications=["B.Sc Culinary Arts"]),
                    SpecializationOption(id="hospitality-services", name="Hospitality Services & Airline Cabin", aliases=["Cabin Crew", "Hospitality"], suggested_qualifications=["B.Sc Airline Hospitality"])
                ],
                default_qualifications=["BHM", "B.Sc Hospitality", "BTTM"]
            ),
            StreamOption(
                id="library-information-science",
                name="Library & Information Science",
                description="Digital libraries, archives, and institutional knowledge management.",
                specializations=[
                    SpecializationOption(id="library-science", name="Library Science (B.Lib.I.Sc)", aliases=["B.Lib", "B.Lib.I.Sc", "Librarianship"], suggested_qualifications=["B.Lib.I.Sc"]),
                    SpecializationOption(id="information-management", name="Information & Knowledge Management", aliases=["KM", "Digital Archives"], suggested_qualifications=["B.Lib"]),
                    SpecializationOption(id="knowledge-management", name="Knowledge Management Systems", aliases=["Knowledge Systems"], suggested_qualifications=["B.Lib"])
                ],
                default_qualifications=["B.Lib.I.Sc"]
            ),
            StreamOption(
                id="sports-physical-education",
                name="Sports & Physical Education",
                description="Sports science, exercise physiology, coaching, and fitness training.",
                specializations=[
                    SpecializationOption(id="physical-education", name="Physical Education (B.P.Ed)", aliases=["B.P.Ed", "BPEd", "Physical Trainer"], suggested_qualifications=["B.P.Ed"]),
                    SpecializationOption(id="sports-science", name="Sports Science & Kinesiology", aliases=["Sports Science", "Kinesiology"], suggested_qualifications=["B.Sc Sports Science"]),
                    SpecializationOption(id="sports-management", name="Sports Management", aliases=["Sports Event Management"], suggested_qualifications=["BBA Sports Management"]),
                    SpecializationOption(id="fitness-coaching", name="Fitness, Coaching & Yoga", aliases=["Fitness Trainer", "Yoga Coaching"], suggested_qualifications=["B.Sc Yoga & Fitness"])
                ],
                default_qualifications=["B.P.Ed", "B.Sc Sports Science"]
            ),
            StreamOption(
                id="vocational-skill-education-ug",
                name="Vocational / Skill Education",
                description="UGC approved Bachelor of Vocation (B.Voc) degrees across industrial sectors.",
                specializations=[
                    SpecializationOption(id="b-voc", name="B.Voc (Bachelor of Vocation - General)", aliases=["B.Voc", "BVoc"], suggested_qualifications=["B.Voc"]),
                    SpecializationOption(id="bvoc-it", name="B.Voc in IT / Software Development", aliases=["B.Voc IT", "BVoc Software"], suggested_qualifications=["B.Voc Software Development"]),
                    SpecializationOption(id="bvoc-retail", name="B.Voc in Retail Management", aliases=["B.Voc Retail"], suggested_qualifications=["B.Voc Retail Management"]),
                    SpecializationOption(id="bvoc-healthcare", name="B.Voc in Healthcare / Paramedical", aliases=["B.Voc Healthcare"], suggested_qualifications=["B.Voc Healthcare"]),
                    SpecializationOption(id="bvoc-tourism", name="B.Voc in Tourism & Hospitality", aliases=["B.Voc Tourism"], suggested_qualifications=["B.Voc Tourism"]),
                    SpecializationOption(id="bvoc-automotive", name="B.Voc in Automotive Technology", aliases=["B.Voc Auto"], suggested_qualifications=["B.Voc Automotive"]),
                    SpecializationOption(id="other-vocational-ug", name="Other Vocational Specialization", aliases=["B.Voc Custom"], suggested_qualifications=["B.Voc (Custom)"])
                ],
                default_qualifications=["B.Voc", "D.Voc"]
            ),
            StreamOption(
                id="interdisciplinary-emerging",
                name="Interdisciplinary / Emerging",
                description="Next-generation multidisciplinary domains merging computational, biological, and social fields.",
                specializations=[
                    SpecializationOption(id="ai-interdisciplinary", name="Artificial Intelligence", aliases=["AI", "Applied AI"], suggested_qualifications=["B.Tech Applied AI"]),
                    SpecializationOption(id="data-science-interdisciplinary", name="Data Science & Quantitative Analytics", aliases=["Data Science", "Quantitative Analytics"], suggested_qualifications=["B.Sc Data Science"]),
                    SpecializationOption(id="computational-biology", name="Computational Biology & Bioinformatics", aliases=["Bioinformatics", "Computational Bio"], suggested_qualifications=["B.Tech Bioinformatics"]),
                    SpecializationOption(id="fintech", name="FinTech (Financial Technology)", aliases=["FinTech", "Financial Tech"], suggested_qualifications=["B.Sc FinTech"]),
                    SpecializationOption(id="climate-science", name="Climate Science & Sustainability", aliases=["Climate Science", "Sustainability Studies"], suggested_qualifications=["B.Sc Sustainability"]),
                    SpecializationOption(id="cognitive-science", name="Cognitive Science", aliases=["CogSci", "Cognitive Neuroscience"], suggested_qualifications=["B.Sc Cognitive Science"]),
                    SpecializationOption(id="computational-social-science", name="Computational Social Science", aliases=["CSS", "Digital Humanities"], suggested_qualifications=["BA Digital Humanities"]),
                    SpecializationOption(id="materials-science", name="Materials Science & Nanotechnology", aliases=["Nanotechnology", "Materials Science"], suggested_qualifications=["B.Sc Materials Science"]),
                    SpecializationOption(id="other-interdisciplinary-ug", name="Other Interdisciplinary Discipline", aliases=["Custom Interdisciplinary UG"], suggested_qualifications=["BS (Interdisciplinary)"])
                ],
                default_qualifications=["B.Tech", "B.Sc", "BS"]
            )
        ]
    ),

    # 4. Postgraduate
    EducationLevelOption(
        id="postgraduate",
        name="Postgraduate",
        short_label="Postgraduate (Master's)",
        description="Master's degrees, postgraduate diplomas, and specialized research programs.",
        order=4,
        streams=[
            StreamOption(
                id="postgraduate-programs",
                name="Postgraduate Degrees & Diplomas",
                description="Accredited Master's programs across technical, management, sciences, and humanities.",
                specializations=[
                    SpecializationOption(id="m-tech", name="M.E / M.Tech", aliases=["M.Tech", "ME", "Master of Technology", "MTech"], suggested_qualifications=["M.Tech CSE", "M.Tech VLSI", "M.Tech Data Science", "M.E."]),
                    SpecializationOption(id="m-sc", name="M.Sc (Master of Science)", aliases=["M.Sc", "MSc", "Master of Science"], suggested_qualifications=["M.Sc Physics", "M.Sc Mathematics", "M.Sc Data Science", "M.Sc Biotech"]),
                    SpecializationOption(id="mca", name="MCA (Master of Computer Applications)", aliases=["MCA", "Master of Computer Applications"], suggested_qualifications=["MCA"]),
                    SpecializationOption(id="mba", name="MBA (Master of Business Administration)", aliases=["MBA", "PGDM", "Master of Business Administration"], suggested_qualifications=["MBA Finance", "MBA Marketing", "MBA Analytics", "PGDM"]),
                    SpecializationOption(id="m-com", name="M.Com (Master of Commerce)", aliases=["M.Com", "MCom"], suggested_qualifications=["M.Com"]),
                    SpecializationOption(id="m-a", name="M.A (Master of Arts)", aliases=["M.A", "MA", "Master of Arts"], suggested_qualifications=["MA Economics", "MA English", "MA Pol Sci"]),
                    SpecializationOption(id="m-s", name="MS (Master of Science by Research)", aliases=["MS Research", "MS"], suggested_qualifications=["MS by Research"]),
                    SpecializationOption(id="m-des", name="M.Des (Master of Design)", aliases=["M.Des", "MDes"], suggested_qualifications=["M.Des UI/UX", "M.Des Product"]),
                    SpecializationOption(id="m-arch", name="M.Arch (Master of Architecture)", aliases=["M.Arch", "MArch"], suggested_qualifications=["M.Arch"]),
                    SpecializationOption(id="llm", name="LLM (Master of Laws)", aliases=["LLM", "Master of Laws"], suggested_qualifications=["LLM Corporate", "LLM Criminal"]),
                    SpecializationOption(id="mph", name="MPH (Master of Public Health)", aliases=["MPH", "Public Health"], suggested_qualifications=["MPH"]),
                    SpecializationOption(id="m-pharm", name="M.Pharm (Master of Pharmacy)", aliases=["M.Pharm", "MPharm"], suggested_qualifications=["M.Pharm"]),
                    SpecializationOption(id="m-ed", name="M.Ed (Master of Education)", aliases=["M.Ed", "MEd"], suggested_qualifications=["M.Ed"]),
                    SpecializationOption(id="m-s-w", name="MSW (Master of Social Work)", aliases=["MSW", "Social Work"], suggested_qualifications=["MSW"]),
                    SpecializationOption(id="pg-diploma", name="PG Diploma", aliases=["Postgraduate Diploma", "PGDCA", "PGDBA"], suggested_qualifications=["PG Diploma"]),
                    SpecializationOption(id="pg-certification", name="Professional Certification", aliases=["Postgraduate Certification"], suggested_qualifications=["Executive Certification"]),
                    SpecializationOption(id="other-postgraduate", name="Other Postgraduate Degree", aliases=["Custom PG"], suggested_qualifications=["Master's Degree (Other)"])
                ],
                default_qualifications=["M.Tech", "M.Sc", "MCA", "MBA", "MA", "LLM"]
            )
        ]
    ),

    # 5. Diploma / Polytechnic
    EducationLevelOption(
        id="diploma-polytechnic",
        name="Diploma / Polytechnic",
        short_label="Diploma / Polytechnic",
        description="3-year technical and engineering diplomas recognized by AICTE with lateral entry.",
        order=5,
        streams=[
            StreamOption(
                id="polytechnic-disciplines",
                name="Polytechnic Engineering Disciplines",
                description="Practical engineering and polytechnic diploma streams.",
                specializations=[
                    SpecializationOption(id="dip-computer-engineering", name="Computer Engineering", aliases=["Diploma CS", "Diploma Computer"], suggested_qualifications=["Diploma in Computer Engineering"]),
                    SpecializationOption(id="dip-it", name="Information Technology", aliases=["Diploma IT"], suggested_qualifications=["Diploma in IT"]),
                    SpecializationOption(id="dip-electronics", name="Electronics & Communication (ECE)", aliases=["Diploma ECE", "Diploma Electronics"], suggested_qualifications=["Diploma in Electronics"]),
                    SpecializationOption(id="dip-electrical", name="Electrical Engineering", aliases=["Diploma Electrical", "Diploma EEE"], suggested_qualifications=["Diploma in Electrical Engineering"]),
                    SpecializationOption(id="dip-mechanical", name="Mechanical Engineering", aliases=["Diploma Mechanical", "Diploma Mech"], suggested_qualifications=["Diploma in Mechanical Engineering"]),
                    SpecializationOption(id="dip-civil", name="Civil Engineering", aliases=["Diploma Civil"], suggested_qualifications=["Diploma in Civil Engineering"]),
                    SpecializationOption(id="dip-automobile", name="Automobile Engineering", aliases=["Diploma Automobile"], suggested_qualifications=["Diploma in Automobile Engineering"]),
                    SpecializationOption(id="dip-chemical", name="Chemical Engineering", aliases=["Diploma Chemical"], suggested_qualifications=["Diploma in Chemical Engineering"]),
                    SpecializationOption(id="dip-instrumentation", name="Instrumentation & Control", aliases=["Diploma Instrumentation"], suggested_qualifications=["Diploma in Instrumentation"]),
                    SpecializationOption(id="dip-architecture", name="Architecture Assistantship", aliases=["Diploma Architecture"], suggested_qualifications=["Diploma in Architectural Assistantship"]),
                    SpecializationOption(id="dip-biotechnology", name="Biotechnology", aliases=["Diploma Biotech"], suggested_qualifications=["Diploma in Biotechnology"]),
                    SpecializationOption(id="dip-other", name="Other Diploma", aliases=["Custom Diploma"], suggested_qualifications=["Polytechnic Diploma (Other)"])
                ],
                default_qualifications=["Polytechnic Diploma", "AICTE Diploma in Engineering"]
            )
        ]
    ),

    # 6. ITI / Industrial Training
    EducationLevelOption(
        id="iti-industrial-training",
        name="ITI / Industrial Training",
        short_label="ITI / Industrial Training",
        description="Craftsmen Training Scheme (CTS) and NCVET trades across Indian industrial institutes.",
        order=6,
        streams=[
            StreamOption(
                id="iti-trades",
                name="Industrial Trades",
                description="Standard trade qualifications recognized under the National Trade Certificate.",
                specializations=[
                    SpecializationOption(id="electrician", name="Electrician", aliases=["ITI Electrician"], suggested_qualifications=["NTC Electrician", "ITI Electrician Certificate"]),
                    SpecializationOption(id="fitter", name="Fitter", aliases=["ITI Fitter"], suggested_qualifications=["NTC Fitter", "ITI Fitter Certificate"]),
                    SpecializationOption(id="electronics-mechanic", name="Electronics Mechanic", aliases=["ITI Electronics", "Radio TV Mechanic"], suggested_qualifications=["NTC Electronics Mechanic"]),
                    SpecializationOption(id="computer-operator-programming", name="Computer Operator / Programming (COPA)", aliases=["COPA", "ITI COPA", "Computer Operator"], suggested_qualifications=["NTC COPA", "ITI COPA Certificate"]),
                    SpecializationOption(id="welder", name="Welder (Gas & Electric)", aliases=["ITI Welder"], suggested_qualifications=["NTC Welder"]),
                    SpecializationOption(id="plumber", name="Plumber", aliases=["ITI Plumber"], suggested_qualifications=["NTC Plumber"]),
                    SpecializationOption(id="mechanic-motor-vehicle", name="Mechanic (Motor Vehicle / Diesel)", aliases=["MMV", "Diesel Mechanic"], suggested_qualifications=["NTC Motor Mechanic"]),
                    SpecializationOption(id="draughtsman", name="Draughtsman (Civil / Mechanical)", aliases=["ITI Draughtsman"], suggested_qualifications=["NTC Draughtsman"]),
                    SpecializationOption(id="refrigeration-ac", name="Refrigeration & AC (RAC)", aliases=["RAC", "AC Mechanic"], suggested_qualifications=["NTC Refrigeration & AC"]),
                    SpecializationOption(id="turner", name="Turner & Machinist", aliases=["Turner", "Machinist"], suggested_qualifications=["NTC Turner"]),
                    SpecializationOption(id="other-trade", name="Other Trade", aliases=["Custom ITI Trade"], suggested_qualifications=["National Trade Certificate (Other)"])
                ],
                default_qualifications=["National Trade Certificate (NTC)", "National Apprenticeship Certificate (NAC)"]
            )
        ]
    ),

    # 7. Vocational / Skill Education
    EducationLevelOption(
        id="vocational-skill-education",
        name="Vocational / Skill Education",
        short_label="Skill & NSQF Sectors",
        description="National Skills Qualifications Framework (NSQF) courses and PMKVY certifications across 59 sectors.",
        order=7,
        streams=[
            StreamOption(
                id="nsqf-industry-sectors",
                name="NSQF Industry Sectors",
                description="Certified sector skills mapped to official competency levels.",
                specializations=[
                    SpecializationOption(id="skill-it-ites", name="IT / ITES", aliases=["Software Skills", "BPO"], suggested_qualifications=["NSQF Level 4/5 Certificate"]),
                    SpecializationOption(id="skill-healthcare", name="Healthcare & Allied Care", aliases=["General Duty Assistant", "Phlebotomy"], suggested_qualifications=["NSQF Healthcare Certificate"]),
                    SpecializationOption(id="skill-retail", name="Retail Operations", aliases=["Store Assistant", "Sales"], suggested_qualifications=["NSQF Retail Certificate"]),
                    SpecializationOption(id="skill-automotive", name="Automotive & EV Technician", aliases=["EV Technician", "Auto Electrician"], suggested_qualifications=["NSQF Automotive Certificate"]),
                    SpecializationOption(id="skill-agriculture", name="Agriculture & Micro-Irrigation", aliases=["Organic Grower", "Soil Testing"], suggested_qualifications=["NSQF Agriculture Certificate"]),
                    SpecializationOption(id="skill-beauty-wellness", name="Beauty & Wellness", aliases=["Cosmetology", "Wellness"], suggested_qualifications=["NSQF Beauty Certificate"]),
                    SpecializationOption(id="skill-tourism", name="Tourism & Hospitality", aliases=["Front Office", "F&B Service"], suggested_qualifications=["NSQF Tourism Certificate"]),
                    SpecializationOption(id="skill-logistics", name="Logistics & Warehousing", aliases=["Supply Chain Assistant", "Warehouse"], suggested_qualifications=["NSQF Logistics Certificate"]),
                    SpecializationOption(id="skill-construction", name="Construction & Masonry", aliases=["Site Supervisor", "Bar Bending"], suggested_qualifications=["NSQF Construction Certificate"]),
                    SpecializationOption(id="skill-electronics", name="Electronics & Solar Technician", aliases=["Solar Panel Technician"], suggested_qualifications=["NSQF Solar Certificate"]),
                    SpecializationOption(id="other-skill-program", name="Other Skill Program", aliases=["Custom Skill"], suggested_qualifications=["Skill India Certificate (Other)"])
                ],
                default_qualifications=["NSQF Level 3 Certificate", "NSQF Level 4 Certificate", "NSQF Level 5 Certificate"]
            )
        ]
    ),

    # 8. Professional Degree
    EducationLevelOption(
        id="professional-degree",
        name="Professional Degree",
        short_label="Professional Degree",
        description="Statutory professional degree programs (CA, CS, CMA, CFA, Actuarial, Medical specialties).",
        order=8,
        streams=[
            StreamOption(
                id="statutory-qualifications",
                name="Statutory Professional Bodies",
                description="Chartered professional qualifications governing corporate and financial practice.",
                specializations=[
                    SpecializationOption(id="chartered-accountancy", name="Chartered Accountancy (CA - ICAI)", aliases=["CA", "ICAI", "Chartered Accountant"], suggested_qualifications=["Chartered Accountant (FCA / ACA)", "CA Final", "CA Intermediate"]),
                    SpecializationOption(id="company-secretary", name="Company Secretary (CS - ICSI)", aliases=["CS", "ICSI", "Company Secretary"], suggested_qualifications=["Company Secretary (ACS / FCS)"]),
                    SpecializationOption(id="cost-management-accountant", name="Cost & Management Accountant (CMA - ICMAI)", aliases=["CMA", "ICWA", "ICMAI"], suggested_qualifications=["Cost & Management Accountant (ACMA)"]),
                    SpecializationOption(id="cfa-charter", name="CFA (Chartered Financial Analyst)", aliases=["CFA", "CFA Institute"], suggested_qualifications=["CFA Charterholder", "CFA Level 1/2"]),
                    SpecializationOption(id="actuarial-science-prof", name="Actuarial Science (IAI)", aliases=["Actuary", "IAI Actuarial"], suggested_qualifications=["Fellow of Institute of Actuaries of India"]),
                    SpecializationOption(id="acca", name="ACCA (Association of Chartered Certified Accountants)", aliases=["ACCA"], suggested_qualifications=["ACCA Member"]),
                    SpecializationOption(id="other-professional", name="Other Professional Degree", aliases=["Custom Professional"], suggested_qualifications=["Professional Member"])
                ],
                default_qualifications=["Professional Member / Associate"]
            )
        ]
    ),

    # 9. Certification / Professional Certification
    EducationLevelOption(
        id="certification",
        name="Certification / Professional Certification",
        short_label="Certifications",
        description="Industry certifications, technology credentials, and government service training programs.",
        order=9,
        streams=[
            StreamOption(
                id="industry-certifications",
                name="Industry & Government Credentials",
                description="Cloud, security, data, and government in-service certifications.",
                specializations=[
                    SpecializationOption(id="cloud-certifications", name="Cloud Architecture (AWS / GCP / Azure)", aliases=["AWS Certified", "GCP Professional", "Azure Solutions Architect"], suggested_qualifications=["AWS Solutions Architect", "GCP Cloud Architect"]),
                    SpecializationOption(id="cybersecurity-certifications", name="Cybersecurity (CEH / CISSP / CompTIA)", aliases=["CEH", "CISSP", "CompTIA Security+"], suggested_qualifications=["CEH", "CISSP", "Security+"]),
                    SpecializationOption(id="data-ai-certifications", name="Data & AI (TensorFlow / Databricks / PMP)", aliases=["TensorFlow Developer", "Databricks Engineer"], suggested_qualifications=["Databricks Certified", "PMP"]),
                    SpecializationOption(id="official-statistics-certifications", name="Official Statistics & Survey Methodology (MOSPI / NSC)", aliases=["MOSPI", "NSC", "JSO Certification", "SSO"], suggested_qualifications=["Government Statistical In-Service Certificate"]),
                    SpecializationOption(id="other-certification", name="Other Industry Certification", aliases=["Custom Certification"], suggested_qualifications=["Certified Professional"])
                ],
                default_qualifications=["Industry Certificate", "Government Training Certificate"]
            )
        ]
    ),

    # 10. Other
    EducationLevelOption(
        id="other",
        name="Other",
        short_label="Other / Custom",
        description="Self-taught, bootcamps, or alternative institutional systems.",
        order=10,
        streams=[
            StreamOption(
                id="alternative-self-taught",
                name="Alternative & Self-Taught",
                description="Custom pathway, self-taught coding, or bootcamp immersion.",
                specializations=[
                    SpecializationOption(id="self-taught-builder", name="Self-Taught Developer / Builder", aliases=["Self-Taught", "Autodidact"], suggested_qualifications=["Self-Directed Portfolio"]),
                    SpecializationOption(id="coding-bootcamp", name="Coding Bootcamp Graduate", aliases=["Bootcamp", "Full Stack Bootcamp"], suggested_qualifications=["Bootcamp Certificate"]),
                    SpecializationOption(id="custom-other", name="Custom Educational Background", aliases=["Other", "Custom"], suggested_qualifications=["Other"])
                ],
                default_qualifications=["Certificate of Completion", "Self-Taught"]
            )
        ]
    )
]

def get_education_catalog() -> List[EducationLevelOption]:
    """Returns the authoritative list of normalized education levels and streams."""
    return EDUCATION_CATALOG

def search_education_taxonomy(query: str) -> List[Dict[str, Any]]:
    """
    Searches across Education Levels, Streams, Specializations, and Aliases.
    Supports queries like 'CSE', 'ECE', 'BCA', 'PCM', 'ITI COPA', 'Mechanical', 'MBBS'.
    """
    if not query or not query.strip():
        return []

    q = query.strip().lower()
    matches = []

    for level in EDUCATION_CATALOG:
        for stream in level.streams:
            for spec in stream.specializations:
                # 1. Match alias exact or contains
                alias_match = any(q == a.lower() or q in a.lower() for a in spec.aliases)
                name_match = q in spec.name.lower()
                stream_match = q in stream.name.lower()
                level_match = q in level.name.lower()

                if alias_match or name_match:
                    matches.append({
                        "education_level_id": level.id,
                        "education_level_name": level.name,
                        "stream_id": stream.id,
                        "stream_name": stream.name,
                        "specialization_id": spec.id,
                        "specialization_name": spec.name,
                        "suggested_qualifications": spec.suggested_qualifications or stream.default_qualifications,
                        "match_type": "alias" if alias_match else "name"
                    })

    # Return top unique matches
    unique_matches = []
    seen = set()
    for m in matches:
        key = (m["education_level_id"], m["stream_id"], m["specialization_id"])
        if key not in seen:
            seen.add(key)
            unique_matches.append(m)
        if len(unique_matches) >= 15:
            break

    return unique_matches

EDUCATION_BOARDS = [
    {"id": "cbse", "name": "CBSE (Central Board of Secondary Education)", "category": "National"},
    {"id": "cisce-isc", "name": "CISCE / ISC (Council for the Indian School Certificate Examinations)", "category": "National"},
    {"id": "state-board", "name": "State Board (HSC / SSC / PUC)", "category": "State"},
    {"id": "nios", "name": "NIOS (National Institute of Open Schooling)", "category": "Open"},
    {"id": "ib-cambridge", "name": "International (IB / Cambridge IGCSE / A-Levels)", "category": "International"},
    {"id": "other-board", "name": "Other Board", "category": "Other"}
]

INSTITUTION_TYPES = [
    {"id": "central-university", "name": "Central University (IIT, NIT, IIIT, IISER, CU)"},
    {"id": "state-university", "name": "State Public University / Govt College"},
    {"id": "autonomous-college", "name": "Autonomous Institution / Engineering College"},
    {"id": "deemed-university", "name": "Deemed to be University"},
    {"id": "private-university", "name": "Private University"},
    {"id": "polytechnic-iti", "name": "Polytechnic / Industrial Training Institute"},
    {"id": "school-institution", "name": "School / Junior College (+2)"},
    {"id": "other-institution", "name": "Other Institution"}
]

STUDY_YEARS = [
    {"id": "year-1", "name": "1st Year / Fresher"},
    {"id": "year-2", "name": "2nd Year / Sophomore"},
    {"id": "year-3", "name": "3rd Year / Pre-Final Year"},
    {"id": "year-4", "name": "4th Year / Final Year"},
    {"id": "graduated", "name": "Graduated / Degree Completed"},
    {"id": "working-professional", "name": "Working Professional / Upskilling"}
]

def get_education_levels() -> List[Dict[str, Any]]:
    """Returns metadata for all top-level education tiers."""
    return [
        {
            "id": lvl.id,
            "name": lvl.name,
            "short_label": lvl.short_label,
            "description": lvl.description,
            "order": lvl.order,
            "stream_count": len(lvl.streams)
        }
        for lvl in EDUCATION_CATALOG
    ]

def get_streams_for_level(level_id: str) -> Optional[List[StreamOption]]:
    """Returns all streams belonging to a specific education level ID."""
    cleaned = (level_id or "").strip().lower()
    for lvl in EDUCATION_CATALOG:
        if lvl.id == cleaned or lvl.name.lower() == cleaned:
            return lvl.streams
    return None

def get_specializations_for_stream(stream_id: str) -> Optional[List[SpecializationOption]]:
    """Returns all specializations under a specific stream ID across any level."""
    cleaned = (stream_id or "").strip().lower()
    for lvl in EDUCATION_CATALOG:
        for st in lvl.streams:
            if st.id == cleaned or st.name.lower() == cleaned:
                return st.specializations
    return None

def get_education_boards() -> List[Dict[str, str]]:
    """Returns supported Indian examination/university boards."""
    return EDUCATION_BOARDS

def get_institution_types() -> List[Dict[str, str]]:
    """Returns recognized categories of higher education / training institutions."""
    return INSTITUTION_TYPES

def get_study_years() -> List[Dict[str, str]]:
    """Returns standard academic progression year options."""
    return STUDY_YEARS
