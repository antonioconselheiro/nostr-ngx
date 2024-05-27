import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IProfile } from '../../domain/profile.interface';
import { IUnauthenticatedUser } from '../../domain/unauthenticated-user';
import { ProfileProxy } from '../profile-service/profile.proxy';
import { AccountConverter } from '../profile-service/account.converter';
import { NostrConfigStorage, TNostrPublic } from '@belomonte/nostr-ngx';
import { INostrCredentialLocalConfig } from '../../domain/nostr-credential-local-config.interface';
import { INostrCredentialSessionConfig } from '../../domain/nostr-credential-session-config.interface';

@Injectable()
export class AuthenticatedProfileObservable extends BehaviorSubject<IProfile | null> {

  static instance: AuthenticatedProfileObservable | null = null;
  
  accounts: Record<string, IUnauthenticatedUser> = this.nostrConfigStorage.readLocalStorage<INostrCredentialLocalConfig>().accounts || {};

  constructor(
    private profileProxy: ProfileProxy,
    private accountConverter: AccountConverter,
    private nostrConfigStorage: NostrConfigStorage
  ) {
    const session = nostrConfigStorage.readSessionStorage<INostrCredentialSessionConfig>();
    const profile = session.sessionFrom === 'sessionStorage' && session.nsec && session.profile || null;

    super(profile)
  }

  getAuthProfile(): IProfile | null {
    return this.getValue();
  }

  authenticateWithNostrSecret(nsec: string): Promise<IProfile> {
    return this.loadProfile(NostrUser.fromNostrSecret(nsec));
  }

  authenticateAccount(account: IUnauthenticatedUser, pin: string): Promise<IProfile> {
    const user = this.accountConverter.decryptAccount(account, pin);
    return this.loadProfile(user);
  }

  authenticateEncryptedEncode(ncryptsec: string, pin: string): Promise<IProfile> {
    const nsec = this.accountConverter.decryptNcryptsec(ncryptsec, pin);
    return this.loadProfile(NostrUser.fromNostrSecret(nsec));
  }

  private loadProfile(npub: TNostrPublic): Promise<IProfile> {
    return this.profileProxy
      .load(npub)
      .then(profile => {
        this.next(profile);
        sessionStorage.setItem('ProfilesObservable_auth', JSON.stringify(profile));
        return Promise.resolve(profile);
      });
  }

  logout(): void {
    this.next(null);
    sessionStorage.clear();
  }
}
