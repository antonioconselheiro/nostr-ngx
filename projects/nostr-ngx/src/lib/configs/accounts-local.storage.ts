import { Injectable } from '@angular/core';
import { AccountAuthenticable } from '../domain/account/account-authenticable.interface';
import { AbstractBrowserStorage } from './abstract-browser-storage';
import { NostrLocalConfig } from './nostr-local-config.interface';

@Injectable({
  providedIn: 'root'
})
export class AccountsLocalStorage extends AbstractBrowserStorage<NostrLocalConfig> {

  private readonly nostrStorageKey = 'nostr';

  protected default: NostrLocalConfig = {};

  protected getItem(): string | null {
    return localStorage.getItem(this.nostrStorageKey);
  }

  protected setItem(serializedObject: string): void {
    localStorage.setItem(this.nostrStorageKey, serializedObject);
  }

  override clear(): void {
    delete localStorage[this.nostrStorageKey];
  }

  accounts(): number {
    return Object.keys(this.read().accounts || {}).length;
  }

  addAccount(account: AccountAuthenticable): AccountAuthenticable {
    let { accounts } = this.read();
    if (!accounts) {
      accounts = {};
    }

    accounts[account.pubkey] = account;
    this.patch({ accounts });
    return account;
  }
}
