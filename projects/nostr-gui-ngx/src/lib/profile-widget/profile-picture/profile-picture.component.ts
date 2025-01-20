import { Component, Inject, Input } from '@angular/core';
import { AccountCacheable, NOSTR_CONFIG_TOKEN, NostrConfig } from '@belomonte/nostr-ngx';
import { ProfilePicture } from '../../domain/profile-picture.interface';

@Component({
  selector: 'nostr-profile-picture',
  templateUrl: './profile-picture.component.html'
})
export class ProfilePictureComponent {

  @Input()
  profile: ProfilePicture | null = null;

  /**
   * fixme: preciso de tipos que agrupem os account que tem dados comuns
   */
  @Input()
  account: AccountCacheable | null = null;

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

