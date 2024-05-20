import { Injectable } from '@angular/core';
import { INostrSessionConfig } from '../../domain/nostr-session-config.interface';
import { INostrLocalConfig } from '../../domain/nostr-local-config.interface';

@Injectable({
  providedIn: 'root'
})
export class NostrConfigStorage {

  readonly NOSTR_STORAGE_KEY = 'nostr';

  defaultLocal: INostrLocalConfig = {
    relayFrom: 'none'
  };

  defaultSession: INostrSessionConfig = {
    sessionFrom: 'none'
  };

  readLocalStorage<T extends INostrLocalConfig = INostrLocalConfig>(): T {
    const data = localStorage.getItem(this.NOSTR_STORAGE_KEY);
    if (data) {
      try {
        return JSON.parse(data) satisfies T;
      } catch (e) {
        console.error('invalid JSON found in localStorage', e);
        return this.defaultLocal as T;
      }
    }

    return this.defaultLocal as T;
  }

  saveLocalStorage<T extends INostrLocalConfig = INostrLocalConfig>(configs: T): void {
    localStorage.setItem(this.NOSTR_STORAGE_KEY, JSON.stringify(configs));
  }

  readSessionStorage<T extends INostrSessionConfig = INostrSessionConfig>(): T {
    const data = sessionStorage.getItem(this.NOSTR_STORAGE_KEY);
    if (data) {
      try {
        return JSON.parse(data) satisfies T;
      } catch (e) {
        console.error('invalid JSON found in sessionStorage', e);
        return this.defaultSession as T;
      }
    }

    return this.defaultSession as T;
  }

  saveSessionStorage<T extends INostrSessionConfig = INostrSessionConfig>(configs: T): void {
    sessionStorage.setItem(this.NOSTR_STORAGE_KEY, JSON.stringify(configs));
  }
}
