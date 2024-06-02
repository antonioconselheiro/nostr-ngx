import { Injectable } from '@angular/core';
import { IUnauthenticatedUser } from '../../domain/unauthenticated-user.interface';
import { nip19 } from 'nostr-tools';
import * as nip49 from 'nostr-tools/nip49';
import { IProfile } from '../../domain/profile.interface';
import { TNcryptsec, TNostrSecret } from '@belomonte/nostr-ngx';

@Injectable()
export class AccountConverter {

  convertProfileToAccount(profile: IProfile, ncryptsec: TNcryptsec): IUnauthenticatedUser {
    const displayName = profile.display_name || profile.name || '';
    const picture = profile.picture || ''; // TODO: include a config to define a default image or a random image generator function

    const account: IUnauthenticatedUser = {
      picture,
      displayName,
      ncryptsec,
      npub: profile.npub,
      nip05: profile.nip05,
      nip05valid: profile.nip05valid
    };

    return account;
  }

  encryptNostrSecret(nostrSecret: string, password: string): string {
    const decoded = nip19.decode(nostrSecret);
    const bytes = decoded.data as Uint8Array; 

    return nip49.encrypt(bytes, password);
  }

  decryptAccount(
    account: IUnauthenticatedUser, password: string
  ): TNostrSecret {
    return nip19.nsecEncode(nip49.decrypt(account.ncryptsec, password));
  }
}
