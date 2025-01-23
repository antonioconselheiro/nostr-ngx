import { Nip05 } from 'nostr-tools/nip05';
import { ProfilePointer } from 'nostr-tools/nip19';

export type AccountNip05Detail = {
  address: Nip05;
  pointer: ProfilePointer;
  relays: Array<WebSocket['url']>;
  valid: true;
} | {
  address: Nip05 | null;
  pointer: ProfilePointer | null;
  relays: Array<WebSocket['url']>;
  valid: false;
}
