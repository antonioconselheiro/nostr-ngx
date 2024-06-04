import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsyncModalModule } from '@belomonte/async-modal-ngx'
import { NostrAuthCheckComponent } from './nostr-auth-check.component';
import { BasicCredentialWidgetModule } from '@belomonte/nostr-credential-ngx';

@NgModule({
  declarations: [
    NostrAuthCheckComponent
  ],
  imports: [
    CommonModule,
    AsyncModalModule,
    BasicCredentialWidgetModule
  ]
})
export class NostrAuthCheckModule { }
