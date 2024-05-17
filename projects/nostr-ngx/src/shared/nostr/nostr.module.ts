import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NostrService } from './nostr.service';
import { RelayService } from './relay.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    NostrService,
    RelayService
  ]
})
export class NostrModule { }
