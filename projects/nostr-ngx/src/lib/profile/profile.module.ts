import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AccountManagerService } from './account-manager.service';
import { CurrentAccountObservable } from './current-account.observable';
import { ProfileCache } from './profile.cache';
import { ProfileNostr } from './profile.nostr';
import { ProfileService } from './profile.service';
import { PoolModule } from '../pool/pool.module';

@NgModule({
  imports: [
    CommonModule,
    PoolModule
  ],
  providers: [
    ProfileNostr,
    ProfileCache,
    ProfileService,
    AccountManagerService,
    CurrentAccountObservable
  ]
})
export class ProfileModule { }
