import { Injectable } from '@angular/core';
import { NSchema as n, NostrMetadata } from '@nostrify/nostrify';
import { LRUCache } from 'lru-cache';
import { nip19, NostrEvent } from 'nostr-tools';
import { Nip05 } from '../domain/nip05.type';
import { NPub } from '../domain/npub.type';
import { NostrGuard } from '../nostr/nostr.guard';

@Injectable({
  providedIn: 'root'
})
export class ProfileCache {

  protected nip5IndexForPubkey = new Map<string, string>();

  protected cache = new LRUCache<string, [NostrEvent, NostrMetadata]>({
    max: 1000
  });

  constructor(
    private guard: NostrGuard
  )  { }

  add(metadataEvent: NostrEvent & { kind: 0 }): void {
    const metadata = n.json().pipe(n.metadata()).parse(metadataEvent.content);
    this.cache.set(metadataEvent.id, [metadataEvent, metadata]);
    if (metadata.nip05) {
      this.nip5IndexForPubkey.set(metadata.nip05, metadataEvent.pubkey);
    }
  }
  
  get(pubkey: string): NostrMetadata | null;
  get(pubkeys: string[]): NostrMetadata[];
  get(npub: NPub): NostrMetadata | null;
  get(npubs: NPub[]): NostrMetadata[];
  get(publicAddresses: string[] | string): NostrMetadata | NostrMetadata[] | null {
    publicAddresses = publicAddresses instanceof Array ? publicAddresses : [ publicAddresses ];
    const metadatas = publicAddresses
      .map(publicAddress => this.castPublicAddressToPubkey(publicAddress))
      .map(pubkey => pubkey && this.cache.get(pubkey) || null)
      .filter((tuple): tuple is [ NostrEvent, NostrMetadata ] => !!tuple)
      .map(([,metadata]) => metadata);

    if (publicAddresses instanceof Array) {
      return metadatas;
    } else {
      return metadatas[0] || null;
    }
  }

  getByNip5(nip5: Nip05): NostrMetadata | null;
  getByNip5(nip5s: Nip05[]): NostrMetadata[];
  getByNip5(nip5s: Nip05 | Nip05[]): NostrMetadata[] | NostrMetadata | null {
    if (nip5s instanceof Array ) {
      nip5s
        .map(nip5 => this.nip5IndexForPubkey.get(nip5))
        .map(pubkey => pubkey && this.get(pubkey) || null)
        .filter(metadata => !!metadata);
    } else {
      const pubkey = this.nip5IndexForPubkey.get(nip5s);
      if (pubkey) {
        return this.get(pubkey);
      }
    }

    return null;
  }

  private castPublicAddressToPubkey(publicAddress: string): string | null {
    if (this.guard.isNPub(publicAddress)) {

      const { data } = nip19.decode(publicAddress);
      return data;
    } else if (this.guard.isHexadecimal(publicAddress)) {
      return publicAddress;
    }

    return null;
  }
}
