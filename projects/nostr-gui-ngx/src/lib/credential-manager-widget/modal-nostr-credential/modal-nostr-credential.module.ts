import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LoadingWidgetModule } from '../../loading/loading-widget.module';
import { AuthenticateFormModule } from '../authenticate-form/authenticate-form.module';
import { DownloadSignerModule } from '../download-signer/download-signer.module';
import { LoginFormModule } from '../login-form/login-form.module';
import { SelectAccountModule } from '../select-account/select-account.module';
import { ChoosePasswordModule } from '../signup/choose-password/choose-password.module';
import { CreateNsecAndNcryptsecModule } from '../signup/create-nsec-and-ncryptsec/create-nsec-and-ncryptsec.module';
import { CreateNsecFormModule } from '../signup/create-nsec/create-nsec.module';
import { RegisterAccountFormModule } from '../signup/register-account/register-account.module';
import { RelayManagerModule } from '../signup/relay-manager/relay-manager.module';
import { ModalNostrCredentialComponent } from './modal-nostr-credential.component';

@NgModule({
  declarations: [
    ModalNostrCredentialComponent
  ],
  imports: [
    CommonModule,
    LoginFormModule,
    AuthenticateFormModule,
    LoadingWidgetModule,
    RegisterAccountFormModule,
    SelectAccountModule,
    CreateNsecFormModule,
    CreateNsecAndNcryptsecModule,
    ChoosePasswordModule,
    RelayManagerModule,
    DownloadSignerModule
  ],
  exports: [
    ModalNostrCredentialComponent
  ]
})
export class ModalNostrCredentialModule { }
