import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MediaUploader, NostrService } from '@belomonte/nostr-ngx';
import { IProfile } from '../../../domain/profile.interface';
import { AuthenticatedProfileObservable } from '../../../profile-service/authenticated-profile.observable';
import { TAuthModalSteps } from '../../auth-modal-steps.type';
import { RegisterAccountEventFactory } from './register-account.event-factory';

@Component({
  selector: 'nostr-register-account',
  templateUrl: './register-account.component.html',
  styleUrls: ['./register-account.component.scss']
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
    private nostrService: NostrService,
    private registerAccountEventFactory: RegisterAccountEventFactory,
    private profile$: AuthenticatedProfileObservable,
    private mediaUploader: MediaUploader
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  // eslint-disable-next-line complexity
  private initForm(): void {
    const currentProfile = this.profile$.getCurrentAuthProfile();
    this.registerAccount = this.fb.group({
      displayName: [currentProfile?.display_name || ''],
      picture: [currentProfile?.picture || ''],
      banner: [currentProfile?.banner || ''],
      bio: [currentProfile?.bio || ''],
      url: [currentProfile?.website || '']
    });
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

  //  FIXME: aqui não deve ser IProfile, deve ser uma interface do perfil em sua forma original
  private castRawValueIntoProfileMetadata(currentProfile: IProfile | null, rawValues: {
    displayName: string | null;
    picture: string | null;
    banner: string | null;
    bio: string | null;
    url: string | null;
  }): IProfile {
    return {
      ...currentProfile,
      display_name: rawValues.displayName || '',
      picture: rawValues.picture || '',
      banner: rawValues.banner || '',
      bio: rawValues.bio || '',
      website: rawValues.url || ''
    };
  }

  onSubmit(): void {
    if (!this.registerAccount.valid) {
      return;
    }

    const raw = this.registerAccount.getRawValue();
    const profile = this.profile$.getCurrentAuthProfile();
    const updatedProfile = this.castRawValueIntoProfileMetadata(profile, raw);
    this.registerAccountEventFactory
      .createProfileMetadata(updatedProfile)
      .then(nostrEvent => this.nostrService.publish(nostrEvent));
  }
}
