import { Injectable } from "@angular/core";
import { InMemoryEventCache } from "./in-memory.event-cache";
import { InMemoryProfileCache } from "./in-memory.profile-cache";

@Injectable()
export class InMemoryCache extends InMemoryEventCache {

  constructor(
    private profileCache: InMemoryProfileCache 
  ) {
    super();
  }
}