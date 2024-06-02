import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RelayCommunicationCheckComponent } from './relay-communication-check.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NostrModule } from '@belomonte/nostr-ngx';

@NgModule({
  declarations: [
    RelayCommunicationCheckComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NostrModule,
    FormsModule
  ]
})
export class RelayCommunicationCheckModule { }
