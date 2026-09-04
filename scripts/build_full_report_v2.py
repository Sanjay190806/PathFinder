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
