const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERR:', err));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await page.click('#btn-connect-wallet');
  await new Promise(r => setTimeout(r, 600));
  await page.click('#btn-modal-connect-companion');
  
  // Wait for balance to be non-zero
  console.log('Waiting for balance display to be funded (> 0 XLM)...');
  await page.waitForFunction(() => {
    const el = document.getElementById('xlm-balance-display');
    if (!el) return false;
    const val = parseFloat(el.innerText.replace(/,/g, ''));
    return val > 0;
  }, { timeout: 30000 });
  
  const balanceText = await page.$eval('#xlm-balance-display', el => el.innerText);
  console.log('Loaded Balance:', balanceText);
  
  await page.click('#btn-fill-sample-dest');
  await new Promise(r => setTimeout(r, 500));
  
  console.log('Submitting payment...');
  await page.click('#btn-submit-payment');
  
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const state = await page.evaluate(() => {
      const errEl = document.getElementById('tx-error-message');
      const confEl = document.getElementById('confirmed-tx-hash');
      const pendingEl = document.getElementById('tx-pending-panel');
      const fieldErr = document.getElementById('amount-error-text');
      const destErr = document.getElementById('destination-error-text');
      return {
        err: errEl ? errEl.innerText : null,
        conf: confEl ? confEl.innerText : null,
        pending: pendingEl ? pendingEl.innerText : null,
        fieldErr: fieldErr ? fieldErr.innerText : null,
        destErr: destErr ? destErr.innerText : null,
      };
    });
    console.log(`Sec ${i+1}:`, state);
    if (state.conf) {
      console.log('SUCCESS CONFIRMED TX HASH:', state.conf);
      break;
    }
    if (state.err) {
      console.log('ERROR:', state.err);
      break;
    }
  }
  
  await browser.close();
})();
