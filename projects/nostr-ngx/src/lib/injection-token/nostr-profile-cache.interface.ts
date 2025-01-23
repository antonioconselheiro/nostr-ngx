import { Nip05 } from 'nostr-tools/nip05';
import { AccountRenderable } from '../domain/account/compose/account-renderable.type';
import { HexString } from '../domain/event/primitive/hex-string.type';
import { NProfile } from 'nostr-tools/nip19';

export interface NostrProfileCache {
  add(account: AccountRenderable): void;
  delete(account: AccountRenderable): boolean;
  get(pubkey: HexString): AccountRenderable | null;
  getByNip05(nip05: Nip05): AccountRenderable | null;
  getByNProfile(nprofile: NProfile): AccountRenderable | null;
  query(search: string): Array<AccountRenderable>;
}
