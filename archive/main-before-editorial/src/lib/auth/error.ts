/* eslint-disable max-classes-per-file */
import { CredentialsSignin } from 'next-auth';

export class CredentialsValidationError extends CredentialsSignin {
  code = 'CredentialsValidationError';
}

export class UserNotFoundError extends CredentialsSignin {
  code = 'UserNotFoundError';
}

export class PasswordNotMatchedError extends CredentialsSignin {
  code = 'PasswordNotMatchedError';
}

export class NotCredentialsUserError extends CredentialsSignin {
  code = 'NotCredentialsUserError';
}
