import { TRelayMetadataRecord } from '../domain/relay-metadata.record';

export interface INostrLocalConfig {
  relayFrom: 'none' | 'localStorage' | 'signer' | 'public';
  commonRelays?: TRelayMetadataRecord;

  /**
   * string index is npub
   */
  userRelays?: Record<string, TRelayMetadataRecord>;
}
