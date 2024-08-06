import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { calculateFileHash, generateDownloadUrl, readServerConfig, uploadFile } from 'nostr-tools/nip96';
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

  uploadedProfilePicture = AuthenticatedProfileObservable.DEFAULT_PROFILE_PICTURE;
  uploadedBanner = AuthenticatedProfileObservable.DEFAULT_BANNER_PICTURE;

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

  async uploadProfilePicture(): Promise<string> {
    //  TODO: por enquanto estou abrindo para image/* mas o correto seria limitar a seleção
    //  para os mime types listados na configuração .well-known to servidor de imagens
    const file = await this.fileManager.load({ format: 'file' });
    //  TODO: preciso dar suporte a outros servidores de imagem destinados a clients nostr,
    //  TODO: preciso validar o uso deste servidor 
    const fileServer = 'https://nostr.build';
    if (file) {

      const serverConfig = await readServerConfig(fileServer);
      const response = await uploadFile(file, serverConfig.api_url, '', {
        size: String(file.size),
        media_type: 'avatar',
        content_type: file.type
      });

      if (response.status === 'error') {
        return Promise.reject(response);
      }

      const matchExtensionRegex = /(?:\.([^.]+))?$/;
      const fileHash = await calculateFileHash(file);
      const [ fileExtension ] = Array.from(file.name.match(matchExtensionRegex) || []);
      const downloadUrl = generateDownloadUrl(fileHash, serverConfig.download_url || fileServer, fileExtension);

      if (response.status === 'success') {
        return Promise.resolve(downloadUrl);
      } else {
        //  TODOING: implementar função assincrona para aguardar o processamento da imagem
        response.processing_url;
      }
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
    // TODO:
  }
}
