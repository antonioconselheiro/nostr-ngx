import { NostrEvent } from 'nostr-tools';

export type NostrRawEvent = Pick<NostrEvent, 'kind' | 'tags' | 'content'>;