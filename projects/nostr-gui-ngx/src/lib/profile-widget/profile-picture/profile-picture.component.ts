import { Component, Input } from '@angular/core';
import { ProfilePicture } from '../../domain/profile-picture.interface';
import { UnauthenticatedAccount } from '@belomonte/nostr-ngx';

@Component({
  selector: 'nostr-profile-picture',
  templateUrl: './profile-picture.component.html'
})
export class ProfilePictureComponent {

  static defaultPicture = '/assets/profile/default-profile.png'; 

  @Input()
  profile: ProfilePicture | null = null;

  @Input()
  account: UnauthenticatedAccount | null = null;

  getPicture(): string {
    if (this.profile && this.profile.picture) {
      return this.profile.picture;
    } else if (this.account && this.account.picture) {
      return this.account.picture;
    } else {
      return ProfilePictureComponent.defaultPicture;
    }
  }

  getTitle(): string {
    if (this.profile) {
      return this.profile.display_name || this.profile.name || '';
    } else if (this.account) {
      return this.account.metadata?.display_name || '';
    }

    return 'profile picture';
  }
}

