import { Component, Input } from '@angular/core';
import { IProfilePicture } from '../../../domain/profile-picture.interface';
import { IUnauthenticatedUser } from '../../../domain/unauthenticated-user';

@Component({
  selector: 'nostr-profile-picture',
  templateUrl: './profile-picture.component.html',
  styleUrl: './profile-picture.component.scss'
})
export class ProfilePictureComponent {

  static defaultPicture = '/assets/profile/default-profile.png'; 

  @Input()
  tabindex?: number;

  @Input()
  profile: IProfilePicture | null = null;

  @Input()
  account: IUnauthenticatedUser | null = null;

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

