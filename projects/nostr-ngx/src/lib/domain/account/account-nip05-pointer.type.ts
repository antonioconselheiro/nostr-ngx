import { ProfilePointer } from 'nostr-tools/nip19';

export type AccountNip05Pointer = {
  address: string;
  pointer: ProfilePointer;
  relays: Array<WebSocket['url']>;
  valid: true;
} | {
  address: string | null;
  pointer: ProfilePointer | null;
  relays: Array<WebSocket['url']>;
  valid: false;
}
