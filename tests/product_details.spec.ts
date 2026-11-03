import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { VALID_USER } from '../data/testUsers';

test.describe('SauceDemo Product Details Tests', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let productDetailsPage: ProductDetailsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    productDetailsPage = new ProductDetailsPage(page);

    // Đăng nhập trước mỗi bài test
    await loginPage.goto('/');
    await loginPage.login(VALID_USER.username, VALID_USER.password);
  });

  /* =========================================================================
   * 1. KIỂM TRA THÔNG TIN CHI TIẾT SẢN PHẨM (ID = 0)
   * ========================================================================= */
  test('TC_PRODUCT_01: Verify product details display correctly for item id=0', async ({ page }) => {
    // Mở trang chi tiết sản phẩm id=0 (Sauce Labs Bike Light)
    await productDetailsPage.openById(0);

    // Assert: URL đúng định dạng
    await expect(page).toHaveURL(/.*inventory-item\.html\?id=0/);

    // Assert: Tên sản phẩm chính xác
    await expect(productDetailsPage.productName).toBeVisible();
    await expect(productDetailsPage.productName).toHaveText('Sauce Labs Bike Light');

    // Assert: Mô tả sản phẩm hiển thị đầy đủ
    await expect(productDetailsPage.productDescription).toBeVisible();
    await expect(productDetailsPage.productDescription).toContainText("A red light isn't the desired state in testing");

    // Assert: Giá sản phẩm chính xác
    await expect(productDetailsPage.productPrice).toBeVisible();
    await expect(productDetailsPage.productPrice).toHaveText('$9.99');

    // Assert: Hình ảnh sản phẩm hiển thị với đúng đường dẫn ảnh
    await expect(productDetailsPage.productImage).toBeVisible();
    await expect(productDetailsPage.productImage).toHaveAttribute('src', /.*bike-light.*/);

    // Assert: Các nút điều hướng và hành động hiển thị đầy đủ
    await expect(productDetailsPage.backToProductsButton).toBeVisible();
    await expect(productDetailsPage.addToCartButton).toBeVisible();
  });

  /* =========================================================================
   * 2. KIỂM TRA THÔNG TIN CHI TIẾT SẢN PHẨM (ID = 4)
   * ========================================================================= */
  test('TC_PRODUCT_02: Verify product details display correctly for item id=4 (Sauce Labs Backpack)', async ({ page }) => {
    await productDetailsPage.openById(4);

    await expect(page).toHaveURL(/.*inventory-item\.html\?id=4/);
    await expect(productDetailsPage.productName).toHaveText('Sauce Labs Backpack');
    await expect(productDetailsPage.productPrice).toHaveText('$29.99');
    await expect(productDetailsPage.productImage).toBeVisible();
    await expect(productDetailsPage.productImage).toHaveAttribute('src', /.*sauce-backpack.*/);
    await expect(productDetailsPage.addToCartButton).toBeVisible();
  });

  /* =========================================================================
   * 3. KIỂM TRA NÚT BACK TO PRODUCTS
   * ========================================================================= */
  test('TC_PRODUCT_03: Click "Back to products" button returns to inventory page', async ({ page }) => {
    // Mở trang chi tiết sản phẩm id=0
    await productDetailsPage.openById(0);

    // Action: Click nút Back to products
    await productDetailsPage.backToProducts();

    // Assert: Quay lại đúng trang danh sách sản phẩm
    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(inventoryPage.pageTitle).toHaveText('Products');
    await expect(inventoryPage.inventoryList).toBeVisible();
  });

  /* =========================================================================
   * 4. KIỂM TRA THÊM VÀ XÓA SẢN PHẨM TRONG GIỎ HÀNG TỪ TRANG CHI TIẾT
   * ========================================================================= */
  test('TC_PRODUCT_04: Add and remove product to/from cart on details page', async () => {
    await productDetailsPage.openById(0);

    // 1. Thêm vào giỏ hàng
    await productDetailsPage.addToCart();
    await expect(productDetailsPage.shoppingCartBadge).toHaveText('1');
    await expect(productDetailsPage.removeButton).toBeVisible();
    await expect(productDetailsPage.addToCartButton).toBeHidden();

    // 2. Xóa khỏi giỏ hàng
    await productDetailsPage.removeFromCart();
    await expect(productDetailsPage.shoppingCartBadge).toBeHidden();
    await expect(productDetailsPage.addToCartButton).toBeVisible();
    await expect(productDetailsPage.removeButton).toBeHidden();
  });

  /* =========================================================================
   * 5. ĐIỀU HƯỚNG TỪ DANH SÁCH SẢN PHẨM VÀO CHI TIẾT
   * ========================================================================= */
  test('TC_PRODUCT_05: Navigate to product details by clicking item name from inventory page', async ({ page }) => {
    // Từ trang inventory, click vào tên sản phẩm
    await inventoryPage.openItemDetails('Sauce Labs Bike Light');

    // Assert: Điều hướng sang trang chi tiết với id=0
    await expect(page).toHaveURL(/.*inventory-item\.html\?id=0/);
    await expect(productDetailsPage.productName).toHaveText('Sauce Labs Bike Light');

    // Click nút quay lại danh sách
    await productDetailsPage.backToProducts();
    await expect(page).toHaveURL(/.*inventory\.html/);
  });

  /* =========================================================================
   * 6. ĐỒNG BỘ TRẠNG THÁI GIỎ HÀNG KHI ĐIỀU HƯỚNG QUA LẠI
   * ========================================================================= */
  test('TC_PRODUCT_06: Cart status is preserved when navigating back and forth', async () => {
    // Thêm sản phẩm vào giỏ tại trang chi tiết
    await productDetailsPage.openById(0);
    await productDetailsPage.addToCart();

    // Quay lại trang danh sách sản phẩm
    await productDetailsPage.backToProducts();

    // Assert: Giỏ hàng trên trang danh sách vẫn giữ số 1 và nút sản phẩm hiển thị "Remove"
    await expect(inventoryPage.shoppingCartBadge).toHaveText('1');
    const bikeLightItem = inventoryPage.getItemContainer('Sauce Labs Bike Light');
    await expect(bikeLightItem.locator('button')).toHaveText('Remove');

    // Quay lại trang chi tiết: Nút bấm vẫn phải là "Remove"
    await inventoryPage.openItemDetails('Sauce Labs Bike Light');
    await expect(productDetailsPage.removeButton).toBeVisible();

    // Dọn dẹp: Bấm Remove
    await productDetailsPage.removeFromCart();
    await expect(productDetailsPage.shoppingCartBadge).toBeHidden();
  });
});
