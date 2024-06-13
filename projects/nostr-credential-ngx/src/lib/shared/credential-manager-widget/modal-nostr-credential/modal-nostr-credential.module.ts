import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalNostrCredentialComponent } from './modal-nostr-credential.component';
import { SelectAuthenticationListModule } from '../select-authentication-list/select-authentication-list.module';
import { AuthenticateFormModule } from '../authenticate-form/authenticate-form.module';
import { LoginFormModule } from '../login-form/login-form.module';
import { LoadingWidgetModule } from '../../loading/loading-widget.module';
import { RegisterAccountFormModule } from '../register-account/register-account.module';

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
    SelectAuthenticationListModule
  ],
  exports: [
    ModalNostrCredentialComponent
  ]
})
export class ModalNostrCredentialModule { }
