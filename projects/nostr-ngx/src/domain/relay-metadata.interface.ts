import { RelayInformation } from 'nostr-tools/nip11';
import { IRelayConfig } from './relay-config.interface';

export interface IRelayMetadata extends IRelayConfig {
  url: string;
  connectionTimeout?: number;
  details?: RelayInformation;
}
