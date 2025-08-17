import { Nip05 } from 'nostr-tools/nip05';
import { ProfilePointer } from 'nostr-tools/nip19';
import { RelayDomain } from '../event/relay-domain.interface';

export type AccountNip05Detail = {
  address: Nip05;
  pointer: ProfilePointer;
  relays: Array<RelayDomain>;
  valid: true;
} | {
  address: Nip05 | null;
  pointer: ProfilePointer | null;
  relays: Array<RelayDomain>;
  valid: false;
}
