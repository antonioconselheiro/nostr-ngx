import { Injectable } from '@angular/core';
import { INostrLocalConfig } from './nostr-local-config.interface';
import { AbstractStorage } from './abstract-storage';

@Injectable({
  providedIn: 'root'
})
export class ConfigsLocalStorage extends AbstractStorage<INostrLocalConfig> {

  private readonly NOSTR_STORAGE_KEY = 'nostr';

  protected default: INostrLocalConfig = {
    relayFrom: 'none'
  };

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
