import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AccountManagerStatefull } from '../nostr-credential/account-manager.statefull';
import { AuthenticatedProfileObservable } from '../nostr-credential/authenticated-profile.observable';
import { ProfileApi } from './profile.api';
import { ProfileCache } from './profile.cache';
import { ProfileConverter } from './profile.converter';
import { AccountConverter } from './account.converter';
import { ProfileProxy } from './profile.proxy';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    ProfileApi,
    ProfileCache,
    ProfileProxy,
    AccountConverter,
    ProfileConverter,
    AccountManagerStatefull,
    AuthenticatedProfileObservable
  ]
})
export class ProfileServiceModule { }
