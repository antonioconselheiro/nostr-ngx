import { Injectable } from '@angular/core';
import { getPublicKey, nip19 } from 'nostr-tools';
import { Npub } from '../domain/nostr-public.type';
import { Nsec } from '../domain/nostr-secret.type';

@Injectable({
  providedIn: 'root'
})
export class NostrConverter {

  convertNsecToNpub(nostrSecret: Nsec): { npub: Npub, pubhex: string } {
    const { data } = nip19.decode(nostrSecret);
    const pubhex = getPublicKey(data);

    return { pubhex, npub: nip19.npubEncode(pubhex) };
  }

  castPubkeyToNostrPublic(pubkey: string): Npub {
    return nip19.npubEncode(pubkey);
  }

  castNostrPublicToPubkey(npub: Npub): string {
    const { data } = nip19.decode(npub);
    return data;
  }

}
