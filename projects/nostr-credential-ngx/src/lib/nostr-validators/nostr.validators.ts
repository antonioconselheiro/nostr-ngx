import { confirmPasswordValidatorFactory } from './confirm-password.validator-fn';
import { nostrSecretValidatorFactory } from './nostr-secret.validator-fn';

export const NostrValidators = {
  nostrSecret: nostrSecretValidatorFactory,
  confirmPassword: confirmPasswordValidatorFactory
};
