import { RelayRecord } from 'nostr-tools/relay';
import { NSec } from '../domain/nsec.type';
import { Account } from '../domain/account.interface';

/**
 * saved in session storage
 */
export interface NostrSessionConfig {
  /**
   * current user account
   */
  account?: Account;
  relays?: RelayRecord;
  nsec?: NSec;
}
