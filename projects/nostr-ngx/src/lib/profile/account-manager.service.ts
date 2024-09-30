import { Inject, Injectable } from '@angular/core';
import { NostrMetadata } from '@nostrify/nostrify';
import { BehaviorSubject } from 'rxjs';
import { AccountsLocalStorage } from '../configs/accounts-local.storage';
import { NostrUserRelays } from '../configs/nostr-user-relays.interface';
import { Account } from '../domain/account.interface';
import { Ncryptsec } from '../domain/ncryptsec.type';
import { UnauthenticatedAccount } from '../domain/unauthenticated-account.interface';
import { nip19 } from 'nostr-tools';
import { NOSTR_CONFIG_TOKEN } from '../injection-token/nostr-config.token';
import { NostrConfig } from '../configs/nostr-config.interface';
import { ProfileSessionStorage } from '../configs/profile-session.storage';

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
    private accountsLocalStorage: AccountsLocalStorage,
    private profileSessionStorage: ProfileSessionStorage,
    @Inject(NOSTR_CONFIG_TOKEN) private nostrConfig: Required<NostrConfig>
  ) { }

  setCurrentAccount(account: Account): void {
    this.accountsLocalStorage.patch({ currentPubkey: account.pubkey });
    this.profileSessionStorage.patch({ account });
  }

  async addAccount(account: Account, ncryptsec: Ncryptsec): Promise<UnauthenticatedAccount | null> {
    const unauthenticated = this.accounts[account.pubkey] = { ...account, ncryptsec }
    this.update();

    return Promise.resolve(unauthenticated);
  }

  removeAccount(profile: Account): void {
    delete this.accounts[profile.pubkey];
    this.update();
  }

  /**
   * Create an account with all user information
   * 
   * @param pubkey user pubkey
   * @param profile user kind 0 metadata
   * @param relayPointer few relays where can found user relay list, this will be used to create nprofile
   * @param relays user full relay config
   */
  accountFactory(pubkey: string, profile: NostrMetadata | null, relayPointer: Array<WebSocket['url']>, relays: NostrUserRelays): Account;
  accountFactory(pubkey: string, profile: NostrMetadata | null, relayPointer: Array<WebSocket['url']>, relays: NostrUserRelays, ncryptsec: Ncryptsec): UnauthenticatedAccount;
  accountFactory(pubkey: string, profile: NostrMetadata | null, relayPointer: Array<WebSocket['url']>, relays: NostrUserRelays, ncryptsec?: Ncryptsec): Account {
    //  FIXME: should load picture and cast into base64
    const picture = profile && profile.picture || this.nostrConfig.defaultProfile.picture;
    const npub = nip19.npubEncode(pubkey);
    const nprofile = nip19.nprofileEncode({ pubkey, relays: relayPointer });
    const account: Account = {
      picture,
      ncryptsec,
      pubkey,
      npub,
      nprofile,
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
