import time
import os
from playwright.sync_api import sync_playwright

SCREENSHOT_DIR = os.path.join(os.path.dirname(__file__), "screenshots")
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

URL = "http://localhost:5173"

def save(page, name, full_page=False):
    path = os.path.join(SCREENSHOT_DIR, f"{name}.png")
    page.screenshot(path=path, full_page=full_page)
    print(f"  Saved: {path}")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        page.goto(URL)
        page.wait_for_timeout(3000)

        # 1. Full Dashboard Overview
        print("1. Dashboard Overview")
        clear_btn = page.query_selector('button:has-text("Clear conversation")')
        if clear_btn:
            clear_btn.click()
            page.wait_for_timeout(500)
        save(page, "01_dashboard_overview")

        # 2. KPI Bar Close-up
        print("2. KPI Bar")
        kpi_el = page.query_selector('[style*="Revenue at Risk"], div:has-text("Revenue at Risk")')
        if kpi_el:
            kpi_el.screenshot(path=os.path.join(SCREENSHOT_DIR, "02_kpi_bar.png"))
            print(f"  Saved KPI bar element")
        else:
            page.screenshot(path=os.path.join(SCREENSHOT_DIR, "02_kpi_bar.png"), clip={"x": 0, "y": 50, "width": 1920, "height": 120})
            print("  Saved KPI bar clip")

        # 3. Workflow Strip
        print("3. Workflow Strip")
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "03_workflow_strip.png"), clip={"x": 0, "y": 130, "width": 1920, "height": 80})

        # 4. Escalation Cases Panel
        print("4. Escalation Cases")
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "04_escalation_cases.png"), clip={"x": 1400, "y": 200, "width": 520, "height": 600})

        # 5. SEV1 Filter
        print("5. SEV1 Filter")
        sev1_btn = page.query_selector('button:has-text("SEV1")')
        if sev1_btn:
            sev1_btn.click()
            page.wait_for_timeout(500)
        save(page, "05_sev1_filter")

        # Reset to ALL
        all_btn = page.query_selector('button:has-text("ALL")')
        if all_btn:
            all_btn.click()
            page.wait_for_timeout(500)

        # 6. Case Detail
        print("6. Case Detail")
        case_card = page.query_selector('div:has-text("ESC-2026-4281")')
        if case_card:
            case_card.click()
            page.wait_for_timeout(1000)
        save(page, "06_case_detail")

        # 7. Sensor Health Panel
        print("7. Sensor Health")
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "07_sensor_health.png"), clip={"x": 960, "y": 200, "width": 500, "height": 400})

        # 8. Telemetry Tab
        print("8. Telemetry")
        tel_btn = page.query_selector('button:has-text("Telemetry")')
        if tel_btn:
            tel_btn.click()
            page.wait_for_timeout(1000)
        save(page, "08_telemetry")

        # 9. Maintenance Tab
        print("9. Maintenance")
        maint_btn = page.query_selector('button:has-text("Maintenance")')
        if maint_btn:
            maint_btn.click()
            page.wait_for_timeout(1000)
        save(page, "09_maintenance")

        # 10. Source Parts Tab
        print("10. Source Parts")
        parts_btn = page.locator('button:has-text("Source Parts")').first
        if parts_btn:
            parts_btn.click()
            page.wait_for_timeout(1000)
        save(page, "10_source_parts")

        # 11. Transfer Tab
        print("11. Transfer")
        transfer_btn = page.query_selector('button:has-text("Transfer")')
        if transfer_btn:
            transfer_btn.click()
            page.wait_for_timeout(1000)
        save(page, "11_transfer")

        # 12. Inventory Tab
        print("12. Inventory")
        inv_btn = page.query_selector('button:has-text("Inventory")')
        if inv_btn:
            inv_btn.click()
            page.wait_for_timeout(1000)
        save(page, "12_inventory")

        # Go back to Case Detail for chat scenarios
        cd_btn = page.query_selector('button:has-text("Case Detail")')
        if cd_btn:
            cd_btn.click()
            page.wait_for_timeout(500)

        # 13. AI Summary click
        print("13. AI Summary")
        clear_btn = page.query_selector('button:has-text("Clear conversation")')
        if clear_btn:
            clear_btn.click()
            page.wait_for_timeout(500)
        ai_sum_btn = page.query_selector('button:has-text("AI Summary")')
        if ai_sum_btn:
            ai_sum_btn.click()
            page.wait_for_timeout(3000)
        save(page, "13_ai_summary")

        # 14. Chat with Tool Steps — type a query
        print("14. Chat Tool Steps")
        clear_btn = page.query_selector('button:has-text("Clear conversation")')
        if clear_btn:
            clear_btn.click()
            page.wait_for_timeout(500)
        chat_input = page.query_selector('input[placeholder*="Ask about"]')
        if chat_input:
            chat_input.fill("Source parts for ESC-2026-4281 with landed cost comparison")
            chat_input.press("Enter")
            page.wait_for_timeout(2000)
        save(page, "14_chat_tool_steps")
        page.wait_for_timeout(2000)
        save(page, "14b_chat_response")

        # 15. SAP Integration Panel
        print("15. SAP Integration Panel")
        sap_badge = page.query_selector('div:has-text("SAP S/4 HANA")')
        if sap_badge:
            sap_badge.click()
            page.wait_for_timeout(1000)
        save(page, "15_sap_integration_panel")

        # Close SAP panel
        close_btns = page.query_selector_all('button:has-text("×")')
        for btn in close_btns:
            try:
                btn.click()
                break
            except:
                pass
        page.wait_for_timeout(500)

        # 16. Architecture Overlay
        print("16. Architecture Overlay")
        arch_btn = page.query_selector('button:has-text("Architecture")')
        if arch_btn:
            arch_btn.click()
            page.wait_for_timeout(1000)
        save(page, "16_architecture_overlay")

        # Close overlay
        close_btns = page.query_selector_all('button:has-text("×")')
        for btn in close_btns:
            try:
                if btn.is_visible():
                    btn.click()
                    break
            except:
                pass
        page.wait_for_timeout(500)

        # 17. Shipment Modal — go to Source Parts and click Execute
        print("17. Shipment Modal")
        parts_tab = page.locator('button:has-text("Source Parts")').first
        if parts_tab:
            parts_tab.click()
            page.wait_for_timeout(1000)
        ship_btn = page.query_selector('button:has-text("Execute Shipment")')
        if not ship_btn:
            ship_btn = page.query_selector('button:has-text("Ship")')
        if ship_btn:
            ship_btn.click()
            page.wait_for_timeout(1000)
        save(page, "17_shipment_modal")

        # 18. Shipment modal after execution
        exec_btn = page.query_selector('button:has-text("Execute via Cortex")')
        if exec_btn:
            exec_btn.click()
            page.wait_for_timeout(5000)
        save(page, "18_shipment_writeback")

        # 19. Fleet Overview
        print("19. Fleet Overview")
        close_btns = page.query_selector_all('button:has-text("×")')
        for btn in close_btns:
            try:
                if btn.is_visible():
                    btn.click()
                    break
            except:
                pass
        page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "19_fleet_overview.png"), clip={"x": 0, "y": 200, "width": 500, "height": 400})

        # 20. Light Theme
        print("20. Light Theme")
        theme_btn = page.query_selector('button[title*="theme"], button[aria-label*="theme"]')
        if not theme_btn:
            buttons = page.query_selector_all('button')
            for b in buttons:
                text = b.inner_text()
                if '☀' in text or '🌙' in text or '◐' in text:
                    theme_btn = b
                    break
        if theme_btn:
            theme_btn.click()
            page.wait_for_timeout(1000)
        save(page, "20_light_theme")

        browser.close()
        print(f"\nDone! {len(os.listdir(SCREENSHOT_DIR))} screenshots saved to {SCREENSHOT_DIR}")

if __name__ == "__main__":
    main()
