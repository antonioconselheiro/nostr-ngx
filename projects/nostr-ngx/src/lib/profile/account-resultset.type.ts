import { NostrMetadata } from '@nostrify/nostrify';
import { Metadata } from 'nostr-tools/kinds';
import { ProfilePointer } from 'nostr-tools/nip19';
import { NostrEvent } from '../domain/nostr-event.interface';

export type AccountResultset = {
  pubkey: string;
  event: NostrEvent<Metadata>;
  metadata: NostrMetadata;
  nip05: ProfilePointer | null;
}
