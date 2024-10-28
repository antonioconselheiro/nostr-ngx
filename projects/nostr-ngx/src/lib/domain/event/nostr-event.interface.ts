import { NostrNip1Event } from './nostr-nip1-event.interface';
import { NostrStrictEvent } from './nostr-strict-event.type';
import { StrictTagKinds } from './strict-tag-kinds.type';

export type NostrEvent<T extends StrictTagKinds | number = number> = T extends StrictTagKinds ? NostrStrictEvent<T> : NostrNip1Event<T>;
