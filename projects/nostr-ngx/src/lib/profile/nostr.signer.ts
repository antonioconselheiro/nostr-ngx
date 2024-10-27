import { Injectable } from '@angular/core';
import { EventTemplate, finalizeEvent, generateSecretKey, getPublicKey, nip04, nip19, nip44 } from 'nostr-tools';
import { WindowNostr } from 'nostr-tools/nip07';
import { RelayRecord } from 'nostr-tools/relay';
import { AccountsLocalStorage } from '../configs/accounts-local.storage';
import { ProfileSessionStorage } from '../configs/profile-session.storage';
import { NoCredentialsFoundError } from '../exceptions/no-credentials-found.error';
import { NotSupportedBySigner } from '../exceptions/not-supported-by-signer.error';
import { SignerNotFoundError } from '../exceptions/signer-not-found.error';
import { NSecCrypto } from '../nostr-utils/nsec.crypto';
import { RelayLocalConfigService } from '../pool/relay-local-config.service';
import { NostrRawEvent } from '../domain/event/nostr-raw-event.interface';
import { unixDate } from '../tools/unix-date.fn';
import { Ncryptsec, NProfile, NSec } from 'nostr-tools/nip19';
import { NostrEvent } from '../domain/event/nostr-event.interface';
import { HexString } from '../domain/event/hex-string.type';

/**
 * Sign Nostr Event according to user authentication settings.
 * Throws NoCredentialsFoundError or SignerNotFoundError if no user is authenticated. 
 * 
 * TODO: test it with NIP-55
 */
@Injectable({
  providedIn: 'root'
})
export class NostrSigner implements Omit<WindowNostr, 'getPublicKey' | 'getRelays'> {

  #inMemoryNsec?: Uint8Array;

  constructor(
    private nsecCrypto: NSecCrypto,
    private localConfigs: AccountsLocalStorage,
    private sessionConfigs: ProfileSessionStorage,
    private relayLocalConfig: RelayLocalConfigService
  ) { }

  login(nsec: NSec, opts?: { saveSession: boolean }): void {
    const { data } = nip19.decode(nsec);
    this.#inMemoryNsec = data as Uint8Array;

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
    this.#inMemoryNsec = undefined;
  }

  generateNsec(): NSec {
    return nip19.nsecEncode(generateSecretKey());
  }

  getInMemoryNCryptsec(password: string): Ncryptsec | null {
    if (this.#inMemoryNsec) {
      return this.nsecCrypto.encryptNSec(this.#inMemoryNsec, password);
    }

    return null;
  }

  /**
   * @throws NoCredentialsFoundError
   */
  #getNSec(): Promise<Uint8Array> {
    if (this.#inMemoryNsec) {
      return Promise.resolve(this.#inMemoryNsec);
    }

    const { nsec } = this.sessionConfigs.read();
    if (nsec) {
      const { data } = nip19.decode(nsec);
      this.#inMemoryNsec = data;
    }

    return Promise.reject(new SignerNotFoundError());
  }

  hasSignerExtension(): boolean {
    return !!window.nostr;
  }

  /**
   * Sign nostr event using current user configs.
   * If `created_at` property is not present, it'll be set with current date time.
   * 
   * @throws NoCredentialsFoundError
   * @throws SignerNotFoundError
   */
  signEvent(event: EventTemplate | NostrRawEvent): Promise<NostrEvent> {
    if (!('created_at' in event)) {
      event = { ...event, created_at: unixDate() };
    }

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
    const nsec = await this.#getNSec();
    return finalizeEvent(event, nsec);
  }

  getPublicKey(): Promise<string | undefined> {
    const localConfig = this.localConfigs.read();
    if (localConfig.signer === 'extension') {
      if (window.nostr) {
        return window.nostr.getPublicKey();
      }
    } else if (this.#inMemoryNsec) {
      return Promise.resolve(getPublicKey(this.#inMemoryNsec));
    }

    return Promise.resolve(undefined);
  }

  async getNProfile(): Promise<NProfile | undefined> {
    const pubkey = await this.getPublicKey();
    if (!pubkey) {
      return Promise.resolve(undefined);
    }

    const relays = await this.relayLocalConfig.getUserOutboxRelays(pubkey);
    return nip19.nprofileEncode({
      pubkey, relays
    });
  }

  readonly nip04 = {
    /**
     * @throws NoCredentialsFoundError
     * @throws SignerNotFoundError
     * @throws NotSupportedBySigner
     */
    encrypt: async (pubkey: HexString, plaintext: string): Promise<string> => {
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
        const nsec = await this.#getNSec();
        return nip04.encrypt(nsec, pubkey, plaintext);
      }
    },

    /**
     * @throws NoCredentialsFoundError
     * @throws SignerNotFoundError
     * @throws NotSupportedBySigner
     */
    decrypt: async (pubkey: HexString, ciphertext: string): Promise<string> => {
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
        const nsec = await this.#getNSec();
        return nip04.decrypt(nsec, pubkey, ciphertext);
      }
    }
  };

  readonly nip44 = {
    /**
     * @throws NoCredentialsFoundError
     * @throws SignerNotFoundError
     * @throws NotSupportedBySigner
     */
    encrypt: async (pubkey: HexString, plaintext: string): Promise<string> => {
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
        const nsec = await this.#getNSec();
        const conversationKey = nip44.v2.utils.getConversationKey(nsec, pubkey);
        return nip44.v2.encrypt(plaintext, conversationKey);
      }
    },

    /**
     * @throws NoCredentialsFoundError
     * @throws SignerNotFoundError
     * @throws NotSupportedBySigner
     */
    decrypt: async (pubkey: HexString, ciphertext: string): Promise<string> => {
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
        const nsec = await this.#getNSec();
        const conversationKey = nip44.v2.utils.getConversationKey(nsec, pubkey);
        return nip44.v2.decrypt(ciphertext, conversationKey);
      }
    }
  };

  isSignerError(error: Error): error is NoCredentialsFoundError | NotSupportedBySigner | SignerNotFoundError {
    if (error instanceof NoCredentialsFoundError || error instanceof NotSupportedBySigner || error instanceof SignerNotFoundError) {
      return true;
    }

    return false;
  }

  /**
   * this method will not return only extension signer relays,
   * will return all user relays, If you need just extension signer
   * relays with no aditional relays you must call getRelaysFromExtensionSigner()
   */
  async getRelays(): Promise<RelayRecord | null> {
    const userRelayConfig = await this.relayLocalConfig.getCurrentUserRelays();
    if (!userRelayConfig) {
      return null;
    }

    return userRelayConfig.general || null;
  }

  getRelaysFromExtensionSigner(): Promise<RelayRecord | null> {
    if (window.nostr) {
      return window.nostr.getRelays();
    }

    return Promise.resolve(null);
  }
}
