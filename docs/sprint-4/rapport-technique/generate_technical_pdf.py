"""Convert the reviewed technical Markdown report to an A4 PDF.

Run from the repository root after editing RAPPORT_TECHNIQUE_2026-11-06.md.
"""

from html import escape
from pathlib import Path
import re

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
)


SOURCE = Path(__file__).with_name("RAPPORT_TECHNIQUE_2026-11-06.md")
OUTPUT = Path(__file__).with_name("RAPPORT_TECHNIQUE_MON_MIAM_MIAM_2026-11-06.pdf")

pdfmetrics.registerFont(TTFont("ArialReport", "C:/Windows/Fonts/arial.ttf"))
pdfmetrics.registerFont(TTFont("ArialReportBold", "C:/Windows/Fonts/arialbd.ttf"))
pdfmetrics.registerFontFamily("ArialReport", normal="ArialReport", bold="ArialReportBold")

NAVY = colors.HexColor("#162039")
GOLD = colors.HexColor("#B57F2A")
MUTED = colors.HexColor("#667187")

styles = {
    "cover": ParagraphStyle("cover", fontName="ArialReportBold", fontSize=27, leading=34, textColor=NAVY, alignment=TA_CENTER, spaceAfter=20),
    "cover_sub": ParagraphStyle("cover_sub", fontName="ArialReport", fontSize=14, leading=21, textColor=GOLD, alignment=TA_CENTER),
    "h2": ParagraphStyle("h2", fontName="ArialReportBold", fontSize=14.6, leading=18, textColor=NAVY, spaceBefore=14, spaceAfter=7, keepWithNext=True),
    "body": ParagraphStyle("body", fontName="ArialReport", fontSize=9.2, leading=13.6, textColor=NAVY, spaceAfter=7, allowWidows=0, allowOrphans=0),
    "bullet": ParagraphStyle("bullet", fontName="ArialReport", fontSize=9.1, leading=13.3, textColor=NAVY, leftIndent=16, firstLineIndent=-10, spaceAfter=4, allowWidows=0, allowOrphans=0),
    "meta": ParagraphStyle("meta", fontName="ArialReport", fontSize=10, leading=16, textColor=MUTED, alignment=TA_CENTER, spaceAfter=4),
    "table": ParagraphStyle("table", fontName="ArialReport", fontSize=9, leading=13.3, textColor=NAVY, leftIndent=12, firstLineIndent=-9, spaceAfter=5),
}


def markup(text):
    value = escape(text.strip())
    value = re.sub(r"`([^`]+)`", r'<font color="#875B19">\1</font>', value)
    value = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", value)
    return value


def decorate(canvas, doc):
    canvas.saveState()
    width, height = A4
    canvas.setStrokeColor(GOLD)
    canvas.setLineWidth(1.4)
    canvas.line(45, height - 40, width - 45, height - 40)
    canvas.setFont("ArialReport", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(45, 32, "Mon Miam Miam / ZeDuc-Sp@ce • Rapport technique • 06.11.2026")
    canvas.drawRightString(width - 45, 32, str(doc.page))
    canvas.restoreState()


def cover(canvas, doc):
    canvas.saveState()
    width, height = A4
    canvas.setFillColor(NAVY)
    canvas.rect(0, height - 23, width, 23, stroke=0, fill=1)
    canvas.setFillColor(GOLD)
    canvas.rect(0, height - 28, width, 5, stroke=0, fill=1)
    canvas.restoreState()


def create():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = BaseDocTemplate(str(OUTPUT), pagesize=A4, leftMargin=46, rightMargin=46, topMargin=58, bottomMargin=52,
                          title="Rapport technique Mon Miam Miam / ZeDuc-Sp@ce", author="Equipe projet")
    frame = Frame(46, 52, A4[0] - 92, A4[1] - 110, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates([
        PageTemplate(id="cover", frames=frame, onPage=cover),
        PageTemplate(id="body", frames=frame, onPage=decorate),
    ])
    story = [Spacer(1, 130), Paragraph("Rapport technique", styles["cover"]),
             Paragraph("Mon Miam Miam / ZeDuc-Sp@ce", styles["cover_sub"]), Spacer(1, 36),
             Paragraph("Applications web et mobile • API Laravel • MySQL", styles["meta"]),
             Paragraph("6 novembre 2026", styles["meta"]),
             Spacer(1, 85), Paragraph("État du code, circulation des données, droits, vérification et travaux restants", styles["meta"]),
             NextPageTemplate("body"), PageBreak()]
    lines = SOURCE.read_text(encoding="utf-8").splitlines()
    paragraph = []
    table_header = None

    def flush():
        if paragraph:
            story.append(Paragraph(markup(" ".join(paragraph)), styles["body"]))
            paragraph.clear()

    for line in lines:
        stripped = line.strip()
        if not stripped:
            flush()
            continue
        if stripped.startswith("# "):
            continue  # Already on the cover.
        if stripped.startswith("## "):
            flush()
            story.append(Paragraph(markup(stripped[3:]), styles["h2"]))
            table_header = None
            continue
        if stripped.startswith("| "):
            flush()
            cells = [cell.strip() for cell in stripped.strip("|").split("|")]
            if all(re.fullmatch(r"[-: ]+", cell) for cell in cells):
                continue
            if table_header is None:
                table_header = cells
            else:
                story.append(Paragraph("• <b>" + markup(cells[0]) + "</b> — " + markup("; ".join(cells[1:])), styles["table"]))
            continue
        table_header = None
        if re.match(r"^(?:\d+\.|-)\s", stripped):
            flush()
            content = re.sub(r"^(?:\d+\.|-)\s+", "", stripped)
            story.append(Paragraph("• " + markup(content), styles["bullet"]))
            continue
        paragraph.append(stripped)
    flush()
    doc.build(story)
    print(OUTPUT)


if __name__ == "__main__":
    create()
