import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ProfileNostr } from './profile.nostr';
import { ProfileCache } from './profile.cache';
import { ProfileService } from './profile.service';
import { AccountManagerService } from './account-manager.service';
import { AuthenticatedAccountObservable } from './authenticated-account.observable';

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
