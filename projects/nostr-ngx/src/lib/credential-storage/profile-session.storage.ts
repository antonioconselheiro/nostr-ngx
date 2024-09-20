import { Injectable } from '@angular/core';
import { ProfileSessionConfig } from './profile-session-config.interface';
import { AbstractBrowserStorage } from '../configs/abstract-browser-storage';

@Injectable({
  providedIn: 'root'
})
export class ProfileSessionStorage extends AbstractBrowserStorage<ProfileSessionConfig> {

  private readonly NOSTR_STORAGE_KEY = 'nostr';

  protected default: ProfileSessionConfig = {
    sessionFrom: 'none'
  };

  protected getItem(): string | null {
    return sessionStorage.getItem(this.NOSTR_STORAGE_KEY);
  }

  protected setItem(serializedObject: string): void {
    sessionStorage.setItem(this.NOSTR_STORAGE_KEY, serializedObject);
  }

  override clear(): void {
    delete sessionStorage[this.NOSTR_STORAGE_KEY];
  }
}
