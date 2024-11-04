import { Injectable } from '@angular/core';
import { InMemoryNCache } from '../injection-token/in-memory.ncache';
import { NostrEvent } from '../domain/event/nostr-event.interface';
import { HexString } from '../domain/event/primitive/hex-string.type';

@Injectable({
  providedIn: 'root'
})
export class CacheInMemory extends InMemoryNCache {
  override get(key: HexString): NostrEvent {
    
  }
}
