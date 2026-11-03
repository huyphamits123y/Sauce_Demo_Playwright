import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { VALID_USER, INVALID_USER, LOCKED_OUT_USER, PERFORMANCE_GLITCH_USER } from '../data/testUsers';
import { ERROR_MESSAGES } from '../constants/errorMessages';


// Không nên Setup các file Test chạy tuần tự, nên để các file test chạy độc lập
test.describe('SauceDemo Login Tests', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto('/');
  });

  test('TC_LOGIN_01: Login successfully with valid credentials', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await loginPage.login(VALID_USER.username, VALID_USER.password);

    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(inventoryPage.pageTitle).toHaveText('Products');
    await expect(inventoryPage.inventoryList).toBeVisible();
  });

  test('TC_LOGIN_02: Login failed with empty username', async () => {
    await loginPage.login('', VALID_USER.password);

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(ERROR_MESSAGES.USERNAME_REQUIRED);
  });

  test('TC_LOGIN_03: Login failed with empty password', async () => {
    await loginPage.login(VALID_USER.username, '');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(ERROR_MESSAGES.PASSWORD_REQUIRED);
  });

  test('TC_LOGIN_04: Login failed with invalid credentials', async () => {
    await loginPage.login(INVALID_USER.username, INVALID_USER.password);

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(ERROR_MESSAGES.INVALID_CREDENTIALS);
  });

  test('TC_LOGIN_05: Login failed with locked out user', async () => {
    await loginPage.login(LOCKED_OUT_USER.username, LOCKED_OUT_USER.password);

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(ERROR_MESSAGES.LOCKED_OUT_USER);
  });

  test('TC_LOGIN_06: Dismiss error banner by clicking error close button', async () => {
    // Kích hoạt lỗi đăng nhập
    await loginPage.login('', '');
    await expect(loginPage.errorMessage).toBeVisible();

    // Bấm nút X đóng lỗi
    await loginPage.dismissError();

    // Assert: Banner lỗi bị ẩn đi
    await expect(loginPage.errorMessage).toBeHidden();
  });

  test('TC_LOGIN_07: Performance glitch user logs in successfully', async ({ page }) => {
    test.slow();
    const inventoryPage = new InventoryPage(page);

    // Chờ thời gian tải cho performance glitch user (tự động tăng timeout cho test chậm)
    await loginPage.login(PERFORMANCE_GLITCH_USER.username, PERFORMANCE_GLITCH_USER.password);

    // Assert: Hệ thống tự động chờ (Auto-wait) và load thành công trang inventory
    await expect(page).toHaveURL(/.*inventory\.html/, { timeout: 15000 });
    await expect(inventoryPage.pageTitle).toHaveText('Products', { timeout: 15000 });
  });
});
