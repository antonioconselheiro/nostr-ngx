import { Injectable } from '@angular/core';
import {  TNostrPublic } from '@belomonte/nostr-ngx';
import { Event, nip19 } from 'nostr-tools';
import { IProfileMetadata } from './profile-metadata.interface';
import { NostrMetadata } from '@nostrify/nostrify';

@Injectable({
  providedIn: 'root'
})
export class ProfileConverter {

  getMetadataFromNostrPublic(npub: TNostrPublic): NostrMetadata {
    return { npub, load: false };
  }

  convertEventToProfile(profile: Event, mergeWith?: NostrMetadata): NostrMetadata {
    let metadata: IProfileMetadata;
    try {
      metadata = JSON.parse(profile.content);
    } catch {
      metadata = { about: profile.content };
    }
    
    const npub = nip19.npubEncode(profile.pubkey);
    let newProfile: NostrMetadata;
    if (mergeWith) {
      newProfile = mergeWith;
      newProfile.npub = npub;
      Object.assign(newProfile, metadata);
    } else {
      newProfile = {
        npub: npub,
        ...metadata
      }
    }

    return newProfile;
  }
}
