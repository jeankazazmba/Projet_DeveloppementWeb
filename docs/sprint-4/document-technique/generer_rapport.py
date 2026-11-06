"""Génère le rapport PDF du groupe 2 à partir du Markdown voisin."""
from html import escape
from pathlib import Path
import re

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import BaseDocTemplate, Frame, Image, PageBreak, PageTemplate, Paragraph, Spacer, Table, TableStyle

HERE = Path(__file__).resolve().parent
SOURCE = HERE / "RAPPORT_GROUPE_2.md"
OUTPUT = HERE / "RAPPORT_TECHNIQUE_GROUPE_2.pdf"
LOGO = Path(r"C:\Users\jeank\AppData\Local\Temp\codex-clipboard-690405f8-8528-4e32-a711-a548919ebc12.png")
if not LOGO.exists():
    LOGO = HERE.parents[2] / "frontend/public/assets/figma/dashboard-imgMonMiamMiamZeDucSpCe.png"

pdfmetrics.registerFont(TTFont("Report", "C:/Windows/Fonts/arial.ttf"))
pdfmetrics.registerFont(TTFont("Report-Bold", "C:/Windows/Fonts/arialbd.ttf"))
pdfmetrics.registerFontFamily("Report", normal="Report", bold="Report-Bold")
INK = colors.HexColor("#1C211E")
GOLD = colors.HexColor("#AE7E37")
MUTED = colors.HexColor("#626A63")
PAPER = colors.HexColor("#F8F5ED")

body = ParagraphStyle("body", fontName="Report", fontSize=9.4, leading=14.7, textColor=INK, alignment=TA_JUSTIFY, spaceAfter=8)
heading = ParagraphStyle("heading", fontName="Report-Bold", fontSize=15, leading=20, textColor=INK, spaceBefore=18, spaceAfter=9, keepWithNext=True)
bullet = ParagraphStyle("bullet", parent=body, leftIndent=13, firstLineIndent=-9, alignment=TA_LEFT, spaceAfter=4)
small = ParagraphStyle("small", parent=body, fontSize=8.5, leading=12, alignment=TA_LEFT)
cover_title = ParagraphStyle("cover_title", fontName="Report-Bold", fontSize=31, leading=36, textColor=INK, alignment=TA_CENTER)
cover_sub = ParagraphStyle("cover_sub", fontName="Report", fontSize=15, leading=22, textColor=GOLD, alignment=TA_CENTER)
center = ParagraphStyle("center", fontName="Report", fontSize=10, leading=17, textColor=INK, alignment=TA_CENTER)

def rich(value):
    value = escape(value)
    value = re.sub(r"\*\*(.*?)\*\*", r"<b>\1</b>", value)
    value = re.sub(r"`([^`]+)`", r'<font color="#815A24">\1</font>', value)
    def link(match):
        url = match.group(1).rstrip(".")
        label = url.split("/")[-1] or "ouvrir"
        return f'<link href="{url}" color="#815A24">{label}</link>'
    value = re.sub(r"(https://[^\s<,]+)", link, value)
    return value

def page(canvas, doc):
    canvas.saveState()
    w, h = A4
    canvas.setFillColor(GOLD)
    canvas.rect(0, h-8, w, 8, fill=1, stroke=0)
    canvas.setStrokeColor(GOLD)
    canvas.line(45, 47, w-45, 47)
    canvas.setFont("Report", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(45, 34, "Mon Miam Miam  |  Groupe 2  |  ULC-ICAM")
    canvas.drawRightString(w-45, 34, str(doc.page))
    canvas.restoreState()

def cover(canvas, doc):
    canvas.saveState()
    w, h = A4
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, w, h, fill=1, stroke=0)
    canvas.setFillColor(GOLD)
    canvas.rect(0, h-12, w, 12, fill=1, stroke=0)
    canvas.rect(0, 0, w, 9, fill=1, stroke=0)
    canvas.restoreState()

def flow(items):
    cells = []
    for index, item in enumerate(items):
        cells.append(Paragraph(f"<b>{escape(item)}</b>", small))
        if index < len(items)-1:
            cells.append(Paragraph("→", center))
    widths = []
    for index in range(len(cells)):
        widths.append(67 if index % 2 == 0 else 18)
    table = Table([cells], colWidths=widths, hAlign="CENTER")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0,0),(-1,-1), PAPER), ("BOX",(0,0),(-1,-1),.5,GOLD),
        ("VALIGN",(0,0),(-1,-1),"MIDDLE"), ("TOPPADDING",(0,0),(-1,-1),12), ("BOTTOMPADDING",(0,0),(-1,-1),12),
    ]))
    return table

def build():
    doc = BaseDocTemplate(str(OUTPUT), pagesize=A4, leftMargin=45, rightMargin=45, topMargin=55, bottomMargin=63,
                          title="Mon Miam Miam - Rapport technique et déroulement - Groupe 2", author="Groupe 2 - ULC-ICAM")
    frame = Frame(45,63,A4[0]-90,A4[1]-118,leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0)
    doc.addPageTemplates([PageTemplate(id="cover", frames=frame, onPage=cover), PageTemplate(id="body", frames=frame, onPage=page)])
    story = [Spacer(1,64), Image(str(LOGO),width=250,height=229), Spacer(1,30),
             Paragraph("ULC-ICAM", cover_sub), Spacer(1,14), Paragraph("MON MIAM MIAM", cover_title),
             Paragraph("Rapport technique et déroulement du projet", cover_sub), Spacer(1,20),
             Paragraph("Groupe 2  •  ZeDuc-Sp@ce  •  Kinshasa", center), Spacer(1,35)]
    members = ["Jean d'Arc Kazamba", "Yveline Mwika", "Christian Onokola", "Wivine Mukendi", "Aksa Mbala", "Roseline Bolongosha", "Caleb Kashoba"]
    story.append(Paragraph("MEMBRES DU GROUPE", center))
    story.append(Spacer(1,8))
    story.extend(Paragraph(escape(name), center) for name in members)
    story.extend([Spacer(1,25), Paragraph("6 novembre 2026", center), PageBreak()])
    lines = SOURCE.read_text(encoding="utf-8").splitlines()
    paragraphs = []
    def flush():
        if paragraphs:
            story.append(Paragraph(rich(" ".join(paragraphs)), body))
            paragraphs.clear()
    for line in lines:
        line = line.strip()
        if not line:
            flush(); continue
        if line.startswith("# ") or line.startswith("**Groupe 2"):
            continue
        if line.startswith("## "):
            flush()
            label=line[3:]
            story.append(Paragraph(rich(label), heading))
            if label.startswith("3. Déroulement"):
                story.append(flow(["Analyse", "Socle", "Métier", "Intégration"]))
                story.append(Spacer(1,12))
            if label.startswith("4. Architecture"):
                story.append(flow(["React / Expo", "API Laravel", "MySQL", "Équipes"]))
                story.append(Spacer(1,12))
            continue
        if line.startswith("- "):
            flush()
            story.append(Paragraph("• " + rich(line[2:]), bullet))
            continue
        paragraphs.append(line)
    flush()
    doc.build(story)
    print(OUTPUT)

if __name__ == "__main__":
    build()
