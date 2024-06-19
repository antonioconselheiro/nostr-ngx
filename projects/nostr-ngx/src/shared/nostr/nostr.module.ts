import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NostrService } from './nostr.service';
import { RelayService } from './relay.service';
import { NostrGuard } from './nostr.guard';
import { NostrConverter } from './nostr.converter';
import { ConfigsSessionStorage } from './configs-session.storage';
import { ConfigsLocalStorage } from './configs-local.storage';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    NostrService,
    RelayService,
    NostrGuard,
    NostrConverter,
    ConfigsSessionStorage,
    ConfigsLocalStorage
  ]
})
export class NostrModule { }
