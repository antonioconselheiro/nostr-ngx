import { RelayInformation } from 'nostr-tools/nip11';

export interface IRelayMetadata {
  url: string;
  read?: boolean;
  write?: boolean;

  /**
   * nip11 data
   */
  details?: RelayInformation;
  connectionTimeout?: number;

  /**
   * smart pool will not close inherited relays
   */
  inherited?: boolean;
}
