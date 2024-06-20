import { Injectable } from '@angular/core';
import { IProfileSessionConfig } from './profile-session-config.interface';
import { AbstractStorage } from '@belomonte/nostr-ngx';

@Injectable({
  providedIn: 'root'
})
export class ProfileSessionStorage extends AbstractStorage<IProfileSessionConfig> {

  private readonly NOSTR_STORAGE_KEY = 'nostr';

  protected default: IProfileSessionConfig = {
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
