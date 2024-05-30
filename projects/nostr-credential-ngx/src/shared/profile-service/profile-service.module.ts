import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ProfileApi } from './profile.api';
import { ProfileCache } from './profile.cache';
import { ProfileConverter } from './profile.converter';
import { AccountConverter } from './account.converter';
import { ProfileProxy } from './profile.proxy';
import { AccountManagerStatefull } from './account-manager.statefull';
import { AuthenticatedProfileObservable } from './authenticated-profile.observable';

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
