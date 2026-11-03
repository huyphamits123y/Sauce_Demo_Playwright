import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutStepOnePage } from '../pages/CheckoutStepOnePage';
import { CheckoutStepTwoPage } from '../pages/CheckoutStepTwoPage';
import { CheckoutCompletePage } from '../pages/CheckoutCompletePage';
import { VALID_USER } from '../data/testUsers';
import { ERROR_MESSAGES } from '../constants/errorMessages';

test.describe('SauceDemo Payment & Checkout Tests', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;
  let stepOnePage: CheckoutStepOnePage;
  let stepTwoPage: CheckoutStepTwoPage;
  let completePage: CheckoutCompletePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    stepOnePage = new CheckoutStepOnePage(page);
    stepTwoPage = new CheckoutStepTwoPage(page);
    completePage = new CheckoutCompletePage(page);

    // Đăng nhập trước mỗi bài test
    await loginPage.goto('/');
    await loginPage.login(VALID_USER.username, VALID_USER.password);
    await expect(page).toHaveURL(/.*inventory\.html/);
  });

  /* =========================================================================
   * 1. KIỂM TRA VALIDATION TẠI CHECKOUT STEP ONE
   * ========================================================================= */
  test('TC_CHECKOUT_01: Verify validation errors on Checkout Step One when fields are empty', async ({ page }) => {
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    await cartPage.checkout();

    await expect(page).toHaveURL(/.*checkout-step-one\.html/);
    await expect(stepOnePage.pageTitle).toHaveText('Checkout: Your Information');

    // 1. Bỏ trống toàn bộ -> Bấm Continue -> Báo lỗi thiếu First Name
    await stepOnePage.continue();
    await expect(stepOnePage.errorMessage).toBeVisible();
    await expect(stepOnePage.errorMessage).toContainText(ERROR_MESSAGES.CHECKOUT_FIRST_NAME_REQUIRED);

    // 2. Điền First Name, bỏ trống Last Name -> Báo lỗi thiếu Last Name
    await stepOnePage.fillInformation('John', '', '');
    await stepOnePage.continue();
    await expect(stepOnePage.errorMessage).toContainText(ERROR_MESSAGES.CHECKOUT_LAST_NAME_REQUIRED);

    // 3. Điền Last Name, bỏ trống Postal Code -> Báo lỗi thiếu Postal Code
    await stepOnePage.fillInformation('John', 'Doe', '');
    await stepOnePage.continue();
    await expect(stepOnePage.errorMessage).toContainText(ERROR_MESSAGES.CHECKOUT_POSTAL_CODE_REQUIRED);
  });

  /* =========================================================================
   * 2. KIỂM TRA NÚT CANCEL TẠI CHECKOUT STEP ONE
   * ========================================================================= */
  test('TC_CHECKOUT_02: Cancel button on Checkout Step One returns to Cart page', async ({ page }) => {
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    await cartPage.checkout();

    // Bấm nút Cancel ở Step One
    await stepOnePage.cancel();

    // Assert: Quay về đúng trang /cart.html
    await expect(page).toHaveURL(/.*cart\.html/);
    await expect(cartPage.pageTitle).toHaveText('Your Cart');
  });

  /* =========================================================================
   * 3. KIỂM TRA THÔNG TIN TỔNG QUAN TẠI CHECKOUT STEP TWO (OVERVIEW)
   * ========================================================================= */
  test('TC_CHECKOUT_03: Complete Step One and verify Checkout Step Two overview details', async ({ page }) => {
    const itemName = 'Sauce Labs Backpack';
    await inventoryPage.addItemToCart(itemName);
    await inventoryPage.goToCart();
    await cartPage.checkout();

    // Điền thông tin hợp lệ tại Step One
    await stepOnePage.fillInformation('John', 'Doe', '70000');
    await stepOnePage.continue();

    // Assert: Chuyển sang Step Two (Overview)
    await expect(page).toHaveURL(/.*checkout-step-two\.html/);
    await expect(stepTwoPage.pageTitle).toHaveText('Checkout: Overview');

    // Assert: Sản phẩm hiển thị trong phần overview
    await expect(stepTwoPage.getItemContainer(itemName)).toBeVisible();

    // Assert: Thông tin thanh toán và giao hàng
    await expect(stepTwoPage.paymentInfo).toHaveText('SauceCard #31337');
    await expect(stepTwoPage.shippingInfo).toHaveText('Free Pony Express Delivery!');

    // Assert: Kiểm tra tính toán Subtotal + Tax = Total
    const subtotal = await stepTwoPage.getSubtotalAmount();
    const tax = await stepTwoPage.getTaxAmount();
    const total = await stepTwoPage.getTotalAmount();

    expect(subtotal).toBe(29.99);
    expect(Number((subtotal + tax).toFixed(2))).toBe(total);
  });

  /* =========================================================================
   * 4. KIỂM TRA NÚT CANCEL TẠI CHECKOUT STEP TWO
   * ========================================================================= */
  test('TC_CHECKOUT_04: Cancel button on Checkout Step Two returns to Inventory page', async ({ page }) => {
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    await cartPage.checkout();
    await stepOnePage.fillInformation('John', 'Doe', '70000');
    await stepOnePage.continue();

    // Bấm Cancel tại Step Two
    await stepTwoPage.cancel();

    // Assert: Quay lại trang /inventory.html
    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(inventoryPage.pageTitle).toHaveText('Products');
  });

  /* =========================================================================
   * 5. HOÀN TẤT THANH TOÁN VÀ KIỂM TRA TRANG CHECKOUT COMPLETE
   * ========================================================================= */
  test('TC_CHECKOUT_05: Finish payment and verify Checkout Complete page', async ({ page }) => {
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    await cartPage.checkout();
    await stepOnePage.fillInformation('John', 'Doe', '70000');
    await stepOnePage.continue();

    // Bấm Finish hoàn tất thanh toán
    await stepTwoPage.finish();

    // Assert: Chuyển sang trang /checkout-complete.html
    await expect(page).toHaveURL(/.*checkout-complete\.html/);
    await expect(completePage.pageTitle).toHaveText('Checkout: Complete!');
    await expect(completePage.completeHeader).toHaveText('Thank you for your order!');
    await expect(completePage.completeText).toContainText('Your order has been dispatched');
    await expect(completePage.ponyImage).toBeVisible();

    // Assert: Giỏ hàng đã được xóa sạch (badge biến mất)
    await expect(completePage.shoppingCartBadge).toBeHidden();
  });

  /* =========================================================================
   * 6. NÚT BACK HOME TẠI TRANG COMPLETE
   * ========================================================================= */
  test('TC_CHECKOUT_06: "Back Home" button on Complete page returns to Inventory page', async ({ page }) => {
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    await cartPage.checkout();
    await stepOnePage.fillInformation('John', 'Doe', '70000');
    await stepOnePage.continue();
    await stepTwoPage.finish();

    // Bấm nút Back Home
    await completePage.backHome();

    // Assert: Quay về trang sản phẩm với giỏ hàng rỗng
    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(inventoryPage.pageTitle).toHaveText('Products');
    await expect(inventoryPage.shoppingCartBadge).toBeHidden();
  });

  /* =========================================================================
   * 7. END-TO-END FLOW: THANH TOÁN NHIỀU SẢN PHẨM CÙNG LÚC
   * ========================================================================= */
  test('TC_CHECKOUT_07: End-to-end full checkout journey with multiple products', async ({ page }) => {
    const item1 = 'Sauce Labs Backpack'; // $29.99
    const item2 = 'Sauce Labs Bike Light'; // $9.99

    // 1. Thêm 2 món hàng
    await inventoryPage.addItemToCart(item1);
    await inventoryPage.addItemToCart(item2);
    await expect(inventoryPage.shoppingCartBadge).toHaveText('2');

    // 2. Vào giỏ và Checkout
    await inventoryPage.goToCart();
    await cartPage.checkout();

    // 3. Điền thông tin giao hàng
    await stepOnePage.fillInformation('Alex', 'Smith', '90210');
    await stepOnePage.continue();

    // 4. Kiểm tra tổng giá tiền ở Step Two
    await expect(page).toHaveURL(/.*checkout-step-two\.html/);
    const subtotal = await stepTwoPage.getSubtotalAmount();
    const tax = await stepTwoPage.getTaxAmount();
    const total = await stepTwoPage.getTotalAmount();

    expect(subtotal).toBe(39.98); // 29.99 + 9.99
    expect(Number((subtotal + tax).toFixed(2))).toBe(total);

    // 5. Hoàn tất đặt hàng
    await stepTwoPage.finish();
    await expect(page).toHaveURL(/.*checkout-complete\.html/);
    await expect(completePage.completeHeader).toHaveText('Thank you for your order!');

    // 6. Trở về trang chủ
    await completePage.backHome();
    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(inventoryPage.shoppingCartBadge).toBeHidden();
  });

  /* =========================================================================
   * 8. ĐÓNG BANNER LỖI TẠI CHECKOUT STEP ONE
   * ========================================================================= */
  test('TC_CHECKOUT_08: Dismiss validation error banner on Checkout Step One', async () => {
    await inventoryPage.goToCart();
    await cartPage.checkout();

    // Kích hoạt lỗi
    await stepOnePage.continue();
    await expect(stepOnePage.errorMessage).toBeVisible();

    // Click nút X đóng lỗi
    await stepOnePage.dismissError();
    await expect(stepOnePage.errorMessage).toBeHidden();
  });

  /* =========================================================================
   * 9. EDGE CASE: CHECKOUT VỚI GIỎ HÀNG RỖNG
   * ========================================================================= */
  test('TC_CHECKOUT_09: Checkout with empty cart proceeds with $0.00 total', async ({ page }) => {
    // Vào thẳng giỏ hàng khi chưa chọn sản phẩm nào
    await inventoryPage.goToCart();
    await expect(page).toHaveURL(/.*cart\.html/);
    await expect(cartPage.cartItems).toHaveCount(0);

    // Tiến hành Checkout
    await cartPage.checkout();
    await stepOnePage.fillInformation('Jane', 'Doe', '10001');
    await stepOnePage.continue();

    // Tại Step Two: Xác nhận $0.00
    await expect(page).toHaveURL(/.*checkout-step-two\.html/);
    expect(await stepTwoPage.getSubtotalAmount()).toBe(0);
    expect(await stepTwoPage.getTaxAmount()).toBe(0);
    expect(await stepTwoPage.getTotalAmount()).toBe(0);

    // Bấm Finish hoàn tất
    await stepTwoPage.finish();
    await expect(page).toHaveURL(/.*checkout-complete\.html/);
    await expect(completePage.completeHeader).toHaveText('Thank you for your order!');
  });
});
