import { Injectable } from '@angular/core';
import { AbstractStorage } from '@belomonte/nostr-ngx';
import { IAccountsLocalConfig } from './accounts-local-config.interface';

@Injectable({
  providedIn: 'root'
})
export class AccountsLocalStorage extends AbstractStorage<IAccountsLocalConfig> {

  private readonly NOSTR_STORAGE_KEY = 'nostr';

  protected default: IAccountsLocalConfig = {
    relayFrom: 'none'
  };

  override getItem(): string | null {
    return localStorage.getItem(this.NOSTR_STORAGE_KEY);
  }

  override setItem(serializedObject: string): void {
    localStorage.setItem(this.NOSTR_STORAGE_KEY, serializedObject);
  }

  override clear(): void {
    delete localStorage[this.NOSTR_STORAGE_KEY];
  }
}
