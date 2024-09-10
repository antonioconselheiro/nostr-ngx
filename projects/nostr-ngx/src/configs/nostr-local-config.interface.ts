import { RelayRecord } from 'nostr-tools/relay';

/**
 * saved in local storage
 */
export interface NostrLocalConfig {
  relayFrom: 'none' | 'localStorage' | 'signer' | 'public';

  /**
   * non npub related local configured relays
   */
  commonRelays?: RelayRecord;

  accounts?: {
    [npub: string]: {
      relays: {
        general: RelayRecord;
        directMessage?: Array<WebSocket['url']>;
      };
    };
  };
}
