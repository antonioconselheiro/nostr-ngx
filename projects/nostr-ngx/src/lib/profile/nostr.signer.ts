import { Injectable } from '@angular/core';
import { EventTemplate, finalizeEvent, generateSecretKey, nip19, NostrEvent } from 'nostr-tools';
import { ConfigsSessionStorage } from '../configs/configs-session.storage';
import { Ncryptsec } from '../domain/ncryptsec.type';
import { NSec } from '../domain/nsec.type';
import { NoCredentialsFoundError } from '../exceptions/no-credentials-found.error';
import { SignerNotFoundError } from '../exceptions/signer-not-found.error';
import { NSecCrypto } from '../nostr/nsec.crypto';

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
    private sessionConfigs: ConfigsSessionStorage,
    private nsecCrypto: NSecCrypto
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
      return this.nsecCrypto.encryptNSec(nsec, password);
    }

    const sessionConfig = this.sessionConfigs.read();
    if (sessionConfig.signer === 'extension') {
      //  maybe should write a NIP suggestin to include a way to get a ncryptsec from extension 
      return null;
    }

    if (NostrSigner.inMemoryNsec) {
      return this.nsecCrypto.encryptNSec(NostrSigner.inMemoryNsec, password);
    }

    const session = this.sessionConfigs.read();
    if (!session.signer && session.nsec) {
      return this.nsecCrypto.encryptNSec(session.nsec, password);
    }

    return null;
  }

  hasSignerExtension(): boolean {
    return !!window.nostr;
  }

  signEvent(event: EventTemplate): Promise<NostrEvent> {
    const sessionConfig = this.sessionConfigs.read();
    if (sessionConfig.signer === 'extension') {
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
    if (!session.signer && session.nsec) {
      const { data } = nip19.decode(session.nsec);
      return Promise.resolve(finalizeEvent(event, data as Uint8Array));
    }

    return Promise.reject(new NoCredentialsFoundError());
  }
}
