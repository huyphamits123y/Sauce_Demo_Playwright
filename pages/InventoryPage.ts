import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage extends BasePage {
  readonly pageTitle: Locator;
  readonly inventoryList: Locator;
  readonly shoppingCartLink: Locator;
  readonly shoppingCartBadge: Locator;

  // Locators cho chức năng sắp xếp (Sort / Filter)
  readonly sortDropdown: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly itemImages: Locator;

  // Locators cho các link mạng xã hội ở footer & bản quyền
  readonly twitterLink: Locator;
  readonly facebookLink: Locator;
  readonly linkedinLink: Locator;
  readonly footerCopy: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('[data-test="title"]');
    this.inventoryList = page.locator('[data-test="inventory-list"]');
    this.shoppingCartLink = page.locator('[data-test="shopping-cart-link"]');
    this.shoppingCartBadge = page.locator('[data-test="shopping-cart-badge"]');

    // Khởi tạo locator cho Sort
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.itemNames = page.locator('[data-test="inventory-item-name"]');
    this.itemPrices = page.locator('[data-test="inventory-item-price"]');
    this.itemImages = page.locator('.inventory_item_img img');

    // Khởi tạo locator cho Social Media & Footer
    this.twitterLink = page.locator('[data-test="social-twitter"], [data-test="social-x"]');
    this.facebookLink = page.locator('[data-test="social-facebook"]');
    this.linkedinLink = page.locator('[data-test="social-linkedin"]');
    this.footerCopy = page.locator('[data-test="footer-copy"]');
  }

  /**
   * Helper định vị container của sản phẩm theo tên
   */
  getItemContainer(itemName: string): Locator {
    return this.page.locator('[data-test="inventory-item"]').filter({ hasText: itemName });
  }

  async addItemToCart(itemName: string): Promise<void> {
    const itemContainer = this.getItemContainer(itemName);
    await itemContainer.locator('button:has-text("Add to cart")').click();
  }

  async removeItemFromCart(itemName: string): Promise<void> {
    const itemContainer = this.getItemContainer(itemName);
    await itemContainer.locator('button:has-text("Remove")').click();
  }

  /**
   * Click vào biểu tượng giỏ hàng để chuyển sang trang cart.html
   */
  async goToCart(): Promise<void> {
    await this.shoppingCartLink.click();
  }

  /**
   * Click vào tên sản phẩm để chuyển đến trang chi tiết sản phẩm
   */
  async openItemDetails(itemName: string): Promise<void> {
    const itemContainer = this.getItemContainer(itemName);
    await itemContainer.locator('[data-test="inventory-item-name"]').click();
  }

  /**
   * Click vào ảnh sản phẩm để chuyển đến trang chi tiết sản phẩm
   */
  async openItemDetailsByImage(itemName: string): Promise<void> {
    const itemContainer = this.getItemContainer(itemName);
    await itemContainer.locator('.inventory_item_img a').click();
  }

  async getCartItemCount(): Promise<number> {
    if (await this.shoppingCartBadge.isVisible()) {
      const countText = await this.shoppingCartBadge.textContent();
      return countText ? parseInt(countText, 10) : 0;
    }
    return 0;
  }

  /**
   * Chọn tiêu chí sắp xếp:
   * - 'az': Name (A to Z)
   * - 'za': Name (Z to A)
   * - 'lohi': Price (low to high)
   * - 'hilo': Price (high to low)
   */
  async selectSortOption(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  /**
   * Lấy danh sách toàn bộ tên sản phẩm đang hiển thị
   */
  async getAllItemNames(): Promise<string[]> {
    return await this.itemNames.allTextContents();
  }

  /**
   * Lấy danh sách toàn bộ giá sản phẩm dạng số (đã bỏ ký tự $)
   */
  async getAllItemPrices(): Promise<number[]> {
    const priceTexts = await this.itemPrices.allTextContents();
    return priceTexts.map(price => parseFloat(price.replace('$', '')));
  }

  /**
   * Lấy danh sách đường dẫn src của tất cả hình ảnh sản phẩm
   */
  async getAllItemImageSources(): Promise<string[]> {
    return await this.itemImages.evaluateAll(imgs => (imgs as HTMLImageElement[]).map(img => img.src));
  }
}
