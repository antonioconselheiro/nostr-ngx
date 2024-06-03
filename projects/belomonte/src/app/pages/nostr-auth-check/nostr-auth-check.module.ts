import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsyncModalModule } from '@belomonte/async-modal-ngx'
import { NostrAuthCheckComponent } from './nostr-auth-check.component';

@NgModule({
  declarations: [
    NostrAuthCheckComponent
  ],
  imports: [
    CommonModule,
    AsyncModalModule
  ]
})
export class NostrAuthCheckModule { }
