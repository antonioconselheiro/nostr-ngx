import { TRelayRecord } from "./relay-record.type";

export interface INostrLocalConfig {
  relayFrom: 'none' | 'localStorage' | 'signer' | 'public';
  commonRelays?: TRelayRecord;

  /**
   * string index is npub
   */
  userRelays?: Record<string, TRelayRecord>;
}
