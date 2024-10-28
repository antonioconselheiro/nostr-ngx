import { NCache, NostrFilter } from "@nostrify/nostrify";
import { NostrEvent } from "../domain/event/nostr-event.interface";
import { HexString } from "../domain/event/primitive/hex-string.type";
import { LRUCache } from "lru-cache";

export abstract class InMemoryNCache extends NCache {
  
  constructor(...args: ConstructorParameters<typeof LRUCache<HexString, NostrEvent>>) {
    super(new LRUCache<HexString, NostrEvent>(...args));
  }

  abstract get(key: HexString): NostrEvent;

  override query(filters: NostrFilter[]): Promise<NostrEvent[]> {
    return super.query(filters);
  }
}