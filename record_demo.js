const { chromium } = require('playwright');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'outputs');
const BASE_URL = 'http://localhost:5175';

async function recordDemo() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
    recordVideo: {
      dir: OUTPUT_DIR,
      size: { width: 1920, height: 1080 }
    }
  });
  const page = await context.newPage();

  console.log('Starting demo recording (LIGHT MODE)...\n');

  // Set light mode in localStorage BEFORE navigating
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.setItem('kla-theme', 'light'));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  console.log('1/14 Dashboard loaded — Case Detail tab (Light Mode)');

  await page.waitForTimeout(2000);

  await page.click('button:has-text("Telemetry")');
  await page.waitForTimeout(2500);
  console.log('2/14 Telemetry tab');

  await page.click('button:has-text("History")');
  await page.waitForTimeout(2500);
  console.log('3/14 Maintenance History');

  await page.click('button:has-text("Source")');
  await page.waitForTimeout(2500);
  console.log('4/14 Source / Shipping');

  await page.click('button:has-text("Transfer")');
  await page.waitForTimeout(2500);
  console.log('5/14 Part Transfer');

  await page.click('button:has-text("Inventory")');
  await page.waitForTimeout(2500);
  console.log('6/14 Parts Inventory');

  await page.click('button:has-text("Optimize")');
  await page.waitForTimeout(2500);
  console.log('7/14 Optimization');

  await page.click('button:has-text("Multi-Source")');
  await page.waitForTimeout(3000);
  console.log('8/14 Multi-Source Analysis');

  await page.click('button:has-text("Compliance")');
  await page.waitForTimeout(2500);
  console.log('9/14 Trade Compliance');

  await page.click('button:has-text("Search")');
  await page.waitForTimeout(2500);
  console.log('10/14 Cortex AI Search');

  await page.click('button:has-text("Case")');
  await page.waitForTimeout(1000);
  await page.click('button:has-text("Summarize open escalation cases by priority")');
  await page.waitForTimeout(4000);
  console.log('11/14 AI Chat — escalation summary');

  await page.click('button:has-text("SEV1")');
  await page.waitForTimeout(2000);
  console.log('12/14 SEV1 Filter');

  await page.click('button:has-text("ALL")');
  await page.waitForTimeout(1000);

  await page.click('button:has-text("Architecture")');
  await page.waitForTimeout(3000);
  console.log('13/14 Architecture Overlay');

  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  await page.evaluate(() => {
    const divs = document.querySelectorAll('div');
    for (const div of divs) {
      if (div.textContent?.includes('SAP S/4 HANA') && div.children.length <= 3) {
        div.click();
        break;
      }
    }
  });
  await page.waitForTimeout(3000);
  console.log('14/14 SAP Integration');

  await page.waitForTimeout(2000);

  await context.close();
  await browser.close();

  console.log('\nRecording complete (LIGHT MODE)!');
  console.log(`Video saved to: ${OUTPUT_DIR}/`);
}

recordDemo().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
