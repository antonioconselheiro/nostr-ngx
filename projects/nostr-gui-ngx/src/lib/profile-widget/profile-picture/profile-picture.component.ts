import { Component, Input } from '@angular/core';
import { IProfilePicture } from '../../domain/profile-picture.interface';
import { IUnauthenticatedAccount } from '../../domain/unauthenticated-account.interface';

@Component({
  selector: 'nostr-profile-picture',
  templateUrl: './profile-picture.component.html'
})
export class ProfilePictureComponent {

  static defaultPicture = '/assets/profile/default-profile.png'; 

  @Input()
  profile: IProfilePicture | null = null;

  @Input()
  account: IUnauthenticatedAccount | null = null;

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
      return this.account.displayName;
    }

    return 'profile picture';
  }
}

