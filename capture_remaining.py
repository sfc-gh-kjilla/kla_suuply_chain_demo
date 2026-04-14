import time
import os
from playwright.sync_api import sync_playwright

SCREENSHOT_DIR = os.path.join(os.path.dirname(__file__), "screenshots")
URL = "http://localhost:5173"

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        page.goto(URL)
        page.wait_for_timeout(3000)

        # Navigate to Source Parts tab via JavaScript to avoid overlay issues
        print("17. Shipment Modal")
        page.evaluate("""
            const tabs = document.querySelectorAll('button');
            for (const t of tabs) {
                if (t.textContent === 'Source Parts' && !t.closest('[style*="width: 380"]')) {
                    t.click();
                    break;
                }
            }
        """)
        page.wait_for_timeout(1000)

        # Click Execute Shipment via JS
        page.evaluate("""
            const btns = document.querySelectorAll('button');
            for (const b of btns) {
                if (b.textContent && b.textContent.includes('Execute Shipment')) {
                    b.click();
                    break;
                }
            }
        """)
        page.wait_for_timeout(1500)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "17_shipment_modal.png"))
        print("  Saved 17_shipment_modal.png")

        # Execute via Cortex Agent
        print("18. Shipment Write-back")
        page.evaluate("""
            const btns = document.querySelectorAll('button');
            for (const b of btns) {
                if (b.textContent && b.textContent.includes('Execute via Cortex')) {
                    b.click();
                    break;
                }
            }
        """)
        page.wait_for_timeout(5000)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "18_shipment_writeback.png"))
        print("  Saved 18_shipment_writeback.png")

        # Close modal
        page.evaluate("""
            const btns = document.querySelectorAll('button');
            for (const b of btns) {
                if (b.textContent && b.textContent.trim() === '×') {
                    b.click();
                    break;
                }
            }
        """)
        page.wait_for_timeout(500)

        # Fleet Overview clip
        print("19. Fleet Overview")
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "19_fleet_overview.png"), clip={"x": 0, "y": 200, "width": 500, "height": 400})
        print("  Saved 19_fleet_overview.png")

        # Theme toggle
        print("20. Light Theme")
        page.evaluate("""
            const btns = document.querySelectorAll('button');
            for (const b of btns) {
                const t = b.textContent || '';
                if (t.includes('☀') || t.includes('🌙') || t.includes('◐') || t.includes('☾') || t.includes('☼')) {
                    b.click();
                    break;
                }
            }
        """)
        page.wait_for_timeout(1000)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "20_light_theme.png"))
        print("  Saved 20_light_theme.png")

        # Customer filter
        print("21. Customer Filter")
        page.evaluate("""
            const btns = document.querySelectorAll('button');
            for (const b of btns) {
                if (b.textContent && b.textContent.includes('All Customers')) {
                    b.click();
                    break;
                }
            }
        """)
        page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "21_customer_filter.png"))
        print("  Saved 21_customer_filter.png")

        browser.close()
        total = len([f for f in os.listdir(SCREENSHOT_DIR) if f.endswith('.png') and f.startswith(('0', '1', '2'))])
        print(f"\nDone! Total screenshots: {total}")

if __name__ == "__main__":
    main()
