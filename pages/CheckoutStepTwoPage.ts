import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutStepTwoPage extends BasePage {
  readonly pageTitle: Locator;
  readonly cartItems: Locator;
  readonly paymentInfo: Locator;
  readonly shippingInfo: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('[data-test="title"]');
    this.cartItems = page.locator('[data-test="inventory-item"]');
    this.paymentInfo = page.locator('[data-test="payment-info-value"]');
    this.shippingInfo = page.locator('[data-test="shipping-info-value"]');
    this.subtotalLabel = page.locator('[data-test="subtotal-label"]');
    this.taxLabel = page.locator('[data-test="tax-label"]');
    this.totalLabel = page.locator('[data-test="total-label"]');
    this.finishButton = page.locator('[data-test="finish"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
  }

  async open(): Promise<void> {
    await this.goto('/checkout-step-two.html');
  }

  getItemContainer(itemName: string): Locator {
    return this.cartItems.filter({ hasText: itemName });
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  /**
   * Trích xuất số tiền subtotal (ví dụ "Item total: $29.99" -> 29.99)
   */
  async getSubtotalAmount(): Promise<number> {
    const text = (await this.subtotalLabel.textContent()) || '';
    const match = text.match(/\$([0-9.]+)/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Trích xuất số tiền tax (ví dụ "Tax: $2.40" -> 2.40)
   */
  async getTaxAmount(): Promise<number> {
    const text = (await this.taxLabel.textContent()) || '';
    const match = text.match(/\$([0-9.]+)/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Trích xuất tổng tiền total (ví dụ "Total: $32.39" -> 32.39)
   */
  async getTotalAmount(): Promise<number> {
    const text = (await this.totalLabel.textContent()) || '';
    const match = text.match(/\$([0-9.]+)/);
    return match ? parseFloat(match[1]) : 0;
  }
}

