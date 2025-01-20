import { Injectable } from "@angular/core";
import { LRUCache } from "lru-cache";
import { AccountRenderable } from "../domain/account/compose/account-renderable.type";
import { HexString } from "../domain/event/primitive/hex-string.type";

@Injectable()
export class InMemoryProfileCache {

  protected cache = new LRUCache<HexString, AccountRenderable>({
    //  TODO: make this configurable
    max: 1000,
    dispose: event => this.delete(event)
  });
  
  delete(account: AccountRenderable): boolean {
    return this.cache.delete(account.pubkey);
  }

  get(pubkey: HexString): AccountRenderable | null {
    return this.cache.get(pubkey) || null;
  }
}