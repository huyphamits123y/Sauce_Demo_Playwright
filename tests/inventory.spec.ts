import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { VALID_USER } from '../data/testUsers';

test.describe('SauceDemo Inventory Tests', () => {
  let inventoryPage: InventoryPage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto('/');
    await loginPage.login(VALID_USER.username, VALID_USER.password);
    inventoryPage = new InventoryPage(page);
  });

  /* =========================================================================
   * 1. CART TESTS (Thêm / Xóa giỏ hàng)
   * ========================================================================= */
  test('TC_CART_01: Add product to cart successfully', async () => {
    const productName = 'Sauce Labs Backpack';

    await inventoryPage.addItemToCart(productName);

    // Assert: Badge giỏ hàng hiển thị số '1'
    await expect(inventoryPage.shoppingCartBadge).toHaveText('1');

    // Assert: Nút của sản phẩm chuyển sang "Remove"
    const productItem = inventoryPage.getItemContainer(productName);
    await expect(productItem.locator('button')).toHaveText('Remove');
  });

  test('TC_CART_02: Remove product from cart successfully', async () => {
    const productName = 'Sauce Labs Backpack';

    // Pre-condition: Thêm sản phẩm trước
    await inventoryPage.addItemToCart(productName);
    await expect(inventoryPage.shoppingCartBadge).toHaveText('1');

    // Action: Xóa sản phẩm
    await inventoryPage.removeItemFromCart(productName);

    // Assert: Badge biến mất hoàn toàn
    await expect(inventoryPage.shoppingCartBadge).toBeHidden();

    // Assert: Nút đổi lại thành "Add to cart"
    const productItem = inventoryPage.getItemContainer(productName);
    await expect(productItem.locator('button')).toHaveText('Add to cart');
  });

  /* =========================================================================
   * 2. SORT / FILTER TESTS (Lọc và sắp xếp sản phẩm)
   * ========================================================================= */
  test('TC_SORT_01: Sort products by Name (A to Z and Z to A)', async () => {
    // 1. Sắp xếp Name (Z to A)
    await inventoryPage.selectSortOption('za');
    const namesZA = await inventoryPage.getAllItemNames();
    const expectedZA = [...namesZA].sort().reverse();
    expect(namesZA).toEqual(expectedZA);

    // 2. Sắp xếp Name (A to Z)
    await inventoryPage.selectSortOption('az');
    const namesAZ = await inventoryPage.getAllItemNames();
    const expectedAZ = [...namesAZ].sort();
    expect(namesAZ).toEqual(expectedAZ);
  });

  test('TC_SORT_02: Sort products by Price (Low to High and High to Low)', async () => {
    // 1. Sắp xếp Price (Low to High)
    await inventoryPage.selectSortOption('lohi');
    const pricesLoHi = await inventoryPage.getAllItemPrices();
    const expectedLoHi = [...pricesLoHi].sort((a, b) => a - b);
    expect(pricesLoHi).toEqual(expectedLoHi);

    // 2. Sắp xếp Price (High to Low)
    await inventoryPage.selectSortOption('hilo');
    const pricesHiLo = await inventoryPage.getAllItemPrices();
    const expectedHiLo = [...pricesHiLo].sort((a, b) => b - a);
    expect(pricesHiLo).toEqual(expectedHiLo);
  });

  /* =========================================================================
   * 3. SOCIAL MEDIA LINKS TESTS (Các link mạng xã hội ở footer)
   * ========================================================================= */
  test('TC_SOCIAL_01: Verify social media links have correct URLs and target="_blank"', async () => {
    // Kiểm tra link Twitter (X)
    await expect(inventoryPage.twitterLink).toBeVisible();
    await expect(inventoryPage.twitterLink).toHaveAttribute('href', /.*(x\.com|twitter\.com)\/saucelabs/);
    await expect(inventoryPage.twitterLink).toHaveAttribute('target', '_blank');

    // Kiểm tra link Facebook
    await expect(inventoryPage.facebookLink).toBeVisible();
    await expect(inventoryPage.facebookLink).toHaveAttribute('href', 'https://www.facebook.com/saucelabs');
    await expect(inventoryPage.facebookLink).toHaveAttribute('target', '_blank');

    // Kiểm tra link LinkedIn
    await expect(inventoryPage.linkedinLink).toBeVisible();
    await expect(inventoryPage.linkedinLink).toHaveAttribute('href', 'https://www.linkedin.com/company/sauce-labs/');
    await expect(inventoryPage.linkedinLink).toHaveAttribute('target', '_blank');
  });

  test('TC_SOCIAL_02: Click social media link and verify new tab opens with correct URL', async ({ context }) => {
    // Lắng nghe sự kiện mở tab mới khi click nút mạng xã hội (Facebook)
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      inventoryPage.facebookLink.click(),
    ]);

    // Chờ tab mới bắt đầu tải và kiểm tra URL của tab mới
    await newPage.waitForLoadState('domcontentloaded');
    expect(newPage.url()).toContain('facebook.com/saucelabs');

    // Đóng tab mới sau khi kiểm tra xong
    await newPage.close();
  });
});
