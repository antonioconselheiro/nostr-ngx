import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AccountsLocalStorage } from '../../../../nostr-gui-ngx/src/lib/credential-manager-widget/credential-storage/accounts-local.storage';
import { IUnauthenticatedAccount } from '../../../../nostr-gui-ngx/src/lib/domain/unauthenticated-account.interface';
import { AccountConverter } from './account.converter';
import { NostrMetadata } from '@nostrify/nostrify';
import { NostrLocalConfigRelays } from '../configs/nostr-local-config-relays.interface';
import { Ncryptsec } from '../domain/ncryptsec.type';
import { NPub } from '../domain/npub.type';

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
