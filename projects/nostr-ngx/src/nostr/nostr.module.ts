import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ConfigsLocalStorage } from '../configs/configs-local.storage';
import { ConfigsSessionStorage } from '../configs/configs-session.storage';
import { IdbStoreModule } from '../idb-cache/idb-cache.module';
import { NSecCrypto } from './nsec.crypto';
import { NostrConverter } from './nostr.converter';
import { NostrGuard } from './nostr.guard';

@NgModule({
  imports: [
    CommonModule,
    IdbStoreModule
  ],
  providers: [
    NostrGuard,
    NostrConverter,
    NSecCrypto,
    ConfigsSessionStorage,
    ConfigsLocalStorage
  ]
})
export class NostrModule { }
