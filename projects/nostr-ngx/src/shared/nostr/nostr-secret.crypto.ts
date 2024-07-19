import { Injectable } from '@angular/core';
import { nip19 } from 'nostr-tools';
import * as nip49 from 'nostr-tools/nip49';
import { TNcryptsec } from '../../domain/ncryptsec.type';
import { TNostrSecret } from '../../domain/nostr-secret.type';

@Injectable({
  providedIn: 'root'
})
export class NostrSecretCrypto {

  decryptNcryptsec(encryptedSecret: TNcryptsec, password: string): TNostrSecret {
    return nip19.nsecEncode(nip49.decrypt(encryptedSecret, password));
  }
}
