# -*- coding: utf-8 -*-
import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, KeepTogether, PageBreak, HRFlowable
)
from reportlab.pdfgen import canvas
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super().showPage()
        super().save()

    def draw_header_footer(self, page_count):
        if self._pageNumber == 1:
            return

        self.saveState()
        self.setFont('Helvetica-Bold', 8)
        self.setFillColor(colors.HexColor('#475569'))
        self.drawString(54, letter[1] - 36, 'PATHFINDER — Technical Architecture & Product Report')
        self.setFont('Helvetica', 8)
        self.drawRightString(letter[0] - 54, letter[1] - 36, 'Phases 6–8 Release-Certified')
        self.setStrokeColor(colors.HexColor('#CBD5E1'))
        self.setLineWidth(0.75)
        self.line(54, letter[1] - 42, letter[0] - 54, letter[1] - 42)

        self.line(54, 48, letter[0] - 54, 48)
        self.setFont('Helvetica', 8)
        self.drawString(54, 34, 'PathFinder: Domain-Agnostic Adaptive Career Intelligence & Employability Platform')
        page_str = f'Page {self._pageNumber} of {page_count}'
        self.drawRightString(letter[0] - 54, 34, page_str)
        self.restoreState()

from report_data import (
    DOC_TITLE, DOC_SUBTITLE, DOC_METADATA, PROBLEM_TABLE, DOMAINS_TABLE,
    PHASE6_STAGES, PHASE7_STAGES, PHASE8_STAGES, SECURITY_TABLE, QA_SUMMARY_TABLE, TECH_STACK_TABLE
)

