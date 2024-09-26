import { Component, Input, Inject } from '@angular/core';
import { Account, NOSTR_CONFIG_TOKEN, NostrConfig } from '@belomonte/nostr-ngx';
import { ProfilePicture } from '../../domain/profile-picture.interface';

@Component({
  selector: 'nostr-profile-picture',
  templateUrl: './profile-picture.component.html'
})
export class ProfilePictureComponent {

  @Input()
  profile: ProfilePicture | null = null;

  @Input()
  account: Account | null = null;

  constructor(
    @Inject(NOSTR_CONFIG_TOKEN) private nostrConfig: Required<NostrConfig>
  ) {}

  getPicture(): string {
    if (this.profile && this.profile.picture) {
      return this.profile.picture;
    } else if (this.account && this.account.picture) {
      return this.account.picture;
    } else {
      return this.nostrConfig.defaultProfile.picture;
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

