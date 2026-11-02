import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly pageTitle: Locator;
  readonly cartList: Locator;
  readonly cartItems: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;
  readonly shoppingCartBadge: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('[data-test="title"]');
    this.cartList = page.locator('[data-test="cart-list"]');
    this.cartItems = page.locator('[data-test="inventory-item"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.shoppingCartBadge = page.locator('[data-test="shopping-cart-badge"]');
  }

  /**
   * Mở trực tiếp trang giỏ hàng
   */
  async open(): Promise<void> {
    await this.goto('/cart.html');
  }

  /**
   * Helper định vị container của sản phẩm trong giỏ hàng theo tên
   */
  getItemContainer(itemName: string): Locator {
    return this.cartItems.filter({ hasText: itemName });
  }

  /**
   * Lấy số lượng (Quantity) của một sản phẩm trong giỏ hàng
   */
  async getItemQuantity(itemName: string): Promise<string> {
    const itemContainer = this.getItemContainer(itemName);
    return (await itemContainer.locator('[data-test="item-quantity"]').textContent()) || '';
  }

  /**
   * Lấy giá tiền của một sản phẩm trong giỏ hàng
   */
  async getItemPrice(itemName: string): Promise<string> {
    const itemContainer = this.getItemContainer(itemName);
    return (await itemContainer.locator('[data-test="inventory-item-price"]').textContent()) || '';
  }

  /**
   * Xóa một sản phẩm khỏi giỏ hàng
   */
  async removeItem(itemName: string): Promise<void> {
    const itemContainer = this.getItemContainer(itemName);
    await itemContainer.locator('button:has-text("Remove")').click();
  }

  /**
   * Click vào tên sản phẩm trong giỏ hàng để chuyển sang trang chi tiết
   */
  async clickItemName(itemName: string): Promise<void> {
    const itemContainer = this.getItemContainer(itemName);
    await itemContainer.locator('[data-test="inventory-item-name"]').click();
  }

  /**
   * Click nút 'Continue Shopping' để tiếp tục mua hàng
   */
  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

  /**
   * Click nút 'Checkout' để tiến hành thanh toán
   */
  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }

  /**
   * Đếm số lượng loại sản phẩm hiển thị trong giỏ hàng
   */
  async getCartItemsCount(): Promise<number> {
    return await this.cartItems.count();
  }

  /**
   * Lấy danh sách tên tất cả sản phẩm trong giỏ hàng
   */
  async getCartItemNames(): Promise<string[]> {
    return await this.cartItems.locator('[data-test="inventory-item-name"]').allTextContents();
  }
}

