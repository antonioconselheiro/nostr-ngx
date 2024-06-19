import { Injectable } from '@angular/core';
import { ConfigsSessionStorage, NoCredentialsFoundError, SignerNotFoundError, TNcryptsec, TNostrSecret } from '@belomonte/nostr-ngx';
import { EventTemplate, finalizeEvent, nip19, NostrEvent } from 'nostr-tools';
import * as nip49 from 'nostr-tools/nip49';

/**
 * Sign Nostr Event according to user authentication settings
 */
@Injectable({
  providedIn: 'root'
})
export class NostrSigner {

  private static inMemoryNsec?: Uint8Array;

  constructor(
    private sessionConfigs: ConfigsSessionStorage
  ) { }

  login(nsec: TNostrSecret): void {
    const { data } = nip19.decode(nsec);
    NostrSigner.inMemoryNsec = data as Uint8Array;
  }

  encryptNsec(password: string): TNcryptsec | null;
  encryptNsec(password: string, nsec: TNostrSecret): TNcryptsec; 
  encryptNsec(password: string, nsec?: TNostrSecret): TNcryptsec | null {
    if (nsec) {
      return this.generateNcryptsec(password, nsec);
    }

    const sessionConfig = this.sessionConfigs.read();
    if (sessionConfig.sessionFrom === 'signer') {
      //  maybe should write a NIP suggestin to include a way to get a ncryptsec from extension 
      return null;
    }

    if (NostrSigner.inMemoryNsec) {
      return this.generateNcryptsec(password, NostrSigner.inMemoryNsec);
    }

    const session = this.sessionConfigs.read();
    if (session.sessionFrom === 'sessionStorage' && session.nsec) {
      return this.generateNcryptsec(password, session.nsec);
    }

    return null;
  }

  private generateNcryptsec(password: string, nsec: TNostrSecret | Uint8Array): TNcryptsec {
    if (typeof nsec === 'string') {
      const decoded = nip19.decode(nsec);
      const bytes = decoded.data as Uint8Array; 

      return nip49.encrypt(bytes, password) as TNcryptsec;
    } else {
      return nip49.encrypt(nsec, password) as TNcryptsec;
    }
  }

  hasSignerExtension(): boolean {
    return !!window.nostr;
  }

  signEvent(event: EventTemplate): Promise<NostrEvent> {
    const sessionConfig = this.sessionConfigs.read();

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
    if (NostrSigner.inMemoryNsec) {
      return Promise.resolve(finalizeEvent(event, NostrSigner.inMemoryNsec));
    }

    const session = this.sessionConfigs.read();
    if (session.sessionFrom === 'sessionStorage' && session.nsec) {
      const { data } = nip19.decode(session.nsec);
      return Promise.resolve(finalizeEvent(event, data as Uint8Array));
    }

    return Promise.reject(new NoCredentialsFoundError());
  }
}
