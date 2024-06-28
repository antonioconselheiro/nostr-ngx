import { Injectable } from '@angular/core';
import { AbstractStorage, TNcryptsec, TNostrSecret } from '@belomonte/nostr-ngx';
import { IAccountsLocalConfig } from './accounts-local-config.interface';
import { IUnauthenticatedUser } from '../../domain/unauthenticated-user.interface';
import { getPublicKey, nip19 } from 'nostr-tools';

@Injectable({
  providedIn: 'root'
})
export class AccountsLocalStorage extends AbstractStorage<IAccountsLocalConfig> {

  private readonly NOSTR_STORAGE_KEY = 'nostr';

  protected default: IAccountsLocalConfig = {
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

  addNewAccount(nsec: TNostrSecret, ncryptsec: TNcryptsec, displayName: string): void {
    const { data } = nip19.decode(nsec);
    const pubHex = getPublicKey(data);
    const npub = nip19.npubEncode(pubHex);
    const account: IUnauthenticatedUser = {
      displayName,
      ncryptsec,
      npub,
      picture: ''
    }

    this.addAccount(account);
  }

  addAccount(account: IUnauthenticatedUser): void {
    let { accounts } = this.read();
    if (!accounts) {
      accounts = {};
    }

    accounts[account.npub] = account;
    this.patch({ accounts });
  }
}
