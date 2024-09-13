import { RelayRecord } from 'nostr-tools/relay';

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
    [pubkey: string]: {
      relays: {
        general: RelayRecord;
        directMessage?: Array<WebSocket['url']>;
      };
    };
  };
}
