import { Injectable } from '@angular/core';
import { AbstractBrowserStorage, Ncryptsec, NostrLocalConfigRelays, NSec } from '@belomonte/nostr-ngx';
import { AccountsLocalConfig } from './accounts-local-config.interface';
import { IUnauthenticatedAccount } from '../../domain/unauthenticated-account.interface';
import { getPublicKey, nip19 } from 'nostr-tools';

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

  addNewAccount(nsec: NSec, ncryptsec: Ncryptsec, displayName: string, relays: NostrLocalConfigRelays): void {
    const { data } = nip19.decode(nsec);
    const pubkey = getPublicKey(data);
    const npub = nip19.npubEncode(pubkey);
    const account: IUnauthenticatedAccount = {
      displayName,
      ncryptsec,
      npub,
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

    accounts[account.npub] = account;
    this.patch({ accounts });
  }
}
