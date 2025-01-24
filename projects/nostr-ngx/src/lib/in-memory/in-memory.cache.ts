import { Injectable } from "@angular/core";
import { NostrCache } from "../injection-token/nostr-cache.interface";
import { InMemoryEventCache } from "./in-memory.event-cache";
import { InMemoryProfileCache } from "./in-memory.profile-cache";

@Injectable()
export class InMemoryCache extends InMemoryEventCache implements NostrCache {

  constructor(
    public profiles: InMemoryProfileCache 
  ) {
    super();
  }
}
