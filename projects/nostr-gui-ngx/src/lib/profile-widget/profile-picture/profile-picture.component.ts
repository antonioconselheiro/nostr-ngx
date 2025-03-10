import { Component, Inject, Input } from '@angular/core';
import { Account, NOSTR_CONFIG_TOKEN, NostrConfig } from '@belomonte/nostr-ngx';

@Component({
  selector: 'nostr-profile-picture',
  templateUrl: './profile-picture.component.html',
  styleUrls: [
    './profile-picture.component.scss'
  ]
})
export class ProfilePictureComponent {

  /**
   * FIXME: preciso de tipos que agrupem os account que tem dados comuns
   */
  @Input()
  account: Account | null = null;

  @Input()
  verticalConnected = false;

  constructor(
    @Inject(NOSTR_CONFIG_TOKEN) private nostrConfig: Required<NostrConfig>
  ) { }

  getPicture(): string {
    if (this.account) {
      if (this.account.pictureBase64) {
        return this.account.pictureBase64;
      } else if (this.account.pictureUrl) {
        return this.account.pictureUrl;
      }
    }

    return this.nostrConfig.defaultProfile.picture;
  }

  getTitle(): string {
    if (this.account && this.account.displayName) {
      return this.account.displayName;
    }

    return '…';
  }
}

