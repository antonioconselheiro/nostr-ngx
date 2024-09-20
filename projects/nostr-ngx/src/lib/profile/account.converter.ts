import { Injectable } from '@angular/core';
import { Ncryptsec, Nip05, NostrLocalConfigRelays, NSec } from '@belomonte/nostr-ngx';
import { NostrMetadata } from '@nostrify/nostrify';
import { nip19 } from 'nostr-tools';
import * as nip49 from 'nostr-tools/nip49';
import { IUnauthenticatedAccount } from '../domain/unauthenticated-account.interface';

@Injectable({
  providedIn: 'root'
})
export class AccountConverter {

  convertProfileToAccount(pubkey: string, profile: NostrMetadata | null, ncryptsec: Ncryptsec, relays: NostrLocalConfigRelays): IUnauthenticatedAccount {
    const displayName = profile && (profile.display_name || profile.name) || '';
    const picture = profile && profile.picture || ''; // TODO: include a config to define a default image or a random image generator function
    const nip05 = (profile && profile.nip05  as Nip05 || undefined);

    const account: IUnauthenticatedAccount = {
      picture,
      displayName,
      ncryptsec,
      pubkey,
      nip05,
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
