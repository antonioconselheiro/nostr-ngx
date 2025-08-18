import { Nip05 } from 'nostr-tools/nip05';
import { ProfilePointer } from 'nostr-tools/nip19';
import { RelayDomainString } from '../event/relay-domain-string.type';

export type AccountNip05Detail = {
  address: Nip05;
  pointer: ProfilePointer;
  relays: Array<RelayDomainString>;
  valid: true;
} | {
  address: Nip05 | null;
  pointer: ProfilePointer | null;
  relays: Array<RelayDomainString>;
  valid: false;
}
