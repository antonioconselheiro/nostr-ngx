import { Injectable } from '@angular/core';
import { NostrService, TNostrPublic } from '@belomonte/nostr-ngx';
import { nip19, NostrEvent } from 'nostr-tools';
import { Metadata } from 'nostr-tools/kinds';

@Injectable({
  providedIn: 'root'
})
export class ProfileNostr {

  constructor(
    private nostrService: NostrService
  ) { }

  loadProfiles(npubs: Array<TNostrPublic>): Promise<NostrEvent[]> {
    return this.nostrService.request([
      {
        kinds: [ Metadata ],
        authors: npubs.map(npub => String(nip19.decode(npub).data))
      }
    ]);
  }
}
