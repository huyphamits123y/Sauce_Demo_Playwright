import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { VALID_USER } from '../data/testUsers';

test.describe('SauceDemo Cart Tests', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;
  let productDetailsPage: ProductDetailsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    productDetailsPage = new ProductDetailsPage(page);

    // Đăng nhập tài khoản hợp lệ trước mỗi bài test
    await loginPage.goto('/');
    await loginPage.login(VALID_USER.username, VALID_USER.password);
    await expect(page).toHaveURL(/.*inventory\.html/);
  });

  /* =========================================================================
   * 1. KIỂM TRA TRANG GIỎ HÀNG KHI TRỐNG
   * ========================================================================= */
  test('TC_CART_PAGE_01: Verify empty cart page elements', async ({ page }) => {
    // Điều hướng vào giỏ hàng khi chưa thêm sản phẩm nào
    await inventoryPage.goToCart();

    // Assert: URL là /cart.html
    await expect(page).toHaveURL(/.*cart\.html/);

    // Assert: Tiêu đề trang là "Your Cart"
    await expect(cartPage.pageTitle).toHaveText('Your Cart');

    // Assert: Danh sách sản phẩm trong giỏ trống
    await expect(cartPage.cartItems).toHaveCount(0);

    // Assert: Badge giỏ hàng không hiển thị
    await expect(cartPage.shoppingCartBadge).toBeHidden();

    // Assert: Nút "Continue Shopping" và "Checkout" hiển thị đầy đủ
    await expect(cartPage.continueShoppingButton).toBeVisible();
    await expect(cartPage.checkoutButton).toBeVisible();
  });

  /* =========================================================================
   * 2. KIỂM TRA HIỂN THỊ CÁC SẢN PHẨM ĐÃ THÊM VÀO GIỎ HÀNG
   * ========================================================================= */
  test('TC_CART_PAGE_02: Verify added products are displayed correctly in cart', async ({ page }) => {
    const item1 = 'Sauce Labs Backpack';
    const item2 = 'Sauce Labs Bike Light';

    // Thêm 2 sản phẩm vào giỏ từ trang Inventory
    await inventoryPage.addItemToCart(item1);
    await inventoryPage.addItemToCart(item2);

    // Chuyển sang trang giỏ hàng
    await inventoryPage.goToCart();
    await expect(page).toHaveURL(/.*cart\.html/);

    // Assert: Giỏ hàng hiển thị đúng 2 sản phẩm
    await expect(cartPage.cartItems).toHaveCount(2);
    await expect(cartPage.cartItems.locator('[data-test="inventory-item-name"]')).toHaveText([item1, item2]);

    // Assert: Số lượng (Quantity) và Giá tiền của từng sản phẩm
    expect(await cartPage.getItemQuantity(item1)).toBe('1');
    expect(await cartPage.getItemPrice(item1)).toBe('$29.99');

    expect(await cartPage.getItemQuantity(item2)).toBe('1');
    expect(await cartPage.getItemPrice(item2)).toBe('$9.99');

    // Assert: Badge giỏ hàng hiển thị số '2'
    await expect(cartPage.shoppingCartBadge).toHaveText('2');
  });

  /* =========================================================================
   * 3. XÓA TỪNG SẢN PHẨM KHỎI GIỎ HÀNG TẠI TRANG CART
   * ========================================================================= */
  test('TC_CART_PAGE_03: Remove a single product from cart', async () => {
    const item1 = 'Sauce Labs Backpack';
    const item2 = 'Sauce Labs Bike Light';

    await inventoryPage.addItemToCart(item1);
    await inventoryPage.addItemToCart(item2);
    await inventoryPage.goToCart();

    // Xóa sản phẩm thứ nhất
    await cartPage.removeItem(item1);

    // Assert: Sản phẩm bị xóa không còn tồn tại trong giỏ
    await expect(cartPage.getItemContainer(item1)).toBeHidden();

    // Assert: Sản phẩm thứ hai vẫn còn hiển thị
    await expect(cartPage.getItemContainer(item2)).toBeVisible();

    // Assert: Tổng số lượng còn lại là 1 và badge cập nhật thành '1'
    await expect(cartPage.cartItems).toHaveCount(1);
    await expect(cartPage.shoppingCartBadge).toHaveText('1');
  });

  /* =========================================================================
   * 4. XÓA TẤT CẢ SẢN PHẨM KHỎI GIỎ HÀNG
   * ========================================================================= */
  test('TC_CART_PAGE_04: Remove all products from cart', async () => {
    const item = 'Sauce Labs Backpack';

    await inventoryPage.addItemToCart(item);
    await inventoryPage.goToCart();

    // Xóa sản phẩm
    await cartPage.removeItem(item);

    // Assert: Giỏ hàng rỗng hoàn toàn và badge biến mất
    await expect(cartPage.cartItems).toHaveCount(0);
    await expect(cartPage.shoppingCartBadge).toBeHidden();
  });

  /* =========================================================================
   * 5. NÚT CONTINUE SHOPPING QUAY LẠI TRANG SẢN PHẨM
   * ========================================================================= */
  test('TC_CART_PAGE_05: Click "Continue Shopping" returns to inventory page', async ({ page }) => {
    await inventoryPage.goToCart();

    // Click nút Continue Shopping
    await cartPage.continueShopping();

    // Assert: Quay về đúng trang /inventory.html
    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(inventoryPage.pageTitle).toHaveText('Products');
    await expect(inventoryPage.inventoryList).toBeVisible();
  });

  /* =========================================================================
   * 6. NÚT CHECKOUT CHUYỂN SANG BƯỚC THANH TOÁN
   * ========================================================================= */
  test('TC_CART_PAGE_06: Click "Checkout" proceeds to checkout step one', async ({ page }) => {
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();

    // Click nút Checkout
    await cartPage.checkout();

    // Assert: Điều hướng sang trang /checkout-step-one.html
    await expect(page).toHaveURL(/.*checkout-step-one\.html/);
    await expect(page.locator('[data-test="title"]')).toHaveText('Checkout: Your Information');
  });

  /* =========================================================================
   * 7. CLICK VÀO TÊN SẢN PHẨM TRONG GIỎ HÀNG ĐỂ MỞ CHI TIẾT
   * ========================================================================= */
  test('TC_CART_PAGE_07: Click product name in cart navigates to product details page', async ({ page }) => {
    const itemName = 'Sauce Labs Backpack';

    await inventoryPage.addItemToCart(itemName);
    await inventoryPage.goToCart();

    // Click vào tên sản phẩm trong giỏ hàng
    await cartPage.clickItemName(itemName);

    // Assert: Chuyển hướng tới đúng trang chi tiết của sản phẩm đó
    await expect(page).toHaveURL(/.*inventory-item\.html\?id=4/);
    await expect(productDetailsPage.productName).toHaveText(itemName);
    await expect(productDetailsPage.removeButton).toBeVisible();
  });
});

