import { RelayInformation } from 'nostr-tools/nip11'

export interface IRelayConfig {
  url: string;
  read?: boolean;
  write?: boolean;

  /**
   * nip11 data
   */
  metadata?: RelayInformation;
}
