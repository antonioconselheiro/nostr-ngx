import { Injectable } from '@angular/core';
import { DataLoadEnum, TNostrPublic } from '@belomonte/nostr-ngx';
import { Event, nip19 } from 'nostr-tools';
import { IProfile } from '../../domain/profile.interface';
import { IProfileMetadata } from './profile-metadata.interface';

@Injectable()
export class ProfileConverter {

  castPubkeyToNostrPublic(pubkey: string): string {
    return nip19.npubEncode(pubkey);
  }

  getMetadataFromNostrPublic(npub: TNostrPublic): IProfile {
    return { npub, load: DataLoadEnum.LAZY_LOADED };
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
      newProfile.load = DataLoadEnum.EAGER_LOADED;
      Object.assign(newProfile, metadata);
    } else {
      newProfile = {
        npub: npub,
        load: DataLoadEnum.EAGER_LOADED,
        ...metadata
      }
    }

    return newProfile;
  }
}
