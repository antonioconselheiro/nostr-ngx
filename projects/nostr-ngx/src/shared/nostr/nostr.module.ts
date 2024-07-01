import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NostrService } from './nostr.service';
import { NostrGuard } from './nostr.guard';
import { NostrConverter } from './nostr.converter';
import { ConfigsSessionStorage } from './configs-session.storage';
import { ConfigsLocalStorage } from './configs-local.storage';
import { PoolStatefull } from './pool.statefull';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    NostrService,
    NostrGuard,
    NostrConverter,
    PoolStatefull,
    ConfigsSessionStorage,
    ConfigsLocalStorage
  ]
})
export class NostrModule { }
