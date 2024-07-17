import { RelayInformation } from 'nostr-tools/nip11';

export interface IRelayMetadata {
  url: string;
  read?: boolean;
  write?: boolean;

  /**
   * nip11 data
   */
  metadata?: RelayInformation;
  connectionTimeout?: number;
  details?: RelayInformation;
}
