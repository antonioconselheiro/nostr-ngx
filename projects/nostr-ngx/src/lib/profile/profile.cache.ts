import { Injectable } from '@angular/core';
import { NostrEvent } from 'nostr-tools';
import { ProfileConverter } from "./profile.converter";
import { NostrMetadata } from '@nostrify/nostrify';
import { NPub } from '../domain/npub.type';
import { NostrConverter } from '../nostr/nostr.converter';

// FIXME: must create an specific structure LNRU based to profile caching
@Injectable({
  providedIn: 'root'
})
export class ProfileCache {

  static instance: ProfileCache | null = null;

  static profiles: {
    [npub: NPub]: NostrMetadata
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

  get(npubs: NPub): NostrMetadata;
  get(npubs: NPub[]): NostrMetadata[];
  get(npubs: NPub[] | NPub): NostrMetadata | NostrMetadata[];
  get(npubs: NPub[] | NPub): NostrMetadata | NostrMetadata[] {
    if (typeof npubs === 'string') {
      return this.getLazily(npubs);
    } else {
      return npubs.map(npub => this.getLazily(npub));
    }
  }

  isEagerLoaded(npub: NPub): boolean {
    return this.get(npub).load || false;
  }

  getFromPubKey(pubkey: string): NostrMetadata {
    return this.get(this.nostrConverter.castPubkeyToNpub(pubkey));
  }

  private getLazily(npub: NPub): NostrMetadata {
    if (ProfileCache.profiles[npub]) {
      return ProfileCache.profiles[npub];
    }

    return ProfileCache.profiles[npub] = this.profileConverter.getMetadataFromNostrPublic(npub);
  }

  cache(profiles: NostrMetadata[]): void {
    profiles.forEach(profile => this.cacheProfile(profile));
  }

  cacheFromEvent(events: NostrEvent[]): void {
    this.cache(events.map(event => this.profileConverter.convertEventToProfile(event)));
  }

  private cacheProfile(profile: NostrMetadata): NostrMetadata {
    ProfileCache.profiles[profile.npub] = Object.assign(
      ProfileCache.profiles[profile.npub] || {},
      this.chooseNewer(profile, ProfileCache.profiles[profile.npub])
    );

    return ProfileCache.profiles[profile.npub];
  }

  private chooseNewer(updatedProfile: NostrMetadata, indexedProfile: NostrMetadata | undefined): NostrMetadata {
    if (!indexedProfile || !indexedProfile.load) {
      return updatedProfile;
    }

    if (Number(updatedProfile.created_at) >= Number(indexedProfile.created_at)) {
      return updatedProfile;
    }

    return indexedProfile;
  }
}
