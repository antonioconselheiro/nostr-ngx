import { RelayInformation } from 'nostr-tools/nip11';
import { AbstractRelay } from 'nostr-tools/relay';

export interface IRelayMetadata {
  writeable: boolean;
  conn?: AbstractRelay;
  details?: RelayInformation;
}
