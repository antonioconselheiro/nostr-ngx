import { Injectable } from "@angular/core";
import { NostrConverter, TNostrPublic, TNostrSecret, TRelayMap } from "@belomonte/nostr-ngx";
import { Event } from 'nostr-tools';
import { IProfile } from "../domain/profile.interface";
import { IUnauthenticatedUser } from "../domain/unauthenticated-user.interface";
import { NostrSigner } from "./nostr.signer";
import { ProfileNostr } from "./profile.nostr";
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
    private profileApi: ProfileNostr,
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

  async load(npubs: TNostrPublic, relays?: TRelayMap | string[]): Promise<IProfile>;
  async load(npubs: TNostrPublic[], relays?: TRelayMap | string[]): Promise<IProfile[]>;
  async load(npubs: TNostrPublic[] | TNostrPublic, relays?: TRelayMap | string[]): Promise<IProfile | IProfile[]> {
    if (typeof npubs === 'string') {
      const indexedProfile = ProfileCache.profiles[npubs];
      if (!indexedProfile || !indexedProfile.load) {
        return this.loadProfile(npubs, relays);
      }

      return Promise.resolve(indexedProfile);
    } else {
      return this.loadProfiles(npubs, relays);
    }
  }

  loadFromPublicHexa(pubkey: string, relays?: TRelayMap | string[]): Promise<IProfile> {
    return this.loadProfile(this.nostrConverter.castPubkeyToNostrPublic(pubkey), relays);
  }

  async loadAccountFromCredentials(nsec: TNostrSecret, password: string, relays?: TRelayMap | string[]): Promise<IUnauthenticatedUser | null> {
    const user = this.nostrConverter.convertNsecToNpub(nsec);
    const profile = await this.load(user.npub, relays);
    const ncrypted = this.nostrSigner.encryptNsec(password, nsec);
    const account = this.accountManagerStatefull.addAccount(profile, ncrypted);

    return Promise.resolve(account);
  }

  async loadProfiles(npubss: TNostrPublic[], relays?: TRelayMap | string[]): Promise<IProfile[]> {
    const npubs = [...new Set(npubss.flat(1))];
    const notLoaded = npubs.filter(npub => !this.profileCache.isEagerLoaded(npub))

    return this.forceProfileReload(notLoaded, relays);
  }

  async loadProfile(npub: TNostrPublic, relays?: TRelayMap | string[]): Promise<IProfile> {
    return this.loadProfiles([npub], relays)
      .then(profiles => Promise.resolve(profiles[0]));
  }
  
  private async forceProfileReload(npubs: Array<TNostrPublic>, relays?: TRelayMap | string[]): Promise<Array<IProfile>> {
    const events = await this.profileApi.loadProfiles(npubs, relays);
    this.profileCache.cache(events);
    return Promise.resolve(npubs.map(npub => this.profileCache.get(npub)));
  }
}
