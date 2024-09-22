import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountsLocalStorage } from './accounts-local.storage';
import { ProfileSessionStorage } from './profile-session.storage';
import { appConfig } from './app.config';
import { RelayRecord } from 'nostr-tools/relay';

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

  static config(configs: {
    defaultProfile?: {
      picture?: string;
      banner?: string;
    },
    defaultFallback?: RelayRecord;
  }): typeof ConfigStorageModule {
    if (configs.defaultProfile) {
      if (configs.defaultProfile.picture) {
        appConfig.defaultProfile.picture = configs.defaultProfile.picture;
      }

      if (configs.defaultProfile.banner) {
        appConfig.defaultProfile.banner = configs.defaultProfile.banner;
      }
    }

    if (configs.defaultFallback) {
      appConfig.defaultFallback = configs.defaultFallback;
    }

    return this;
  }
}
