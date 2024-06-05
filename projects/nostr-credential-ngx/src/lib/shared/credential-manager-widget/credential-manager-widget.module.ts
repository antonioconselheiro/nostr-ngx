import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AsyncModalModule } from '@belomonte/async-modal-ngx';
import { ModalNostrCredentialModule } from './modal-nostr-credential/modal-nostr-credential.module';
import { CredentialHandlerComponent } from './credential-handler/credential-handler.component';
import { CredentialHandlerService } from './credential-handler.service';

@NgModule({
  imports: [
    CommonModule,
    AsyncModalModule,
    ModalNostrCredentialModule
  ],
  exports: [
    AsyncModalModule,
    CredentialHandlerComponent
  ],
  declarations: [
    CredentialHandlerComponent
  ],
  providers: [
    CredentialHandlerService
  ]
})
export class CredentialManagerWidgetModule { }
