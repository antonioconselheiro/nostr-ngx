import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IUnauthenticatedUser } from '../../domain/unauthenticated-user';
import { AccountConverter } from '../profile-service/account.converter';
import { IProfile } from '../../domain/profile.interface';

@Injectable()
export class AccountManagerStatefull {

  private readonly storageKey = 'AccountManagerStatefull_accounts';

  accounts: {
    [npub: string]: IUnauthenticatedUser
  } = JSON.parse(localStorage.getItem(this.storageKey) || '{}');

  static instance: AccountManagerStatefull | null = null;

  constructor(
    private profileEncrypt: AccountConverter
  ) {
    if (!AccountManagerStatefull.instance) {
      AccountManagerStatefull.instance = this;
    }

    return AccountManagerStatefull.instance;
  }

  private accountsSubject = new BehaviorSubject<IUnauthenticatedUser[]>(Object.values(this.accounts));
  accounts$ = this.accountsSubject.asObservable();

  createAccount(profile: IProfile, pin: string): IUnauthenticatedUser & { nsecEncrypted: string };
  createAccount(profile: IProfile, pin?: string | void | null): IUnauthenticatedUser | IUnauthenticatedUser & { nsecEncrypted: string } | null;
  createAccount(profile: IProfile, pin?: string | void | null): IUnauthenticatedUser | IUnauthenticatedUser & { nsecEncrypted: string } | null {
    const unauthenticated = this.profileEncrypt.encryptAccount(profile, pin);
    if (!unauthenticated) {
      return null;
    }
    return unauthenticated;
  }
  
  addAccount(unauthenticated: IUnauthenticatedUser): void {
    this.accounts[unauthenticated.npub] = unauthenticated
    this.update();
  }

  removeAccount(profile: IUnauthenticatedUser): void {
    delete this.accounts[profile.npub];
    this.update();
  }

  private update(): void {
    //  FIXME: criar um mecanismo para acessar storage?
    localStorage.setItem(this.storageKey, JSON.stringify(this.accounts))
    this.accountsSubject.next(Object.values(this.accounts));
  }
}
