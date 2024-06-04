import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AsyncModalModule } from '@belomonte/async-modal-ngx';
import { ModalNostrCredentialModule } from './modal-nostr-credential/modal-nostr-credential.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { IconArrowNarrowRight, IconEye, IconEyeOff, IconInfoCircle, IconLogout } from 'angular-tabler-icons/icons';

@NgModule({
  imports: [
    CommonModule,
    AsyncModalModule,
    ModalNostrCredentialModule,
    TablerIconsModule.pick({
      IconEye,
      IconEyeOff,
      IconInfoCircle,
      IconLogout,
      IconArrowNarrowRight
    })
  ],
  exports: [
    AsyncModalModule,
    TablerIconsModule
  ]
})
export class BasicCredentialWidgetModule { }
