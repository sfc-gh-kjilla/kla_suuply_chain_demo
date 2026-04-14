const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

async function captureSAP() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  
  await page.goto('http://localhost:5175', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Click SAP badge using a more precise selector
  console.log('Capturing SAP Integration...');
  await page.evaluate(() => {
    const divs = document.querySelectorAll('div');
    for (const div of divs) {
      if (div.textContent?.includes('SAP S/4 HANA') && div.children.length <= 3) {
        div.click();
        break;
      }
    }
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '14_sap_integration.png'), fullPage: false });
  console.log('SAP Integration captured!');

  // Also capture light mode
  console.log('Capturing Light Mode...');
  // Click the theme toggle button (sun icon)
  await page.evaluate(() => {
    const divs = document.querySelectorAll('div');
    for (const div of divs) {
      if (div.textContent?.includes('SAP S/4 HANA') && div.children.length <= 3) {
        div.click();
        break;
      }
    }
  });
  await page.waitForTimeout(500);
  
  // Find and click theme toggle - it's a button with the sun/moon icon
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const svg = await btn.$('svg');
    if (svg) {
      const ariaLabel = await btn.getAttribute('aria-label');
      const textContent = await btn.textContent();
      if (!textContent || textContent.trim() === '') {
        // Could be the theme toggle (icon-only button at far right of header)
        const rect = await btn.boundingBox();
        if (rect && rect.x > 1600) {
          await btn.click();
          break;
        }
      }
    }
  }
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '15_light_mode.png'), fullPage: false });
  console.log('Light Mode captured!');

  await browser.close();
}

captureSAP().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
