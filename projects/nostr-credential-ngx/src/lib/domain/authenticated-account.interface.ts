import { TNostrPublic } from '@belomonte/nostr-ngx';
import { NostrEvent, NostrMetadata } from '@nostrify/nostrify';

export interface IAuthenticatedAccount {
  metadata: NostrMetadata;
  npub: TNostrPublic;
  pubhex: string;
  relayList: NostrEvent;
}
