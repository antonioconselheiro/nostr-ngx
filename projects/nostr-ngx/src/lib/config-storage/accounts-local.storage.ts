import { Inject, Injectable } from '@angular/core';
import { NostrMetadata } from '@nostrify/nostrify';
import { getPublicKey, nip19 } from 'nostr-tools';
import { AbstractBrowserStorage } from '../configs/abstract-browser-storage';
import { NostrConfig } from '../configs/nostr-config.interface';
import { NostrLocalConfig } from '../configs/nostr-local-config.interface';
import { NostrUserRelays } from '../configs/nostr-user-relays.interface';
import { Ncryptsec } from '../domain/ncryptsec.type';
import { NSec } from '../domain/nsec.type';
import { UnauthenticatedAccount } from '../domain/unauthenticated-account.interface';
import { NOSTR_CONFIG_TOKEN } from '../injection-token/nostr-config.token';

@Injectable({
  providedIn: 'root'
})
export class AccountsLocalStorage extends AbstractBrowserStorage<NostrLocalConfig> {

  private readonly NOSTR_STORAGE_KEY = 'nostr';

  protected default: NostrLocalConfig = {};

  constructor(
    @Inject(NOSTR_CONFIG_TOKEN) private nostrConfig: Required<NostrConfig>
  ) {
    super();
  }

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
      picture: this.nostrConfig.defaultProfile.picture,
      //  TODO: Nip05 precisa ser validado aqui e sua validação precisa ficar em cache
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
