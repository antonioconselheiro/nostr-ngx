import { Injectable } from '@angular/core';
import { NostrMetadata } from '@nostrify/nostrify';
import { BehaviorSubject } from 'rxjs';
import { AccountsLocalStorage } from '../config-storage/accounts-local.storage';
import { NostrUserRelays } from '../configs/nostr-user-relays.interface';
import { Account } from '../domain/account.interface';
import { Ncryptsec } from '../domain/ncryptsec.type';
import { UnauthenticatedAccount } from '../domain/unauthenticated-account.interface';
import { nip19 } from 'nostr-tools';

/**
 * manage account objects, manage the account list in localstorage and the current user account in sessionstorage
 */
@Injectable({
  providedIn: 'root'
})
export class AccountManagerService {

  private accounts = this.accountsLocalStorage.read().accounts || {};
  private accountsSubject = new BehaviorSubject<UnauthenticatedAccount[]>(Object.values(this.accounts));
  accounts$ = this.accountsSubject.asObservable();

  constructor(
    private accountsLocalStorage: AccountsLocalStorage
  ) { }

  async addAccount(account: Account, ncryptsec: Ncryptsec): Promise<UnauthenticatedAccount | null> {
    const unauthenticated = this.accounts[account.pubkey] = { ...account, ncryptsec }
    this.update();

    return Promise.resolve(unauthenticated);
  }

  removeAccount(profile: UnauthenticatedAccount): void {
    delete this.accounts[profile.pubkey];
    this.update();
  }

  accountFactory(pubkey: string, profile: NostrMetadata | null, relays: NostrUserRelays): Account;
  accountFactory(pubkey: string, profile: NostrMetadata | null, relays: NostrUserRelays, ncryptsec: Ncryptsec): UnauthenticatedAccount;
  accountFactory(pubkey: string, profile: NostrMetadata | null, relays: NostrUserRelays, ncryptsec?: Ncryptsec): Account {
    //  FIXME: should load picture and cast into base64
    // TODO: include a config to define a default image or a random image generator function
    const picture = profile && profile.picture || '';
    const npub = nip19.npubEncode(pubkey);
    const account: Account = {
      picture,
      ncryptsec,
      pubkey,
      npub,
      relays,
      //  FIXME: preciso fazer a validação do NIP05 aqui, preciso deixar no cache a validação
      isNip05Valid: false
    };

    return account;
  }

  private update(): void {
    this.accountsLocalStorage.patch({ accounts: this.accounts });
    this.accountsSubject.next(Object.values(this.accounts));
  }
}