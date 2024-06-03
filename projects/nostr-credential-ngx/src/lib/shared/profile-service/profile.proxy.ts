import { Injectable } from "@angular/core";
import { NostrConverter, TNostrPublic, TNostrSecret } from "@belomonte/nostr-ngx";
import { Event } from 'nostr-tools';
import { IProfile } from "../../domain/profile.interface";
import { IUnauthenticatedUser } from "../../domain/unauthenticated-user.interface";
import { NostrSigner } from "./nostr.signer";
import { ProfileApi } from "./profile.api";
import { ProfileCache } from "./profile.cache";
import { AccountManagerStatefull } from "./account-manager.statefull";

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
    private profileApi: ProfileApi,
    private accountManagerStatefull: AccountManagerStatefull,
    private profileCache: ProfileCache,
    private nostrConverter: NostrConverter
  ) { }

  get(npubs: TNostrPublic): IProfile;
  get(npubs: TNostrPublic[]): IProfile[];
  get(npubs: TNostrPublic[] | TNostrPublic): IProfile | IProfile[];
  get(npubs: TNostrPublic[] | TNostrPublic): IProfile | IProfile[] {
    return this.profileCache.get(npubs);
  }

  cache(profiles: IProfile[]): void;
  cache(profiles: Event[]): void;
  cache(profiles: IProfile[] | Event[]): void;
  cache(profiles: IProfile[] | Event[]): void {
    this.profileCache.cache(profiles);
  }

  async load(npubs: TNostrPublic): Promise<IProfile>;
  async load(npubs: TNostrPublic[]): Promise<IProfile[]>;
  async load(npubs: TNostrPublic[] | TNostrPublic): Promise<IProfile | IProfile[]> {
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

  loadFromPubKey(pubkey: string): Promise<IProfile> {
    return this.loadProfile(this.nostrConverter.castPubkeyToNostrPublic(pubkey));
  }

  async loadAccount(nsec: TNostrSecret, password: string): Promise<IUnauthenticatedUser | null> {
    const user = this.nostrConverter.convertNostrSecretToPublic(nsec);

    const profile = await this.load(user.npub);
    const ncrypted = this.nostrSigner.getEncryptedNostrSecret(password, nsec);
    const account = this.accountManagerStatefull.addAccount(profile, ncrypted);

    return Promise.resolve(account);
  }

  async loadProfiles(...npubss: TNostrPublic[][]): Promise<IProfile[]> {
    const npubs = [...new Set(npubss.flat(1))];
    const notLoaded = npubs.filter(npub => !this.profileCache.isEagerLoaded(npub))

    return this.forceProfileReload(notLoaded);
  }

  async loadProfile(npub: TNostrPublic): Promise<IProfile> {
    return this.loadProfiles([npub])
      .then(npubs => Promise.resolve(npubs[0]));
  }
  
  private async forceProfileReload(npubs: Array<TNostrPublic>): Promise<Array<IProfile>> {
    const events = await this.profileApi.loadProfiles(npubs);
    this.profileCache.cache(events);
    return Promise.resolve(npubs.map(npub => this.profileCache.get(npub)));
  }
}
