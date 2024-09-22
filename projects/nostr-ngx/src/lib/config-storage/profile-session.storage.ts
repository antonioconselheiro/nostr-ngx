import { Injectable } from '@angular/core';
import { AbstractBrowserStorage } from '../configs/abstract-browser-storage';
import { NostrSessionConfig } from '../configs/nostr-session-config.interface';

@Injectable({
  providedIn: 'root'
})
export class ProfileSessionStorage extends AbstractBrowserStorage<NostrSessionConfig> {

  private readonly NOSTR_STORAGE_KEY = 'nostr';

  protected default: NostrSessionConfig = {};

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
