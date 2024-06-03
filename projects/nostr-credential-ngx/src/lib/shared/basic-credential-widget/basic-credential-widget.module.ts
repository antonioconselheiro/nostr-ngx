import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AsyncModalModule } from '@belomonte/async-modal-ngx';
import { ModalNostrCredentialModule } from './modal-nostr-credential/modal-nostr-credential.module';

@NgModule({
  imports: [
    CommonModule,
    AsyncModalModule,
    ModalNostrCredentialModule
  ],
  exports: [
    AsyncModalModule
  ]
})
export class BasicCredentialWidgetModule { }
