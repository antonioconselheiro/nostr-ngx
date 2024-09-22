import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsyncModalModule } from '@belomonte/async-modal-ngx'
import { NostrAuthCheckComponent } from './nostr-auth-check.component';
import { CredentialManagerWidgetModule } from '@belomonte/nostr-gui-ngx';

@NgModule({
  declarations: [
    NostrAuthCheckComponent
  ],
  imports: [
    CommonModule,
    AsyncModalModule,
    CredentialManagerWidgetModule
  ]
})
export class NostrAuthCheckModule { }
