import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;

  // Header & Sidebar Navigation (chung cho mọi trang sau khi login)
  readonly menuButton: Locator;
  readonly closeMenuButton: Locator;
  readonly allItemsLink: Locator;
  readonly aboutLink: Locator;
  readonly logoutLink: Locator;
  readonly resetAppStateLink: Locator;
  readonly shoppingCartLink: Locator;
  readonly shoppingCartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.closeMenuButton = page.locator('#react-burger-cross-btn');
    this.allItemsLink = page.locator('[data-test="inventory-sidebar-link"]');
    this.aboutLink = page.locator('[data-test="about-sidebar-link"]');
    this.logoutLink = page.locator('[data-test="logout-sidebar-link"]');
    this.resetAppStateLink = page.locator('[data-test="reset-sidebar-link"]');
    this.shoppingCartLink = page.locator('[data-test="shopping-cart-link"]');
    this.shoppingCartBadge = page.locator('[data-test="shopping-cart-badge"]');
  }

  async goto(path: string = '/') {
    await this.page.goto(path);
  }

  /**
   * Mở thanh menu bên (Burger Menu)
   */
  async openMenu(): Promise<void> {
    await this.menuButton.click();
    await this.allItemsLink.waitFor({ state: 'visible' });
  }

  /**
   * Đóng thanh menu bên
   */
  async closeMenu(): Promise<void> {
    await this.closeMenuButton.click();
    await this.allItemsLink.waitFor({ state: 'hidden' });
  }

  /**
   * Click vào link 'All Items' trong sidebar menu
   */
  async clickAllItems(): Promise<void> {
    await this.openMenu();
    await this.allItemsLink.click();
  }
  async clickAbout(): Promise<string> {
    await this.openMenu();
    await this.aboutLink.click();
    await this.page.waitForLoadState('load');
    console.log('Current URL after clicking About link:', this.page.url());
    return this.page.url();
  }

  /**
   * Đăng xuất qua sidebar menu
   */
  async logout(): Promise<void> {
    await this.openMenu();
    await this.logoutLink.click();
  }

  /**
   * Đặt lại trạng thái ứng dụng qua sidebar menu
   */
  async resetAppState(): Promise<void> {
    await this.openMenu();
    await this.resetAppStateLink.click();
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }
}
