import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NSecCrypto } from './nsec.crypto';
import { NostrConverter } from './nostr.converter';
import { NostrGuard } from './nostr.guard';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    NostrGuard,
    NostrConverter,
    NSecCrypto
  ]
})
export class NostrUtilsModule { }