def build_pdf(filename='PATHFINDER_PROJECT_REPORT.pdf'):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=24, leading=30,
        textColor=colors.HexColor('#0F172A'), spaceAfter=6
    )
    subtitle_style = ParagraphStyle(
        'DocSubTitle', parent=styles['Normal'],
        fontName='Helvetica', fontSize=11, leading=15,
        textColor=colors.HexColor('#1E40AF'), spaceAfter=10
    )
    h1_style = ParagraphStyle(
        'Heading1_Custom', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=13, leading=17,
        textColor=colors.HexColor('#1E40AF'), spaceBefore=12, spaceAfter=6,
        keepWithNext=True
    )
    h2_style = ParagraphStyle(
        'Heading2_Custom', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=10.5, leading=14,
        textColor=colors.HexColor('#0F172A'), spaceBefore=8, spaceAfter=4,
        keepWithNext=True
    )
    h3_style = ParagraphStyle(
        'Heading3_Custom', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=9.5, leading=13,
        textColor=colors.HexColor('#334155'), spaceBefore=6, spaceAfter=3,
        keepWithNext=True
    )
    body_style = ParagraphStyle(
        'Body_Custom', parent=styles['Normal'],
        fontName='Helvetica', fontSize=8.5, leading=12,
        textColor=colors.HexColor('#1E293B'), spaceAfter=5
    )
    bullet_style = ParagraphStyle(
        'Bullet_Custom', parent=styles['Normal'],
        fontName='Helvetica', fontSize=8.5, leading=12,
        textColor=colors.HexColor('#1E293B'), leftIndent=12, firstLineIndent=-8,
        spaceAfter=2.5
    )
    callout_style = ParagraphStyle(
        'Callout_Custom', parent=styles['Normal'],
        fontName='Helvetica-Oblique', fontSize=8.2, leading=11.5,
        textColor=colors.HexColor('#1E3A8A'), spaceAfter=4
    )
    table_head_style = ParagraphStyle(
        'TH_Custom', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=7.8, leading=10,
        textColor=colors.white
    )
    table_body_style = ParagraphStyle(
        'TB_Custom', parent=styles['Normal'],
        fontName='Helvetica', fontSize=7.5, leading=10,
        textColor=colors.HexColor('#1E293B')
    )
    caption_style = ParagraphStyle(
        'Caption_Custom', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=7.5, leading=10,
        textColor=colors.HexColor('#475569'), alignment=1, spaceAfter=6
    )

    story = []

    def p(text, style=body_style):
        return Paragraph(text, style)

    def heading1(text):
        return Paragraph(text, h1_style)

    def heading2(text):
        return Paragraph(text, h2_style)

    def heading3(text):
        return Paragraph(text, h3_style)

    def bullet(text):
        return Paragraph(f'• {text}', bullet_style)

    def callout_box(text, title='KEY ARCHITECTURAL PRINCIPLE'):
        t = Table(
            [[Paragraph(f'<b>{title}:</b> {text}', callout_style)]],
            colWidths=[504]
        )
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#EFF6FF')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#93C5FD')),
            ('PADDING', (0, 0), (-1, -1), 7),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        return t

    def make_table(header_data, rows_data, col_widths=None):
        table_data = [[Paragraph(h, table_head_style) for h in header_data]]
        for row in rows_data:
            table_data.append([Paragraph(str(cell).replace('\n', '<br/>'), table_body_style) for cell in row])
        
        t = Table(table_data, colWidths=col_widths, repeatRows=1)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E40AF')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#FFFFFF'), colors.HexColor('#F8FAFC')]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ('TOPPADDING', (0, 0), (-1, -1), 3.5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
            ('LEFTPADDING', (0, 0), (-1, -1), 4.5),
            ('RIGHTPADDING', (0, 0), (-1, -1), 4.5),
        ]))
        return t

    # 1. COVER PAGE
    story.append(Spacer(1, 30))
    story.append(HRFlowable(width='100%', thickness=4, color=colors.HexColor('#1E40AF'), spaceAfter=14))
    story.append(p(DOC_TITLE, title_style))
    story.append(p(DOC_SUBTITLE, subtitle_style))
    story.append(p('Comprehensive Engineering Architecture, System Design & Release Verification Report', ParagraphStyle('CoverSub', parent=body_style, fontSize=10, leading=14, textColor=colors.HexColor('#475569'))))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#CBD5E1'), spaceAfter=15))

    t_cover = Table([[Paragraph(f'<b>{k}</b>', table_body_style), Paragraph(v, table_body_style)] for k, v in DOC_METADATA], colWidths=[150, 354])
    t_cover.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#E2E8F0')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('PADDING', (0, 0), (-1, -1), 4.5),
    ]))
    story.append(t_cover)

    story.append(Spacer(1, 20))
    story.append(callout_box(
        'PathFinder is an authoritative, closed-loop technical career platform that unifies theoretical learning graphs, real-time behavioral telemetry, exponential skill decay, applied engineering project sandboxes, verifiable portfolio evidence, and mathematical employability estimation.',
        'EXECUTIVE POSITIONING'
    ))
    story.append(PageBreak())

    # 2. TABLE OF CONTENTS
    story.append(heading1('Table of Contents'))
    story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#1E40AF'), spaceAfter=8))

    toc_items = [
        ('1. Executive Summary & Core Value Proposition', '3'),
        ('2. Problem Statement & Structural Learning Breakdown', '4'),
        ('3. Product Vision & The Closed-Loop Lifecycle', '5'),
        ('4. Layered Technical Architecture & Subsystem Topology', '6'),
        ('5. Domain-Agnostic Core Philosophy & Competency Graph', '8'),
        ('6. Phase 6 Deep-Dive: UI/UX & Interactive Visualization', '9'),
        ('7. Phase 7 Deep-Dive: Intelligence, Velocity & Skill Decay', '11'),
        ('8. Phase 8 Deep-Dive: Experiential Learning & Employability', '14'),
        ('9. Core Intelligence Algorithms & Mathematical Formulations', '17'),
        ('10. Universal Decision Traceability & 8-Factor Explainability', '19'),
        ('11. AI Career Coach Architecture, Grounding & Safety Rules', '20'),
        ('12. Security Architecture & Threat Mitigation Matrix', '22'),
        ('13. Relational Data Architecture & Immutable State History', '23'),
        ('14. Practical Competency vs Theoretical Learning Retention', '24'),
        ('15. The Employability Estimation Model & Action Dispatcher', '25'),
        ('16. Opportunity Intelligence & Match Scoring Pipeline', '26'),
        ('17. Application Execution & Action Lifecycle Tracker', '27'),
        ('18. Resume ATS Optimization & Technical Mock Interviews', '28'),
        ('19. Multi-Domain Verification Across 7 Technical Careers', '29'),
        ('20. Comprehensive Verification, Regression Testing & QA', '30'),
        ('21. Production Readiness & Release Certification Status', '31'),
        ('22. Technical Limitations & Operational Boundaries', '32'),
        ('23. Strategic Future Roadmap & Phase 9 Architecture', '33'),
        ('24. Conclusion & Final Release Summary', '34'),
        ('Appendix A: Verified Technology Stack Catalog', '35'),
        ('Appendix B: Complete REST API Endpoint Inventory', '35')
    ]
    t_toc = Table([[Paragraph(title, table_body_style), Paragraph(page, ParagraphStyle('TR', parent=table_body_style, alignment=2))] for title, page in toc_items], colWidths=[430, 74])
    t_toc.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor('#F1F5F9')),
        ('PADDING', (0, 0), (-1, -1), 2),
    ]))
    story.append(t_toc)
    story.append(PageBreak())

    # 3. EXECUTIVE SUMMARY
    story.append(heading1('1. Executive Summary & Core Value Proposition'))
    story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#1E40AF'), spaceAfter=8))
    story.append(p('The modern technical workforce faces a profound paradox: while access to educational content has expanded exponentially, technical hiring and career development remain fundamentally broken. Learners are overwhelmed by thousands of disconnected courses, static linear syllabi that ignore prior knowledge, invisible prerequisite bottlenecks, and an industry reality where <i>course completion does not equate to practical engineering capability</i>.'))
    story.append(p('<b>PathFinder</b> solves this breakdown as a <b>Domain-Agnostic Adaptive Career Intelligence and Employability Platform</b>. Rather than functioning as a course directory or an ungrounded chatbot, PathFinder is engineered as an authoritative, closed-loop career development platform connecting curriculum navigation directly to hands-on engineering execution and job placement readiness.'))
    story.append(p('The platform is developed and verified across three major engineering phases:'))
    story.append(bullet('<b>Phase 6 (UI/UX & Interactive Design System)</b>: Delivered an accessible web application featuring interactive skill dependency graphs, dynamic roadmap visualization, diagnostic calibration, and multi-domain curriculum navigation.'))
    story.append(bullet('<b>Phase 7 (Deep Intelligence & Personalization)</b>: Built backend-authoritative engines for real-time behavior telemetry, learning velocity modeling, multi-factor skill mastery, exponential half-life skill decay, DAG-aware prerequisite distance, market signal provenance, and universal decision traceability.'))
    story.append(bullet('<b>Phase 8 (Experiential Learning & Employability)</b>: Established practical competency measurement, real-world multi-milestone projects, incident response scenario simulations, rubric-graded assessments, verifiable career portfolios, opportunity match scoring, and resume ATS/interview simulators.'))

    if os.path.exists('report_assets/fig_continuous_loop.png'):
        story.append(Spacer(1, 4))
        story.append(Image('report_assets/fig_continuous_loop.png', width=6.0*inch, height=2.8*inch))
        story.append(p('Figure 1.1 — The PathFinder Closed-Loop Career Development Lifecycle', caption_style))

    story.append(p('PathFinder is release-certified with <b>142/142 passing backend regression tests</b>, a clean Next.js 14.2 production build, zero P0/P1 security blockers, and complete domain-agnostic validation across AI/ML Engineering, Cybersecurity, VLSI Hardware, Data Science, Full Stack, DevOps, and Software Engineering.'))
    story.append(PageBreak())

    # 4. PROBLEM STATEMENT
    story.append(heading1('2. Problem Statement & Structural Learning Breakdown'))
    story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#1E40AF'), spaceAfter=8))
    story.append(p('Traditional learning management systems and static roadmap websites suffer from fundamental architectural defects that mislead learners and produce weak candidate outcomes:'))
    story.append(make_table(['Educational Failure Mode', 'Real-World Consequence', 'PathFinder Engineering Solution'], PROBLEM_TABLE, [130, 170, 204]))
    story.append(Spacer(1, 6))

    # 5. PRODUCT VISION
    story.append(heading1('3. Product Vision & The Closed-Loop Lifecycle'))
    story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#1E40AF'), spaceAfter=8))
    story.append(p('PathFinder replaces static, open-ended course consumption with a closed-loop engineering cycle: <b>LEARN → MEASURE → ADAPT → PRACTICE → DEMONSTRATE → ANALYZE → PREPARE → EXECUTE</b>. Every interaction (quiz attempt, code milestone, scenario decision) produces authoritative telemetry that continuously updates the learner\'s skill confidence, velocity, decay index, and employability estimate.'))
    story.append(PageBreak())

    # 6. SYSTEM ARCHITECTURE
    story.append(heading1('4. Layered Technical Architecture & Subsystem Topology'))
    story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#1E40AF'), spaceAfter=8))
    story.append(p('PathFinder is architected as a layered, modular platform where the backend remains the strict single source of truth for all calculations, scores, adaptations, and state transitions. The frontend acts solely as a high-fidelity presentation and interaction layer.'))

    if os.path.exists('report_assets/fig_architecture.png'):
        story.append(Image('report_assets/fig_architecture.png', width=6.2*inch, height=3.2*inch))
        story.append(p('Figure 4.1 — Layered Technical Architecture of the PathFinder Platform', caption_style))

    story.append(heading2('Core Subsystem Responsibilities'))
    story.append(bullet('<b>Presentation Layer (Next.js 14.2 App Router)</b>: Server-rendered and client-hydrated pages providing accessible navigation, reactive state management, interactive SVG/Recharts DAG visualizers, and slide-over AI coach modals.'))
    story.append(bullet('<b>API Gateway & Security (FastAPI)</b>: High-performance asynchronous REST endpoints enforcing JWT token validation, profile-scoped authorization boundaries, CORS policies, and strict Pydantic payload serialization.'))
    story.append(bullet('<b>Intelligence & Adaptive Engines</b>: Pure mathematical algorithms calculating rolling velocity, 6-tier skill mastery, exponential decay curves, prerequisite topological distance, and dynamic roadmap mutations.'))
    story.append(bullet('<b>Experiential & Practical Engine</b>: Applied engineering milestone verifiers, production incident scenario simulators, rubric-graded assessment engines, and verified career portfolio aggregators.'))
    story.append(bullet('<b>AI Career Coach & Security Sandbox</b>: PromptGuard-protected, ContextBuilder-grounded conversational advisor with strict ActionValidator gatekeeping preventing unauthorized state writes.'))
    story.append(bullet('<b>Persistence Layer (SQLAlchemy ORM)</b>: Relational database architecture preserving immutable historical audit logs for roadmap versions, scenario attempts, assessments, and decision traces.'))
    story.append(PageBreak())

    # 7. DOMAIN-AGNOSTIC CORE
    story.append(heading1('5. Domain-Agnostic Core Philosophy & Competency Graph'))
    story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#1E40AF'), spaceAfter=8))
    story.append(p('A fundamental engineering achievement of PathFinder is its <b>domain-agnostic architecture</b>. The algorithms powering skill graphs, adaptive roadmaps, prerequisite distance, decay modeling, project evaluation, and employability estimation contain zero domain-specific branching.'))
    story.append(p('The platform treats all technical careers as directed acyclic graphs of abstract competencies. Whether evaluating a candidate for VLSI Hardware Engineering (RTL synthesis, timing closure) or AI/ML Engineering (PyTorch kernels, vector RAG), the exact same backend engine processes graph topology, evaluates rubric dimensions, and calculates readiness.'))

    if os.path.exists('report_assets/fig_skill_dag.png'):
        story.append(Image('report_assets/fig_skill_dag.png', width=6.0*inch, height=2.8*inch))
        story.append(p('Figure 5.1 — Topological Prerequisite Gating and Decay Overlay on Abstract Skill DAG', caption_style))

    story.append(make_table(['Technical Career Domain', 'Graph Nodes (Sample)', 'Applied Project Scope', 'Incident Scenario Simulation'], DOMAINS_TABLE, [105, 130, 139, 130]))
    story.append(PageBreak())

    # 8. PHASE 6 DEEP-DIVE
    story.append(heading1('6. Phase 6 Deep-Dive: UI/UX & Interactive Visualization'))
    story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#1E40AF'), spaceAfter=8))
    story.append(p('Phase 6 delivered a responsive, accessible application adhering to WCAG standards with interactive visualization tools across 12 implementation stages:'))
    story.append(make_table(['Phase 6 Stage', 'Core Functionality Delivered', 'Verification Metric'], PHASE6_STAGES, [110, 274, 120]))
    story.append(PageBreak())

    # 9. PHASE 7 DEEP-DIVE
    story.append(heading1('7. Phase 7 Deep-Dive: Intelligence, Velocity & Skill Decay'))
    story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#1E40AF'), spaceAfter=8))
    story.append(p('Phase 7 introduced mathematical intelligence engines running autonomously on the backend to model progression, retention, and decay:'))
    story.append(make_table(['Phase 7 Stage', 'Core Functionality Delivered', 'Verification Metric'], PHASE7_STAGES, [115, 269, 120]))
    story.append(PageBreak())

    # 10. PHASE 8 DEEP-DIVE
    story.append(heading1('8. Phase 8 Deep-Dive: Experiential Learning & Employability'))
    story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#1E40AF'), spaceAfter=8))
    story.append(p('Phase 8 elevates PathFinder into an experiential career development system, establishing the critical boundary between <b>Theoretical Learning Retention</b> and <b>Practical Demonstrated Engineering Competency</b>:'))
    story.append(make_table(['Phase 8 Stage', 'Architectural Responsibility', 'API Endpoints'], PHASE8_STAGES, [110, 230, 164]))
    story.append(Spacer(1, 6))

    if os.path.exists('report_assets/fig_employability_pie.png'):
        story.append(Image('report_assets/fig_employability_pie.png', width=5.6*inch, height=2.6*inch))
        story.append(p('Figure 8.1 — Factor Breakdown of the PathFinder Employability Estimate', caption_style))
    story.append(PageBreak())

    # 11. CORE ALGORITHMS
    story.append(heading1('9. Core Intelligence Algorithms & Mathematical Formulations'))
    story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#1E40AF'), spaceAfter=8))
    story.append(p('PathFinder operates entirely on deterministic, verifiable mathematical models:'))

    story.append(heading2('9.1 Exponential Half-Life Skill Decay Formula'))
    story.append(callout_box(
        'R(Δt) = 2^(-Δt / T_half), where Δt is elapsed days since last practice and T_half is skill half-life (30 days). Freshness states: Fresh (>=0.80), Aging (0.60-0.79), Review Recommended (0.40-0.59), Decay Risk (<0.40).',
        'SKILL RETENTION FORMULA'
    ))

    story.append(heading2('9.2 Career Readiness Index Formula'))
    story.append(callout_box(
        'Readiness = clamp(0, 100, (0.45 * Competency + 0.25 * Prerequisites + 0.20 * Freshness - Critical_Blocker_Penalty) * 100)',
        'CAREER READINESS FORMULA'
    ))

    story.append(heading2('9.3 Composite Employability Index Formula'))
    story.append(callout_box(
        'Employability = clamp(0, 100, (0.35 * CareerReadiness + 0.35 * PracticalReadiness + 0.15 * PortfolioQuality + 0.10 * MarketAlignment + 0.05 * EvidenceFreshness) * 100)',
        'EMPLOYABILITY INDEX FORMULA'
    ))

    story.append(heading2('9.4 Multi-Factor Opportunity Match Score Formula'))
    story.append(callout_box(
        'MatchScore = (0.35 * SkillCoverage + 0.30 * TheoreticalReadiness + 0.20 * PortfolioFit + 0.15 * RoleAlignment) * 100',
        'OPPORTUNITY MATCH FORMULA'
    ))
    story.append(PageBreak())

    # 12. DECISION TRACEABILITY & EXPLAINABILITY
    story.append(heading1('10. Universal Decision Traceability & 8-Factor Explainability'))
    story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#1E40AF'), spaceAfter=8))
    story.append(p('Every recommendation, adaptation, and readiness score produced by PathFinder is fully explainable via the <b>Universal Decision Trace</b> architecture. The system exposes the exact weights, input signals, and human-readable rationale:'))

    if os.path.exists('report_assets/fig_decision_trace.png'):
        story.append(Image('report_assets/fig_decision_trace.png', width=6.0*inch, height=2.5*inch))
        story.append(p('Figure 10.1 — Universal Decision Traceability and Explainability Flow', caption_style))

    story.append(bullet('<b>Goal Relevance (25%)</b>: Topological distance to learner target career.'))
    story.append(bullet('<b>Skill Gap Severity (20%)</b>: Deficit relative to required benchmark mastery.'))
    story.append(bullet('<b>Prerequisite Preparedness (15%)</b>: Confidence in immediate upstream dependencies.'))
    story.append(bullet('<b>Difficulty Fit (10%)</b>: Alignment with learner\'s difficulty tolerance.'))
    story.append(bullet('<b>Format Preference (10%)</b>: Alignment with preferred modalities (projects/videos).'))
    story.append(bullet('<b>Pacing Fit (10%)</b>: Calibration to weekly study hours and velocity.'))
    story.append(bullet('<b>Engagement History (5%)</b>: Historical completion consistency.'))
    story.append(bullet('<b>Curriculum Diversity (5%)</b>: Prevention of resource type exhaustion.'))
    story.append(PageBreak())

    # 13. AI ARCHITECTURE & SECURITY
    story.append(heading1('11. AI Career Coach Architecture, Grounding & Safety Rules'))
    story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#1E40AF'), spaceAfter=8))
    story.append(p('PathFinder\'s AI Career Coach is designed with a <b>strict security-first, grounded architecture</b>. Unlike unconstrained LLM assistants, the Coach is strictly an explanatory and advisory layer operating over authoritative backend data.'))

    if os.path.exists('report_assets/fig_ai_safety.png'):
        story.append(Image('report_assets/fig_ai_safety.png', width=6.2*inch, height=2.7*inch))
        story.append(p('Figure 11.1 — AI Career Coach Grounding and Security Gateway Pipeline', caption_style))

    story.append(heading2('Non-Negotiable AI Safety Rules'))
    story.append(bullet('<b>PromptGuard Defense</b>: Deterministically intercepts and refuses jailbreaks, system prompt extraction, developer override commands, and roleplay bypass attacks.'))
    story.append(bullet('<b>ContextBuilder Grounding</b>: The LLM prompt is dynamically assembled from authoritative database records (velocity, readiness score, critical blockers, decay alerts, market demand). The LLM is prohibited from guessing or fabricating learner achievements.'))
    story.append(bullet('<b>ActionValidator Gatekeeping</b>: Suggested learning actions or roadmap adaptations generated by AI must pass strict backend schema validation before execution.'))
    story.append(bullet('<b>Deterministic Offline Fallback</b>: If API keys are unavailable or upstream providers fail, the system falls back seamlessly to rule-based deterministic response generators.'))
    story.append(PageBreak())

    # 14. SECURITY ARCHITECTURE
    story.append(heading1('12. Security Architecture & Threat Mitigation Matrix'))
    story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#1E40AF'), spaceAfter=8))
    story.append(p('PathFinder implements a zero-trust, defense-in-depth architecture across all endpoints, database operations, and AI subsystems:'))
    story.append(make_table(['Security Threat', 'Potential Risk', 'PathFinder Mitigation Strategy'], SECURITY_TABLE, [120, 150, 234]))
    story.append(PageBreak())

    # 15. TESTING & QA
    story.append(heading1('13. Comprehensive Verification, Regression Testing & QA'))
    story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#1E40AF'), spaceAfter=8))
    story.append(p('Quality engineering is central to PathFinder. Every phase was executed under strict regression baselines requiring 100% test passage before advancing.'))

    if os.path.exists('report_assets/fig_test_dashboard.png'):
        story.append(Image('report_assets/fig_test_dashboard.png', width=5.8*inch, height=2.6*inch))
        story.append(p('Figure 13.1 — Cumulative Backend Test Progression Across Phases 6, 7, and 8', caption_style))

    story.append(make_table(['System Component', 'Verification Method', 'Documented Result'], QA_SUMMARY_TABLE, [140, 204, 160]))
    story.append(PageBreak())

    # 16. LIMITATIONS & FUTURE ROADMAP
    story.append(heading1('14. Technical Limitations & Future Roadmap (Phase 9)'))
    story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#1E40AF'), spaceAfter=8))
    story.append(p('In adherence to engineering integrity, the platform\'s current operational boundaries are documented alongside planned future evolutions:'))

    story.append(heading2('Documented Operational Boundaries'))
    story.append(bullet('<b>Market Data Ingestion</b>: Current market intelligence uses curated provenance datasets with mock labeling. Live job-board scraping connectors are planned for enterprise releases.'))
    story.append(bullet('<b>Code Execution Environment</b>: Code submissions are evaluated against structured rubric criteria. Sandboxed containerized execution (e.g. WebAssembly or Docker execution runners) is slated for Phase 9.'))
    story.append(bullet('<b>Single-Learner Scoping</b>: Current data models support individual learner profiles. Multi-tenant enterprise team management and cohort project collaboration are defined in the Phase 9 specification.'))

    story.append(heading2('Phase 9 Architecture: Collaborative Career Acceleration'))
    story.append(p('Phase 9 will expand PathFinder into team and enterprise dimensions:'))
    story.append(bullet('<b>Stage 1–3</b>: Cohort & Collaborative Team Engine, Peer Pull-Request Reviews, Asynchronous Code Execution Sandbox.'))
    story.append(bullet('<b>Stage 4–6</b>: Verified Industry Mentorship Review Engine, Live System Design Mock Sessions, W3C Verifiable Credentials.'))
    story.append(bullet('<b>Stage 7–9</b>: Enterprise Portal & Team Upskilling Dashboard, Recruiter Talent Discovery Matcher, Direct ATS Integration.'))
    story.append(bullet('<b>Stage 10–12</b>: Enterprise Coach Alignment, Multi-Tenant Security QA, and Final Phase 9 Production Release Certification.'))
    story.append(PageBreak())

    # 17. CONCLUSION & APPENDIX
    story.append(heading1('15. Conclusion & Final Release Verdict'))
    story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#1E40AF'), spaceAfter=8))
    story.append(p('PathFinder successfully establishes that career development platforms can move beyond static video playlists and generic chatbots to become <b>deterministic, evidence-driven, and experiential engineering engines</b>.'))
    story.append(p('By bridging theoretical curriculum graphs, real-time behavioral telemetry, exponential retention modeling, applied engineering deliverables, and mathematical employability estimation, PathFinder provides a unified, production-ready foundation for technical career acceleration.'))

    story.append(Spacer(1, 12))
    story.append(callout_box(
        'PATHFINDER PHASE 8 RELEASE CERTIFICATION: Verified cumulative backend regression: 142/142 tests passing. Frontend production build: PASS. P0 Blockers: 0. P1 Blockers: 0. Release-certified according to documented verification suites.',
        'FINAL RELEASE VERDICT'
    ))

    story.append(Spacer(1, 12))
    story.append(heading2('Appendix A: Verified Technology Stack'))
    story.append(make_table(['Layer', 'Technology', 'Architectural Purpose'], TECH_STACK_TABLE, [100, 160, 244]))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f'Successfully generated {filename}')

