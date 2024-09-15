import { Injectable } from '@angular/core';
import { nip19 } from 'nostr-tools';
import * as nip49 from 'nostr-tools/nip49';
import { Ncryptsec } from '../domain/ncryptsec.type';
import { NSec } from '../domain/nsec.type';

@Injectable({
  providedIn: 'root'
})
export class NSecCrypto {

  decryptNcryptsec(encryptedSecret: Ncryptsec, password: string): NSec {
    return nip19.nsecEncode(nip49.decrypt(encryptedSecret, password));
  }
}
