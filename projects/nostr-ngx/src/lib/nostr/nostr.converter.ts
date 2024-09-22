import { Injectable } from '@angular/core';
import { getPublicKey, nip19 } from 'nostr-tools';
import { NPub } from '../domain/npub.type';
import { NSec } from '../domain/nsec.type';

@Injectable({
  providedIn: 'root'
})
export class NostrConverter {

  convertNsecToNpub(nostrSecret: NSec): { npub: NPub, pubkey: string } {
    const { data } = nip19.decode(nostrSecret);
    const pubkey = getPublicKey(data);
    const npub = nip19.npubEncode(pubkey);

    return { pubkey, npub };
  }

  castPubkeyToNostrPublic(pubkey: string): NPub {
    return nip19.npubEncode(pubkey);
  }

  casNPubToPubkey(npub: NPub): string {
    const { data } = nip19.decode(npub);
    return data;
  }

  castPubkeyToNpub(pubkey: string): NPub {
    return nip19.npubEncode(pubkey);
  }

}
