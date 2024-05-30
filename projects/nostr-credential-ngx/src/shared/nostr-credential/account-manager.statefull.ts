import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IUnauthenticatedUser } from '../../domain/unauthenticated-user';

@Injectable({
  providedIn: 'root'
})
export class AccountManagerStatefull {

  private readonly storageKey = 'AccountManagerStatefull_accounts';

  accounts: Record<string, IUnauthenticatedUser> = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
  private accountsSubject = new BehaviorSubject<IUnauthenticatedUser[]>(Object.values(this.accounts));
  accounts$ = this.accountsSubject.asObservable();

  static instance: AccountManagerStatefull | null = null;
  
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
