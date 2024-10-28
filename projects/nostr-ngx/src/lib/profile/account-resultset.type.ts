import { NostrMetadata } from '@nostrify/nostrify';
import { Metadata } from 'nostr-tools/kinds';
import { ProfilePointer } from 'nostr-tools/nip19';
import { NostrEvent } from '../domain/event/nostr-event.interface';
import { HexString } from '../domain/event/primitive/hex-string.type';

export type AccountResultset = {
  pubkey: HexString;
  event: NostrEvent<Metadata>;
  metadata: NostrMetadata;
  nip05: ProfilePointer | null;
}
