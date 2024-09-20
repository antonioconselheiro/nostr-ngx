import { Injectable } from '@angular/core';
import { AccountsLocalConfig } from './accounts-local-config.interface';
import { IUnauthenticatedAccount } from '../domain/unauthenticated-account.interface';
import { getPublicKey, nip19 } from 'nostr-tools';
import { AbstractBrowserStorage } from '../configs/abstract-browser-storage';
import { Ncryptsec } from '../domain/ncryptsec.type';
import { NSec } from '../domain/nsec.type';
import { NostrUserRelays } from '../configs/nostr-user-relays.interface';

@Injectable({
  providedIn: 'root'
})
export class AccountsLocalStorage extends AbstractBrowserStorage<AccountsLocalConfig> {

  private readonly NOSTR_STORAGE_KEY = 'nostr';

  protected default: AccountsLocalConfig = {
    relayFrom: 'none'
  };

  protected getItem(): string | null {
    return localStorage.getItem(this.NOSTR_STORAGE_KEY);
  }

  protected setItem(serializedObject: string): void {
    localStorage.setItem(this.NOSTR_STORAGE_KEY, serializedObject);
  }

  override clear(): void {
    delete localStorage[this.NOSTR_STORAGE_KEY];
  }

  addNewAccount(nsec: NSec, ncryptsec: Ncryptsec, displayName: string, relays: NostrUserRelays): void {
    const { data } = nip19.decode(nsec);
    const pubkey = getPublicKey(data);
    const account: IUnauthenticatedAccount = {
      displayName,
      ncryptsec,
      pubkey,
      picture: '',
      relays
    }

    this.addAccount(account);
  }

  addAccount(account: IUnauthenticatedAccount): void {
    let { accounts } = this.read();
    if (!accounts) {
      accounts = {};
    }

    accounts[account.pubkey] = account;
    this.patch({ accounts });
  }
}
