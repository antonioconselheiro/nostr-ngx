import { Injectable } from '@angular/core';
import { IUnauthenticatedUser } from '../../domain/unauthenticated-user.interface';
import { AccountConverter } from './account.converter';
import { BehaviorSubject } from 'rxjs';
import { IProfile } from '../../domain/profile.interface';
import { NostrConfigStorage, TNcryptsec } from '@belomonte/nostr-ngx';
import { INostrCredentialLocalConfig } from '../../domain/nostr-credential-local-config.interface';

@Injectable({
  providedIn: 'root'
})
export class AccountManagerStatefull {

  private accounts = this.nostrConfigStorage.readLocalStorage<INostrCredentialLocalConfig>().accounts || {};
  private accountsSubject = new BehaviorSubject<IUnauthenticatedUser[]>(Object.values(this.accounts));
  accounts$ = this.accountsSubject.asObservable();

  constructor(
    private accountConverter: AccountConverter,
    private nostrConfigStorage: NostrConfigStorage
  ) { }

  addAccount(profile: IProfile, ncryptsec: TNcryptsec): IUnauthenticatedUser | null {
    const unauthenticated = this.accountConverter.convertProfileToAccount(profile, ncryptsec);
    if (!unauthenticated) {
      return null;
    }
    this.accounts[unauthenticated.npub] = unauthenticated
    this.update();
    return unauthenticated;
  }

  removeAccount(profile: IUnauthenticatedUser): void {
    delete this.accounts[profile.npub];
    this.update();
  }

  private update(): void {
    this.nostrConfigStorage.patchLocalStorage<INostrCredentialLocalConfig>({ accounts: this.accounts });
    this.accountsSubject.next(Object.values(this.accounts));
  }
}
