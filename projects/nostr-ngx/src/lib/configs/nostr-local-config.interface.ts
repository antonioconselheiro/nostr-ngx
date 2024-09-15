import { RelayRecord } from 'nostr-tools/relay';
import { NostrLocalConfigAccount } from './nostr-local-config-account.interface';

/**
 * saved in local storage
 */
export interface NostrLocalConfig {
  relayFrom: 'none' | 'localStorage' | 'signer' | 'public';

  /**
   * Current user
   */
  currentPubkey?: string;

  /**
   * non npub related local configured relays
   */
  commonRelays?: RelayRecord;

  accounts?: {
    [pubkey: string]: NostrLocalConfigAccount;
  };
}
