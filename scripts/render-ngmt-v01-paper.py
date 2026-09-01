#!/usr/bin/env python3
"""Deterministically render the frozen NGMT v0.1 Markdown manuscript."""

from __future__ import annotations

import argparse
import html
import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import KeepTogether, ListFlowable, ListItem, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def inline(text: str) -> str:
    text = html.escape(text.strip())
    text = re.sub(r"`([^`]+)`", r'<font name="Courier">\1</font>', text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<i>\1</i>", text)
    return text


def footer(canvas: Canvas, doc) -> None:
    canvas.saveState()
    canvas.setTitle("NGMT v0.1 Frozen Negative Result")
    canvas.setAuthor("OWNER APPROVAL REQUIRED")
    canvas.setSubject("Evidence-bounded negative/inconclusive development result")
    canvas.setCreator("deterministic NGMT v0.1 renderer")
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#5A6472"))
    canvas.drawString(0.72 * inch, 0.42 * inch, "NGMT v0.1 | frozen negative-result evidence")
    canvas.drawRightString(7.78 * inch, 0.42 * inch, f"Page {doc.page}")
    canvas.restoreState()


def canvas_factory(filename, **kwargs):
    kwargs.pop("invariant", None)
    kwargs.pop("pageCompression", None)
    return Canvas(filename, invariant=1, pageCompression=0, **kwargs)


def parse_markdown(text: str, styles: dict) -> list:
    lines = text.splitlines()
    story: list = []
    paragraph: list[str] = []
    bullets: list[str] = []

    def flush_paragraph() -> None:
        if paragraph:
            story.append(Paragraph(inline(" ".join(paragraph)), styles["body"]))
            story.append(Spacer(1, 6))
            paragraph.clear()

    def flush_bullets() -> None:
        if bullets:
            story.append(ListFlowable(
                [ListItem(Paragraph(inline(item), styles["body"]), leftIndent=12) for item in bullets],
                bulletType="bullet", start="circle", leftIndent=22, bulletFontName="Helvetica", bulletFontSize=7,
            ))
            story.append(Spacer(1, 6))
            bullets.clear()

    index = 0
    while index < len(lines):
        raw = lines[index]
        stripped = raw.strip()
        if stripped.startswith("|") and index + 1 < len(lines) and re.match(r"^\|[\s:|-]+\|$", lines[index + 1].strip()):
            flush_paragraph(); flush_bullets()
            table_lines = [stripped]
            index += 2
            while index < len(lines) and lines[index].strip().startswith("|"):
                table_lines.append(lines[index].strip()); index += 1
            rows = [[Paragraph(inline(cell), styles["table"]) for cell in line.strip("|").split("|")] for line in table_lines]
            cols = len(rows[0])
            widths = [6.95 * inch / cols] * cols
            table = Table(rows, colWidths=widths, repeatRows=1, hAlign="LEFT")
            table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E8EEF6")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#182231")),
                ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#AAB5C3")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 4), ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]))
            story.extend([table, Spacer(1, 9)])
            continue
        if not stripped:
            flush_paragraph(); flush_bullets(); index += 1; continue
        if stripped.startswith("# "):
            flush_paragraph(); flush_bullets()
            story.extend([Spacer(1, 0.45 * inch), Paragraph(inline(stripped[2:]), styles["title"]), Spacer(1, 0.20 * inch)])
        elif stripped.startswith("## "):
            flush_paragraph(); flush_bullets()
            story.extend([Spacer(1, 8), Paragraph(inline(stripped[3:]), styles["h2"]), Spacer(1, 4)])
        elif stripped.startswith("### "):
            flush_paragraph(); flush_bullets()
            story.extend([Spacer(1, 5), Paragraph(inline(stripped[4:]), styles["h3"]), Spacer(1, 3)])
        elif stripped.startswith("- "):
            flush_paragraph(); bullets.append(stripped[2:])
        elif stripped.startswith("> "):
            flush_paragraph(); flush_bullets()
            story.extend([Paragraph(inline(stripped[2:]), styles["quote"]), Spacer(1, 6)])
        else:
            flush_bullets(); paragraph.append(stripped)
        index += 1
    flush_paragraph(); flush_bullets()
    return story


def render(source: Path, output: Path) -> None:
    sample = getSampleStyleSheet()
    styles = {
        "title": ParagraphStyle("Title", parent=sample["Title"], fontName="Helvetica-Bold", fontSize=18,
                                leading=22, textColor=colors.HexColor("#172033"), alignment=TA_CENTER),
        "h2": ParagraphStyle("H2", parent=sample["Heading2"], fontName="Helvetica-Bold", fontSize=12.5,
                             leading=15, textColor=colors.HexColor("#153E67"), keepWithNext=True),
        "h3": ParagraphStyle("H3", parent=sample["Heading3"], fontName="Helvetica-Bold", fontSize=10.5,
                             leading=13, textColor=colors.HexColor("#244D73"), keepWithNext=True),
        "body": ParagraphStyle("Body", parent=sample["BodyText"], fontName="Helvetica", fontSize=9.2,
                               leading=12.2, textColor=colors.HexColor("#202833"), alignment=TA_JUSTIFY,
                               spaceAfter=0, allowWidows=0, allowOrphans=0),
        "quote": ParagraphStyle("Quote", parent=sample["BodyText"], fontName="Helvetica-Oblique", fontSize=9.2,
                                leading=12.2, leftIndent=18, rightIndent=18, borderColor=colors.HexColor("#7A8DA5"),
                                borderWidth=0.8, borderPadding=7, textColor=colors.HexColor("#26384A")),
        "table": ParagraphStyle("Table", parent=sample["BodyText"], fontName="Helvetica", fontSize=7.1,
                                leading=8.7, textColor=colors.HexColor("#202833")),
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(str(output), pagesize=letter, rightMargin=0.72 * inch, leftMargin=0.72 * inch,
                            topMargin=0.62 * inch, bottomMargin=0.65 * inch, title="NGMT v0.1 Frozen Negative Result",
                            author="OWNER APPROVAL REQUIRED", subject="Evidence-bounded negative/inconclusive result")
    doc.build(parse_markdown(source.read_text(encoding="utf-8"), styles), onFirstPage=footer,
              onLaterPages=footer, canvasmaker=canvas_factory)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    render(args.source, args.output)
