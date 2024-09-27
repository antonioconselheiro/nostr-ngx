import { Injectable } from '@angular/core';
import { EventTemplate, finalizeEvent, generateSecretKey, getPublicKey, nip04, nip19, nip44, NostrEvent } from 'nostr-tools';
import { WindowNostr } from 'nostr-tools/nip07';
import { ConfigsLocalStorage } from '../configs/configs-local.storage';
import { ConfigsSessionStorage } from '../configs/configs-session.storage';
import { Ncryptsec } from '../domain/ncryptsec.type';
import { NSec } from '../domain/nsec.type';
import { NoCredentialsFoundError } from '../exceptions/no-credentials-found.error';
import { NotSupportedBySigner } from '../exceptions/not-supported-by-signer.error';
import { SignerNotFoundError } from '../exceptions/signer-not-found.error';
import { NSecCrypto } from '../nostr/nsec.crypto';

/**
 * Sign Nostr Event according to user authentication settings.
 * Throws NoCredentialsFoundError or SignerNotFoundError if no user is authenticated. 
 * 
 * TODO: test it with NIP-55
 */
@Injectable({
  providedIn: 'root'
})
export class NostrSigner implements Omit<WindowNostr, 'getRelays'> {

  private static inMemoryNsec?: Uint8Array;

  constructor(
    private sessionConfigs: ConfigsSessionStorage,
    private localConfigs: ConfigsLocalStorage,
    private nsecCrypto: NSecCrypto
  ) { }

  login(nsec: NSec, opts?: { saveSession: boolean }): void {
    const { data } = nip19.decode(nsec);
    NostrSigner.inMemoryNsec = data as Uint8Array;

    if (opts?.saveSession) {
      this.sessionConfigs.patch({ nsec });
    }
  }

  logout(): void {
    this.sessionConfigs.clear();
    this.localConfigs.update(configs => {
      delete configs.signer;
      return configs;
    });
    delete NostrSigner.inMemoryNsec;
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

    const session = this.sessionConfigs.read();
    const local = this.localConfigs.read();

    if (local.signer === 'extension') {
      //  FIXME: maybe should write a NIP suggestin to include a way to get a ncryptsec from extension
      //  https://github.com/nostr-protocol/nips/issues/1516
      return null;
    }

    if (NostrSigner.inMemoryNsec) {
      return this.nsecCrypto.encryptNSec(NostrSigner.inMemoryNsec, password);
    }

    if (!local.signer && session.nsec) {
      return this.nsecCrypto.encryptNSec(session.nsec, password);
    }

    return null;
  }

  /**
   * @throws NoCredentialsFoundError
   */
  private getNSec(): Promise<Uint8Array> {
    if (NostrSigner.inMemoryNsec) {
      return Promise.resolve(NostrSigner.inMemoryNsec);
    }

    const { nsec } = this.sessionConfigs.read();
    if (nsec) {
      const { data } = nip19.decode(nsec);
      NostrSigner.inMemoryNsec = data;
    }

    return Promise.reject(new SignerNotFoundError());
  }

  hasSignerExtension(): boolean {
    return !!window.nostr;
  }

  /**
   * @throws NoCredentialsFoundError
   * @throws SignerNotFoundError
   */
  signEvent(event: EventTemplate): Promise<NostrEvent> {
    const localConfig = this.localConfigs.read();
    if (localConfig.signer === 'extension') {
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

  private async signWithClient(event: EventTemplate): Promise<NostrEvent> {
    const nsec = await this.getNSec();
    return finalizeEvent(event, nsec);
  }

  getPublicKey(): Promise<string> {
    if (NostrSigner.inMemoryNsec) {
      return Promise.resolve(getPublicKey(NostrSigner.inMemoryNsec));
    } else {
      return Promise.reject(new NoCredentialsFoundError());
    }
  }

  readonly nip04 = {
    /**
     * @throws NoCredentialsFoundError
     * @throws SignerNotFoundError
     * @throws NotSupportedBySigner
     */
    encrypt: async (pubkey: string, plaintext: string): Promise<string> => {
      const { signer } = this.localConfigs.read();
      if (signer === 'extension') {
        if (window.nostr) {
          if (window.nostr.nip04) {
            return window.nostr.nip04.encrypt(pubkey, plaintext);
          } else {
            return Promise.reject(new NotSupportedBySigner());
          }
        } else {
          this.logout();
          return Promise.reject(new SignerNotFoundError());
        }
      } else {
        const nsec = await this.getNSec();
        return nip04.encrypt(nsec, pubkey, plaintext);
      }
    },

    /**
     * @throws NoCredentialsFoundError
     * @throws SignerNotFoundError
     * @throws NotSupportedBySigner
     */
    decrypt: async (pubkey: string, ciphertext: string): Promise<string> => {
      const { signer } = this.localConfigs.read();
      if (signer === 'extension') {
        if (window.nostr) {
          if (window.nostr.nip04) {
            return window.nostr.nip04.decrypt(pubkey, ciphertext);
          } else {
            return Promise.reject(new NotSupportedBySigner());
          }
        } else {
          this.logout();
          return Promise.reject(new SignerNotFoundError());
        }
      } else {
        const nsec = await this.getNSec();
        return nip04.decrypt(nsec, pubkey, ciphertext);
      }
    },
  };

  readonly nip44 = {
    /**
     * @throws NoCredentialsFoundError
     * @throws SignerNotFoundError
     * @throws NotSupportedBySigner
     */
    encrypt: async (pubkey: string, plaintext: string): Promise<string> => {
      const { signer } = this.localConfigs.read();
      if (signer === 'extension') {
        if (window.nostr) {
          if (window.nostr.nip44) {
            return window.nostr.nip44.encrypt(pubkey, plaintext);
          } else {
            return Promise.reject(new NotSupportedBySigner());
          }
        } else {
          return Promise.reject(new SignerNotFoundError());
        }
      } else {
        const nsec = await this.getNSec();
        const conversationKey = nip44.v2.utils.getConversationKey(nsec, pubkey);
        return nip44.v2.encrypt(plaintext, conversationKey);
      }
    },

    /**
     * @throws NoCredentialsFoundError
     * @throws SignerNotFoundError
     * @throws NotSupportedBySigner
     */
    decrypt: async (pubkey: string, ciphertext: string): Promise<string> => {
      const { signer } = this.localConfigs.read();
      if (signer === 'extension') {
        if (window.nostr) {
          if (window.nostr.nip44) {
            return window.nostr.nip44.decrypt(pubkey, ciphertext);
          } else {
            return Promise.reject(new NotSupportedBySigner());
          }
        } else {
          return Promise.reject(new SignerNotFoundError());
        }
      } else {
        const nsec = await this.getNSec();
        const conversationKey = nip44.v2.utils.getConversationKey(nsec, pubkey);
        return nip44.v2.decrypt(ciphertext, conversationKey);
      }
    },
  };

  isSignerError(error: Error): error is NoCredentialsFoundError | NotSupportedBySigner | SignerNotFoundError {
    if (error instanceof NoCredentialsFoundError || error instanceof  NotSupportedBySigner || error instanceof  SignerNotFoundError) {
      return true;
    }

    return false;
  }
}
