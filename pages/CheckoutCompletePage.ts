import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutCompletePage extends BasePage {
  readonly pageTitle: Locator;
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly backHomeButton: Locator;
  readonly shoppingCartBadge: Locator;
  readonly ponyImage: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('[data-test="title"]');
    this.completeHeader = page.locator('[data-test="complete-header"]');
    this.completeText = page.locator('[data-test="complete-text"]');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
    this.shoppingCartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.ponyImage = page.locator('.pony_express');
  }

  async open(): Promise<void> {
    await this.goto('/checkout-complete.html');
  }

  async backHome(): Promise<void> {
    await this.backHomeButton.click();
  }
}

