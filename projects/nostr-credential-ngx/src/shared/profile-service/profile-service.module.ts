import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AccountManagerStatefull } from '../nostr-credential/account-manager.statefull';
import { AuthenticatedProfileObservable } from '../nostr-credential/authenticated-profile.observable';
import { ProfileApi } from './profile.api';
import { ProfileCache } from './profile.cache';
import { ProfileConverter } from './profile.converter';
import { ProfileEncrypt } from './profile.encrypt';
import { ProfileProxy } from './profile.proxy';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    ProfileApi,
    ProfileCache,
    ProfileProxy,
    ProfileEncrypt,
    ProfileConverter,
    AccountManagerStatefull,
    AuthenticatedProfileObservable
  ]
})
export class ProfileServiceModule { }
