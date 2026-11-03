import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductDetailsPage extends BasePage {
  readonly backToProductsButton: Locator;
  readonly productName: Locator;
  readonly productDescription: Locator;
  readonly productPrice: Locator;
  readonly productImage: Locator;
  readonly addToCartButton: Locator;
  readonly removeButton: Locator;
  readonly shoppingCartBadge: Locator;

  constructor(page: Page) {
    super(page);
    this.backToProductsButton = page.locator('[data-test="back-to-products"]');
    // Định vị chính xác trong container chi tiết sản phẩm để tránh xung đột với trang danh sách
    this.productName = page.locator('.inventory_details_container [data-test="inventory-item-name"]');
    this.productDescription = page.locator('.inventory_details_container [data-test="inventory-item-desc"]');
    this.productPrice = page.locator('.inventory_details_container [data-test="inventory-item-price"]');
    this.productImage = page.locator('.inventory_details_img');
    this.addToCartButton = page.locator('[data-test="add-to-cart"]');
    this.removeButton = page.locator('[data-test="remove"]');
    this.shoppingCartBadge = page.locator('[data-test="shopping-cart-badge"]');
  }

  /**
   * Mở trang chi tiết sản phẩm theo ID (ví dụ id = 0 cho Sauce Labs Bike Light)
   */
  async openById(id: string | number): Promise<void> {
    await this.goto(`/inventory-item.html?id=${id}`);
  }

  /**
   * Click nút 'Back to products' để quay lại trang danh sách sản phẩm
   */
  async backToProducts(): Promise<void> {
    await this.backToProductsButton.click();
  }

  /**
   * Thêm sản phẩm vào giỏ hàng từ trang chi tiết
   */
  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  /**
   * Xóa sản phẩm khỏi giỏ hàng từ trang chi tiết
   */
  async removeFromCart(): Promise<void> {
    await this.removeButton.click();
  }
}
