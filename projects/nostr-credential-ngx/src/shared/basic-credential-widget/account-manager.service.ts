import { Injectable } from '@angular/core';
import { IUnauthenticatedUser } from '../../domain/unauthenticated-user';
import { ProfileEncrypt } from '../profile-service/profile.encrypt';
import { BehaviorSubject } from 'rxjs';
import { IProfile } from '../../domain/profile.interface';

@Injectable({
  providedIn: 'root'
})
export class AccountManagerService {

  accounts: {
    [npub: string]: IUnauthenticatedUser
  } = JSON.parse(localStorage.getItem('AccountManagerService_accounts') || '{}');

  static instance: AccountManagerService | null = null;

  constructor(
    private profileEncrypt: ProfileEncrypt
  ) {
    if (!AccountManagerService.instance) {
      AccountManagerService.instance = this;
    }

    return AccountManagerService.instance;
  }

  private accountsSubject = new BehaviorSubject<IUnauthenticatedUser[]>(Object.values(this.accounts));
  accounts$ = this.accountsSubject.asObservable();

  // eslint-disable-next-line complexity
  addAccount(profile: IProfile, pin: string): IUnauthenticatedUser | null {
    const unauthenticated = this.profileEncrypt.encryptAccount(profile, pin);
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
    //  FIXME: criar um mecanismo que persita dados
    //  automaticamente em localStorage ou no storage local
    localStorage.setItem('AccountManagerService_accounts', JSON.stringify(this.accounts))
    this.accountsSubject.next(Object.values(this.accounts));
  }
}
