import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutStepOnePage } from '../pages/CheckoutStepOnePage';
import { PROBLEM_USER, PERFORMANCE_GLITCH_USER, LOCKED_OUT_USER } from '../data/testUsers';
import { ERROR_MESSAGES } from '../constants/errorMessages';

test.describe('SauceDemo Special User Personas Tests', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;
  let stepOnePage: CheckoutStepOnePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    stepOnePage = new CheckoutStepOnePage(page);

    await loginPage.goto('/');
  });

  /* =========================================================================
   * 1. PROBLEM_USER: BỊ LỖI HÌNH ẢNH SẢN PHẨM (ALL 404 DOG IMAGES)
   * ========================================================================= */
  test('TC_PERSONA_01: problem_user displays broken images (sl-404) for all products', async ({ page }) => {
    await loginPage.login(PROBLEM_USER.username, PROBLEM_USER.password);
    await expect(page).toHaveURL(/.*inventory\.html/);

    // Lấy toàn bộ link ảnh sản phẩm hiển thị trên trang
    const imageSources = await inventoryPage.getAllItemImageSources();
    expect(imageSources.length).toBe(6);

    // Assert: Tất cả ảnh của problem_user đều bị trỏ sang ảnh lỗi sl-404
    for (const src of imageSources) {
      expect(src).toContain('sl-404');
    }
  });

  /* =========================================================================
   * 2. PROBLEM_USER: BỊ LỖI TẠI CHECKOUT STEP ONE (KHÔNG THỂ NHẬP LAST NAME)
   * ========================================================================= */
  test('TC_PERSONA_02: problem_user cannot complete Checkout Step One due to defective Last Name input', async ({ page }) => {
    await loginPage.login(PROBLEM_USER.username, PROBLEM_USER.password);
    await expect(page).toHaveURL(/.*inventory\.html/);

    // Vào giỏ và bấm Checkout
    await inventoryPage.goToCart();
    await cartPage.checkout();

    // Điền thông tin
    await stepOnePage.fillInformation('John', 'Doe', '12345');
    await stepOnePage.continue();

    // Assert: Hệ thống báo lỗi "Last Name is required" vì trường Last Name bị lỗi không nhận giá trị
    await expect(stepOnePage.errorMessage).toBeVisible();
    await expect(stepOnePage.errorMessage).toContainText(ERROR_MESSAGES.CHECKOUT_LAST_NAME_REQUIRED);
  });

  /* =========================================================================
   * 3. PERFORMANCE_GLITCH_USER: ĐỘ TRỄ MẠNG ĐƯỢC XỬ LÝ ỔN ĐỊNH
   * ========================================================================= */
  test('TC_PERSONA_03: performance_glitch_user handles slow page loads gracefully', async ({ page }) => {
    test.slow();
    // Đăng nhập với tài khoản có độ trễ cao
    await loginPage.login(PERFORMANCE_GLITCH_USER.username, PERFORMANCE_GLITCH_USER.password);

    // Assert: Playwright auto-wait tự động đợi đến khi tải xong mà không timeout
    await expect(page).toHaveURL(/.*inventory\.html/, { timeout: 15000 });
    await expect(inventoryPage.pageTitle).toHaveText('Products', { timeout: 15000 });
    expect(await inventoryPage.getAllItemNames()).toHaveLength(6);
  });

  /* =========================================================================
   * 4. LOCKED_OUT_USER: BỊ KHÓA HOÀN TOÀN TỪ VÒNG ĐĂNG NHẬP
   * ========================================================================= */
  test('TC_PERSONA_04: locked_out_user is barred from logging in', async ({ page }) => {
    await loginPage.login(LOCKED_OUT_USER.username, LOCKED_OUT_USER.password);

    // Assert: Vẫn ở trang đăng nhập và hiển thị banner bị khóa
    await expect(page).toHaveURL(/https:\/\/www\.saucedemo\.com\/?$/);
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(ERROR_MESSAGES.LOCKED_OUT_USER);
  });
});

