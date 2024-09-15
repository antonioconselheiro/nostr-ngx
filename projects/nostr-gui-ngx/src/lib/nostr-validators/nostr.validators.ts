import { confirmPasswordValidatorFactory } from './confirm-password.validator-fn';
import { nsecValidatorFactory } from './nostr-secret.validator-fn';

export const NostrValidators = {
  nsec: nsecValidatorFactory,
  confirmPassword: confirmPasswordValidatorFactory
};
