import { EventTemplate, NostrEvent } from 'nostr-tools';
import { TRelayMap } from '../../domain/relay-map.type';

/**
 * https://github.com/nostr-protocol/nips/blob/master/07.md
 */
export interface INip07 {
  getPublicKey(): Promise<string>;
  signEvent(event: EventTemplate): Promise<NostrEvent>;
  getRelays(): Promise<TRelayMap>;
  nip04: {
    encrypt(pubkey: string, plaintext: string): Promise<string>;
    ecrypt(pubkey: string, ciphertext: string): Promise<string>;
  };
  nip44: {
    encrypt(pubkey: string, plaintext: string): Promise<string>;
    decrypt(pubkey: string, ciphertext: string): Promise<string>;
  };
};
