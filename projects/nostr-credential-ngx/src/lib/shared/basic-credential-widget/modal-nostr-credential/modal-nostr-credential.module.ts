import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalNostrCredentialComponent } from './modal-nostr-credential.component';
import { SelectAuthenticationListModule } from '../select-authentication-list/select-authentication-list.module';
import { AuthenticateFormModule } from '../authenticate-form/authenticate-form.module';
import { AddAccountFormModule } from '../add-account-form/add-account-form.module';
import { LoadingWidgetModule } from '../../loading/loading-widget.module';

@NgModule({
  declarations: [
    ModalNostrCredentialComponent
  ],
  imports: [
    CommonModule,
    AddAccountFormModule,
    AuthenticateFormModule,
    LoadingWidgetModule,
    SelectAuthenticationListModule
  ],
  exports: [
    ModalNostrCredentialComponent
  ]
})
export class ModalNostrCredentialModule { }
