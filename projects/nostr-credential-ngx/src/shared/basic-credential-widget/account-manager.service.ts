import { Injectable } from '@angular/core';
import { IUnauthenticatedUser } from '../../domain/unauthenticated-user';
import { AccountConverter } from '../profile-service/account.converter';
import { BehaviorSubject } from 'rxjs';
import { IProfile } from '../../domain/profile.interface';
import { NostrConfigStorage, TNcryptsec } from '@belomonte/nostr-ngx';
import { INostrCredentialLocalConfig } from '../../domain/nostr-credential-local-config.interface';

@Injectable({
  providedIn: 'root'
})
export class AccountManagerService {

  accounts: {
    [npub: string]: IUnauthenticatedUser
  } = JSON.parse(localStorage.getItem('AccountManagerService_accounts') || '{}');

  constructor(
    private accountConverter: AccountConverter,
    private nostrConfigStorage: NostrConfigStorage
  ) { }

  private accountsSubject = new BehaviorSubject<IUnauthenticatedUser[]>(Object.values(this.accounts));
  accounts$ = this.accountsSubject.asObservable();

  // eslint-disable-next-line complexity
  addAccount(profile: IProfile, ncryptsec: TNcryptsec): IUnauthenticatedUser | null {
    const unauthenticated = this.accountConverter.convertProfileToAccount(profile, ncryptsec);
    if (!unauthenticated) {
      return null;
    }
    this.accounts[unauthenticated.npub] = unauthenticated
    this.update();
    return unauthenticated;
  }

  removeAccount(profile: IUnauthenticatedUser): void {
    delete this.accounts[profile.npub];
    this.update();
  }

  private update(): void {
    this.nostrConfigStorage.updateLocalStorage<INostrCredentialLocalConfig>(configs => {
      configs.accounts = this.accounts;
      this.accountsSubject.next(Object.values(this.accounts));

      return configs;
    });
  }
}
