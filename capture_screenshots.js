const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const BASE_URL = 'http://localhost:5173';

async function captureScreenshots() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.setItem('kla-theme', 'light'));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  console.log('Light mode set via localStorage\n');

  // 1. Main Dashboard with SLA Breach Banner + Case Detail
  console.log('01. Dashboard overview (SLA breach banner visible)...');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01_dashboard_overview.png'), fullPage: false });

  // 2. Click a case in the breach banner to show drill-down
  console.log('02. Case detail drill-down...');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02_case_detail.png'), fullPage: false });

  // 3. Sensors tab
  console.log('03. Sensors tab...');
  await page.click('button:has-text("Sensors")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03_sensors.png'), fullPage: false });

  // 4. Telemetry tab
  console.log('04. Telemetry tab...');
  await page.click('button:has-text("Telemetry")');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04_telemetry.png'), fullPage: false });

  // 5. Maintenance History
  console.log('05. Maintenance History...');
  await page.click('button:has-text("History")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05_maintenance_history.png'), fullPage: false });

  // 6. Source (Shipping Comparison)
  console.log('06. Source / Shipping Comparison...');
  await page.click('button:has-text("Source")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06_source_shipping.png'), fullPage: false });

  // 7. Part Transfer
  console.log('07. Part Transfer...');
  await page.click('button:has-text("Transfer")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07_part_transfer.png'), fullPage: false });

  // 8. Parts Inventory
  console.log('08. Parts Inventory...');
  await page.click('button:has-text("Inventory")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08_parts_inventory.png'), fullPage: false });

  // 9. Optimize
  console.log('09. Optimization Panel...');
  await page.click('button:has-text("Optimize")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '09_optimization.png'), fullPage: false });

  // 10. Multi-Source
  console.log('10. Multi-Source Panel...');
  await page.click('button:has-text("Multi-Src")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '10_multi_source.png'), fullPage: false });

  // 11. Trade Compliance
  console.log('11. Trade Compliance...');
  await page.click('button:has-text("Comply")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '11_trade_compliance.png'), fullPage: false });

  // 12. Cortex Search
  console.log('12. Cortex AI Search...');
  await page.click('button:has-text("Search")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '12_cortex_search.png'), fullPage: false });

  // 13. AI Chat — trigger a suggested prompt
  console.log('13. AI Chat response...');
  await page.click('button:has-text("Case")');
  await page.waitForTimeout(500);
  await page.click('button:has-text("Summarize open escalation cases by priority")');
  await page.waitForTimeout(3500);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '13_ai_chat_response.png'), fullPage: false });

  // 14. SEV1 filter
  console.log('14. SEV1 filter...');
  await page.click('button:has-text("SEV1")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '14_sev1_filtered.png'), fullPage: false });

  // 15. Customer filter — TSMC
  console.log('15. Customer filter (TSMC)...');
  await page.click('button:has-text("ALL")');
  await page.waitForTimeout(300);
  await page.click('button:has-text("All Customers")');
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const options = document.querySelectorAll('div[style*="cursor: pointer"]');
    for (const opt of options) {
      if (opt.textContent?.includes('TSMC')) { opt.click(); break; }
    }
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '15_customer_tsmc.png'), fullPage: false });

  // 16. Customer filter — Samsung
  console.log('16. Customer filter (Samsung)...');
  await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    for (const b of btns) {
      if (b.textContent?.trim() === 'TSMC') { b.click(); break; }
    }
  });
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const options = document.querySelectorAll('div[style*="cursor"]');
    for (const opt of options) {
      if (opt.textContent?.includes('Samsung')) { opt.click(); break; }
    }
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '16_customer_samsung.png'), fullPage: false });

  // Reset to All Customers
  await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    for (const b of btns) {
      if (b.textContent?.includes('Samsung')) { b.click(); break; }
    }
  });
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const options = document.querySelectorAll('div[style*="cursor"]');
    for (const opt of options) {
      if (opt.textContent?.includes('All Customers')) { opt.click(); break; }
    }
  });
  await page.waitForTimeout(800);

  // 17. Architecture overlay
  console.log('17. Architecture Overlay...');
  await page.click('button:has-text("Architecture")');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '17_architecture_overlay.png'), fullPage: false });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // 18. SAP Integration
  console.log('18. SAP Integration...');
  await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    for (const b of btns) {
      if (b.textContent?.includes('SAP S/4 HANA')) { b.click(); break; }
    }
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '18_sap_integration.png'), fullPage: false });

  console.log(`\nAll 18 screenshots captured in LIGHT MODE!`);
  console.log(`Saved to: ${SCREENSHOTS_DIR}`);

  await browser.close();
}

captureScreenshots().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
