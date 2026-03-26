import os
import time
from playwright.sync_api import sync_playwright
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SCREENSHOTS_DIR = os.path.join(BASE_DIR, "screenshots")
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

APP_URL = "http://localhost:5174/"

SLIDES = [
    {
        "title": "KLA Scanner Intelligence",
        "subtitle": "Global Supply Chain Tower\nPowered by Snowflake + SAP S/4 HANA",
        "notes": "",
        "screenshot": None,
    },
    {
        "title": "The Problem & The Dashboard",
        "subtitle": "[0:00 - 0:40]",
        "notes": (
            "What you're looking at is a Global Supply Chain Tower for KLA's scanner fleet. "
            "This connects directly to SAP S/4 HANA - you can see the live indicator in the header - "
            "and gives our field service and supply chain teams a single pane of glass across all customers.\n\n"
            "Today we're managing a fleet of 12 fabs across 5 major customers - TSMC, Samsung, Intel, "
            "SK Hynix, and Renesas. Right away in the header you can see we have 2 critical scanners "
            "and 4 warnings that need attention."
        ),
        "screenshot": "01_full_dashboard.png",
        "capture": "full_dashboard",
    },
    {
        "title": "Customer Fleet Overview",
        "subtitle": "[0:40 - 1:20] Navigate by Customer",
        "notes": (
            "The first thing a fleet manager does is pick their customer. Let me filter down to TSMC - "
            "they're about 50% of our revenue.\n\n"
            "Now I'm looking at TSMC's 30 scanners across 4 fabs - Tainan, Taichung, Hsinchu, and Arizona. "
            "I can immediately see Fab 18 in Tainan has the most scanners and some warnings. "
            "The color coding - red for critical, orange for warning, green for healthy - tells me where to focus."
        ),
        "screenshot": "02_tsmc_filtered.png",
        "capture": "tsmc_filter",
    },
    {
        "title": "Sensor Health - Multi-Sensor Diagnostics",
        "subtitle": "[1:20 - 2:10] SCN-KR-001 Critical Scanner",
        "notes": (
            "This is where it gets powerful. Scanner SCN-KR-001 in Korea is flagged critical, "
            "and instead of just seeing one number, we see ALL the sensor metrics sorted worst-to-best.\n\n"
            "At the top - 193nm Laser Power at 82.3 milliwatts. That's well below our 90 milliwatt "
            "critical threshold. But look - it's not just the laser. Stage Vibration is in warning "
            "territory at 3.14 nanometers, Chamber Pressure is low at 0.81 Pascals, and Beam Current is borderline.\n\n"
            "This strip plot visualization shows the healthy range in green, and the dot shows exactly "
            "where the current reading sits. When multiple sensors degrade together like this, that's a "
            "pattern - and that's where our AI agent comes in."
        ),
        "screenshot": "03_sensor_health.png",
        "capture": "sensor_health",
    },
    {
        "title": "AI Diagnostic Agent",
        "subtitle": "[2:10 - 3:10] Pattern Recognition",
        "notes": (
            "Let me ask our KLA Diagnostic Agent about this. I'll click directly on the 193nm Laser Power metric.\n\n"
            "That automatically triggers an AI analysis. The agent looks at this scanner's telemetry history, "
            "compares it against the full fleet, and identifies root causes.\n\n"
            "I can ask: 'show me other scanners where this same pattern has been observed.' "
            "The agent can correlate degradation patterns across the entire fleet and identify "
            "if this is an isolated issue or a systemic batch problem.\n\n"
            "And I can check if any deferred maintenance could be the root cause. This connects "
            "maintenance history to current sensor readings - something that typically requires "
            "a field engineer to manually cross-reference."
        ),
        "screenshot": "04_ai_chat.png",
        "capture": "ai_chat",
    },
    {
        "title": "Telemetry & Maintenance",
        "subtitle": "[3:10 - 3:50] The Evidence",
        "notes": (
            "Below the fleet overview, we have the telemetry trend for this scanner - you can see "
            "the laser power degrading over the past two weeks.\n\n"
            "Switching to Maintenance history, I can see the full repair log - previous part replacements, "
            "calibrations, and importantly, any deferred preventive maintenance that might explain what we're seeing."
        ),
        "screenshot": "05_telemetry.png",
        "capture": "telemetry",
    },
    {
        "title": "Supply Chain Action",
        "subtitle": "[3:50 - 4:30] Ship Part & Transfers",
        "notes": (
            "Here's where diagnostics meets supply chain execution. Once we've identified the issue, "
            "I need to get a replacement part to the customer. This view shows me shipping options "
            "from different warehouses - cost, transit time, and tax implications side by side.\n\n"
            "I can compare shipping from our US warehouse versus our APAC warehouse, see the landed "
            "cost breakdown, and choose the best option.\n\n"
            "And if the part isn't in the nearest warehouse, I can initiate a warehouse-to-warehouse "
            "transfer to pre-position inventory closer to customers who might need it next.\n\n"
            "The inventory view gives me real-time stock levels across all our warehouses, so I know "
            "exactly what's available before I commit to a repair plan."
        ),
        "screenshot": "06_ship_part.png",
        "capture": "ship_part",
    },
    {
        "title": "The Value",
        "subtitle": "[4:30 - 5:00] Closing",
        "notes": (
            "So to recap - in one unified view, we went from a fleet-level overview, to customer-specific "
            "diagnostics, to multi-sensor pattern analysis, to AI-powered root cause identification, "
            "to supply chain execution.\n\n"
            "What used to take a field engineer hours of cross-referencing spreadsheets and SAP transactions "
            "now happens in seconds. This is KLA Scanner Intelligence - connecting diagnostics to action, "
            "powered by Snowflake and SAP S/4 HANA."
        ),
        "screenshot": "07_closing.png",
        "capture": "closing",
    },
    {
        "title": "Architecture",
        "subtitle": "Technical Stack",
        "notes": (
            "The solution is built on:\n"
            "- Snowflake Cortex Agent for AI diagnostics\n"
            "- Snowflake Cortex Analyst (Semantic View) for natural language to SQL\n"
            "- Cortex Search for technical documentation retrieval\n"
            "- SAP S/4 HANA integration for live ERP data\n"
            "- React dashboard with real-time sensor telemetry"
        ),
        "screenshot": None,
        "text_content": (
            "Data Layer: Snowflake (KLA_SUPPLY_CHAIN database)\n"
            "  - SCANNERS: 46 scanners across 12 fabs\n"
            "  - TELEMETRY_READINGS: 6,258 sensor readings\n"
            "  - ALERTS: Active critical/warning alerts\n"
            "  - PARTS_INVENTORY: 14 parts across warehouses\n\n"
            "AI Layer: Snowflake Cortex\n"
            "  - Cortex Agent: KLA_DIAGNOSTIC_AGENT\n"
            "  - Semantic View: KLA_SCANNER_INTELLIGENCE\n"
            "  - Search Service: TECHNICAL_DOCS_SEARCH\n\n"
            "ERP Layer: SAP S/4 HANA\n"
            "  - Live inventory & shipping data\n"
            "  - Part transfer & logistics\n\n"
            "Frontend: React + TypeScript + Vite\n"
            "  - Recharts for telemetry visualization\n"
            "  - Real-time sensor health strip plots"
        ),
    },
]


