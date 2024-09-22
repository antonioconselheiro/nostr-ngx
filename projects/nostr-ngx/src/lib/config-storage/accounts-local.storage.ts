import { Injectable } from '@angular/core';
import { NostrMetadata } from '@nostrify/nostrify';
import { getPublicKey, nip19 } from 'nostr-tools';
import { AbstractBrowserStorage } from '../configs/abstract-browser-storage';
import { NostrLocalConfig } from '../configs/nostr-local-config.interface';
import { NostrUserRelays } from '../configs/nostr-user-relays.interface';
import { Ncryptsec } from '../domain/ncryptsec.type';
import { NSec } from '../domain/nsec.type';
import { UnauthenticatedAccount } from '../domain/unauthenticated-account.interface';
import { appConfig } from './app.config';

@Injectable({
  providedIn: 'root'
})
export class AccountsLocalStorage extends AbstractBrowserStorage<NostrLocalConfig> {

  private readonly NOSTR_STORAGE_KEY = 'nostr';

  protected default: NostrLocalConfig = {
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

  addNewAccount(nsec: NSec, ncryptsec: Ncryptsec, relays: NostrUserRelays, metadata?: NostrMetadata): void {
    const { data } = nip19.decode(nsec);
    const pubkey = getPublicKey(data);
    const npub = nip19.npubEncode(pubkey);

    const account: UnauthenticatedAccount = {
      metadata,
      ncryptsec,
      pubkey,
      npub,
      picture: appConfig.defaultProfile.picture,
      //  Nip05 precisa ser validado aqui e sua validação precisa ficar em cache
      isNip05Valid: false,
      relays
    }

    this.addAccount(account);
  }

  addAccount(account: UnauthenticatedAccount): void {
    let { accounts } = this.read();
    if (!accounts) {
      accounts = {};
    }

    accounts[account.pubkey] = account;
    this.patch({ accounts });
  }
}
