import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { VALID_USER } from '../data/testUsers';

test.describe('SauceDemo Sidebar Menu Tests', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);

    // Đăng nhập trước mỗi bài test
    await loginPage.goto('/');
    await loginPage.login(VALID_USER.username, VALID_USER.password);
    await expect(page).toHaveURL(/.*inventory\.html/);
  });

  /* =========================================================================
   * 1. MỞ VÀ ĐÓNG SIDEBAR MENU
   * ========================================================================= */
  test('TC_SIDEBAR_01: Open and close sidebar menu', async () => {
    // 1. Mở menu
    await inventoryPage.openMenu();

    // Assert: Cả 4 mục trong menu đều hiển thị
    await expect(inventoryPage.allItemsLink).toBeVisible();
    await expect(inventoryPage.aboutLink).toBeVisible();
    await expect(inventoryPage.logoutLink).toBeVisible();
    await expect(inventoryPage.resetAppStateLink).toBeVisible();

    // 2. Đóng menu
    await inventoryPage.closeMenu();

    // Assert: Các link trong menu bị ẩn đi
    await expect(inventoryPage.allItemsLink).toBeHidden();
  });

  /* =========================================================================
   * 2. LINK "ALL ITEMS" QUAY LẠI TRANG DANH SÁCH SẢN PHẨM
   * ========================================================================= */
  test('TC_SIDEBAR_02: "All Items" link navigates back to inventory page', async ({ page }) => {
    // Di chuyển sang trang giỏ hàng
    await inventoryPage.goToCart();
    await expect(page).toHaveURL(/.*cart\.html/);

    // Mở menu và click "All Items"
    await cartPage.clickAllItems();

    // Assert: Điều hướng quay lại trang /inventory.html
    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(inventoryPage.pageTitle).toHaveText('Products');
    await expect(inventoryPage.inventoryList).toBeVisible();
  });

  /* =========================================================================
   * 3. LINK "ABOUT" DẪN ĐẾN TRANG CHỦ SAUCE LABS
   * ========================================================================= */
  test('TC_SIDEBAR_03: "About" link points to official Sauce Labs website', async () => {

    await expect(inventoryPage.clickAbout()).resolves.toEqual('https://saucelabs.com/');


    // await inventoryPage.openMenu();

    // Assert: Link About có đường dẫn href chính xác tới https://saucelabs.com/
    // await expect(inventoryPage.aboutLink).toHaveAttribute('href', 'https://saucelabs.com/');

  });

  /* =========================================================================
   * 4. "RESET APP STATE" XÓA GIỎ HÀNG VÀ ĐẶT LẠI TRẠNG THÁI NÚT
   * ========================================================================= */
  test('TC_SIDEBAR_04: "Reset App State" resets cart count and item button states', async ({ page }) => {
    const itemName = 'Sauce Labs Backpack';

    // 1. Thêm sản phẩm vào giỏ
    await inventoryPage.addItemToCart(itemName);
    await expect(inventoryPage.shoppingCartBadge).toHaveText('1');
    const itemContainer = inventoryPage.getItemContainer(itemName);
    await expect(itemContainer.locator('button')).toHaveText('Remove');

    // 2. Thực hiện Reset App State qua menu
    await inventoryPage.resetAppState();
    await inventoryPage.closeMenu();

    // Assert: Badge giỏ hàng biến mất ngay lập tức
    await expect(inventoryPage.shoppingCartBadge).toBeHidden();

    // 3. Tải lại trang: Nút bấm của sản phẩm được hoàn nguyên thành "Add to cart"
    await page.reload();
    await expect(itemContainer.locator('button')).toHaveText('Add to cart');
  });

  /* =========================================================================
   * 5. "LOGOUT" ĐĂNG XUẤT VÀ QUAY VỀ TRANG LOGIN
   * ========================================================================= */
  test('TC_SIDEBAR_05: "Logout" logs out user and redirects to login page', async ({ page }) => {
    // Thực hiện Logout qua menu
    await inventoryPage.logout();

    // Assert: Điều hướng về trang login
    await expect(page).toHaveURL(/https:\/\/www\.saucedemo\.com\/?$/);
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
  });
});
