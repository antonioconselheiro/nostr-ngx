import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MediaUploader } from '@belomonte/nostr-ngx';
import { AuthenticatedProfileObservable } from '../../../profile-service/authenticated-profile.observable';
import { TAuthModalSteps } from '../../auth-modal-steps.type';

@Component({
  selector: 'nostr-register-account',
  templateUrl: './register-account.component.html',
  styleUrls: [ './register-account.component.scss' ]
})
export class RegisterAccountComponent implements OnInit {

  @Output()
  changeStep = new EventEmitter<TAuthModalSteps>();

  submitted = false;

  registerAccount!: FormGroup<{
    displayName: FormControl<string | null>;
    picture: FormControl<string | null>;
    banner: FormControl<string | null>;
    bio: FormControl<string | null>;
    url: FormControl<string | null>;
  }>;

  uploadedProfilePicture = AuthenticatedProfileObservable.DEFAULT_PROFILE_PICTURE;
  uploadedBanner = AuthenticatedProfileObservable.DEFAULT_BANNER_PICTURE;

  constructor(
    private fb: FormBuilder,
    private profile$: AuthenticatedProfileObservable,
    private mediaUploader: MediaUploader
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.registerAccount = this.fb.group({
      displayName: [''],
      picture: [''],
      banner: [''],
      bio: [''],
      url: ['']
    })
  }

  uploadProfilePicture(): void {

    this.mediaUploader
      .uploadFromDialog('http://nostr.build', { media_type: 'avatar' })
      .subscribe({
        next: status => {
          if (status.type === 'complete') {
            this.uploadedProfilePicture = status.downloadUrl;
            this.registerAccount.patchValue({ picture: status.downloadUrl })
          }
        }
      });
  }

  uploadBanner(): void {
    this.mediaUploader
      .uploadFromDialog('http://nostr.build', { media_type: 'banner' })
      .subscribe({
        next: status => {
          if (status.type === 'complete') {
            this.uploadedBanner = status.downloadUrl;
            this.registerAccount.patchValue({ banner: status.downloadUrl })
          }
        }
      });
  }

  onSubmit(): void {
    // TODO:
  }
}
