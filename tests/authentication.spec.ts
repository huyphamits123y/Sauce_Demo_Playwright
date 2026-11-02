import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { VALID_USER } from '../data/testUsers';
import { ERROR_MESSAGES } from '../constants/errorMessages';

test.describe('SauceDemo Authentication & Protected Routes Tests', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
  });

  /* =========================================================================
   * 1. CHẶN TRUY CẬP TRỰC TIẾP VÀO INVENTORY KHI CHƯA ĐĂNG NHẬP
   * ========================================================================= */
  test('TC_AUTH_01: Direct access to /inventory.html without login is blocked', async ({ page }) => {
    await page.goto('/inventory.html');

    // Assert: Bị chuyển hướng về trang đăng nhập
    await expect(page).toHaveURL(/https:\/\/www\.saucedemo\.com\/?$/);
    await expect(loginPage.loginButton).toBeVisible();

    // Assert: Hiển thị thông báo lỗi yêu cầu đăng nhập
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(ERROR_MESSAGES.UNAUTHENTICATED_INVENTORY);
  });

  /* =========================================================================
   * 2. CHẶN TRUY CẬP TRỰC TIẾP VÀO CART KHI CHƯA ĐĂNG NHẬP
   * ========================================================================= */
  test('TC_AUTH_02: Direct access to /cart.html without login is blocked', async ({ page }) => {
    await page.goto('/cart.html');

    await expect(page).toHaveURL(/https:\/\/www\.saucedemo\.com\/?$/);
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(ERROR_MESSAGES.UNAUTHENTICATED_CART);
  });

  /* =========================================================================
   * 3. CHẶN TRUY CẬP TRỰC TIẾP VÀO CHECKOUT KHI CHƯA ĐĂNG NHẬP
   * ========================================================================= */
  test('TC_AUTH_03: Direct access to /checkout-step-one.html without login is blocked', async ({ page }) => {
    await page.goto('/checkout-step-one.html');

    await expect(page).toHaveURL(/https:\/\/www\.saucedemo\.com\/?$/);
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(ERROR_MESSAGES.UNAUTHENTICATED_CHECKOUT);
  });

  /* =========================================================================
   * 4. BẢO MẬT SAU KHI LOGOUT: NÚT BACK CỦA TRÌNH DUYỆT KHÔNG THỂ VÀO LẠI
   * ========================================================================= */
  test('TC_AUTH_04: Browser back button after logout cannot re-access inventory', async ({ page }) => {
    // 1. Đăng nhập thành công
    await loginPage.goto('/');
    await loginPage.login(VALID_USER.username, VALID_USER.password);
    await expect(page).toHaveURL(/.*inventory\.html/);

    // 2. Đăng xuất
    await inventoryPage.logout();
    await expect(page).toHaveURL(/https:\/\/www\.saucedemo\.com\/?$/);

    // 3. Bấm nút Back của trình duyệt
    await page.goBack();

    // Assert: Không được phép xem danh sách sản phẩm, hiển thị lỗi yêu cầu đăng nhập
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });
});

