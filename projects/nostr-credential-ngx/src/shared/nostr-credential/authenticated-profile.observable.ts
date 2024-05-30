import { Injectable } from '@angular/core';
import { NostrConfigStorage, NostrConverter, TNcryptsec, TNostrPublic, TNostrSecret } from '@belomonte/nostr-ngx';
import { BehaviorSubject } from 'rxjs';
import { INostrCredentialLocalConfig } from '../../domain/nostr-credential-local-config.interface';
import { INostrCredentialSessionConfig } from '../../domain/nostr-credential-session-config.interface';
import { IProfile } from '../../domain/profile.interface';
import { IUnauthenticatedUser } from '../../domain/unauthenticated-user';
import { AccountConverter } from '../profile-service/account.converter';
import { ProfileProxy } from '../profile-service/profile.proxy';

@Injectable()
export class AuthenticatedProfileObservable extends BehaviorSubject<IProfile | null> {

  static instance: AuthenticatedProfileObservable | null = null;
  
  accounts = this.nostrConfigStorage.readLocalStorage<INostrCredentialLocalConfig>().accounts || {};

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
