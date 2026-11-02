const { chromium } = require('@playwright/test');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Test error button dismiss on Login
  await page.goto('https://www.saucedemo.com');
  await page.click('[data-test="login-button"]');
  const errorVisibleBefore = await page.locator('[data-test="error"]').isVisible();
  const closeBtn = await page.locator('.error-button, [data-test="error-button"]').isVisible();
  console.log('Login error visible:', errorVisibleBefore, 'close button visible:', closeBtn);
  await page.click('.error-button, [data-test="error-button"]');
  const errorVisibleAfter = await page.locator('[data-test="error"]').isVisible();
  console.log('Login error visible after close:', errorVisibleAfter);

  // Test problem_user
  await page.fill('[data-test="username"]', 'problem_user');
  await page.fill('[data-test="password"]', 'secret_sauce');
  await page.click('[data-test="login-button"]');
  await page.waitForURL('**/inventory.html');
  const images = await page.$$eval('.inventory_item_img img', imgs => imgs.map(i => i.src));
  console.log('Problem user images:', images);

  // Test clicking image to navigate to product details
  await page.goto('https://www.saucedemo.com');
  await page.fill('[data-test="username"]', 'standard_user');
  await page.fill('[data-test="password"]', 'secret_sauce');
  await page.click('[data-test="login-button"]');
  await page.waitForURL('**/inventory.html');
  await page.click('#item_4_img_link');
  console.log('URL after clicking backpack image:', page.url());

  // Test footer copy
  const footerText = await page.locator('[data-test="footer-copy"]').textContent();
  console.log('Footer copy:', footerText);

  await browser.close();
}

main().catch(console.error);

