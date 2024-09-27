import { Injectable } from '@angular/core';
import { NostrLocalConfig } from './nostr-local-config.interface';
import { AbstractBrowserStorage } from './abstract-browser-storage';

@Injectable({
  providedIn: 'root'
})
export class ConfigsLocalStorage extends AbstractBrowserStorage<NostrLocalConfig> {

  private readonly NOSTR_STORAGE_KEY = 'nostr';

  protected default: NostrLocalConfig = {};

  protected getItem(): string | null {
    return localStorage.getItem(this.NOSTR_STORAGE_KEY);
  }

  protected setItem(serializedObject: string): void {
    localStorage.setItem(this.NOSTR_STORAGE_KEY, serializedObject);
  }

  override clear(): void {
    delete localStorage[this.NOSTR_STORAGE_KEY];
  }
}
