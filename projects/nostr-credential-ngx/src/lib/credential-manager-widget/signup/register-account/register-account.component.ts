import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { uploadFile } from 'nostr-tools/nip96';
import { FileManagerService } from '../../../file-manager/file-manager.service';
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

  uploadedImage?: string = decodeURIComponent('https%3A%2F%2Fnostr.build%2Fi%2Fe89d4572c560e72c08ce440064b64196d0839bbb628774096f33250775b4aa8a.jpg');
  uploadedBanner?: string = decodeURIComponent('https%3A%2F%2Fnostr.build%2Fi%2F8814d42a71f542c0bf7453318fb7d7145106475adbed73235ac419bc26c85add.jpg');

  constructor(
    private fb: FormBuilder,
    private profile$: AuthenticatedProfileObservable,
    private fileManager: FileManagerService
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

  async uploadProfilePicture(): Promise<void> {
    //  TODO: por enquanto estou abrindo para image/* mas o correto seria limitar a seleção
    //  para os mime types listados na configuração .well-known to servidor de imagens
    const file = await this.fileManager.load({ format: 'file' });

    if (file) {
      const { serverApiUrl, nip98AuthorizationHeader } = await this.profile$.getUploadFileConfigs();
      const response = await uploadFile(file, serverApiUrl, nip98AuthorizationHeader, {
        size: String(file.size),
        media_type: 'avatar',
        content_type: file.type
      });

      response.processing_url
    }
  }

  async uploadBanner(): Promise<void> {
    //  TODO: por enquanto estou abrindo para image/* mas o correto seria limitar a seleção
    //  para os mime types listados na configuração .well-known to servidor de imagens
    const file = await this.fileManager.load({ format: 'file' });

    if (file) {
      const { serverApiUrl, nip98AuthorizationHeader } = await this.profile$.getUploadFileConfigs();
      uploadFile(file, serverApiUrl, nip98AuthorizationHeader, {
        size: String(file.size),
        media_type: 'banner',
        content_type: file.type
      });
    }
  }

  onSubmit(): void {
    
  }
}
