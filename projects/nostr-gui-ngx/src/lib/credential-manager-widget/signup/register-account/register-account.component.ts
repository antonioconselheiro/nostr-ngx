import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CurrentProfileObservable, NOSTR_CONFIG_TOKEN, NostrConfig, NostrMetadata, NostrPool, ProfileEventFactory } from '@belomonte/nostr-ngx';
import { AuthModalSteps } from '../../auth-modal-steps.type';

@Component({
  selector: 'nostr-register-account',
  templateUrl: './register-account.component.html',
  styleUrls: ['./register-account.component.scss']
})
export class RegisterAccountComponent implements OnInit {

  @Output()
  changeStep = new EventEmitter<AuthModalSteps>();

  submitted = false;

  registerAccount!: FormGroup<{
    displayName: FormControl<string | null>;
    picture: FormControl<string | null>;
    banner: FormControl<string | null>;
    about: FormControl<string | null>;
    url: FormControl<string | null>;
  }>;

  uploadedProfilePicture = this.nostrConfig.defaultProfile.picture;
  uploadedBanner = this.nostrConfig.defaultProfile.banner;

  constructor(
    private fb: FormBuilder,
    private npool: NostrPool,
    private profile$: CurrentProfileObservable,
    private profileEventFactory: ProfileEventFactory,
    @Inject(NOSTR_CONFIG_TOKEN) private nostrConfig: Required<NostrConfig>
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  // eslint-disable-next-line complexity
  private initForm(): void {
    const account = this.profile$.getValue();
    const metadata = account?.metadata || null;
    this.registerAccount = this.fb.group({
      displayName: [metadata?.display_name || ''],
      picture: [metadata?.picture || ''],
      banner: [metadata?.banner || ''],
      about: [metadata?.about || ''],
      url: [metadata?.website || '']
    });
  }

  uploadProfilePicture(): void {
    //  FIXME: revisar implementação
    //this.mediaUploader
    //  .uploadFromDialog('http://nostr.build', { media_type: 'avatar' })
    //  .subscribe({
    //    next: status => {
    //      if (status.type === 'complete') {
    //        this.uploadedProfilePicture = status.downloadUrl;
    //        this.registerAccount.patchValue({ picture: status.downloadUrl })
    //      }
    //    }
    //  });
  }

  uploadBanner(): void {
    //  FIXME: revisar implementação
    //this.mediaUploader
    //  .uploadFromDialog('http://nostr.build', { media_type: 'banner' })
    //  .subscribe({
    //    next: status => {
    //      if (status.type === 'complete') {
    //        this.uploadedBanner = status.downloadUrl;
    //        this.registerAccount.patchValue({ banner: status.downloadUrl })
    //      }
    //    }
    //  });
  }

  //  FIXME: aqui não deve ser IProfile, deve ser uma interface do perfil em sua forma original
  private castRawValueIntoProfileMetadata(currentProfile: NostrMetadata | null, rawValues: {
    displayName: string | null;
    picture: string | null;
    banner: string | null;
    about: string | null;
    url: string | null;
  }): NostrMetadata {
    return {
      ...currentProfile,
      display_name: rawValues.displayName || '',
      picture: rawValues.picture || '',
      banner: rawValues.banner || '',
      about: rawValues.about || '',
      website: rawValues.url || ''
    };
  }

  onSubmit(): void {
    if (!this.registerAccount.valid) {
      return;
    }

    const raw = this.registerAccount.getRawValue();
    const account = this.profile$.getValue();
    const updatedProfile = this.castRawValueIntoProfileMetadata(account?.metadata || null, raw);
    this.profileEventFactory
      .createProfileMetadata(updatedProfile)
      .then(nostrEvent => this.npool.event(nostrEvent));
  }
}
