import { Injectable } from '@angular/core';
import { INostrCredentialSessionConfig } from '../../../domain/nostr-credential-session-config.interface';
import { AbstractStorage } from '@belomonte/nostr-ngx';

@Injectable({
  providedIn: 'root'
})
export class ProfileSessionStorage extends AbstractStorage<INostrCredentialSessionConfig> {

  private readonly NOSTR_STORAGE_KEY = 'nostr';

  protected default: INostrCredentialSessionConfig = {
    sessionFrom: 'none'
  };

  override getItem(): string | null {
    return sessionStorage.getItem(this.NOSTR_STORAGE_KEY);
  }

  override setItem(serializedObject: string): void {
    sessionStorage.setItem(this.NOSTR_STORAGE_KEY, serializedObject);
  }

  override clear(): void {
    delete sessionStorage[this.NOSTR_STORAGE_KEY];
  }
}
