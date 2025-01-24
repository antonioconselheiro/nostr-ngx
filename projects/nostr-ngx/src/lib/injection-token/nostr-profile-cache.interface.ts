import { Nip05 } from 'nostr-tools/nip05';
import { AccountRenderable } from '../domain/account/compose/account-renderable.type';
import { HexString } from '../domain/event/primitive/hex-string.type';
import { NProfile } from 'nostr-tools/nip19';

/**
 * For a new cache type to be configured, it must implement the
 * NostrCache interface and a NostrProfileCache interface.
 */
export interface NostrProfileCache {

  /**
   * add account object into cache
   */
  add(account: AccountRenderable): void;

  /**
   * delete account from cache
   */
  delete(pubkey: HexString): void;

  /**
   * get account using pubkey
   */
  get(pubkey: HexString): AccountRenderable | null;

  /**
   * get account using nip05
   */
  getByNip05(nip05: Nip05): AccountRenderable | null;

  /**
   * get account by nprofile
   */
  getByNProfile(nprofile: NProfile): AccountRenderable | null;

  /**
   * search in cache for keyword
   */
  query(search: string): Array<AccountRenderable>;
}
