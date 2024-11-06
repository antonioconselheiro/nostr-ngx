import { NCache, NostrFilter } from "@nostrify/nostrify";
import { NostrEvent } from "../domain/event/nostr-event.interface";
import { HexString } from "../domain/event/primitive/hex-string.type";
import { LRUCache } from "lru-cache";
import { Injectable } from "@angular/core";

@Injectable()
export class InMemoryNCache extends NCache {
  
  constructor() {
    super(new LRUCache<HexString, NostrEvent>({
      //  TODO: make this configurable
      max: 5000,
      dispose: event => this.delete(event)
    }));
  }

  get(idEvent: HexString): NostrEvent | null {
    return this.cache.get(idEvent) || null;
  }

  override query(filters: NostrFilter[]): Promise<NostrEvent[]> {
    return super.query(filters);
  }
}