def build_docx(filename='PATHFINDER_PROJECT_REPORT.docx'):
    doc = docx.Document()

    for section in doc.sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)

    # Title
    t_p = doc.add_paragraph()
    t_run = t_p.add_run('PATHFINDER')
    t_run.font.name = 'Arial'
    t_run.font.size = Pt(24)
    t_run.font.bold = True
    t_run.font.color.rgb = RGBColor(15, 23, 42)

    sub_p = doc.add_paragraph()
    sub_run = sub_p.add_run('Domain-Agnostic Adaptive Career Intelligence, Practical Competency & Employability Platform\nComprehensive Technical Architecture & Project Report')
    sub_run.font.name = 'Arial'
    sub_run.font.size = Pt(12)
    sub_run.font.color.rgb = RGBColor(30, 64, 175)

    doc.add_paragraph('Release Status: PRODUCTION READY (Phase 8 Release-Certified) | 142/142 Backend Tests Passing | Next.js Production Build: PASS')
    doc.add_paragraph('Repository: https://github.com/Sanjay190806/PathFinder\n')

    doc.add_heading('1. Executive Summary', level=1)
    doc.add_paragraph('PathFinder is a domain-agnostic adaptive career intelligence and experiential employability platform. It bridges the gap between theoretical course navigation and real-world engineering capability through closed-loop learning graphs, behavioral telemetry, exponential skill decay, applied engineering project sandboxes, verifiable portfolio evidence, and mathematical employability estimation.')

    doc.add_heading('2. Core Engineering Phases', level=1)
    doc.add_paragraph('• Phase 6 (UI/UX & Interactive Design System): Accessible web interface with interactive skill dependency graphs, dynamic roadmaps, diagnostic assessments, and analytics (77/77 tests passing).')
    doc.add_paragraph('• Phase 7 (Deep Intelligence & Personalization): Backend-authoritative engines for learning velocity, multi-factor skill mastery, exponential decay modeling, adaptive roadmap optimization, skill gap calculation, and grounded AI coaching (120/120 cumulative tests passing).')
    doc.add_paragraph('• Phase 8 (Experiential Learning & Employability): Practical competency measurement, multi-milestone applied projects, scenario simulations, rubric practical assessments, verifiable portfolios, opportunity match scoring, and resume/interview intelligence (142/142 cumulative tests passing).')

    doc.add_heading('3. Verified Metrics & Invariants', level=1)
    doc.add_paragraph('• Backend Pytest Regression: 142/142 tests passing (100% across Phase 6, 7, and 8).')
    doc.add_paragraph('• Frontend Build: Clean Next.js 14.2 production compilation (11 static pages).')
    doc.add_paragraph('• Security Invariants: JWT authentication, profile-scoped IDOR prevention, PromptGuard injection defense, ActionValidator state protection.')
    doc.add_paragraph('• Multi-Domain Certified: AI/ML Engineer, Cybersecurity Analyst, VLSI Hardware Engineer, Data Scientist, Full Stack Developer, Cloud/DevOps Engineer, Software Engineer.')

    doc.save(filename)
    print(f'Successfully generated {filename}')

if __name__ == '__main__':
    build_pdf()
    build_docx()
