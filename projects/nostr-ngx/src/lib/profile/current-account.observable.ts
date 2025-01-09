import { Injectable } from '@angular/core';
import { Ncryptsec, NSec } from 'nostr-tools/nip19';
import { BehaviorSubject } from 'rxjs';
import { AccountsLocalStorage } from '../configs/accounts-local.storage';
import { ProfileSessionStorage } from '../configs/profile-session.storage';
import { AccountAuthenticable } from '../domain/account/account-authenticable.interface';
import { AccountSession } from '../domain/account/account-session.interface';
import { Account } from '../domain/account/account.interface';
import { HexString } from '../domain/event/primitive/hex-string.type';
import { NostrConverter } from '../nostr-utils/nostr.converter';
import { NSecCrypto } from '../nostr-utils/nsec.crypto';
import { RelayConverter } from '../nostr-utils/relay.converter';
import { AccountFactory } from './account.factory';
import { NostrSigner } from './nostr.signer';
import { ProfileProxy } from './profile.proxy';

// TODO: this service must listen to account changing in signer and update it when it updates
@Injectable({
  providedIn: 'root'
})
export class CurrentAccountObservable extends BehaviorSubject<AccountSession | null> {

  constructor(
    private nsecCrypto: NSecCrypto,
    private nostrSigner: NostrSigner,
    private profileService: ProfileProxy,
    private nostrConverter: NostrConverter,
    private relayConverter: RelayConverter,
    private accountFactory: AccountFactory,
    private profileSessionStorage: ProfileSessionStorage,
    private accountLocalStorage: AccountsLocalStorage
  ) {
    const session = profileSessionStorage.read();
    let account: AccountSession | null = null;
    if (session.account) {
      account = session.account;
    }

    super(account);
  }

  /**
   * @returns account of current authenticated user, return null if there is no user set in signer
   */
  async useExtension(): Promise<Account | null> {
    const pubkey = await this.nostrSigner.getPublicKey();
    this.accountLocalStorage.patch({
      signer: 'extension'
    });

    if (!pubkey) {
      return Promise.resolve(null);
    }

    return this.loadCurrentProfile(pubkey);
  }

  authenticateAccount(account: AccountAuthenticable, password: string, saveNSecInSessionStorage = false): AccountSession {
    const nsec = this.nsecCrypto.decryptNcryptsec(account.ncryptsec, password);
    this.profileSessionStorage.clear();
    this.profileSessionStorage.patch({ account });

    if (saveNSecInSessionStorage) {
      this.profileSessionStorage.patch({ nsec });
    }

    return account;
  }

  authenticateWithNSec(nsec: NSec, saveNSecInSessionStorage = false): Promise<AccountSession> {
    const user = this.nostrConverter.convertNSecToPublicKeys(nsec);
    this.profileSessionStorage.clear();

    if (saveNSecInSessionStorage) {
      this.profileSessionStorage.patch({ nsec });
    }

    return this.loadCurrentProfile(user.pubkey);
  }

  async authenticateWithNcryptsec(ncryptsec: Ncryptsec, password: string, saveNSecInSessionStorage = false): Promise<AccountSession> {
    const nsec = this.nsecCrypto.decryptNcryptsec(ncryptsec, password);
    const user = this.nostrConverter.convertNSecToPublicKeys(nsec);
    const account = await this.loadCurrentProfile(user.pubkey, ncryptsec);

    this.profileSessionStorage.clear();
    this.profileSessionStorage.save({ account });

    if (saveNSecInSessionStorage) {
      this.profileSessionStorage.patch({ nsec });
    }

    return Promise.resolve(account);
  }

  private async loadCurrentProfile(pubkey: HexString, ncryptsec?: Ncryptsec): Promise<AccountSession> {
    let account: AccountSession = await this.profileService.loadAccount(pubkey, 'complete');
    const accountRelays = account.relays.general || null;
    const outbox = this.relayConverter.extractOutboxRelays(accountRelays);

    if (ncryptsec) {
      account = this.accountFactory.accountAuthenticableFactory(account, ncryptsec);
    }

    /**
     * FIXME: first load account data with client, then now I load it again loaded relays.
     * I must find a way to be sure I'm looking to the latest updated data.
     */
    return this.profileService
      .loadAccount(pubkey, 'complete', {
        include: outbox
      })
      .then((account) => {
        this.profileSessionStorage.save({ account });
        this.next(account);

        return Promise.resolve(account);
      });
  }

  logout(): void {
    this.next(null);
    sessionStorage.clear();
  }
}
