const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const APP_URL = 'http://localhost:3000/';
const SCREENSHOTS_DIR = path.resolve(__dirname, '..', 'docs', 'screenshots');
const CORE_SCREENSHOTS_DIR = path.resolve(__dirname, '..', '..', 'stellar-bazaar-core', 'docs', 'screenshots');

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
  if (!fs.existsSync(CORE_SCREENSHOTS_DIR)) {
    fs.mkdirSync(CORE_SCREENSHOTS_DIR, { recursive: true });
  }

  console.log('Launching browser for screenshots...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900'],
    defaultViewport: { width: 1280, height: 900 },
  });

  const page = await browser.newPage();

  async function saveScreenshot(filename) {
    const p1 = path.join(SCREENSHOTS_DIR, filename);
    const p2 = path.join(CORE_SCREENSHOTS_DIR, filename);
    await page.screenshot({ path: p1 });
    fs.copyFileSync(p1, p2);
    console.log(`Saved screenshot: ${filename}`);
  }

  try {
    console.log('Navigating to', APP_URL);
    await page.goto(APP_URL, { waitUntil: 'networkidle0' });
    await sleep(1500);

    // 1. Available Wallet Options
    console.log('Capturing: 01_available_wallet_options.png');
    await page.waitForSelector('#btn-connect-wallet');
    await page.click('#btn-connect-wallet');
    await page.waitForSelector('#btn-connect-companion', { timeout: 8000 });
    await sleep(1000);
    await saveScreenshot('01_available_wallet_options.png');

    // 2. Connected Wallet
    console.log('Capturing: 02_connected_wallet.png');
    await page.click('#btn-connect-companion');
    await page.waitForSelector('#connected-address-display', { timeout: 15000 });
    await sleep(2500); // Wait for balance retrieval
    await saveScreenshot('02_connected_wallet.png');

    // 3. Create Demand Circle Modal
    console.log('Capturing: 03_create_demand_circle.png');
    await page.evaluate(() => {
      const el = document.getElementById('btn-open-create-circle');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await sleep(500);
    await page.click('#btn-open-create-circle');
    await sleep(800);

    // Fill form
    await page.type('#circle-title', 'Organic Single-Origin Cocoa Beans (Bulk 100kg)');
    await page.$eval('#circle-quantity', (el) => (el.value = '75'));
    await page.$eval('#circle-price', (el) => (el.value = '3.5000'));
    await page.$eval('#circle-duration', (el) => (el.value = '21'));
    await page.$eval('#circle-metadata', (el) => (el.value = 'ipfs://bafybeicocoabeans100kg'));
    await sleep(600);
    await saveScreenshot('03_create_demand_circle.png');

    // Close create modal
    await page.click('#btn-close-create-modal');
    await sleep(600);

    // 4. Circle Retrieved On-Chain State
    console.log('Capturing: 04_circle_retrieved_onchain_state.png');
    // Click on circle #1
    await page.evaluate(() => {
      const card = document.querySelector('[id^="circle-card-"]');
      if (card) card.click();
    });
    await sleep(1000);
    await saveScreenshot('04_circle_retrieved_onchain_state.png');

    // 5. Real Contract Tx Hash & Explorer Link
    console.log('Capturing: 05_real_contract_tx_hash_explorer.png');
    await saveScreenshot('05_real_contract_tx_hash_explorer.png');

    // Close detail modal
    await page.click('#btn-close-detail-modal');
    await sleep(600);

    // 6. Visible Loading & Error States
    console.log('Capturing: 06_visible_loading_and_error_states.png');
    await page.evaluate(() => {
      window.scrollTo({ top: 200, behavior: 'instant' });
    });
    await sleep(500);

    // Trigger an invalid address validation in payment form
    const destInput = await page.$('#destination-address');
    if (destInput) {
      await page.type('#destination-address', 'INVALID_STELLAR_TESTNET_ADDRESS');
      await page.type('#payment-amount', '999999999');
      const submitBtn = await page.$('#btn-submit-payment');
      if (submitBtn) await submitBtn.click();
      await sleep(1000);
    }
    await saveScreenshot('06_visible_loading_and_error_states.png');

    // 7. Deployed Contract Address & Network
    console.log('Capturing: 07_deployed_contract_address_network.png');
    await page.evaluate(() => {
      const el = document.getElementById('btn-open-create-circle');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await sleep(800);
    await saveScreenshot('07_deployed_contract_address_network.png');

    console.log('All 7 screenshots captured successfully!');
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('Screenshot error:', err);
  process.exit(1);
});
