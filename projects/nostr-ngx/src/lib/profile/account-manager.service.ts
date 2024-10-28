import { Inject, Injectable } from '@angular/core';
import { nip19 } from 'nostr-tools';
import { BehaviorSubject } from 'rxjs';
import { AccountsLocalStorage } from '../configs/accounts-local.storage';
import { NostrConfig } from '../configs/nostr-config.interface';
import { NostrUserRelays } from '../configs/nostr-user-relays.interface';
import { ProfileSessionStorage } from '../configs/profile-session.storage';
import { Account } from '../domain/account.interface';
import { UnauthenticatedAccount } from '../domain/unauthenticated-account.interface';
import { NOSTR_CONFIG_TOKEN } from '../injection-token/nostr-config.token';
import { RelayConverter } from '../nostr-utils/relay.converter';
import { AccountResultset } from './account-resultset.type';
import { NostrMetadata } from '@nostrify/nostrify';
import { Ncryptsec } from 'nostr-tools/nip19';
import { HexString } from '../domain/event/primitive/hex-string.type';

/**
 * manage account objects, manage the account list in localstorage
 */
@Injectable({
  providedIn: 'root'
})
export class AccountManagerService {

  private accounts = this.accountsLocalStorage.read().accounts || {};
  private accountsSubject = new BehaviorSubject<UnauthenticatedAccount[]>(Object.values(this.accounts));
  accounts$ = this.accountsSubject.asObservable();

  constructor(
    private relayConverter: RelayConverter,
    private accountsLocalStorage: AccountsLocalStorage,
    private profileSessionStorage: ProfileSessionStorage,
    @Inject(NOSTR_CONFIG_TOKEN) private nostrConfig: Required<NostrConfig>
  ) { }

  setCurrentAccount(account: Account): void {
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
   * Create an account with user prefetched content
   */
  accountFactory(pubkey: HexString, resultset: AccountResultset | null, relays: NostrUserRelays): Promise<Account>;
  accountFactory(pubkey: HexString, resultset: AccountResultset | null, relays: NostrUserRelays, ncryptsec: Ncryptsec): Promise<UnauthenticatedAccount>;
  //  FIXME:
  // eslint-disable-next-line complexity 
  async accountFactory(pubkey: HexString, resultset: AccountResultset | null, relays: NostrUserRelays, ncryptsec?: Ncryptsec): Promise<Account> {

    let picture = this.nostrConfig.defaultProfile.picture,
      metadata: NostrMetadata | null = null,
      relayPointer: string[] = [],
      isNip05Valid = false;

    if (resultset) {
      if (resultset.metadata) {
        metadata = resultset.metadata;
        if (resultset.metadata.picture) {
          picture = resultset.metadata.picture;
        }

        if (resultset.nip05) {
          relayPointer = resultset.nip05.relays || [];
          isNip05Valid = !!relayPointer.length;
        }
      }
    }

    relayPointer = relayPointer.length ? relayPointer : this.relayConverter.extractOutboxRelays(relays).splice(0, 3);

    const npub = nip19.npubEncode(pubkey);
    const nprofile = nip19.nprofileEncode({ pubkey, relays: relayPointer });
    const account: Account = {
      ncryptsec,
      nprofile,
      metadata,
      picture,
      relays,
      pubkey,
      npub,
      isNip05Valid
    };

    return account;
  }

  async loadProfilePictureAsBase64(url: string): Promise<string> {
    //  FIXME: must use user configured image proxy
    const response = await fetch('https://imgproxy.iris.to/insecure/plain/' + url);
    if (!response.ok) {
      return Promise.reject(response);
    }

    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const maxSize = 64;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const base64Image = canvas.toDataURL('image/png');
          resolve(base64Image);
        }
      };

      img.onerror = (e) => reject(e);
      img.src = imageUrl;
    });
  }

  private update(): void {
    this.accountsLocalStorage.patch({ accounts: this.accounts });
    this.accountsSubject.next(Object.values(this.accounts));
  }
}
