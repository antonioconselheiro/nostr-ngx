import { Injectable } from '@angular/core';
import { LRUCache } from 'lru-cache';
import { isNip05, Nip05 } from 'nostr-tools/nip05';
import { NostrTypeGuard, NProfile } from 'nostr-tools/nip19';
import { AccountRenderable } from '../domain/account/compose/account-renderable.type';
import { HexString } from '../domain/event/primitive/hex-string.type';
import { indexNotFound } from '../domain/symbol/index-not-found.const';
import { NostrProfileCache } from '../injection-token/nostr-profile-cache.interface';

@Injectable()
export class InMemoryProfileCache implements NostrProfileCache {

  protected readonly isPubkey = /^[a-f\d]{64}$/;

  private nip05Index = new Map<Nip05, HexString>();
  private nprofileIndex = new Map<NProfile, HexString>();
  private fistLetterIndex = new Map<string, Array<HexString>>();

  protected cache = new LRUCache<HexString, AccountRenderable>({
    //  TODO: make this configurable
    max: 1000,
    dispose: event => this.delete(event.pubkey)
  });

  add(account: AccountRenderable): void {
    this.delete(account.pubkey);
    this.cache.set(account.pubkey, account);

    if (account.nip05?.address) {
      const address = account.nip05.address;
      this.nip05Index.set(address, account.pubkey);
    }

    if (account.nprofile) {
      this.nprofileIndex.set(account.nprofile, account.pubkey);
    }

    if (account.displayName) {
      const firstLetter = this.getFirstLetter(account.displayName);
      const list = this.fistLetterIndex.get(firstLetter) || [];
      list.push(account.pubkey);
      this.fistLetterIndex.set(firstLetter, list);
    }
  }
  
  delete(pubkey: HexString): void {
    const account = this.get(pubkey);
    this.cache.delete(pubkey);

    if (account) {
      if (account.nip05?.address) {
        //  FIXME: check if nip05 set as _ is recognized by this method
        if (isNip05(account.nip05.address)) {
          const address = account.nip05.address;
          this.nip05Index.delete(address);
        }
      }
  
      if (account.nprofile) {
        this.nprofileIndex.delete(account.nprofile);
      }
  
      if (account.displayName) {
        const firstLetter = this.getFirstLetter(account.displayName);
        const list = this.fistLetterIndex.get(firstLetter) || [];
        const index = list.indexOf(account.pubkey);

        if (index !== indexNotFound) {
          list.splice(index, 1);
        }

        this.fistLetterIndex.set(firstLetter, list);
      }
    }
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

    const isHex = this.isPubkey.test(therm);
    const isNProfile = NostrTypeGuard.isNProfile(therm);
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

    const firstLetter = this.getFirstLetter(therm);
    const pubkeys = this.fistLetterIndex.get(firstLetter) || [];
    const searchableList = pubkeys.map(pubkey => this.get(pubkey));
    const firstSuggestions = new Array<AccountRenderable>();
    const secondSuggestions = new Array<AccountRenderable>();

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
        secondSuggestions.push(account);
      }
    });

    return [ ...firstSuggestions, ...secondSuggestions ];
  }

  private getFirstLetter(therm: string): string {
    return therm.trim()[0].toLocaleLowerCase();
  }
}