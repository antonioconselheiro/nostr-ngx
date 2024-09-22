import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountsLocalStorage } from './accounts-local.storage';
import { ProfileSessionStorage } from './profile-session.storage';
import { appConfig } from './app.config';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    AccountsLocalStorage,
    ProfileSessionStorage
  ]
})
export class ConfigStorageModule {

  static setDefaultProfile({ picture, banner }: {
    picture?: string, banner?: string
  }): typeof ConfigStorageModule {
    if (picture) {
      appConfig.defaultProfile.picture = picture;
    }

    if (banner) {
      appConfig.defaultProfile.banner = banner;
    }

    return this;
  }
}
