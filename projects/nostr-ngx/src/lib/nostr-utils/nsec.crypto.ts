import { Injectable } from '@angular/core';
import { nip19 } from 'nostr-tools';
import * as nip49 from 'nostr-tools/nip49';
import { Ncryptsec } from '../domain/ncryptsec.type';
import { NSec } from '../domain/nsec.type';

// FIXME: find a better name for these type of service
@Injectable({
  providedIn: 'root'
})
export class NSecCrypto {

  encryptNSec(nsec: NSec | Uint8Array, password: string): Ncryptsec {
    if (typeof nsec === 'string') {
      const decoded = nip19.decode(nsec);
      const bytes = decoded.data as Uint8Array; 

      return nip49.encrypt(bytes, password) as Ncryptsec;
    } else {
      return nip49.encrypt(nsec, password) as Ncryptsec;
    }
  }

  decryptNcryptsec(encryptedSecret: Ncryptsec, password: string): NSec {
    return nip19.nsecEncode(nip49.decrypt(encryptedSecret, password));
  }
}
