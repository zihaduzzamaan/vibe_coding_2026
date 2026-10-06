import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

async function captureDemo() {
  const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  
  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 2 });
  
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // 1. Initial screenshot
  await page.screenshot({ path: path.resolve('screenshots', 'initial_statuses.png'), fullPage: true });
  console.log('Saved initial_statuses.png');

  // 2. Toggle to Bangla
  const langBtn = await page.$('header button:last-child');
  if (langBtn) {
    await langBtn.click();
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.resolve('screenshots', 'bangla_ui.png'), fullPage: true });
    console.log('Saved bangla_ui.png');
    // Switch back to English
    await langBtn.click();
    await new Promise(r => setTimeout(r, 500));
  }

  // 3. Upload sample documents
  const docsDir = path.resolve('Problems', 'problem-pack', 'sample-pack', 'documents');
  const sampleFiles = fs.readdirSync(docsDir).map(f => path.join(docsDir, f));

  const fileInput = await page.$('input[type="file"][multiple]');
  if (fileInput) {
    await fileInput.uploadFile(...sampleFiles);
    await new Promise(r => setTimeout(r, 2000));

    // Click Auto-Match button
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Auto-Match')) {
        await btn.click();
        break;
      }
    }

    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.resolve('screenshots', 'all_verified_statuses.png'), fullPage: true });
    console.log('Saved all_verified_statuses.png');

    // Click Generate Package button
    const actionButtons = await page.$$('button');
    for (const btn of actionButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Generate Package')) {
        await btn.click();
        console.log('Clicked Generate Package...');
        break;
      }
    }

    await new Promise(r => setTimeout(r, 3500));
    await page.screenshot({ path: path.resolve('screenshots', 'package_generated.png'), fullPage: true });
    console.log('Saved package_generated.png');
  }

  await browser.close();
}

captureDemo().catch(err => {
  console.error('Demo capture error:', err);
  process.exit(1);
});
