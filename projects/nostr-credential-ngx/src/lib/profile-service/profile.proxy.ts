import { Injectable } from '@angular/core';
import { NostrConverter, SmartPool, TNostrPublic, TNostrSecret } from '@belomonte/nostr-ngx';
import { NostrEvent } from 'nostr-tools';
import { IUnauthenticatedAccount } from '../domain/unauthenticated-account.interface';
import { AccountManagerStatefull } from './account-manager.statefull';
import { NostrSigner } from './nostr.signer';
import { ProfileCache } from './profile.cache';
import { ProfileNostr } from './profile.nostr';
import { NostrMetadata } from '@nostrify/nostrify';

/**
 * Orchestrate the interaction with the profile data,
 * check the cache, call the nostr api, cast the
 * resultset into domain object, cache it and return
 * 
 * There is a set of operations that must be done for
 * each nostr query precisely to reduce the need to repeat
 * queries, the complexity of this flow is abstracted
 * through this facade, which orchestrates services with
 * different responsibilities (cache, api, cast)
 */
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

  get(npubs: TNostrPublic): NostrMetadata;
  get(npubs: TNostrPublic[]): NostrMetadata[];
  get(npubs: TNostrPublic[] | TNostrPublic): NostrMetadata | NostrMetadata[];
  get(npubs: TNostrPublic[] | TNostrPublic): NostrMetadata | NostrMetadata[] {
    return this.profileCache.get(npubs);
  }

  cache(profiles: NostrMetadata[]): void {
    this.profileCache.cache(profiles);
  }

  cacheFromEvents(profiles: NostrEvent[]): void {
    this.profileCache.cacheFromEvent(profiles);
  }

  async load(npubs: TNostrPublic): Promise<NostrMetadata>;
  async load(npubs: TNostrPublic[]): Promise<NostrMetadata[]>;
  async load(npubs: TNostrPublic[] | TNostrPublic): Promise<NostrMetadata | NostrMetadata[]> {
    if (typeof npubs === 'string') {
      const indexedProfile = ProfileCache.profiles[npubs];
      if (!indexedProfile || !indexedProfile.load) {
        return this.loadProfile(npubs);
      }

      return Promise.resolve(indexedProfile);
    } else {
      return this.loadProfiles(npubs);
    }
  }

  loadFromPublicHexa(pubkey: string, pool?: SmartPool): Promise<NostrMetadata> {
    return this.loadProfile(this.nostrConverter.castPubkeyToNostrPublic(pubkey), pool);
  }

  async loadAccountFromCredentials(nsec: TNostrSecret, password: string): Promise<IUnauthenticatedAccount | null> {
    const user = this.nostrConverter.convertNsecToNpub(nsec);
    const profile = await this.load(user.npub);
    const ncrypted = this.nostrSigner.encryptNsec(password, nsec);
    const account = this.accountManagerStatefull.addAccount(profile, ncrypted);

    return Promise.resolve(account);
  }

  async loadProfiles(npubss: TNostrPublic[], pool?: SmartPool): Promise<NostrMetadata[]> {
    const npubs = [...new Set(npubss.flat(1))];
    const notLoaded = npubs.filter(npub => !this.profileCache.isEagerLoaded(npub))

    return this.forceProfileReload(notLoaded, pool);
  }

  async loadProfile(npub: TNostrPublic, pool?: SmartPool): Promise<NostrMetadata> {
    return this.loadProfiles([npub], pool)
      .then(profiles => Promise.resolve(profiles[0]));
  }
  
  private async forceProfileReload(npubs: Array<TNostrPublic>, pool?: SmartPool): Promise<Array<NostrMetadata>> {
    const events = await this.profileApi.loadProfiles(npubs, pool);
    this.profileCache.cacheFromEvent(events);
    return Promise.resolve(npubs.map(npub => this.profileCache.get(npub)));
  }
}
