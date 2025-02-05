import { Injectable } from '@angular/core';
import { IdbEventCache } from './idb.event-cache';
import { NostrCache } from '../injection-token/nostr-cache.interface';
import { IdbProfileCache } from './idb.profile-cache';

@Injectable()
export class IdbCache extends IdbEventCache implements NostrCache {
  constructor(
    public profiles: IdbProfileCache
  ) {
    super();
  }
}