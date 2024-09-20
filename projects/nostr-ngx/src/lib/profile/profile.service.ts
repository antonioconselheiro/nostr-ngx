import { Injectable } from '@angular/core';
import { NostrMetadata } from '@nostrify/nostrify';
import { NostrEvent } from 'nostr-tools';
import { NSec } from '../domain/nsec.type';
import { IUnauthenticatedAccount } from '../domain/unauthenticated-account.interface';
import { NostrConverter } from '../nostr/nostr.converter';
import { NPoolRequestOptions } from '../pool/npool-request.options';
import { AccountManagerStatefull } from './account-manager.statefull';
import { NostrSigner } from './nostr.signer';
import { ProfileCache } from './profile.cache';
import { ProfileNostr } from './profile.nostr';

// TODO: include load and cache of users relay list
@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(
    private nostrSigner: NostrSigner,
    private profileApi: ProfileNostr,
    private accountManagerStatefull: AccountManagerStatefull,
    private profileCache: ProfileCache,
    private nostrConverter: NostrConverter
  ) { }

  //  FIXME: must load from cache, except if opts include  ignoreCache=true
  async get(pubkey: string, opts?: NPoolRequestOptions): Promise<NostrMetadata | null> {
    const event = await this.profileApi.loadProfile(pubkey, opts);
    const [ metadata ] = await this.profileCache.add([event]);
    return Promise.resolve(metadata || null);
  }

  async list(pubkeys: string[], opts?: NPoolRequestOptions): Promise<Array<NostrMetadata>> {
    const events = await this.profileApi.loadProfiles(pubkeys, opts);
    return this.profileCache.add(events);
  }

  add(profiles: Array<NostrEvent & { kind: 0 }>): void {
    this.profileCache.add(profiles);
  }

  //  FIXME: revisar este método para que ele retorne uma instância completa do unauthenticated account
  async loadAccountFromCredentials(nsec: NSec, password: string): Promise<IUnauthenticatedAccount | null> {
    const user = this.nostrConverter.convertNsecToNpub(nsec);
    const profile = await this.get(user.pubkey);
    const ncrypted = this.nostrSigner.encryptNsec(password, nsec);
    const relays = await this.profileApi.loadProfileRelayConfig(user.pubkey);
    const account = this.accountManagerStatefull.addAccount(user.npub, profile, ncrypted, relays);

    return Promise.resolve(account);
  }
}
