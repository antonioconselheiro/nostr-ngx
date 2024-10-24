import { Injectable } from '@angular/core';
import { AbstractBrowserStorage } from './abstract-browser-storage';
import { NostrSessionConfig } from './nostr-session-config.interface';

@Injectable({
  providedIn: 'root'
})
export class ProfileSessionStorage extends AbstractBrowserStorage<NostrSessionConfig> {

  private readonly nostrStorageKey = 'nostr';

  protected default: NostrSessionConfig = {};

  protected getItem(): string | null {
    return sessionStorage.getItem(this.nostrStorageKey);
  }

  protected setItem(serializedObject: string): void {
    sessionStorage.setItem(this.nostrStorageKey, serializedObject);
  }

  override clear(): void {
    delete sessionStorage[this.nostrStorageKey];
  }
}
