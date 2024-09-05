import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NostrService } from './nostr.service';
import { NostrGuard } from './nostr.guard';
import { NostrConverter } from './nostr.converter';
import { ConfigsSessionStorage } from '../configs/configs-session.storage';
import { ConfigsLocalStorage } from '../configs/configs-local.storage';
import { MainPool } from './main.pool';
import { NostrSecretCrypto } from './nostr-secret.crypto';
import { IdbCacheModule } from '../idb-cache/idb-cache.module';

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
    MainPool,
    ConfigsSessionStorage,
    ConfigsLocalStorage
  ]
})
export class NostrModule { }
