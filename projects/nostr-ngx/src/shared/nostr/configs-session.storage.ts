import { Injectable } from '@angular/core';
import { INostrSessionConfig } from '../../domain/nostr-session-config.interface';
import { AbstractStorage } from '../abstract-storage';

@Injectable({
  providedIn: 'root'
})
export class ConfigsSessionStorage extends AbstractStorage<INostrSessionConfig> {

  private readonly NOSTR_STORAGE_KEY = 'nostr';

  protected default: INostrSessionConfig = {
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
