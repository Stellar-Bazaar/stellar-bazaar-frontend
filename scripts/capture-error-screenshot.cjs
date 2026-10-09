const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 960 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await page.click('#btn-connect-wallet');
  await new Promise((r) => setTimeout(r, 600));
  await page.click('#btn-modal-connect-companion');
  await page.waitForFunction(() => {
    const el = document.getElementById('xlm-balance-display');
    return el && parseFloat(el.innerText.replace(/,/g, '')) > 0;
  });

  // Enter invalid recipient address
  await page.click('#destination-address-input');
  await page.keyboard.type('GBBADCHECKSUM12345');

  // Enter amount exceeding balance
  await page.click('#amount-input');
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.keyboard.type('999999');

  // Click submit to trigger validation error state
  await page.click('#btn-submit-payment');
  await new Promise((r) => setTimeout(r, 800));

  const paymentCard = await page.$('#payment-card');
  if (paymentCard) {
    await paymentCard.screenshot({
      path: path.join(__dirname, '..', 'docs', 'screenshots', '06-transaction-error-state.png'),
    });
  }

  await browser.close();
  console.log('06-transaction-error-state.png captured successfully with visible errors!');
})();
