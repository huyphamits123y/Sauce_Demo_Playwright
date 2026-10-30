export interface UserCredentials {
  username: string;
  password: string;
}

export const VALID_USER: UserCredentials = {
  username: 'standard_user',
  password: 'secret_sauce'
};

export const INVALID_USER: UserCredentials = {
  username: 'standard_user',
  password: 'wrong_password'
};

export const LOCKED_OUT_USER: UserCredentials = {
  username: 'locked_out_user',
  password: 'secret_sauce'
};

