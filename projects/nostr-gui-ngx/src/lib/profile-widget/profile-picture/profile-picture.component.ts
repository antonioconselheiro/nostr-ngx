import { Component, Inject, Input } from '@angular/core';
import { Account, NOSTR_CONFIG_TOKEN, NostrConfig } from '@belomonte/nostr-ngx';

@Component({
  selector: 'nostr-profile-picture',
  templateUrl: './profile-picture.component.html'
})
export class ProfilePictureComponent {

  /**
   * fixme: preciso de tipos que agrupem os account que tem dados comuns
   */
  @Input()
  account: Account | null = null;

  constructor(
    @Inject(NOSTR_CONFIG_TOKEN) private nostrConfig: Required<NostrConfig>
  ) { }

  getPicture(): string {
    if (this.account && this.account.picture) {
      return this.account.picture;
    } else {
      return this.nostrConfig.defaultProfile.picture;
    }
  }

  getTitle(): string {
    if (this.account) {
      return this.account.displayName;
    }

    return '…';
  }
}

