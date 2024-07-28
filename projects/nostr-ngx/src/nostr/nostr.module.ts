import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NostrService } from './nostr.service';
import { NostrGuard } from './nostr.guard';
import { NostrConverter } from './nostr.converter';
import { ConfigsSessionStorage } from '../storage/configs-session.storage';
import { ConfigsLocalStorage } from '../storage/configs-local.storage';
import { MainPool } from './main.pool';
import { NostrSecretCrypto } from './nostr-secret.crypto';

@NgModule({
  imports: [
    CommonModule
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
