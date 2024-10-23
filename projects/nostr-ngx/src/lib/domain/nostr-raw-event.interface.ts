import { NostrEvent } from './nostr-event.interface';

export type NostrRawEvent = Pick<NostrEvent, 'kind' | 'tags' | 'content'>;