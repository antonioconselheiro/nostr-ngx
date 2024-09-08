import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ConfigsLocalStorage } from '../configs/configs-local.storage';
import { ConfigsSessionStorage } from '../configs/configs-session.storage';
import { IdbCacheModule } from '../idb-cache/idb-cache.module';
import { NostrSecretCrypto } from './nostr-secret.crypto';
import { NostrConverter } from './nostr.converter';
import { NostrGuard } from './nostr.guard';
import { NostrService } from './nostr.service';

@NgModule({
  imports: [
    CommonModule,
    IdbCacheModule
  ],
  providers: [
    NostrService,
    NostrGuard,
    NostrConverter,
    NostrSecretCrypto,
    ConfigsSessionStorage,
    ConfigsLocalStorage
  ]
})
export class NostrModule { }
