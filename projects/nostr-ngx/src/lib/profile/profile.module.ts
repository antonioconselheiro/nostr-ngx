import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AccountManagerService } from './account-manager.service';
import { AuthenticatedAccountObservable } from './authenticated-account.observable';
import { ProfileCache } from './profile.cache';
import { ProfileNostr } from './profile.nostr';
import { ProfileService } from './profile.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    ProfileNostr,
    ProfileCache,
    ProfileService,
    AccountManagerService,
    AuthenticatedAccountObservable
  ]
})
export class ProfileModule { }
