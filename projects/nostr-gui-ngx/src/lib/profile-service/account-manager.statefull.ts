import { Injectable } from '@angular/core';
import { Ncryptsec, NostrLocalConfigRelays, NPub } from '@belomonte/nostr-ngx';
import { BehaviorSubject } from 'rxjs';
import { AccountsLocalStorage } from '../credential-manager-widget/credential-storage/accounts-local.storage';
import { IUnauthenticatedAccount } from '../domain/unauthenticated-account.interface';
import { AccountConverter } from './account.converter';
import { NostrMetadata } from '@nostrify/nostrify';

@Injectable({
  providedIn: 'root'
})
export class AccountManagerStatefull {

  private accounts = this.accountsLocalStorage.read().accounts || {};
  private accountsSubject = new BehaviorSubject<IUnauthenticatedAccount[]>(Object.values(this.accounts));
  accounts$ = this.accountsSubject.asObservable();

  constructor(
    private accountConverter: AccountConverter,
    private accountsLocalStorage: AccountsLocalStorage
  ) { }

  addAccount(npub: NPub, profile: NostrMetadata, ncryptsec: Ncryptsec, relays: NostrLocalConfigRelays): IUnauthenticatedAccount | null {
    const unauthenticated = this.accountConverter.convertProfileToAccount(npub, profile, ncryptsec, relays);
    if (!unauthenticated) {
      return null;
    }
    this.accounts[unauthenticated.npub] = unauthenticated
    this.update();
    return unauthenticated;
  }

  removeAccount(profile: IUnauthenticatedAccount): void {
    delete this.accounts[profile.npub];
    this.update();
  }

  private update(): void {
    this.accountsLocalStorage.patch({ accounts: this.accounts });
    this.accountsSubject.next(Object.values(this.accounts));
  }
}