def capture_screenshots(page):
    page.set_viewport_size({"width": 1440, "height": 900})
    page.goto(APP_URL)
    page.wait_for_load_state("networkidle")
    time.sleep(1)

    page.evaluate("localStorage.setItem('kla-theme', 'light')")
    page.reload()
    page.wait_for_load_state("networkidle")
    time.sleep(2)

    page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "01_full_dashboard.png"), full_page=True)
    print("Captured: 01_full_dashboard.png")

    try:
        dropdown = page.locator("text=All Customers").first
        dropdown.click()
        time.sleep(0.5)
        tsmc_option = page.locator("text=TSMC").first
        if tsmc_option.is_visible():
            tsmc_option.click()
            time.sleep(1)
    except Exception:
        pass
    page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "02_tsmc_filtered.png"), full_page=True)
    print("Captured: 02_tsmc_filtered.png")

    try:
        dropdown = page.locator("button:has-text('TSMC')").first
        if dropdown.is_visible():
            dropdown.click()
            time.sleep(0.5)
        all_opt = page.locator("text=All Customers").first
        if all_opt.is_visible():
            all_opt.click()
            time.sleep(1)
    except Exception:
        pass

    page.screenshot(
        path=os.path.join(SCREENSHOTS_DIR, "03_sensor_health.png"),
        clip={"x": 0, "y": 0, "width": 960, "height": 900}
    )
    print("Captured: 03_sensor_health.png")

    page.screenshot(
        path=os.path.join(SCREENSHOTS_DIR, "04_ai_chat.png"),
        clip={"x": 640, "y": 0, "width": 800, "height": 900}
    )
    print("Captured: 04_ai_chat.png")

    try:
        page.locator("button:has-text('Telemetry')").first.click()
        time.sleep(1)
    except Exception:
        pass
    page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "05_telemetry.png"), full_page=True)
    print("Captured: 05_telemetry.png")

    try:
        page.locator("button:has-text('Ship Part')").first.click()
        time.sleep(1)
    except Exception:
        pass
    page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "06_ship_part.png"), full_page=True)
    print("Captured: 06_ship_part.png")

    page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "07_closing.png"), full_page=True)
    print("Captured: 07_closing.png")


