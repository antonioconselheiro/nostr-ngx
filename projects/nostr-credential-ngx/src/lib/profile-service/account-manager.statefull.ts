import { Injectable } from '@angular/core';
import { TNcryptsec } from '@belomonte/nostr-ngx';
import { BehaviorSubject } from 'rxjs';
import { IAccountsLocalConfig } from '../credential-manager-widget/credential-storage/accounts-local-config.interface';
import { IProfile } from '../domain/profile.interface';
import { IUnauthenticatedUser } from '../domain/unauthenticated-user.interface';
import { AccountsLocalStorage } from '../credential-manager-widget/credential-storage/accounts-local.storage';
import { AccountConverter } from './account.converter';

@Injectable({
  providedIn: 'root'
})
export class AccountManagerStatefull {

  private accounts = this.accountsLocalStorage.read().accounts || {};
  private accountsSubject = new BehaviorSubject<IUnauthenticatedUser[]>(Object.values(this.accounts));
  accounts$ = this.accountsSubject.asObservable();

  constructor(
    private accountConverter: AccountConverter,
    private accountsLocalStorage: AccountsLocalStorage
  ) { }

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
    this.accountsLocalStorage.patch({ accounts: this.accounts });
    this.accountsSubject.next(Object.values(this.accounts));
  }
}
