import { Injectable } from '@angular/core';
import { getPublicKey, nip19 } from 'nostr-tools';
import { NProfile, NPub, NSec, ProfilePointer } from 'nostr-tools/nip19';
import { HexString } from '../domain/event/primitive/hex-string.type';
import { RelayDomain } from '../domain/event/relay-domain.interface';
import { NostrPublicUser } from '../domain/nostr-public-user.interface';
import { ProfilePointerSanitized } from '../domain/profile-pointer-sanitized.interface';
import { NostrGuard } from './nostr.guard';

@Injectable({
  providedIn: 'root'
})
export class NostrConverter {

  constructor(
    private nostrGuard: NostrGuard
  ) {}

  parseNProfile(nprofile: NProfile): ProfilePointerSanitized {
    return this.sanitizeProfilePointer(nip19.decode(nprofile).data);
  }

  sanitizeProfilePointer(profilePointer: ProfilePointer): ProfilePointerSanitized {
    const sanitized: ProfilePointerSanitized = {
      pubkey: profilePointer.pubkey,
      relays: []
    };

    if (profilePointer.relays && profilePointer.relays.length) {
      profilePointer.relays.forEach(relay => {
        if (this.nostrGuard.isRelayString(relay)) {
          sanitized.relays.push(relay);
        }
      });
    }

    return sanitized;
  }

  convertNSecToPublicKeys(nostrSecret: NSec): Omit<NostrPublicUser, 'nprofile'>;
  convertNSecToPublicKeys(nostrSecret: NSec, outboxRelayList?: Array<RelayDomain>): NostrPublicUser;
  convertNSecToPublicKeys(nostrSecret: NSec, outboxRelayList?: Array<RelayDomain>): NostrPublicUser {
    const { data } = nip19.decode(nostrSecret);
    const pubkey = getPublicKey(data);

    return this.convertPubkeyToPublicKeys(pubkey, outboxRelayList);
  }

  convertPubkeyToPublicKeys(pubkey: HexString): Omit<NostrPublicUser, 'nprofile'>;
  convertPubkeyToPublicKeys(pubkey: HexString, outboxRelayList?: Array<RelayDomain>): NostrPublicUser;
  convertPubkeyToPublicKeys(pubkey: HexString, outboxRelayList?: Array<RelayDomain>): NostrPublicUser {
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
