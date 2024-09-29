import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AsyncModalModule } from '@belomonte/async-modal-ngx';
import { ModalNostrCredentialModule } from './modal-nostr-credential/modal-nostr-credential.module';
import { CredentialHandlerComponent } from './credential-handler/credential-handler.component';
import { CredentialHandlerService } from './credential-handler.service';
import { SvgRenderModule } from '../svg-render/svg-render.module';
import { NostrModule } from '@belomonte/nostr-ngx';
import { QrcodeServiceModule } from '../qrcode-service/qrcode-service.module';
import { CameraModule } from '../camera/camera.module';

@NgModule({
  imports: [
    CommonModule,
    AsyncModalModule,
    SvgRenderModule,
    NostrModule,
    CameraModule,
    ModalNostrCredentialModule,
    QrcodeServiceModule
  ],
  exports: [
    AsyncModalModule,
    AsyncModalModule,
    SvgRenderModule,
    NostrModule,
    CameraModule,
    ModalNostrCredentialModule,
    QrcodeServiceModule,
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
