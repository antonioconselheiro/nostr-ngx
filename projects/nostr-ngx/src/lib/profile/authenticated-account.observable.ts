import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AccountsLocalStorage } from '../config-storage/accounts-local.storage';
import { ProfileSessionStorage } from '../config-storage/profile-session.storage';
import { Account } from '../domain/account.interface';
import { Ncryptsec } from '../domain/ncryptsec.type';
import { NSec } from '../domain/nsec.type';
import { UnauthenticatedAccount } from '../domain/unauthenticated-account.interface';
import { NostrConverter } from '../nostr/nostr.converter';
import { NSecCrypto } from '../nostr/nsec.crypto';
import { ProfileService } from './profile.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticatedAccountObservable extends BehaviorSubject<Account | null> {

  constructor(
    private profileService: ProfileService,
    private nostrConverter: NostrConverter,
    private nsecCrypto: NSecCrypto,
    private profileSessionStorage: ProfileSessionStorage,
    private accountLocalStorage: AccountsLocalStorage
  ) {
    const session = profileSessionStorage.read();
    let account: Account | null = null;
    if (session.account) {
      account = session.account;
    }

    super(account);
  }

  authenticateAccount(account: UnauthenticatedAccount, password: string, saveNSecInSessionStorage = false): Promise<Account> {
    const nsec = this.nsecCrypto.decryptNcryptsec(account.ncryptsec, password);
    const user = this.nostrConverter.convertNsecToNpub(nsec);
    this.profileSessionStorage.clear();
    this.profileSessionStorage.patch({ account });

    if (saveNSecInSessionStorage) {
      this.profileSessionStorage.patch({ nsec });
    }

    return this.updateProfile(user.pubkey);
  }

  authenticateWithNSec(nsec: NSec, saveNSecInSessionStorage = false): Promise<Account> {
    const user = this.nostrConverter.convertNsecToNpub(nsec);
    this.profileSessionStorage.clear();

    if (saveNSecInSessionStorage) {
      this.profileSessionStorage.patch({ nsec });
    }

    return this.updateProfile(user.pubkey);
  }

  async authenticateWithNcryptsec(ncryptsec: Ncryptsec, password: string, saveNSecInSessionStorage = false): Promise<Account> {
    const nsec = this.nsecCrypto.decryptNcryptsec(ncryptsec, password);
    const user = this.nostrConverter.convertNsecToNpub(nsec);
    const account = await this.updateProfile(user.pubkey);

    account.ncryptsec = ncryptsec;
    this.profileSessionStorage.clear();
    this.profileSessionStorage.save({ account });

    if (saveNSecInSessionStorage) {
      this.profileSessionStorage.patch({ nsec });
    }

    return Promise.resolve(account);
  }

  private updateProfile(pubkey: string, signer?: 'extension'): Promise<Account> {
    return this.profileService
      .getAccount(pubkey)
      .then((account) => {
        this.profileSessionStorage.save({ account });

        if (signer) {
          this.accountLocalStorage.patch({ signer });
        }

        this.next(account);

        return Promise.resolve(account);
      });
  }

  logout(): void {
    this.next(null);
    sessionStorage.clear();
  }
}
