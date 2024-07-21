import { Injectable } from '@angular/core';
import { NostrSecretCrypto, NostrConverter, TNcryptsec, TNostrPublic, TNostrSecret } from '@belomonte/nostr-ngx';
import { BehaviorSubject } from 'rxjs';
import { IProfile } from '../domain/profile.interface';
import { IUnauthenticatedUser } from '../domain/unauthenticated-user.interface';
import { ProfileSessionStorage } from '../credential-manager-widget/credential-storage/profile-session.storage';
import { AccountConverter } from './account.converter';
import { ProfileProxy } from './profile.proxy';

@Injectable({
  providedIn: 'root'
})
export class AuthenticatedProfileObservable extends BehaviorSubject<IProfile | null> {
 
  constructor(
    private profileProxy: ProfileProxy,
    private accountConverter: AccountConverter,
    private nostrConverter: NostrConverter,
    private nostrSecretCrypto: NostrSecretCrypto,
    private sessionConfigs: ProfileSessionStorage
  ) {
    const session = sessionConfigs.read();
    const profile = session.sessionFrom === 'sessionStorage' && session.nsec && session.profile || null;

    super(profile)
  }

  getAuthProfile(): IProfile | null {
    return this.getValue();
  }

  authenticateWithNostrSecret(nsec: TNostrSecret, saveNostrSecretInSessionStorage = false): Promise<IProfile> {
    const user = this.nostrConverter.convertNsecToNpub(nsec);
    this.sessionConfigs.clear();

    if (saveNostrSecretInSessionStorage) {
      this.sessionConfigs.patch({ nsec });
    }

    return this.loadProfile(user.npub);
  }

  authenticateAccount(account: IUnauthenticatedUser, password: string, saveNostrSecretInSessionStorage = false): Promise<IProfile> {
    const nsec = this.accountConverter.decryptAccount(account, password);
    const user = this.nostrConverter.convertNsecToNpub(nsec);
    this.sessionConfigs.clear();
    this.sessionConfigs.patch({ ncryptsec: account.ncryptsec });

    if (saveNostrSecretInSessionStorage) {
      this.sessionConfigs.patch({ nsec });
    }

    return this.loadProfile(user.npub);
  }

  authenticateEncryptedEncode(ncryptsec: TNcryptsec, password: string, saveNostrSecretInSessionStorage = false): Promise<IProfile> {
    const nsec = this.nostrSecretCrypto.decryptNcryptsec(ncryptsec, password);
    const user = this.nostrConverter.convertNsecToNpub(nsec);
    this.sessionConfigs.clear();
    this.sessionConfigs.patch({ ncryptsec });

    if (saveNostrSecretInSessionStorage) {
      this.sessionConfigs.patch({ nsec });
    }

    return this.loadProfile(user.npub);
  }

  private loadProfile(npub: TNostrPublic): Promise<IProfile> {
    return this.profileProxy
      .load(npub)
      .then(profile => {
        this.sessionConfigs.patch({ profile });
        this.next(profile);

        return Promise.resolve(profile);
      });
  }

  logout(): void {
    this.next(null);
    sessionStorage.clear();
  }
}
