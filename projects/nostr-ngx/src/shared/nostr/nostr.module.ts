import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NostrService } from './nostr.service';
import { RelayService } from './relay.service';
import { NostrGuard } from './nostr.guard';
import { NostrConverter } from './nostr.converter';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    NostrService,
    RelayService,
    NostrGuard,
    NostrConverter
  ]
})
export class NostrModule { }
