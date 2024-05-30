import { Injectable } from '@angular/core';
import { getPublicKey, nip19 } from 'nostr-tools';
import { TNostrSecret } from '../../domain/nostr-secret.type';
import { TNostrPublic } from '../../domain/nostr-public.type';
import { TNcryptsec } from '../../domain/ncryptsec.type';
import * as nip49 from 'nostr-tools/nip49';

@Injectable()
export class NostrConverter {

  convertNostrSecretToPublic(nostrSecret: TNostrSecret): { npub: TNostrPublic, pubhex: string } {
    const { data } = nip19.decode(nostrSecret);
    const pubhex = getPublicKey(data);

    return { pubhex, npub: nip19.npubEncode(pubhex) };
  }

  decryptNcryptsec(encryptedSecret: TNcryptsec, password: string): TNostrSecret {
    return nip19.nsecEncode(nip49.decrypt(encryptedSecret, password));
  }
}
