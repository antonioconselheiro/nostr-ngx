import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AccountsLocalStorage } from '../configs/accounts-local.storage';
import { ProfileSessionStorage } from '../configs/profile-session.storage';
import { Account } from '../domain/account.interface';
import { Ncryptsec } from '../domain/ncryptsec.type';
import { NSec } from '../domain/nsec.type';
import { UnauthenticatedAccount } from '../domain/unauthenticated-account.interface';
import { NostrConverter } from '../nostr-utils/nostr.converter';
import { NSecCrypto } from '../nostr-utils/nsec.crypto';
import { NPoolRequestOptions } from '../pool/npool-request.options';
import { RelayPublicConfigService } from '../pool/relay-public-config.service';
import { NostrSigner } from './nostr.signer';
import { ProfileService } from './profile.service';
import { RelayConverter } from '../nostr-utils/relay.converter';

// TODO: this service must listen to account changing in signer and update it when it updates
@Injectable({
  providedIn: 'root'
})
export class CurrentAccountObservable extends BehaviorSubject<Account | null> {

  constructor(
    private nsecCrypto: NSecCrypto,
    private nostrSigner: NostrSigner,
    private profileService: ProfileService,
    private nostrConverter: NostrConverter,
    private relayConverter: RelayConverter,
    private relayPublicConfig: RelayPublicConfigService,
    private profileSessionStorage: ProfileSessionStorage,
    private accountLocalStorage: AccountsLocalStorage
  ) {
    const session = profileSessionStorage.read();
    let account: Account | null = null;
    if (session.account) {
      account = session.account;
    }

    super(account);
  }

  /**
   * @returns account of current authenticated user, return null if there is no user set in signer
   */
    async useExtension(opts?: NPoolRequestOptions): Promise<Account | null> {
      const pubkey = await this.nostrSigner.getPublicKey();
      this.accountLocalStorage.patch({
        currentPubkey: pubkey,
        signer: 'extension'
      });
  
      if (!pubkey) {
        return Promise.resolve(null);
      }

      const account = await this.profileService.getAccount(pubkey, opts);
      this.profileSessionStorage.patch({ account });
  
      return Promise.resolve(account);
    }

  authenticateAccount(account: UnauthenticatedAccount, password: string, saveNSecInSessionStorage = false): Promise<Account> {
    const nsec = this.nsecCrypto.decryptNcryptsec(account.ncryptsec, password);
    const user = this.nostrConverter.convertNsecToPublicKeys(nsec);
    this.profileSessionStorage.clear();
    this.profileSessionStorage.patch({ account });

    if (saveNSecInSessionStorage) {
      this.profileSessionStorage.patch({ nsec });
    }

    return this.updateCurrentProfile(user.pubkey);
  }

  authenticateWithNSec(nsec: NSec, saveNSecInSessionStorage = false): Promise<Account> {
    const user = this.nostrConverter.convertNsecToPublicKeys(nsec);
    this.profileSessionStorage.clear();

    if (saveNSecInSessionStorage) {
      this.profileSessionStorage.patch({ nsec });
    }

    return this.updateCurrentProfile(user.pubkey);
  }

  async authenticateWithNcryptsec(ncryptsec: Ncryptsec, password: string, saveNSecInSessionStorage = false): Promise<Account> {
    const nsec = this.nsecCrypto.decryptNcryptsec(ncryptsec, password);
    const user = this.nostrConverter.convertNsecToPublicKeys(nsec);
    const account = await this.updateCurrentProfile(user.pubkey);

    account.ncryptsec = ncryptsec;
    this.profileSessionStorage.clear();
    this.profileSessionStorage.save({ account });

    if (saveNSecInSessionStorage) {
      this.profileSessionStorage.patch({ nsec });
    }

    return Promise.resolve(account);
  }

  private async updateCurrentProfile(pubkey: string): Promise<Account> {
    const relays = await this.relayPublicConfig.loadCurrentUserRelays();
    const outbox = this.relayConverter.extractOutboxRelays(relays?.general || null)

    return this.profileService
      .getAccount(pubkey, {
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