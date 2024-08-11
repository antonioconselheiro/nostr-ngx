import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ProfileNostr } from './profile.nostr';
import { ProfileCache } from './profile.cache';
import { ProfileConverter } from './profile.converter';
import { AccountConverter } from './account.converter';
import { ProfileProxy } from './profile.proxy';
import { AccountManagerStatefull } from './account-manager.statefull';
import { AuthenticatedAccountObservable } from './authenticated-profile.observable';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    ProfileNostr,
    ProfileCache,
    ProfileProxy,
    AccountConverter,
    ProfileConverter,
    AccountManagerStatefull,
    AuthenticatedAccountObservable
  ]
})
export class ProfileServiceModule { }
