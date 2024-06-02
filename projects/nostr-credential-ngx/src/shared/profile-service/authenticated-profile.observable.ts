import { Injectable } from '@angular/core';
import { NostrConfigStorage, NostrConverter, TNcryptsec, TNostrPublic, TNostrSecret } from '@belomonte/nostr-ngx';
import { BehaviorSubject } from 'rxjs';
import { INostrCredentialSessionConfig } from '../../domain/nostr-credential-session-config.interface';
import { IProfile } from '../../domain/profile.interface';
import { IUnauthenticatedUser } from '../../domain/unauthenticated-user.interface';
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
    private nostrConfigStorage: NostrConfigStorage
  ) {
    const session = nostrConfigStorage.readSessionStorage<INostrCredentialSessionConfig>();
    const profile = session.sessionFrom === 'sessionStorage' && session.nsec && session.profile || null;

    super(profile)
  }

  getAuthProfile(): IProfile | null {
    return this.getValue();
  }

  authenticateWithNostrSecret(nsec: TNostrSecret, saveNostrSecretInSessionStorage = false): Promise<IProfile> {
    const user = this.nostrConverter.convertNostrSecretToPublic(nsec);
    this.nostrConfigStorage.clearSessionStorage();

    if (saveNostrSecretInSessionStorage) {
      this.nostrConfigStorage.patchSessionStorage({ nsec });
    }

    return this.loadProfile(user.npub);
  }

  authenticateAccount(account: IUnauthenticatedUser, pin: string, saveNostrSecretInSessionStorage = false): Promise<IProfile> {
    const nsec = this.accountConverter.decryptAccount(account, pin);
    const user = this.nostrConverter.convertNostrSecretToPublic(nsec);
    this.nostrConfigStorage.clearSessionStorage();
    this.nostrConfigStorage.patchSessionStorage({ ncryptsec: account.ncryptsec });

    if (saveNostrSecretInSessionStorage) {
      this.nostrConfigStorage.patchSessionStorage({ nsec });
    }

    return this.loadProfile(user.npub);
  }

  authenticateEncryptedEncode(ncryptsec: TNcryptsec, pin: string, saveNostrSecretInSessionStorage = false): Promise<IProfile> {
    const nsec = this.nostrConverter.decryptNcryptsec(ncryptsec, pin);
    const user = this.nostrConverter.convertNostrSecretToPublic(nsec);
    this.nostrConfigStorage.clearSessionStorage();
    this.nostrConfigStorage.patchSessionStorage({ ncryptsec });

    if (saveNostrSecretInSessionStorage) {
      this.nostrConfigStorage.patchSessionStorage({ nsec });
    }

    return this.loadProfile(user.npub);
  }

  private loadProfile(npub: TNostrPublic): Promise<IProfile> {
    return this.profileProxy
      .load(npub)
      .then(profile => {
        this.nostrConfigStorage.patchSessionStorage<INostrCredentialSessionConfig>({ profile });
        this.next(profile);

        return Promise.resolve(profile);
      });
  }

  logout(): void {
    this.next(null);
    sessionStorage.clear();
  }
}
