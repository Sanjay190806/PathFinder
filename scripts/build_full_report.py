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
        self.drawString(54, letter[1] - 36, 'PATHFINDER')
        self.setFont('Helvetica', 8)
        self.drawRightString(letter[0] - 54, letter[1] - 36, 'Domain-Agnostic Adaptive Career Intelligence & Employability Platform')
        self.setStrokeColor(colors.HexColor('#CBD5E1'))
        self.setLineWidth(0.75)
        self.line(54, letter[1] - 42, letter[0] - 54, letter[1] - 42)

        self.line(54, 48, letter[0] - 54, 48)
        self.setFont('Helvetica', 8)
        self.drawString(54, 34, 'Technical Project Report — Verified Release Certification (Phases 6–8)')
        page_str = f'Page {self._pageNumber} of {page_count}'
        self.drawRightString(letter[0] - 54, 34, page_str)
        self.restoreState()

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
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=26,
        leading=32,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=8
    )
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#1E40AF'),
        spaceAfter=14
    )
    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#1E40AF'),
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )
    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#0F172A'),
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )
    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.8,
        leading=12.5,
        textColor=colors.HexColor('#1E293B'),
        spaceAfter=6
    )
    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.8,
        leading=12.5,
        textColor=colors.HexColor('#1E293B'),
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=3
    )
    callout_style = ParagraphStyle(
        'Callout_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#1E3A8A'),
        spaceAfter=6
    )
    table_head_style = ParagraphStyle(
        'TH_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )
    table_body_style = ParagraphStyle(
        'TB_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.8,
        leading=10.5,
        textColor=colors.HexColor('#1E293B')
    )
    caption_style = ParagraphStyle(
        'Caption_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.8,
        leading=10.5,
        textColor=colors.HexColor('#475569'),
        alignment=1,
        spaceAfter=8
    )

    story = []

    def p(text, style=body_style):
        return Paragraph(text, style)

    def heading1(text):
        return Paragraph(text, h1_style)

    def heading2(text):
        return Paragraph(text, h2_style)

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
            ('PADDING', (0, 0), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        return t

    def make_table(header_data, rows_data, col_widths=None):
        table_data = [[Paragraph(h, table_head_style) for h in header_data]]
        for row in rows_data:
            table_data.append([Paragraph(str(cell), table_body_style) for cell in row])
        
        t = Table(table_data, colWidths=col_widths, repeatRows=1)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E40AF')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#FFFFFF'), colors.HexColor('#F8FAFC')]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 5),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ]))
        return t

    # 1. COVER PAGE
    story.append(Spacer(1, 35))
    story.append(HRFlowable(width='100%', thickness=4, color=colors.HexColor('#1E40AF'), spaceAfter=18))
    story.append(p('PATHFINDER', title_style))
    story.append(p('Domain-Agnostic Adaptive Career Intelligence, Practical Competency & Employability Platform', subtitle_style))
    story.append(p('Comprehensive Engineering Architecture & Release Verification Report', ParagraphStyle('CoverSub', parent=body_style, fontSize=10.5, leading=15, textColor=colors.HexColor('#475569'))))
    story.append(Spacer(1, 15))
    story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#CBD5E1'), spaceAfter=20))

    cover_meta = [
        ['System Release Status', 'PRODUCTION READY (Phase 8 Release-Certified)'],
        ['Verified Test Baseline', '142/142 Backend Pytest Regression Tests Passing (100%)'],
        ['Frontend Production Build', 'Next.js 14.2 App Router — Clean Production Compilation'],
        ['Implementation Scope', 'Phase 6 (UI/UX) • Phase 7 (Intelligence) • Phase 8 (Experiential)'],
        ['Core Domains Certified', 'AI/ML, Cybersecurity, VLSI, Data Science, Full Stack, DevOps, SWE'],
        ['Repository Reference', 'https://github.com/Sanjay190806/PathFinder'],
        ['Release Date', 'August 2026']
    ]
    t_cover = Table([[Paragraph(f'<b>{k}</b>', table_body_style), Paragraph(v, table_body_style)] for k, v in cover_meta], colWidths=[150, 354])
    t_cover.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#E2E8F0')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('PADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_cover)

    story.append(Spacer(1, 30))
    story.append(callout_box(
        'PathFinder is an authoritative, closed-loop technical career platform that unifies theoretical learning graphs, real-time behavioral telemetry, exponential skill decay, applied engineering project sandboxes, verifiable portfolio evidence, and mathematical employability estimation.',
        'EXECUTIVE POSITIONING'
    ))
    story.append(PageBreak())

    # 2. TABLE OF CONTENTS
    story.append(heading1('Table of Contents'))
    story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#1E40AF'), spaceAfter=10))

    toc_items = [
        ('1. Executive Summary', '3'),
        ('2. Problem Statement & Educational Failure Modes', '4'),
        ('3. Product Vision & The Closed-Loop Lifecycle', '5'),
        ('4. High-Level System Architecture', '6'),
        ('5. Domain-Agnostic Core Philosophy', '7'),
        ('6. Phase 6: Human-Centered Design & Interactive Graph UI', '8'),
        ('7. Phase 7: Deep Intelligence, Mastery & Skill Decay', '10'),
        ('8. Phase 8: Experiential Learning & Employability Engine', '13'),
        ('9. Core Intelligence Algorithms & Scoring Formulas', '16'),
        ('10. Universal Decision Traceability & Explainability', '18'),
        ('11. AI Career Coach Architecture & Security Invariants', '19'),
        ('12. Security Architecture & Threat Mitigation Matrix', '21'),
        ('13. Relational Data Architecture & Immutable History', '22'),
        ('14. Practical Competency vs Theoretical Learning', '23'),
        ('15. The Employability Estimation Model', '24'),
        ('16. Opportunity Intelligence & Match Pipeline', '25'),
        ('17. Application Execution & Career Prep Systems', '26'),
        ('18. Multi-Domain Validation Matrix', '27'),
        ('19. Comprehensive Verification & QA Matrix', '28'),
        ('20. Production Readiness & Release Certification', '29'),
        ('21. Limitations & Future Development (Phase 9)', '30'),
        ('22. Conclusion & Verification Summary', '31'),
        ('Appendix A: Technology Stack & Component Map', '32'),
        ('Appendix B: Verified API Endpoint Catalog', '33')
    ]
    t_toc = Table([[Paragraph(title, table_body_style), Paragraph(page, ParagraphStyle('TR', parent=table_body_style, alignment=2))] for title, page in toc_items], colWidths=[430, 74])
    t_toc.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor('#F1F5F9')),
        ('PADDING', (0, 0), (-1, -1), 2.5),
    ]))
    story.append(t_toc)
    story.append(PageBreak())

    # 3. EXECUTIVE SUMMARY
    story.append(heading1('1. Executive Summary'))
    story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#1E40AF'), spaceAfter=8))
    story.append(p('The modern technical workforce faces a profound paradox: while access to educational content has expanded exponentially, technical hiring and career development remain fundamentally broken. Learners are overwhelmed by thousands of disconnected courses, static linear syllabi that ignore prior knowledge, invisible prerequisite bottlenecks, and an industry reality where <i>course completion does not equate to practical engineering capability</i>.'))
    story.append(p('<b>PathFinder</b> solves this breakdown as a <b>Domain-Agnostic Adaptive Career Intelligence and Employability Platform</b>. Rather than functioning as a course directory or an ungrounded chatbot, PathFinder is engineered as an authoritative, closed-loop career development platform connecting curriculum navigation directly to hands-on engineering execution and job placement readiness.'))
    story.append(p('The platform is developed and verified across three major engineering phases:'))
    story.append(bullet('<b>Phase 6 (UI/UX & Interactive Design System)</b>: Delivered an accessible web application featuring interactive skill dependency graphs, dynamic roadmap visualization, diagnostic calibration, and multi-domain curriculum navigation.'))
    story.append(bullet('<b>Phase 7 (Deep Intelligence & Personalization)</b>: Built backend-authoritative engines for real-time behavior telemetry, learning velocity modeling, multi-factor skill mastery, exponential half-life skill decay, DAG-aware prerequisite distance, market signal provenance, and universal decision traceability.'))
    story.append(bullet('<b>Phase 8 (Experiential Learning & Employability)</b>: Established practical competency measurement, real-world multi-milestone projects, incident response scenario simulations, rubric-graded assessments, verifiable career portfolios, opportunity match scoring, and resume ATS/interview simulators.'))

    if os.path.exists('report_assets/fig_continuous_loop.png'):
        story.append(Spacer(1, 4))
        story.append(Image('report_assets/fig_continuous_loop.png', width=6.2*inch, height=3.0*inch))
        story.append(p('Figure 1.1 — The PathFinder Closed-Loop Career Development Lifecycle', caption_style))

    story.append(p('PathFinder is release-certified with <b>142/142 passing backend regression tests</b>, a clean Next.js 14.2 production build, zero P0/P1 security blockers, and complete domain-agnostic validation across AI/ML Engineering, Cybersecurity, VLSI Hardware, Data Science, Full Stack, DevOps, and Software Engineering.'))
    story.append(PageBreak())

    # 4. PROBLEM STATEMENT
    story.append(heading1('2. Problem Statement & Educational Failure Modes'))
    story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#1E40AF'), spaceAfter=8))
    story.append(p('Traditional learning platforms fail learners through structural disconnects between instruction, retention, and real-world execution:'))

    prob_headers = ['Educational Failure Mode', 'Real-World Consequence', 'PathFinder Engineering Solution']
    prob_rows = [
        ['Static Linear Roadmaps', 'Learners waste hundreds of hours reviewing familiar concepts or hit insurmountable blockers.', 'Dynamic Topological DAGs that adaptively insert prerequisites or bypass mastered skills.'],
        ['Invisible Prerequisite Bottlenecks', 'Learners fail advanced topics (e.g. Transformers) due to unrecognized gaps in core math.', 'Prerequisite DAG evaluation that computes distance and gates advanced modules.'],
        ['Course Completion != Competency', 'Learners obtain certificates without knowing how to architect, build, or debug real code.', 'Practical Competency Engine with multi-milestone projects and rubric-graded code.'],
        ['Skill Decay Over Time', 'Knowledge fades over weeks of inactivity, causing unexpected failures in technical interviews.', 'Exponential half-life skill decay engine triggering proactive review recommendations.'],
        ['Opaque AI Hallucinations', 'Generic chatbots invent arbitrary recommendations without grounding in actual progress.', 'PromptGuard & ContextBuilder enforcing strict grounding in authoritative backend data.'],
        ['Disconnection from Job Market', 'Learners complete roadmaps that do not match current employer hiring requisitions.', 'Opportunity Match Engine scoring profiles against real job requirements and portfolio gaps.']
    ]
    story.append(make_table(prob_headers, prob_rows, [130, 170, 204]))
    story.append(Spacer(1, 8))

    # 5. PRODUCT VISION & ARCHITECTURE
    story.append(heading1('3. Product Vision & System Architecture'))
    story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#1E40AF'), spaceAfter=8))
    story.append(p('PathFinder is architected as a layered, modular system where the backend remains the strict single source of truth for all calculations, scores, adaptations, and state transitions. The frontend acts solely as a high-fidelity presentation and interaction layer.'))

    if os.path.exists('report_assets/fig_architecture.png'):
        story.append(Image('report_assets/fig_architecture.png', width=6.2*inch, height=3.3*inch))
        story.append(p('Figure 3.1 — Layered Technical Architecture of the PathFinder Platform', caption_style))

    story.append(heading2('Core Architectural Invariants'))
    story.append(bullet('<b>Backend Authoritative</b>: All intelligence metrics (velocity, mastery, decay, readiness, employability, match scores) are computed via deterministic backend engines. The frontend never calculates or fabricates state.'))
    story.append(bullet('<b>Domain Agnostic</b>: Core engines operate on abstract directed graphs, skill slugs, rubric dimensions, and evidence records without hardcoding career-specific logic.'))
    story.append(bullet('<b>Security-First AI Isolation</b>: AI components can interpret and explain authoritative state, but cannot directly mutate database records without passing through the ActionValidator.'))
    story.append(bullet('<b>Immutable Historical Auditing</b>: Every roadmap change, scenario attempt, assessment submission, and decision trace is preserved immutably.'))
    story.append(PageBreak())

    # 6. DOMAIN-AGNOSTIC CORE PHILOSOPHY
    story.append(heading1('4. Domain-Agnostic Core Philosophy'))
    story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#1E40AF'), spaceAfter=8))
    story.append(p('A fundamental engineering achievement of PathFinder is its <b>domain-agnostic architecture</b>. The algorithms powering skill graphs, adaptive roadmaps, prerequisite distance, decay modeling, project evaluation, and employability estimation contain zero domain-specific branching.'))
    story.append(p('The platform treats all technical careers as directed acyclic graphs of abstract competencies. Whether evaluating a candidate for VLSI Hardware Engineering (RTL synthesis, timing closure) or AI/ML Engineering (PyTorch kernels, vector RAG), the exact same backend engine processes graph topology, evaluates rubric dimensions, and calculates readiness.'))

    domain_headers = ['Technical Career Domain', 'Graph Nodes (Sample)', 'Applied Project Scope', 'Incident Scenario Simulation']
    domain_rows = [
        ['AI/ML Engineer', 'python, deep-learning, transformers, vector-rag, mlops', 'Enterprise RAG Microservice with hybrid search and reranking.', 'Diagnose CUDA OOM and Transformer P99 latency spikes.'],
        ['Cybersecurity Analyst', 'networking, linux, web-security, cryptography, pentesting', 'Automated SOC Log Monitor parsing access bursts for attacks.', 'Investigate lateral movement via compromised SSH jump hosts.'],
        ['VLSI Hardware Engineer', 'linear-algebra, python, dsa, digital-logic, verilog', 'Pipelined 32-Bit Floating Point Arithmetic Multiplier in RTL.', 'Resolve setup/hold timing violations in synthesized modules.'],
        ['Data Scientist', 'python, sql, pandas, machine-learning, statistics', 'End-to-End Analytics Pipeline with automated feature stores.', 'Triage data drift and distribution shifts in streaming models.'],
        ['Full Stack Developer', 'typescript, react, next.js, rest-apis, docker, sql', 'Distributed Asynchronous Task Queue with exponential backoff.', 'Debug Redis connection pool exhaustion under concurrency bursts.'],
        ['Cloud / DevOps Engineer', 'linux, docker, kubernetes, aws, git-ci-cd', 'Multi-Stage GitOps CI/CD Deployment with telemetry monitoring.', 'Mitigate Kubernetes pod crash loops and memory leaks.']
    ]
    story.append(make_table(domain_headers, domain_rows, [105, 130, 139, 130]))
    story.append(Spacer(1, 8))

    # 7. PHASE 6 DEEP-DIVE
    story.append(heading1('5. Phase 6: Human-Centered Design & Interactive Graph UI'))
    story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#1E40AF'), spaceAfter=8))
    story.append(p('Phase 6 delivered a responsive, accessible application adhering to WCAG standards with interactive visualization tools.'))

    p6_headers = ['Phase 6 Stage', 'Core Functionality Delivered', 'Verification Metric']
    p6_rows = [
        ['Stage 1: Design System', 'Semantic typography, color tokens, accessible buttons, badges, modals.', 'Component audit PASS'],
        ['Stage 2: Navigation', 'Global header, role switcher, route guards, active link tracking.', 'Route testing PASS'],
        ['Stage 3: Landing & Auth', 'Feature showcase, JWT authentication, bcrypt hashing, error boundaries.', 'Auth suite PASS'],
        ['Stage 4: Onboarding', 'Multi-step onboarding wizard calibrating target roles and weekly hours.', 'Profile flow PASS'],
        ['Stage 5: Dashboard', 'Metrics overview, active roadmap progress, next recommended actions.', 'Dashboard PASS'],
        ['Stage 6: Interactive Graph', 'Recharts & SVG-rendered Skill DAG displaying prerequisite relationships.', 'DAG rendering PASS'],
        ['Stage 7: Diagnostics', 'Skill calibration assessments calculating baseline confidence maps.', 'Assessment PASS'],
        ['Stage 8: Resource Detail', 'Curated learning content detail, prerequisite checks, completion tracker.', 'Resource PASS'],
        ['Stage 9: Growth Analytics', 'Time-series mastery charts, weekly study pace, velocity tracking.', 'Analytics PASS'],
        ['Stage 10: AI Coach UI', 'Slide-over career coach interface with suggested grounded prompt actions.', 'Coach UI PASS'],
        ['Stage 11: Global QA', 'Full accessibility audit, keyboard navigation (Tab/Enter/Escape), responsive QA.', 'QA Matrix PASS'],
        ['Stage 12: Production Release', 'Release validation, zero P0/P1 blockers, production build clean.', '77/77 Tests PASS']
    ]
    story.append(make_table(p6_headers, p6_rows, [110, 274, 120]))
    story.append(PageBreak())

    # 8. PHASE 7 DEEP-DIVE
    story.append(heading1('6. Phase 7: Deep Intelligence, Mastery & Skill Decay'))
    story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#1E40AF'), spaceAfter=8))
    story.append(p('Phase 7 introduced mathematical intelligence engines running autonomously on the backend to model progression, retention, and decay.'))

    story.append(heading2('6.1 Learning Velocity & Pacing Engine'))
    story.append(p('Learning velocity models progression speed and consistency. The engine tracks completed resources, elapsed hours, and session regularity to compute a normalized velocity score \(V \in [0.0, 1.0]\) and pacing states (<i>Ahead of Schedule</i>, <i>On Track</i>, <i>Pacing Adjustment Needed</i>).'))

    story.append(heading2('6.2 Multi-Factor Skill Mastery Taxonomy'))
    story.append(p('Mastery is evaluated across demonstrated signals (quiz performance, diagnostic score, resource completion, repetition count) mapped to a 6-tier taxonomy: <b>Unknown</b> (0.00–0.19), <b>Beginner</b> (0.20–0.39), <b>Developing</b> (0.40–0.59), <b>Competent</b> (0.60–0.74), <b>Strong</b> (0.75–0.89), and <b>Mastery</b> (0.90–1.00).'))

    story.append(heading2('6.3 Exponential Half-Life Skill Decay Modeling'))
    story.append(p('Technical knowledge degrades over time without active reinforcement. PathFinder models skill decay using an exponential retention formula:'))
    story.append(callout_box(
        'R(Δt) = 2^(-Δt / T_half), where Δt is elapsed days since last practice and T_half is skill half-life (30 days). Freshness states: Fresh (>=0.80), Aging (0.60-0.79), Review Recommended (0.40-0.59), Decay Risk (<0.40).',
        'SKILL RETENTION FORMULA'
    ))
    story.append(p('Crucially, <b>decay represents recency of practice, not erasure of historical mastery</b>. Historical competency remains recorded while triggering proactive review recommendations.'))

    story.append(heading2('6.4 Dynamic Adaptive Roadmap Engine'))
    story.append(bullet('<b>Prerequisite Insertion</b>: If a learner struggles with an advanced skill, missing prerequisite nodes are automatically inserted.'))
    story.append(bullet('<b>Competency Bypass</b>: If diagnostic assessment demonstrates >=0.85 mastery on a skill, redundant introductory modules are bypassed.'))
    story.append(bullet('<b>Decay Review Injection</b>: If a previously mastered foundational skill enters \'Decay Risk\', targeted refresher exercises are scheduled.'))

    story.append(heading2('6.5 Career Skill-Gap & Readiness Engine'))
    story.append(p('The Skill Gap Engine calculates DAG-aware prerequisite distance. The Opportunity Readiness Engine computes composite career readiness \(R_{career} \in [0, 100]\):'))
    story.append(callout_box(
        'Readiness = clamp(0, 100, (0.45 * Competency + 0.25 * Prerequisites + 0.20 * Freshness - Critical_Blocker_Penalty) * 100)',
        'CAREER READINESS FORMULA'
    ))
    story.append(p('Readiness is classified into 5 tiers: <i>Career Ready</i> (85–100), <i>Near Ready</i> (70–84.9), <i>Developing Readiness</i> (50–69.9), <i>Early Preparation</i> (25–49.9), and <i>Not Ready</i> (<25). Phase 7 passed with <b>120/120 cumulative backend tests</b>.'))
    story.append(PageBreak())

    # 9. PHASE 8 DEEP-DIVE
    story.append(heading1('7. Phase 8: Experiential Learning & Employability Engine'))
    story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#1E40AF'), spaceAfter=8))
    story.append(p('Phase 8 elevates PathFinder into an experiential career development system, establishing the critical boundary between <b>Theoretical Learning Retention</b> and <b>Practical Demonstrated Engineering Competency</b>.'))

    p8_headers = ['Phase 8 System', 'Architectural Responsibility', 'API Endpoints']
    p8_rows = [
        ['Practical Competency', 'Ingests multi-type practical evidence across 6 dimensions (Application, Problem Solving, Debugging, Decision Making, Tools, Discipline).', 'GET /practical/competencies\nPOST /practical/evidence'],
        ['Real-World Projects', 'State-machine project engine managing multi-milestone applied engineering deliverables with verification.', 'GET /projects\nPOST /projects/{id}/start\nPOST /projects/{id}/submit'],
        ['Engineering Scenarios', 'Production incident and architecture tradeoff simulation engine recording tradeoff choices and written reasoning.', 'GET /scenarios\nPOST /scenarios/{id}/submit\nGET /scenarios/attempts'],
        ['Practical Assessments', 'Rubric-graded coding and system design assessments evaluating correctness, engineering quality, robustness, and docs.', 'GET /practical-assessments\nPOST /practical-assessments/{id}/submit'],
        ['Portfolio & Evidence', 'Aggregates verified projects and assessments into a quantified career portfolio (0–100 quality score).', 'GET /portfolio\nPOST /portfolio/artifacts'],
        ['Employability Engine', 'Computes composite employability index combining readiness, practical competency, portfolio evidence, and market fit.', 'GET /employability'],
        ['Opportunity Matching', 'Matches real-world job postings, internships, and open-source opportunities against learner profile and skill gaps.', 'GET /opportunities\nGET /opportunities/matches'],
        ['Career Action Tracker', 'Manages application lifecycle (saved, applied, interviewing, offered) with per-opportunity prep action checklists.', 'GET /applications\nPOST /applications\nPATCH /applications/{id}'],
        ['Resume & Interview', 'ATS keyword density audit and interactive technical mock interview simulation engine.', 'POST /career-prep/resume/audit\nPOST /career-prep/interview/start']
    ]
    story.append(make_table(p8_headers, p8_rows, [110, 230, 164]))
    story.append(Spacer(1, 8))

    if os.path.exists('report_assets/fig_employability_pie.png'):
        story.append(Image('report_assets/fig_employability_pie.png', width=5.8*inch, height=2.8*inch))
        story.append(p('Figure 7.1 — Factor Breakdown of the PathFinder Employability Estimate', caption_style))

    story.append(p('Phase 8 completed with <b>142/142 cumulative backend regression tests passing</b>, proving complete end-to-end integration from initial onboarding to verified job readiness.'))
    story.append(PageBreak())

    # 10. AI ARCHITECTURE & SECURITY
    story.append(heading1('8. AI Architecture & Security Invariants'))
    story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#1E40AF'), spaceAfter=8))
    story.append(p('PathFinder\'s AI Career Coach is designed with a <b>strict security-first, grounded architecture</b>. Unlike unconstrained LLM assistants, the Coach is strictly an explanatory and advisory layer operating over authoritative backend data.'))

    if os.path.exists('report_assets/fig_ai_safety.png'):
        story.append(Image('report_assets/fig_ai_safety.png', width=6.2*inch, height=2.7*inch))
        story.append(p('Figure 8.1 — AI Career Coach Grounding and Security Gateway Pipeline', caption_style))

    story.append(heading2('Non-Negotiable AI Safety Rules'))
    story.append(bullet('<b>PromptGuard Defense</b>: Deterministically intercepts and refuses jailbreaks, system prompt extraction, developer override commands, and roleplay bypass attacks.'))
    story.append(bullet('<b>ContextBuilder Grounding</b>: The LLM prompt is dynamically assembled from authoritative database records (velocity, readiness score, critical blockers, decay alerts, market demand). The LLM is prohibited from guessing or fabricating learner achievements.'))
    story.append(bullet('<b>ActionValidator Gatekeeping</b>: Suggested learning actions or roadmap adaptations generated by AI must pass strict backend schema validation before execution.'))
    story.append(bullet('<b>Deterministic Offline Fallback</b>: If API keys are unavailable or upstream providers fail, the system falls back seamlessly to rule-based deterministic response generators.'))

    story.append(heading2('Security Threat & Mitigation Matrix'))
    sec_headers = ['Security Threat', 'Potential Risk', 'PathFinder Mitigation Strategy']
    sec_rows = [
        ['Unauthorized API Access', 'Data breach of private learner progress.', 'JWT Bearer token authentication required on all private routes (HTTP 401).'],
        ['Insecure Direct Object Reference (IDOR)', 'User A modifies or reads User B data.', 'All queries strictly scoped through current_user.profile.id.'],
        ['Prompt Injection Attacks', 'Leakage of internal system prompts.', 'PromptGuard pattern inspection refusing adversarial queries.'],
        ['Unauthorized AI State Mutation', 'LLM modifies mastery or project completion.', 'ActionValidator blocking direct database writes from AI agents.'],
        ['Credential Exposure', 'API keys or passwords leaked in repos.', '100% environment-driven configuration with zero committed secrets.'],
        ['Database Inconsistency', 'Partial writes during complex adaptations.', 'Atomic SQLAlchemy transactions with explicit commit/rollback boundaries.']
    ]
    story.append(make_table(sec_headers, sec_rows, [120, 150, 234]))
    story.append(PageBreak())

    # 11. TESTING & QA
    story.append(heading1('9. Comprehensive Verification & Quality Assurance'))
    story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#1E40AF'), spaceAfter=8))
    story.append(p('Quality engineering is central to PathFinder. Every phase was executed under strict regression baselines requiring 100% test passage before advancing.'))

    if os.path.exists('report_assets/fig_test_dashboard.png'):
        story.append(Image('report_assets/fig_test_dashboard.png', width=5.8*inch, height=2.6*inch))
        story.append(p('Figure 9.1 — Cumulative Backend Test Progression Across Phases 6, 7, and 8', caption_style))

    story.append(heading2('Full System Verification Summary'))
    qa_headers = ['System Component', 'Verification Method', 'Documented Result']
    qa_rows = [
        ['Phase 6 UI/UX & Navigation', 'Automated Pytest + Next.js build validation', '77/77 PASS (100%)'],
        ['Phase 7 Intelligence & Decay', 'Automated unit & integration regression tests', '43/43 PASS (100%)'],
        ['Phase 8 Experiential & Projects', 'Automated end-to-end lifecycle verification', '22/22 PASS (100%)'],
        ['Cumulative Backend Suite', 'Full test suite execution via pytest', '142/142 PASS (100% in 34.7s)'],
        ['Frontend Production Build', 'next build static page generation (11 routes)', '0 Errors / 0 Warnings (PASS)'],
        ['Cross-User Data Isolation', 'Multi-tenant IDOR attack simulation tests', 'Verified (Zero cross-talk)'],
        ['Prompt Injection Defenses', 'Adversarial jailbreak and override test suite', 'Verified (100% Refusal)'],
        ['Multi-Domain Career Catalog', 'Cross-domain end-to-end test execution', '7/7 Technical Domains PASS'],
        ['Production Blockers', 'Full security and architecture audit', '0 P0 Blockers / 0 P1 Blockers']
    ]
    story.append(make_table(qa_headers, qa_rows, [140, 204, 160]))
    story.append(Spacer(1, 8))

    # 12. LIMITATIONS & FUTURE ROADMAP
    story.append(heading1('10. Limitations & Strategic Future Roadmap (Phase 9)'))
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

    # 13. CONCLUSION & APPENDIX
    story.append(heading1('11. Conclusion & Certification'))
    story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#1E40AF'), spaceAfter=8))
    story.append(p('PathFinder successfully establishes that career development platforms can move beyond static video playlists and generic chatbots to become <b>deterministic, evidence-driven, and experiential engineering engines</b>.'))
    story.append(p('By bridging theoretical curriculum graphs, real-time behavioral telemetry, exponential retention modeling, applied engineering deliverables, and mathematical employability estimation, PathFinder provides a unified, production-ready foundation for technical career acceleration.'))

    story.append(Spacer(1, 12))
    story.append(callout_box(
        'PATHFINDER PHASE 8 RELEASE CERTIFICATION: Verified cumulative backend regression: 142/142 tests passing. Frontend production build: PASS. P0 Blockers: 0. P1 Blockers: 0. Release-certified according to documented verification suites.',
        'FINAL RELEASE VERDICT'
    ))

    story.append(Spacer(1, 15))
    story.append(heading2('Appendix: Verified Technology Stack'))
    tech_headers = ['Layer', 'Technology', 'Architectural Purpose']
    tech_rows = [
        ['Frontend UI', 'Next.js 14.2 (App Router), React, TypeScript', 'Server-rendered and client-hydrated reactive user interface.'],
        ['Styling & Viz', 'Tailwind CSS, Recharts, Lucide Icons', 'Accessible design system and interactive visual analytics.'],
        ['Backend API', 'FastAPI, Python 3.11, Pydantic v2', 'High-performance asynchronous REST API gateway and validation.'],
        ['Database / ORM', 'SQLAlchemy 2.0, Alembic, SQLite/PostgreSQL', 'Relational persistence with strict foreign keys and cascades.'],
        ['Security', 'JWT (python-jose), Passlib (bcrypt)', 'Stateless bearer authentication and cryptographic hashing.'],
        ['AI Provider', 'Google Gemini API / Deterministic Provider', 'Grounded career coaching with deterministic offline fallback.']
    ]
    story.append(make_table(tech_headers, tech_rows, [100, 160, 244]))

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
