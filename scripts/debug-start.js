const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const logs = [];
  page.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message));
  page.on('console', (msg) => logs.push(msg.type() + ': ' + msg.text()));
  page.on('requestfailed', (req) => logs.push('FAIL: ' + req.url() + ' ' + req.failure()?.errorText));
  page.on('response', (res) => {
    if (res.status() >= 400) logs.push('HTTP ' + res.status() + ': ' + res.url());
  });

  await page.goto('http://127.0.0.1:8765/');
  await page.waitForLoadState('networkidle');

  const mods = await page.evaluate(async () => {
    try {
      await import('./js/game.js');
      return 'game import ok';
    } catch (e) {
      return 'game import fail: ' + e.message;
    }
  });

  await page.click('#start-btn', { force: true });
  await page.waitForTimeout(300);

  const state = await page.evaluate(() => ({
    titleHidden: document.getElementById('title-screen').hidden,
    gameHidden: document.getElementById('game-screen').hidden,
  }));

  console.log('import:', mods);
  console.log('state:', state);
  console.log('logs:', logs.join('\n'));
  await browser.close();
})();
