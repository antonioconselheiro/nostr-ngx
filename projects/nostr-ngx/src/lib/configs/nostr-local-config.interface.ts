import { RelayRecord } from 'nostr-tools/relay';
import { UnauthenticatedAccount } from '../domain/unauthenticated-account.interface';

/**
 * saved in local storage
 */
export interface NostrLocalConfig {

  /**
   * make app sign using extension, also check
   * extension relays ou pointer to load relay config
   */
  signer?: 'extension';

  /**
   * Current user
   */
  currentPubkey?: string;

  /**
   * non npub related local configured relays
   */
  commonRelays?: RelayRecord;

  accounts?: {
    [pubkey: string]: UnauthenticatedAccount;
  };
}
