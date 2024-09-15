import { Injectable } from '@angular/core';
import { IUnauthenticatedAccount } from '../domain/unauthenticated-account.interface';
import { nip19 } from 'nostr-tools';
import * as nip49 from 'nostr-tools/nip49';
import { Nip05, NostrLocalConfigRelays, NPub, Ncryptsec, NSec } from '@belomonte/nostr-ngx';
import { NostrMetadata } from '@nostrify/nostrify';

@Injectable({
  providedIn: 'root'
})
export class AccountConverter {

  convertProfileToAccount(npub: NPub, profile: NostrMetadata, ncryptsec: Ncryptsec, relays: NostrLocalConfigRelays): IUnauthenticatedAccount {
    const displayName = profile.display_name || profile.name || '';
    const picture = profile.picture || ''; // TODO: include a config to define a default image or a random image generator function

    const account: IUnauthenticatedAccount = {
      picture,
      displayName,
      ncryptsec,
      npub: npub,
      nip05: profile.nip05 as Nip05 | undefined,
      relays
    };

    return account;
  }

  encryptNSec(nsec: NSec, password: string): string {
    const decoded = nip19.decode(nsec);
    const bytes = decoded.data as Uint8Array; 

    return nip49.encrypt(bytes, password);
  }

  decryptAccount(
    account: IUnauthenticatedAccount, password: string
  ): NSec {
    return nip19.nsecEncode(nip49.decrypt(account.ncryptsec, password));
  }
}
