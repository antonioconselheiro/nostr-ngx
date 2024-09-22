import { Account } from '../domain/account.interface';
import { NSec } from '../domain/nsec.type';

/**
 * saved in session storage
 */
export interface NostrSessionConfig {
  signer?: 'extension';
  account?: Account;
  nsec?: NSec;
}
