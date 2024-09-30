import { Injectable } from '@angular/core';
import { EventTemplate, finalizeEvent, generateSecretKey, getPublicKey, nip04, nip19, nip44, NostrEvent } from 'nostr-tools';
import { WindowNostr } from 'nostr-tools/nip07';
import { AccountsLocalStorage } from '../configs/accounts-local.storage';
import { ProfileSessionStorage } from '../configs/profile-session.storage';
import { Ncryptsec } from '../domain/ncryptsec.type';
import { NSec } from '../domain/nsec.type';
import { NoCredentialsFoundError } from '../exceptions/no-credentials-found.error';
import { NotSupportedBySigner } from '../exceptions/not-supported-by-signer.error';
import { SignerNotFoundError } from '../exceptions/signer-not-found.error';
import { NSecCrypto } from '../nostr-utils/nsec.crypto';
import { NPoolRequestOptions } from '../pool/npool-request.options';
import { ProfileService } from './profile.service';
import { Account } from '../domain/account.interface';
import { RelayRecord } from 'nostr-tools/relay';
import { NProfile } from '../domain/nprofile.type';
import { RelayPublicConfigService } from '../pool/relay-public-config.service';

/**
 * Sign Nostr Event according to user authentication settings.
 * Throws NoCredentialsFoundError or SignerNotFoundError if no user is authenticated. 
 * 
 * TODO: test it with NIP-55
 */
@Injectable({
  providedIn: 'root'
})
export class NostrSigner implements WindowNostr {

  private static inMemoryNsec?: Uint8Array;

  constructor(
    private sessionConfigs: ProfileSessionStorage,
    private localConfigs: AccountsLocalStorage,
    private nsecCrypto: NSecCrypto,
    private profileService: ProfileService,
    private relayPublicConfig: RelayPublicConfigService
  ) { }

  login(nsec: NSec, opts?: { saveSession: boolean }): void {
    const { data } = nip19.decode(nsec);
    NostrSigner.inMemoryNsec = data as Uint8Array;

    if (opts?.saveSession) {
      this.sessionConfigs.patch({ nsec });
    }
  }

  /**
   * @param opts request options to load account
   */
  async useExtension(opts?: NPoolRequestOptions): Promise<Account> {
    const pubkey = await this.getPublicKey();
    this.localConfigs.patch({
      currentPubkey: pubkey,
      signer: 'extension'
    });

    //  FIXME: account must be load using user relays config
    const account = await this.profileService.getAccount(pubkey, opts);
    this.sessionConfigs.patch({ account });

    return Promise.resolve(account);
  }

  logout(): void {
    this.sessionConfigs.clear();
    this.localConfigs.update(configs => {
      delete configs.signer;
      delete configs.currentPubkey;
      return configs;
    });
    delete NostrSigner.inMemoryNsec;
  }

  generateNsec(): NSec {
    return nip19.nsecEncode(generateSecretKey());
  }

  getInMemoryNCryptsec(password: string): Ncryptsec | null {
    if (NostrSigner.inMemoryNsec) {
      return this.nsecCrypto.encryptNSec(NostrSigner.inMemoryNsec, password);
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
    }
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
    }
  };

  isSignerError(error: Error): error is NoCredentialsFoundError | NotSupportedBySigner | SignerNotFoundError {
    if (error instanceof NoCredentialsFoundError || error instanceof  NotSupportedBySigner || error instanceof  SignerNotFoundError) {
      return true;
    }

    return false;
  }

  /**
   * this method will not return only extension signer relays,
   * will return all user relays, If you need just extension signer
   * relays with no aditional relays you must call getRelaysFromExtensionSigner()
   */
  async getRelays(): Promise<RelayRecord> {
    const userRelayConfig = await this.relayPublicConfig.getCurrentUserRelays();
    if (!userRelayConfig) {
      return {};
    }

    return userRelayConfig.general || {};
  }

  getRelaysFromExtensionSigner(): Promise<RelayRecord | null> {
    if (window.nostr) {
      return window.nostr.getRelays();
    }

    return Promise.resolve(null);
  }

  async getNProfile(): Promise<NProfile> {
    const pubkey = await this.getPublicKey();
    const relays = await this.relayPublicConfig.getUserPublicOutboxRelays(pubkey);

    return nip19.nprofileEncode({
      pubkey, relays
    });
  }
}
