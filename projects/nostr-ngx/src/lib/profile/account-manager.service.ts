import { Injectable } from '@angular/core';
import { Ncryptsec } from 'nostr-tools/nip19';
import { BehaviorSubject } from 'rxjs';
import { AccountsLocalStorage } from '../configs/accounts-local.storage';
import { ProfileSessionStorage } from '../configs/profile-session.storage';
import { AccountAuthenticable } from '../domain/account/account-authenticable.interface';
import { AccountComplete } from '../domain/account/account-complete.interface';
import { AccountSession } from '../domain/account/compose/account-session.type';
import { Account } from '../domain/account/compose/account.interface';
import { AccountFactory } from './account.factory';

/**
 * manage account objects, manage the account list in localstorage
 */
@Injectable({
  providedIn: 'root'
})
export class AccountManagerService {

  private accounts = this.accountsLocalStorage.read().accounts || {};
  private accountsSubject = new BehaviorSubject<AccountAuthenticable[]>(Object.values(this.accounts));
  accounts$ = this.accountsSubject.asObservable();

  constructor(
    private accountFactory: AccountFactory,
    private accountsLocalStorage: AccountsLocalStorage,
    private profileSessionStorage: ProfileSessionStorage
  ) { }

  setCurrentAccount(account: AccountComplete): void {
    this.profileSessionStorage.patch({ account });
  }

  async addAccount(account: AccountSession, ncryptsec: Ncryptsec): Promise<AccountAuthenticable | null> {
    const authenticable = this.accountFactory.accountAuthenticableFactory(account, ncryptsec);
    this.accounts[account.pubkey] = authenticable;
    this.update();

    return Promise.resolve(authenticable);
  }

  removeAccount(profile: Account): void {
    delete this.accounts[profile.pubkey];
    this.update();
  }

  async loadProfilePictureAsBase64(url: string): Promise<string> {
    //  FIXME: must use user configured image proxy
    const response = await fetch('https://imgproxy.iris.to/insecure/plain/' + url);
    if (!response.ok) {
      return Promise.reject(response);
    }

    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const maxSize = 64;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const base64Image = canvas.toDataURL('image/png');
          resolve(base64Image);
        }
      };

      img.onerror = (e) => reject(e);
      img.src = imageUrl;
    });
  }

  private update(): void {
    this.accountsLocalStorage.patch({ accounts: this.accounts });
    this.accountsSubject.next(Object.values(this.accounts));
  }
}
