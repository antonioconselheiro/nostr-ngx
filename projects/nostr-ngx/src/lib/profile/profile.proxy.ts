import { Injectable } from '@angular/core';
import { NostrEvent } from 'nostr-tools';
import { IUnauthenticatedAccount } from '../domain/unauthenticated-account.interface';
import { AccountManagerStatefull } from './account-manager.statefull';
import { NostrSigner } from './nostr.signer';
import { ProfileCache } from './profile.cache';
import { ProfileNostr } from './profile.nostr';
import { NostrMetadata } from '@nostrify/nostrify';
import { NostrConverter } from '../nostr/nostr.converter';
import { NPub } from '../domain/npub.type';
import { NSec } from '../domain/nsec.type';
import { NPoolRequestOptions } from '../pool/npool-request.options';

// TODO: include load and cache of users relay list
@Injectable({
  providedIn: 'root'
})
export class ProfileProxy {

  constructor(
    private nostrSigner: NostrSigner,
    private profileApi: ProfileNostr,
    private accountManagerStatefull: AccountManagerStatefull,
    private profileCache: ProfileCache,
    private nostrConverter: NostrConverter
  ) { }

  get(pubkey: string): NostrMetadata | null;
  get(pubkeys: string[]): NostrMetadata[];
  get(npub: NPub): NostrMetadata | null;
  get(npubs: NPub[]): NostrMetadata[];
  get(publicAddresses: string[] | string): NostrMetadata | NostrMetadata[] | null {
    return this.profileCache.get(publicAddresses);
  }

  //  FIXME: must load from cache, except if opts include  ignoreCache=true
  async load(pubkeys: string, opts?: NPoolRequestOptions): Promise<NostrMetadata>;
  async load(pubkeys: string[], opts?: NPoolRequestOptions): Promise<NostrMetadata[]>;
  async load(pubkeys: string[] | string, opts?: NPoolRequestOptions): Promise<NostrMetadata | NostrMetadata[]>;
  async load(pubkeys: string[] | string, opts?: NPoolRequestOptions): Promise<NostrMetadata | NostrMetadata[]> {
    if (pubkeys instanceof Array) {
      const events = await this.profileApi.loadProfiles(pubkeys, opts);
      return this.profileCache.add(events);
    } else {
      const events = await this.profileApi.loadProfiles([pubkeys], opts);
      const [ metadata ] = await this.profileCache.add(events);
      return Promise.resolve(metadata || null);
    }
  }

  add(profiles: Array<NostrEvent & { kind: 0 }>): void {
    this.profileCache.add(profiles);
  }

  //  FIXME: revisar este método para que ele retorne uma instância completa do unauthenticated account
  async loadAccountFromCredentials(nsec: NSec, password: string): Promise<IUnauthenticatedAccount | null> {
    const user = this.nostrConverter.convertNsecToNpub(nsec);
    const profile = await this.load(user.npub);
    const ncrypted = this.nostrSigner.encryptNsec(password, nsec);
    const account = this.accountManagerStatefull.addAccount(user.npub, profile, ncrypted);

    return Promise.resolve(account);
  }
}
