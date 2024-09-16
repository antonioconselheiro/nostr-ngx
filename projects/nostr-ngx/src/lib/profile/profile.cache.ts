import { Injectable } from '@angular/core';
import { NostrMetadata } from '@nostrify/nostrify';
import { LRUCache } from 'lru-cache';
import { nip19, NostrEvent } from 'nostr-tools';
import { NPub } from '../domain/npub.type';
import { NostrConverter } from '../nostr/nostr.converter';
import { ProfileConverter } from "./profile.converter";
import { NostrGuard } from '../nostr/nostr.guard';
import { NSchema as n } from '@nostrify/nostrify';
import { Nip05 } from '../domain/nip05.type';

@Injectable({
  providedIn: 'root'
})
export class ProfileCache {

  protected cache = new LRUCache<string, [NostrEvent, NostrMetadata]>({
    max: 1000
  });

  static profiles: {
    [npub: NPub]: NostrMetadata
  } = {};

  constructor(
    private guard: NostrGuard,
    private nostrConverter: NostrConverter,
    private profileConverter: ProfileConverter
  )  { }

  add(metadataEvent: NostrEvent & { kind: 0 }): void {
    const metadata = n.json().pipe(n.metadata()).parse(metadataEvent.content);
    this.cache.set(metadataEvent.id, [metadataEvent, metadata]);
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

  getByNip5(nip5: Nip05[]): NostrMetadata[];
  getByNip5(nip5: Nip05): NostrMetadata | null;
  getByNip5(nip5: Nip05 | Nip05[]): NostrMetadata[] | NostrMetadata | null {
    //  TODOING
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
