import { Injectable } from '@angular/core';
import { NostrConverter, TNostrPublic } from '@belomonte/nostr-ngx';
import { NostrEvent } from 'nostr-tools';
import { IProfile } from "../domain/profile.interface";
import { ProfileConverter } from "./profile.converter";

@Injectable({
  providedIn: 'root'
})
export class ProfileCache {

  static instance: ProfileCache | null = null;

  static profiles: {
    [npub: TNostrPublic]: IProfile
  } = {};

  constructor(
    private nostrConverter: NostrConverter,
    private profileConverter: ProfileConverter
  )  {
    if (!ProfileCache.instance) {
      ProfileCache.instance = this;
    }

    return ProfileCache.instance;
  }

  get(npubs: TNostrPublic): IProfile;
  get(npubs: TNostrPublic[]): IProfile[];
  get(npubs: TNostrPublic[] | TNostrPublic): IProfile | IProfile[];
  get(npubs: TNostrPublic[] | TNostrPublic): IProfile | IProfile[] {
    if (typeof npubs === 'string') {
      return this.getLazily(npubs);
    } else {
      return npubs.map(npub => this.getLazily(npub));
    }
  }

  isEagerLoaded(npub: TNostrPublic): boolean {
    return this.get(npub).load || false;
  }

  getFromPubKey(pubkey: string): IProfile {
    return this.get(this.nostrConverter.castPubkeyToNostrPublic(pubkey));
  }

  private getLazily(npub: TNostrPublic): IProfile {
    if (ProfileCache.profiles[npub]) {
      return ProfileCache.profiles[npub];
    }

    return ProfileCache.profiles[npub] = this.profileConverter.getMetadataFromNostrPublic(npub);
  }

  cache(profiles: IProfile[]): void {
    profiles.forEach(profile => this.cacheProfile(profile));
  }

  cacheFromEvent(events: NostrEvent[]): void {
    this.cache(events.map(event => this.profileConverter.convertEventToProfile(event)));
  }

  private cacheProfile(profile: IProfile): IProfile {
    ProfileCache.profiles[profile.npub] = Object.assign(
      ProfileCache.profiles[profile.npub] || {},
      this.chooseNewer(profile, ProfileCache.profiles[profile.npub])
    );

    return ProfileCache.profiles[profile.npub];
  }

  private chooseNewer(updatedProfile: IProfile, indexedProfile: IProfile | undefined): IProfile {
    if (!indexedProfile || !indexedProfile.load) {
      return updatedProfile;
    }

    if (Number(updatedProfile.created_at) >= Number(indexedProfile.created_at)) {
      return updatedProfile;
    }

    return indexedProfile;
  }
}
