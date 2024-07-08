import { Injectable } from '@angular/core';
import { NostrEventKind, NostrService, TNostrPublic, TRelayMap } from '@belomonte/nostr-ngx';
import { nip19, NostrEvent } from 'nostr-tools';

@Injectable({
  providedIn: 'root'
})
export class ProfileNostr {

  constructor(
    private nostrService: NostrService
  ) { }

  loadProfiles(npubs: Array<TNostrPublic>, relays?: TRelayMap | string[]): Promise<NostrEvent[]> {
    return this.nostrService.request([
      {
        kinds: [
          Number(NostrEventKind.Metadata)
        ],
        authors: npubs.map(npub => String(nip19.decode(npub).data))
      }
    ], relays);
  }
}
