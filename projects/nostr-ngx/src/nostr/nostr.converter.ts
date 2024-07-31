import { Injectable } from '@angular/core';
import { getPublicKey, nip19 } from 'nostr-tools';
import { TNostrPublic } from '../domain/nostr-public.type';
import { TNostrSecret } from '../domain/nostr-secret.type';

@Injectable({
  providedIn: 'root'
})
export class NostrConverter {

  convertNsecToNpub(nostrSecret: TNostrSecret): { npub: TNostrPublic, pubhex: string } {
    const { data } = nip19.decode(nostrSecret);
    const pubhex = getPublicKey(data);

    return { pubhex, npub: nip19.npubEncode(pubhex) };
  }

  castPubkeyToNostrPublic(pubkey: string): TNostrPublic {
    return nip19.npubEncode(pubkey);
  }

  castNostrPublicToPubkey(npub: TNostrPublic): string {
    const { data } = nip19.decode(npub);
    return data;
  }

}
