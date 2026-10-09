const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'docs', 'screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function capture() {
  console.log('Starting screenshot capture session...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,960'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 960, deviceScaleFactor: 1 });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // 1. Disconnected State
  console.log('Capturing 01-disconnected-state.png...');
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, '01-disconnected-state.png'),
    fullPage: false,
  });

  // Open Connect Modal
  console.log('Opening wallet modal...');
  await page.click('#btn-connect-wallet');
  await new Promise((r) => setTimeout(r, 600));

  // Connect via Testnet Companion Signer
  console.log('Connecting via Testnet Companion Signer...');
  await page.click('#btn-modal-connect-companion');

  // Wait for balance to be funded (> 0 XLM)
  console.log('Waiting for balance to load from Stellar Testnet Horizon...');
  await page.waitForFunction(() => {
    const el = document.getElementById('xlm-balance-display');
    return el && parseFloat(el.innerText.replace(/,/g, '')) > 0;
  }, { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1500));

  // 2. Connected Wallet State (Full Page Overview)
  console.log('Capturing 02-connected-wallet.png...');
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, '02-connected-wallet.png'),
    fullPage: false,
  });

  // 3. Testnet Balance Card
  console.log('Capturing 03-testnet-balance.png...');
  const balanceCard = await page.$('#balance-card');
  if (balanceCard) {
    await balanceCard.screenshot({
      path: path.join(SCREENSHOTS_DIR, '03-testnet-balance.png'),
    });
  }

  // 4. Payment Form Before Submission
  console.log('Filling payment form...');
  await page.click('#btn-fill-sample-dest');
  await new Promise((r) => setTimeout(r, 600));

  console.log('Capturing 04-payment-form.png...');
  const paymentCard = await page.$('#payment-card');
  if (paymentCard) {
    await paymentCard.screenshot({
      path: path.join(SCREENSHOTS_DIR, '04-payment-form.png'),
    });
  }

  // 5. Submit real Testnet payment
  console.log('Submitting genuine Testnet payment to Stellar Horizon...');
  await page.click('#btn-submit-payment');

  // Wait for confirmation panel
  console.log('Waiting for ledger inclusion confirmation on Testnet...');
  await page.waitForSelector('#tx-confirmation-panel', { timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1500));

  const confirmedTxHash = await page.$eval('#confirmed-tx-hash', (el) => el.innerText.trim());
  console.log('Genuinely confirmed Testnet transaction hash:', confirmedTxHash);

  // Capture 05-successful-transaction.png
  console.log('Capturing 05-successful-transaction.png...');
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, '05-successful-transaction.png'),
    fullPage: false,
  });

  // 6. Reproduce error state
  console.log('Triggering visible validation / error state...');
  await page.click('#btn-new-payment');
  await new Promise((r) => setTimeout(r, 600));

  // Type an invalid amount that exceeds available balance
  await page.$eval('#amount-input', (el) => (el.value = '99999999'));
  // Trigger blur and submit
  await page.click('#destination-address-input');
  await page.click('#btn-submit-payment');
  await new Promise((r) => setTimeout(r, 1000));

  console.log('Capturing 06-transaction-error-state.png...');
  const errorPaymentCard = await page.$('#payment-card');
  if (errorPaymentCard) {
    await errorPaymentCard.screenshot({
      path: path.join(SCREENSHOTS_DIR, '06-transaction-error-state.png'),
    });
  }

  await browser.close();
  console.log('All 6 screenshots captured successfully in docs/screenshots!');
}

capture().catch((err) => {
  console.error('Capture error:', err);
  process.exit(1);
});
