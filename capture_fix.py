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

        # Make sure ALL cases filter is active
        page.evaluate("""
            const btns = document.querySelectorAll('button');
            for (const b of btns) {
                if (b.textContent === 'ALL') { b.click(); break; }
            }
        """)
        page.wait_for_timeout(500)

        # Click ESC-2026-4281 case first
        page.evaluate("""
            const divs = document.querySelectorAll('div');
            for (const d of divs) {
                if (d.textContent && d.textContent.includes('ESC-2026-4281') && d.textContent.includes('SEV1')) {
                    d.click();
                    break;
                }
            }
        """)
        page.wait_for_timeout(1000)

        # Click Source Parts tab (bottom panel tab, not the button)
        page.evaluate("""
            const btns = document.querySelectorAll('button');
            for (const b of btns) {
                if (b.textContent === 'Source Parts' && b.closest('[style*="flex"]')) {
                    b.click();
                    break;
                }
            }
        """)
        page.wait_for_timeout(1000)
        
        # Take clean dashboard shot first
        print("01b. Clean dashboard")
        page.evaluate("""
            const btns = document.querySelectorAll('button');
            for (const b of btns) {
                if (b.textContent === 'Case Detail') { b.click(); break; }
            }
        """)
        page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "01b_dashboard_clean.png"))
        
        # Now navigate through each tab properly for source parts
        print("10b. Source Parts with cards")
        page.evaluate("""
            const btns = document.querySelectorAll('button');
            for (const b of btns) {
                if (b.textContent === 'Source Parts' && !b.closest('[style*="width: 380"]') && !b.closest('[style*="background: linear"]')) {
                    b.click();
                    break;
                }
            }
        """)
        page.wait_for_timeout(1000)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "10b_source_parts_v2.png"))
        
        # Now try Execute Shipment
        print("17b. Shipment Modal")
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
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "17b_shipment_modal_v2.png"))
        
        # Execute via Cortex Agent
        print("18b. Write-back animation")
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
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "18b_writeback_complete.png"))
        
        browser.close()
        print("Done!")

if __name__ == "__main__":
    main()
