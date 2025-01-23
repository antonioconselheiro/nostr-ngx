import { Injectable } from '@angular/core';
import { LRUCache } from 'lru-cache';
import { Nip05 } from 'nostr-tools/nip05';
import { NProfile } from 'nostr-tools/nip19';
import { AccountRenderable } from '../domain/account/compose/account-renderable.type';
import { HexString } from '../domain/event/primitive/hex-string.type';
import { NostrProfileCache } from '../injection-token/nostr-profile-cache.interface';
import { NostrGuard } from '../nostr-utils/nostr.guard';

@Injectable()
export class InMemoryProfileCache implements NostrProfileCache {

  private nip05Index = new Map<Nip05, HexString>();
  private nprofileIndex = new Map<NProfile, HexString>();
  private fistLetterIndex = new Map<string, Array<HexString>>();

  constructor(
    private nostrGuard: NostrGuard
  ){ }

  protected cache = new LRUCache<HexString, AccountRenderable>({
    //  TODO: make this configurable
    max: 1000,
    dispose: event => this.delete(event)
  });

  add(account: AccountRenderable): void {
    //  must add to the indexes too
    this.cache.set(account.pubkey, account);
  }
  
  delete(account: AccountRenderable): boolean {
    //  TODO: must remove from indexes too
    return this.cache.delete(account.pubkey);
  }

  get(pubkey: HexString): AccountRenderable | null {
    return this.cache.get(pubkey) || null;
  }

  getByNip05(nip05: Nip05): AccountRenderable | null {
    const pubkey = this.nip05Index.get(nip05);
    if (pubkey) {
      return this.get(pubkey);
    }

    return null;
  }

  getByNProfile(nprofile: NProfile): AccountRenderable | null {
    const pubkey = this.nprofileIndex.get(nprofile);
    if (pubkey) {
      return this.get(pubkey);
    }

    return null;
  }

  query(therm: string): Array<AccountRenderable> {
    if (!therm.length) {
      return [];
    }

    const isHex = this.nostrGuard.isHexadecimal(therm);
    const isNProfile = this.nostrGuard.isNProfile(therm);
    let account: AccountRenderable | null = null;

    if (isHex && therm.length) {
      account = this.get(therm);
    }

    if (isNProfile) {
      account = this.getByNProfile(therm);
    }

    if (account) {
      return [ account ];
    }

    const firstLetter = therm.trim()[0].toLocaleLowerCase();
    const pubkeys = this.fistLetterIndex.get(firstLetter) || [];
    const searchableList = pubkeys.map(pubkey => this.get(pubkey));

    const firstSuggestions = new Array<AccountRenderable>();
    const secoundSuggestions = new Array<AccountRenderable>();

    //  first show the accounts that matches the whole therm from begining
    const priorityMatch = new RegExp(`^${therm}`, 'i');
    //  then show the account that matches with the word position
    const secondaryMatch = new RegExp(`${therm.split('').map(l => `(${l})`).join('(.*)')}`);

    searchableList.forEach(account => {
      if (!account) {
        return;
      }

      if (priorityMatch.test(account.displayName)) {
        firstSuggestions.push(account);
      } else if (secondaryMatch.test(account.displayName)) {
        secoundSuggestions.push(account);
      }
    });

    return [ ...firstSuggestions, ...secoundSuggestions ];
  }
}