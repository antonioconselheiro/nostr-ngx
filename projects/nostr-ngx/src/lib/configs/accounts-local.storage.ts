import { Inject, Injectable } from '@angular/core';
import { NostrMetadata } from '@nostrify/nostrify';
import { getPublicKey, nip19 } from 'nostr-tools';
import { AbstractBrowserStorage } from './abstract-browser-storage';
import { NostrConfig } from './nostr-config.interface';
import { NostrLocalConfig } from './nostr-local-config.interface';
import { NostrUserRelays } from './nostr-user-relays.interface';
import { Ncryptsec } from '../domain/ncryptsec.type';
import { NSec } from '../domain/nsec.type';
import { UnauthenticatedAccount } from '../domain/unauthenticated-account.interface';
import { NOSTR_CONFIG_TOKEN } from '../injection-token/nostr-config.token';
import { RelayConverter } from '../nostr-utils/relay.converter';
import { ProfilePointer } from 'nostr-tools/nip19';

@Injectable({
  providedIn: 'root'
})
export class AccountsLocalStorage extends AbstractBrowserStorage<NostrLocalConfig> {

  private readonly NOSTR_STORAGE_KEY = 'nostr';

  protected default: NostrLocalConfig = {};

  constructor(
    private relayConverter: RelayConverter,
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

  addNewAccount(nsec: NSec, ncryptsec: Ncryptsec, relays: NostrUserRelays, metadata: NostrMetadata | null): UnauthenticatedAccount {
    const { data } = nip19.decode(nsec);
    const pubkey = getPublicKey(data);
    const npub = nip19.npubEncode(pubkey);
    const pointerRelays = this.relayConverter.extractOutboxRelays(relays).splice(0, 2);
    const pointer: ProfilePointer = { pubkey, relays: pointerRelays };
    const nprofile = nip19.nprofileEncode(pointer);

    const account: UnauthenticatedAccount = {
      metadata,
      ncryptsec,
      pubkey,
      npub,
      nprofile,
      picture: this.nostrConfig.defaultProfile.picture,
      //  TODO: Nip05 precisa ser validado aqui e sua validação precisa ficar em cache
      isNip05Valid: false,
      relays
    }

    this.addAccount(account);
    return account;
  }

  addAccount(account: UnauthenticatedAccount): UnauthenticatedAccount {
    let { accounts } = this.read();
    if (!accounts) {
      accounts = {};
    }

    accounts[account.pubkey] = account;
    this.patch({ accounts });
    return account;
  }
}
