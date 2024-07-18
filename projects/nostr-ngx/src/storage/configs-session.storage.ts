import { Injectable } from '@angular/core';
import { INostrSessionConfig } from './nostr-session-config.interface';
import { AbstractStorage } from './abstract-storage';

@Injectable({
  providedIn: 'root'
})
export class ConfigsSessionStorage extends AbstractStorage<INostrSessionConfig> {

  private readonly NOSTR_STORAGE_KEY = 'nostr';

  protected default: INostrSessionConfig = {
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
