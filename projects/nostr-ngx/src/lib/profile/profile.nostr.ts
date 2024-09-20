import { Injectable } from '@angular/core';
import { NostrGuard, NostrPool, NPub } from '@belomonte/nostr-ngx';
import { nip19, NostrEvent } from 'nostr-tools';
import { Metadata } from 'nostr-tools/kinds';

@Injectable({
  providedIn: 'root'
})
export class ProfileNostr {

  constructor(
    private guard: NostrGuard,
    private nostrPool: NostrPool
  ) { }

  loadProfiles(npubs: Array<NPub | string>): Promise<NostrEvent[]> {
    const authors = npubs.map(pubkey => this.guard.isNPub(pubkey) ? String(nip19.decode(pubkey).data) : pubkey);
    return this.nostrPool.query([
      {
        kinds: [ Metadata ], authors
      }
    ]);
  }
}
