import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PoolModule } from '../pool/pool.module';
import { AccountManagerService } from './account-manager.service';
import { CurrentAccountObservable } from './current-account.observable';
import { ProfileEventFactory } from './profile-event.factory';
import { ProfileCache } from './profile.cache';
import { ProfileNostr } from './profile.nostr';
import { ProfileProxy } from './profile.proxy';
import { AccountFactory } from './account.factory';

@NgModule({
  imports: [
    CommonModule,
    PoolModule
  ],
  providers: [
    ProfileNostr,
    ProfileCache,
    AccountFactory,
    ProfileProxy,
    ProfileEventFactory,
    AccountManagerService,
    CurrentAccountObservable
  ]
})
export class ProfileModule { }
