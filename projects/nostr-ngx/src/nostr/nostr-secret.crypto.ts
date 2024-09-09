import { Injectable } from '@angular/core';
import { nip19 } from 'nostr-tools';
import * as nip49 from 'nostr-tools/nip49';
import { Ncryptsec } from '../domain/ncryptsec.type';
import { Nsec } from '../domain/nostr-secret.type';

@Injectable({
  providedIn: 'root'
})
export class NostrSecretCrypto {

  decryptNcryptsec(encryptedSecret: Ncryptsec, password: string): Nsec {
    return nip19.nsecEncode(nip49.decrypt(encryptedSecret, password));
  }
}
