import { NPub } from '@belomonte/nostr-ngx';
import { NostrEvent, NostrMetadata } from '@nostrify/nostrify';

export interface IAuthenticatedAccount {
  metadata: NostrMetadata;
  npub: NPub;
  pubhex: string;
  relayList: NostrEvent;
}
