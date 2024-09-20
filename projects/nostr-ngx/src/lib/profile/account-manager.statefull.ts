import { Injectable } from '@angular/core';
import { NostrEvent, NostrMetadata } from '@nostrify/nostrify';
import { BehaviorSubject } from 'rxjs';
import { AccountsLocalStorage } from '../credential-storage/accounts-local.storage';
import { Ncryptsec } from '../domain/ncryptsec.type';
import { IUnauthenticatedAccount } from '../domain/unauthenticated-account.interface';
import { RelayConverter } from '../nostr/relay.converter';
import { AccountConverter } from './account.converter';

@Injectable({
  providedIn: 'root'
})
export class AccountManagerStatefull {

  private accounts = this.accountsLocalStorage.read().accounts || {};
  private accountsSubject = new BehaviorSubject<IUnauthenticatedAccount[]>(Object.values(this.accounts));
  accounts$ = this.accountsSubject.asObservable();

  constructor(
    private accountConverter: AccountConverter,
    private accountsLocalStorage: AccountsLocalStorage,
    private relayConverter: RelayConverter
  ) { }

  addAccount(pubkey: string, profile: NostrMetadata | null, ncryptsec: Ncryptsec, relays: Array<NostrEvent>): IUnauthenticatedAccount | null {
    const relayConfigRecord = this.relayConverter.convertEventsToRelayConfig(relays);
    const unauthenticated = this.accountConverter.convertProfileToAccount(pubkey, profile, ncryptsec, relayConfigRecord[pubkey]);
    if (!unauthenticated) {
      return null;
    }
    this.accounts[unauthenticated.pubkey] = unauthenticated
    this.update();
    return unauthenticated;
  }

  removeAccount(profile: IUnauthenticatedAccount): void {
    delete this.accounts[profile.pubkey];
    this.update();
  }

  private update(): void {
    this.accountsLocalStorage.patch({ accounts: this.accounts });
    this.accountsSubject.next(Object.values(this.accounts));
  }
}
