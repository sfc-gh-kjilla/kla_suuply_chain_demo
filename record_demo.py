import os
import time
from playwright.sync_api import sync_playwright

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VIDEO_DIR = os.path.join(BASE_DIR, "demo_video")
os.makedirs(VIDEO_DIR, exist_ok=True)

APP_URL = "http://localhost:5174/"

def smooth_scroll(page, y, steps=5, delay=0.1):
    current = page.evaluate("window.scrollY")
    step_size = (y - current) / steps
    for i in range(steps):
        page.evaluate(f"window.scrollBy(0, {step_size})")
        time.sleep(delay)

def move_cursor_to(page, selector, pause_after=0.5):
    el = page.locator(selector).first
    if el.is_visible():
        el.hover()
        time.sleep(pause_after)
        return el
    return None

def record_demo():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            record_video_dir=VIDEO_DIR,
            record_video_size={"width": 1440, "height": 900},
        )
        page = context.new_page()

        print("[0:00] Opening dashboard...")
        page.goto(APP_URL)
        page.wait_for_load_state("networkidle")
        time.sleep(3)

        print("[0:05] Hovering over header stats...")
        move_cursor_to(page, "text=Critical", pause_after=2)
        move_cursor_to(page, "text=Warning", pause_after=2)

        print("[0:15] Panning across fleet overview...")
        move_cursor_to(page, "text=Customer Fleet Overview", pause_after=2)

        time.sleep(5)
        smooth_scroll(page, 200, steps=5, delay=0.3)
        time.sleep(3)
        smooth_scroll(page, 0, steps=5, delay=0.3)
        time.sleep(5)

        print("[0:40] Clicking customer dropdown -> TSMC...")
        try:
            dropdown = page.locator("text=All Customers").first
            dropdown.click()
            time.sleep(1.5)
            tsmc = page.locator("text=TSMC").first
            if tsmc.is_visible():
                tsmc.click()
                time.sleep(3)
        except Exception as e:
            print(f"  Dropdown error: {e}")

        print("[0:50] Viewing TSMC fleet...")
        time.sleep(8)
        smooth_scroll(page, 200, steps=5, delay=0.3)
        time.sleep(3)
        smooth_scroll(page, 0, steps=5, delay=0.3)
        time.sleep(3)

        print("[1:10] Switching back to All Customers...")
        try:
            dropdown = page.locator("button:has-text('TSMC')").first
            if dropdown.is_visible():
                dropdown.click()
                time.sleep(1)
            all_opt = page.locator("text=All Customers").first
            if all_opt.is_visible():
                all_opt.click()
                time.sleep(3)
        except Exception as e:
            print(f"  Dropdown error: {e}")

        print("[1:20] Focusing on Sensor Health panel...")
        sensor_panel = page.locator("text=Sensor Health").first
        if sensor_panel.is_visible():
            sensor_panel.hover()
            time.sleep(2)

        time.sleep(8)

        print("[1:50] Hovering over individual sensor metrics...")
        try:
            laser = page.locator("text=193nm Laser Power").first
            if laser.is_visible():
                laser.hover()
                time.sleep(3)

            vibration = page.locator("text=Stage Vibration").first
            if vibration.is_visible():
                vibration.hover()
                time.sleep(2)

            chamber = page.locator("text=Chamber Pressure").first
            if chamber.is_visible():
                chamber.hover()
                time.sleep(2)
        except Exception:
            pass

        time.sleep(5)

        print("[2:10] Clicking 193nm Laser Power for AI analysis...")
        try:
            laser = page.locator("text=193nm Laser Power").first
            if laser.is_visible():
                laser.click()
                time.sleep(5)
        except Exception:
            pass

        print("[2:20] Viewing AI chat response...")
        chat_panel = page.locator("text=KLA Diagnostic Agent").first
        if chat_panel.is_visible():
            chat_panel.hover()
        time.sleep(8)

        print("[2:40] Clicking suggested prompt - fleet pattern...")
        try:
            prompt1 = page.locator("text=Show me other scanners").first
            if prompt1.is_visible():
                prompt1.click()
                time.sleep(6)
        except Exception:
            pass

        print("[2:55] Clicking suggested prompt - deferred maintenance...")
        try:
            prompt2 = page.locator("text=deferred").first
            if prompt2.is_visible():
                prompt2.click()
                time.sleep(6)
        except Exception:
            pass

        time.sleep(3)

        print("[3:10] Clicking Telemetry tab...")
        try:
            page.locator("button:has-text('Telemetry')").first.click()
            time.sleep(2)
        except Exception:
            pass

        print("[3:15] Viewing telemetry trend...")
        time.sleep(8)

        print("[3:25] Clicking Maintenance tab...")
        try:
            page.locator("button:has-text('Maintenance')").first.click()
            time.sleep(2)
        except Exception:
            pass

        time.sleep(8)

        print("[3:50] Clicking Ship Part tab...")
        try:
            page.locator("button:has-text('Ship Part')").first.click()
            time.sleep(2)
        except Exception:
            pass

        print("[3:55] Viewing shipping options...")
        time.sleep(8)

        print("[4:10] Clicking Transfer tab...")
        try:
            page.locator("button:has-text('Transfer')").first.click()
            time.sleep(2)
        except Exception:
            pass
        time.sleep(5)

        print("[4:20] Clicking Inventory tab...")
        try:
            page.locator("button:has-text('Inventory')").first.click()
            time.sleep(2)
        except Exception:
            pass
        time.sleep(5)

        print("[4:30] Closing - back to full view...")
        smooth_scroll(page, 0, steps=5, delay=0.3)
        time.sleep(10)

        print("[5:00] Demo complete. Closing browser...")
        context.close()
        browser.close()

    video_files = [f for f in os.listdir(VIDEO_DIR) if f.endswith(".webm")]
    if video_files:
        src = os.path.join(VIDEO_DIR, video_files[-1])
        dst = os.path.join(BASE_DIR, "KLA_Scanner_Intelligence_Demo.webm")
        os.rename(src, dst)
        size_mb = os.path.getsize(dst) / (1024 * 1024)
        print(f"\nVideo saved: {dst}")
        print(f"Size: {size_mb:.1f} MB")
        return dst
    else:
        print("Warning: No video file found")
        return None


if __name__ == "__main__":
    print("=== Recording KLA Scanner Intelligence Demo ===")
    print(f"App URL: {APP_URL}")
    print(f"Output: {VIDEO_DIR}")
    print()
    result = record_demo()
    if result:
        print(f"\nDone! Video: {result}")
    else:
        print("\nRecording may have failed - check demo_video/ directory")
