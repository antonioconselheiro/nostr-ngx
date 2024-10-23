import { Injectable } from '@angular/core';
import { getPublicKey, nip19 } from 'nostr-tools';
import { NostrPublicUser } from '../domain/nostr-public-user.interface';
import { NPub, NSec } from 'nostr-tools/nip19';

@Injectable({
  providedIn: 'root'
})
export class NostrConverter {

  convertNsecToPublicKeys(nostrSecret: NSec): Omit<NostrPublicUser, 'nprofile'>;
  convertNsecToPublicKeys(nostrSecret: NSec, outboxRelayList?: Array<WebSocket['url']>): NostrPublicUser;
  convertNsecToPublicKeys(nostrSecret: NSec, outboxRelayList?: Array<WebSocket['url']>): NostrPublicUser {
    const { data } = nip19.decode(nostrSecret);
    const pubkey = getPublicKey(data);

    return this.convertPubkeyToPublicKeys(pubkey, outboxRelayList);
  }

  convertPubkeyToPublicKeys(pubkey: string): Omit<NostrPublicUser, 'nprofile'>;
  convertPubkeyToPublicKeys(pubkey: string, outboxRelayList?: Array<WebSocket['url']>): NostrPublicUser;
  convertPubkeyToPublicKeys(pubkey: string, outboxRelayList?: Array<WebSocket['url']>): NostrPublicUser {
    const npub = nip19.npubEncode(pubkey);
    const publicUser: NostrPublicUser = { pubkey, npub };
    if (outboxRelayList) {
      publicUser.nprofile = nip19.nprofileEncode({
        pubkey, relays: outboxRelayList
      });
    }

    return publicUser;
  }
  
  convertNPubToPubkey(npub: NPub): string {
    const { data } = nip19.decode(npub);
    return data;
  }
}
