import { Injectable } from '@angular/core';
import { NoCredentialsFoundError, NostrConfigStorage, SignerNotFoundError, TNostrSecret } from '@belomonte/nostr-ngx';
import { EventTemplate, finalizeEvent, nip19, NostrEvent } from 'nostr-tools';

@Injectable({
  providedIn: 'root'
})
export class NostrSigner {

  private static inMemoryNostrSecret?: Uint8Array;

  constructor(
    private nostrConfigStorage: NostrConfigStorage
  ) { }

  login(nostrSecret: TNostrSecret): void {
    const { data } = nip19.decode(nostrSecret);
    NostrSigner.inMemoryNostrSecret = data as Uint8Array;
  }

  hasSignerExtension(): boolean {
    return !!window.nostr;
  }

  signEvent(event: EventTemplate): Promise<NostrEvent> {
    const sessionConfig = this.nostrConfigStorage.readSessionStorage();

    if (sessionConfig.sessionFrom === 'signer') {
      return this.signWithSigner(event);
    }

    return this.signWithClient(event);
  }

  private signWithSigner(event: EventTemplate): Promise<NostrEvent> {
    if (window.nostr) {
      return window.nostr.signEvent(event);
    }

    return Promise.reject(new SignerNotFoundError());
  }

  private signWithClient(event: EventTemplate): Promise<NostrEvent> {
    if (NostrSigner.inMemoryNostrSecret) {
      return Promise.resolve(finalizeEvent(event, NostrSigner.inMemoryNostrSecret));
    }

    const session = this.nostrConfigStorage.readSessionStorage();
    if (session.sessionFrom === 'sessionStorage' && session.nsec) {
      const { data } = nip19.decode(session.nsec);
      return Promise.resolve(finalizeEvent(event, data as Uint8Array));
    }

    return Promise.reject(new NoCredentialsFoundError());
  }
}
