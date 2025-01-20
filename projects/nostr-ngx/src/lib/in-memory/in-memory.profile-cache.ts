import { Injectable } from "@angular/core";
import { LRUCache } from "lru-cache";
import { AccountRenderable } from "../domain/account/compose/account-renderable.type";
import { HexString } from "../domain/event/primitive/hex-string.type";

@Injectable()
export class InMemoryProfileCache extends NCache {
  
  constructor() {
    super(new LRUCache<HexString, AccountRenderable>({
      //  TODO: make this configurable
      max: 5000,
      dispose: event => this.delete(event)
    }));
  }

  get(idEvent: HexString): AccountRenderable | null {
    return this.cache.get(idEvent) || null;
  }
}