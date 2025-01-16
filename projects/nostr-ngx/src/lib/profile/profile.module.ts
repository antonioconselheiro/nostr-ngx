import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PoolModule } from '../pool/pool.module';
import { AccountManagerService } from './account-manager.service';
import { AccountFactory } from './account.factory';
import { CurrentAccountObservable } from './current-account.observable';
import { Nip05Proxy } from './nip05.proxy';
import { ProfileEventFactory } from './profile-event.factory';
import { ProfileImageFlyweight } from './profile-image.flyweight';
import { ProfileCache } from './profile.cache';
import { ProfileNostr } from './profile.nostr';
import { ProfileProxy } from './profile.proxy';

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
    Nip05Proxy,
    ProfileEventFactory,
    ProfileImageFlyweight,
    AccountManagerService,
    CurrentAccountObservable
  ]
})
export class ProfileModule { }
