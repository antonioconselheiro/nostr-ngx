import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AsyncModalModule } from '@belomonte/async-modal-ngx';
import { ModalNostrCredentialModule } from './modal-nostr-credential/modal-nostr-credential.module';
import { CredentialHandlerComponent } from './credential-handler/credential-handler.component';
import { CredentialHandlerService } from './credential-handler.service';
import { SvgRenderModule } from '../svg-render/svg-render.module';
import { NostrModule } from '@belomonte/nostr-ngx';
import { QrcodeServiceModule } from '../qrcode-service/qrcode-service.module';
import { CredentialStorageModule } from '../../../../nostr-ngx/src/lib/credential-storage/credential-storage.module';

@NgModule({
  imports: [
    CommonModule,
    AsyncModalModule,
    SvgRenderModule,
    NostrModule,
    CredentialStorageModule,
    ModalNostrCredentialModule,
    QrcodeServiceModule
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
