import { Injectable } from '@angular/core';
import { EventTemplate, finalizeEvent, generateSecretKey, nip19, NostrEvent } from 'nostr-tools';
import * as nip49 from 'nostr-tools/nip49';
import { ConfigsSessionStorage } from '../configs/configs-session.storage';
import { Ncryptsec } from '../domain/ncryptsec.type';
import { NSec } from '../domain/nsec.type';
import { SignerNotFoundError } from '../exceptions/signer-not-found.error';
import { NoCredentialsFoundError } from '../exceptions/no-credentials-found.error';

/**
 * Sign Nostr Event according to user authentication settings
 * 
 * TODO: test it with NIP-55
 */
@Injectable({
  providedIn: 'root'
})
export class NostrSigner {

  private static inMemoryNsec?: Uint8Array;

  constructor(
    private sessionConfigs: ConfigsSessionStorage
  ) { }

  login(nsec: NSec): void {
    const { data } = nip19.decode(nsec);
    NostrSigner.inMemoryNsec = data as Uint8Array;
  }

  generateNsec(): NSec {
    return nip19.nsecEncode(generateSecretKey());
  }

  encryptNsec(password: string): Ncryptsec | null;
  encryptNsec(password: string, nsec: NSec): Ncryptsec; 
  encryptNsec(password: string, nsec?: NSec): Ncryptsec | null {
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

  private generateNcryptsec(password: string, nsec: NSec | Uint8Array): Ncryptsec {
    if (typeof nsec === 'string') {
      const decoded = nip19.decode(nsec);
      const bytes = decoded.data as Uint8Array; 

      return nip49.encrypt(bytes, password) as Ncryptsec;
    } else {
      return nip49.encrypt(nsec, password) as Ncryptsec;
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
