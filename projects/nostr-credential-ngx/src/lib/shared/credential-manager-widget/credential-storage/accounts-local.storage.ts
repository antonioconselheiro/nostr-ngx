import { Injectable } from '@angular/core';
import { AbstractStorage } from '@belomonte/nostr-ngx';
import { INostrCredentialLocalConfig } from '../../../domain/nostr-credential-local-config.interface';

@Injectable({
  providedIn: 'root'
})
export class AccountsLocalStorage extends AbstractStorage<INostrCredentialLocalConfig> {

  private readonly NOSTR_STORAGE_KEY = 'nostr';

  protected default: INostrCredentialLocalConfig = {
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
