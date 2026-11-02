export const ERROR_MESSAGES = {
  USERNAME_REQUIRED: 'Epic sadface: Username is required',
  PASSWORD_REQUIRED: 'Epic sadface: Password is required',
  INVALID_CREDENTIALS: 'Epic sadface: Username and password do not match any user in this service',
  LOCKED_OUT_USER: 'Epic sadface: Sorry, this user has been locked out.',
  CHECKOUT_FIRST_NAME_REQUIRED: 'Error: First Name is required',
  CHECKOUT_LAST_NAME_REQUIRED: 'Error: Last Name is required',
  CHECKOUT_POSTAL_CODE_REQUIRED: 'Error: Postal Code is required',
  UNAUTHENTICATED_INVENTORY: "Epic sadface: You can only access '/inventory.html' when you are logged in.",
  UNAUTHENTICATED_CART: "Epic sadface: You can only access '/cart.html' when you are logged in.",
  UNAUTHENTICATED_CHECKOUT: "Epic sadface: You can only access '/checkout-step-one.html' when you are logged in."
} as const;
