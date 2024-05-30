import { Injectable } from '@angular/core';
import {  TNostrPublic } from '@belomonte/nostr-ngx';
import { Event, nip19 } from 'nostr-tools';
import { IProfile } from '../../domain/profile.interface';
import { IProfileMetadata } from './profile-metadata.interface';

@Injectable()
export class ProfileConverter {

  getMetadataFromNostrPublic(npub: TNostrPublic): IProfile {
    return { npub, load: false };
  }

  convertEventToProfile(profile: Event, mergeWith?: IProfile ): IProfile {
    let metadata: IProfileMetadata;
    try {
      metadata = JSON.parse(profile.content);
    } catch (e) {
      metadata = { about: profile.content };
    }
    
    const npub = nip19.npubEncode(profile.pubkey);
    let newProfile: IProfile;
    if (mergeWith) {
      newProfile = mergeWith;
      newProfile.npub = npub;
      newProfile.load = true;
      Object.assign(newProfile, metadata);
    } else {
      newProfile = {
        npub: npub,
        load: true,
        ...metadata
      }
    }

    return newProfile;
  }
}