def create_ppt():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    KLA_BLUE = RGBColor(0x00, 0x5B, 0xA2)
    KLA_DARK = RGBColor(0x1A, 0x1A, 0x2E)
    WHITE = RGBColor(0xFF, 0xFF, 0xFF)
    GRAY = RGBColor(0x66, 0x66, 0x66)

    for i, slide_data in enumerate(SLIDES):
        slide_layout = prs.slide_layouts[6]
        slide = prs.slides.add_slide(slide_layout)

        bg = slide.background
        fill = bg.fill
        fill.solid()
        if i == 0:
            fill.fore_color.rgb = KLA_DARK
        elif i == len(SLIDES) - 1:
            fill.fore_color.rgb = KLA_DARK
        else:
            fill.fore_color.rgb = WHITE

        is_dark = i == 0 or i == len(SLIDES) - 1
        title_color = WHITE if is_dark else KLA_BLUE
        subtitle_color = RGBColor(0xBB, 0xBB, 0xBB) if is_dark else GRAY
        body_color = RGBColor(0xDD, 0xDD, 0xDD) if is_dark else RGBColor(0x33, 0x33, 0x33)

        screenshot_path = None
        if slide_data.get("screenshot"):
            sp = os.path.join(SCREENSHOTS_DIR, slide_data["screenshot"])
            if os.path.exists(sp):
                screenshot_path = sp

        if screenshot_path and i != 0 and i != len(SLIDES) - 1:
            try:
                from PIL import Image
                img = Image.open(screenshot_path)
                img_w, img_h = img.size
            except ImportError:
                img_w, img_h = 1440, 900

            slide_w = Inches(13.333)
            slide_h = Inches(7.5)

            title_area_h = Inches(1.2)

            avail_w = slide_w - Inches(0.5)
            avail_h = slide_h - title_area_h - Inches(0.3)

            scale_w = avail_w / Emu(int(img_w * 914400 / 96))
            scale_h = avail_h / Emu(int(img_h * 914400 / 96))
            scale = min(scale_w, scale_h, 1.0)

            pic_w = int(img_w * 914400 / 96 * scale)
            pic_h = int(img_h * 914400 / 96 * scale)

            left = int((slide_w - pic_w) / 2)
            top = int(title_area_h)

            txBox = slide.shapes.add_textbox(Inches(0.5), Inches(0.2), Inches(10), Inches(0.5))
            tf = txBox.text_frame
            p = tf.paragraphs[0]
            p.text = slide_data["title"]
            p.font.size = Pt(24)
            p.font.bold = True
            p.font.color.rgb = KLA_BLUE

            if slide_data.get("subtitle"):
                txBox2 = slide.shapes.add_textbox(Inches(0.5), Inches(0.7), Inches(10), Inches(0.4))
                tf2 = txBox2.text_frame
                p2 = tf2.paragraphs[0]
                p2.text = slide_data["subtitle"]
                p2.font.size = Pt(14)
                p2.font.color.rgb = GRAY

            try:
                slide.shapes.add_picture(screenshot_path, left, top, pic_w, pic_h)
            except Exception as e:
                print(f"Warning: Could not add image for slide {i}: {e}")
                txBox3 = slide.shapes.add_textbox(Inches(1), Inches(2), Inches(11), Inches(4))
                tf3 = txBox3.text_frame
                tf3.word_wrap = True
                p3 = tf3.paragraphs[0]
                p3.text = f"[Screenshot: {slide_data['screenshot']}]"
                p3.font.size = Pt(18)
                p3.font.color.rgb = GRAY
        else:
            if i == 0:
                txBox = slide.shapes.add_textbox(Inches(1), Inches(2), Inches(11), Inches(1.5))
                tf = txBox.text_frame
                p = tf.paragraphs[0]
                p.text = slide_data["title"]
                p.font.size = Pt(48)
                p.font.bold = True
                p.font.color.rgb = WHITE
                p.alignment = PP_ALIGN.CENTER

                txBox2 = slide.shapes.add_textbox(Inches(1), Inches(3.8), Inches(11), Inches(1))
                tf2 = txBox2.text_frame
                for line in slide_data["subtitle"].split("\n"):
                    p2 = tf2.add_paragraph() if tf2.paragraphs[0].text else tf2.paragraphs[0]
                    p2.text = line
                    p2.font.size = Pt(24)
                    p2.font.color.rgb = RGBColor(0xBB, 0xBB, 0xBB)
                    p2.alignment = PP_ALIGN.CENTER

            elif i == len(SLIDES) - 1:
                txBox = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(5), Inches(0.6))
                tf = txBox.text_frame
                p = tf.paragraphs[0]
                p.text = slide_data["title"]
                p.font.size = Pt(36)
                p.font.bold = True
                p.font.color.rgb = WHITE

                if slide_data.get("text_content"):
                    txBox2 = slide.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(11.5), Inches(5.5))
                    tf2 = txBox2.text_frame
                    tf2.word_wrap = True
                    for line in slide_data["text_content"].split("\n"):
                        p2 = tf2.add_paragraph() if tf2.paragraphs[0].text else tf2.paragraphs[0]
                        p2.text = line
                        p2.font.size = Pt(16)
                        p2.font.color.rgb = RGBColor(0xDD, 0xDD, 0xDD)
                        if line and not line.startswith("  "):
                            p2.font.bold = True
                            p2.font.size = Pt(18)
                            p2.font.color.rgb = RGBColor(0x55, 0xBB, 0xFF)

            else:
                txBox = slide.shapes.add_textbox(Inches(1), Inches(2.5), Inches(11), Inches(1))
                tf = txBox.text_frame
                p = tf.paragraphs[0]
                p.text = slide_data["title"]
                p.font.size = Pt(36)
                p.font.bold = True
                p.font.color.rgb = title_color
                p.alignment = PP_ALIGN.CENTER

                if slide_data.get("subtitle"):
                    txBox2 = slide.shapes.add_textbox(Inches(1), Inches(3.8), Inches(11), Inches(0.6))
                    tf2 = txBox2.text_frame
                    p2 = tf2.paragraphs[0]
                    p2.text = slide_data["subtitle"]
                    p2.font.size = Pt(20)
                    p2.font.color.rgb = subtitle_color
                    p2.alignment = PP_ALIGN.CENTER

        if slide_data.get("notes"):
            notes_slide = slide.notes_slide
            notes_tf = notes_slide.notes_text_frame
            notes_tf.text = slide_data["notes"]

    output_path = os.path.join(BASE_DIR, "KLA_Scanner_Intelligence_Demo.pptx")
    prs.save(output_path)
    print(f"\nPPT saved to: {output_path}")
    return output_path


if __name__ == "__main__":
    print("=== Capturing Screenshots ===")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        capture_screenshots(page)
        browser.close()

    print("\n=== Creating PowerPoint ===")
    create_ppt()
    print("\nDone!")
