import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PoolModule } from '../pool/pool.module';
import { AccountManagerService } from './account-manager.service';
import { AccountFactory } from './account.factory';
import { CurrentProfileObservable } from './current-profile.observable';
import { Nip05Proxy } from './nip05.proxy';
import { ProfileEventFactory } from './profile-event.factory';
import { ProfileCache } from './profile.cache';
import { ProfileNostr } from './profile.nostr';
import { ProfileProxy } from './profile.proxy';
import { AccountGuard } from './account.guard';

@NgModule({
  imports: [
    CommonModule,
    PoolModule
  ],
  providers: [
    Nip05Proxy,
    ProfileNostr,
    ProfileCache,
    AccountGuard,
    AccountFactory,
    ProfileProxy,
    ProfileEventFactory,
    AccountManagerService,
    CurrentProfileObservable
  ]
})
export class ProfileModule { }
