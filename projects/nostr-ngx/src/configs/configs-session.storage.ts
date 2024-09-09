import { Injectable } from '@angular/core';
import { NostrSessionConfig } from './nostr-session-config.interface';
import { AbstractBrowserStorage } from './abstract-browser-storage';

@Injectable({
  providedIn: 'root'
})
export class ConfigsSessionStorage extends AbstractBrowserStorage<NostrSessionConfig> {

  private readonly NOSTR_STORAGE_KEY = 'nostr';

  protected default: NostrSessionConfig = {
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
