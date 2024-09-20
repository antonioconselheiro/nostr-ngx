import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ProfileNostr } from './profile.nostr';
import { ProfileCache } from './profile.cache';
import { AccountConverter } from './account.converter';
import { ProfileService } from './profile.service';
import { AccountManagerStatefull } from './account-manager.statefull';
import { AuthenticatedAccountObservable } from './authenticated-profile.observable';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    ProfileNostr,
    ProfileCache,
    ProfileService,
    AccountConverter,
    AccountManagerStatefull,
    AuthenticatedAccountObservable
  ]
})
export class ProfileModule { }
