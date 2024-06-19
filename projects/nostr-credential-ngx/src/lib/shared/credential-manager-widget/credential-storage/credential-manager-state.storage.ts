import { Injectable } from '@angular/core';
import { AbstractStorage } from '@belomonte/nostr-ngx';


@Injectable({
  providedIn: 'root'
})
export class CredentialManagerStateStorage extends AbstractStorage<{}> {

  private readonly NOSTR_STORAGE_KEY = 'nostr';

  protected default = {
    relayFrom: 'none'
  };

  override getItem(): string | null {
    return history.state[this.NOSTR_STORAGE_KEY] || null;
  }

  override setItem(serializedObject: string): void {
    history.state[this.NOSTR_STORAGE_KEY] = serializedObject;
  }

  override clear(): void {
    delete history.state[this.NOSTR_STORAGE_KEY];
  }
}