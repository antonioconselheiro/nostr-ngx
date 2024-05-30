import { Injectable } from '@angular/core';
import { INostrSessionConfig } from '../../domain/nostr-session-config.interface';
import { INostrLocalConfig } from '../../domain/nostr-local-config.interface';

@Injectable({
  providedIn: 'root'
})
export class NostrConfigStorage {

  private readonly NOSTR_STORAGE_KEY = 'nostr';

  private defaultLocal: INostrLocalConfig = {
    relayFrom: 'none'
  };

  private defaultSession: INostrSessionConfig = {
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

  updateLocalStorage<T extends INostrLocalConfig = INostrLocalConfig>(updater: (configs: T) => T) {
    const local = this.readLocalStorage<T>();
    this.saveLocalStorage(updater(local));
  }

  async asyncUpdateLocalStorage<T extends INostrLocalConfig = INostrLocalConfig>(updater: (configs: T) => Promise<T>) {
    const local = this.readLocalStorage<T>();
    const updatedLocal = await updater(local);
    this.saveLocalStorage(updatedLocal);
  }

  patchLocalStorage<T extends INostrLocalConfig = INostrLocalConfig>(configs: Partial<T>): void {
    this.updateLocalStorage<T>(savedConfigs => {
      return { ...savedConfigs, ...configs };
    });
  }

  clearLocalStorage(): void {
    delete localStorage[this.NOSTR_STORAGE_KEY];
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

  updateSessionStorage<T extends INostrSessionConfig = INostrSessionConfig>(updater: (configs: T) => T) {
    const session = this.readSessionStorage<T>();
    this.saveSessionStorage(updater(session));
  }

  async asyncUpdateSessionStorage<T extends INostrSessionConfig = INostrSessionConfig>(updater: (configs: T) => Promise<T>) {
    const session = this.readSessionStorage<T>();
    const updatedSession = await updater(session);
    this.saveSessionStorage(updatedSession);
  }

  patchSessionStorage<T extends INostrSessionConfig = INostrSessionConfig>(configs: Partial<T>): void {
    this.updateSessionStorage<T>(savedConfigs => {
      return { ...savedConfigs, ...configs };
    });
  }

  clearSessionStorage(): void {
    delete sessionStorage[this.NOSTR_STORAGE_KEY];
  }
}
