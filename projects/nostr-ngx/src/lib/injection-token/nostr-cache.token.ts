import { InjectionToken } from '@angular/core';
import { NostrCache } from './nostr-cache.interface';

export const NOSTR_CACHE_TOKEN = new InjectionToken<NostrCache>('NostrCache');