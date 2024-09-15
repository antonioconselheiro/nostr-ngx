import { Injectable } from '@angular/core';
import { NostrPool, NPub } from '@belomonte/nostr-ngx';
import { nip19, NostrEvent } from 'nostr-tools';
import { Metadata } from 'nostr-tools/kinds';

@Injectable({
  providedIn: 'root'
})
export class ProfileNostr {

  constructor(
    private nostrPool: NostrPool
  ) { }

  loadProfiles(npubs: Array<NPub>): Promise<NostrEvent[]> {
    return this.nostrPool.query([
      {
        kinds: [ Metadata ],
        authors: npubs.map(npub => String(nip19.decode(npub).data))
      }
    ]);
  }
}
