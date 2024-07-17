import { TRelayMetadataRecord } from "./relay-record.type";

export interface INostrLocalConfig {
  relayFrom: 'none' | 'localStorage' | 'signer' | 'public';
  commonRelays?: TRelayMetadataRecord;

  /**
   * string index is npub
   */
  userRelays?: Record<string, TRelayMetadataRecord>;
}
