import { Component } from '@angular/core';

@Component({
  selector: 'nostr-profile-picture',
  templateUrl: './profile-picture.component.html',
  styleUrl: './profile-picture.component.scss'
})
export class ProfilePictureComponent {

  readonly defaultPicture = '/assets/profile/default-profile.png'; 

  @Input()
  tabindex?: number;

  @Input()
  profile: IProfile | null = null;

  @Input()
  account: IUnauthenticatedUser | null = null;

  constructor(
    private error$: MainErrorObservable,
    private router: Router
  ) { }

  openProfile(): void {
    if (this.profile && this.profile.npub) {
      this.router.navigate(['/p', this.profile.npub]).catch(e => this.error$.next(e));
    }
  }

  getPicture(): string {
    if (this.profile && this.profile.picture) {
      return this.profile.picture;
    } else if (this.account && this.account.picture) {
      return this.account.picture;
    } else {
      return this.defaultPicture;
    }
  }

  getTitle(): string {
    if (this.profile) {
      return this.profile.display_name || this.profile.name || '';
    }

    return 'profile picture';
  }
}

