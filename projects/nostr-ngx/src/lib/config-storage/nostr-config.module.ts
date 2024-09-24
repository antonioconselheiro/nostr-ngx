import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { RelayRecord } from 'nostr-tools/relay';
import { NOSTR_CONFIG_TOKEN } from '../injection-token/nostr-config.token';
import { AccountsLocalStorage } from './accounts-local.storage';
import { appConfig } from './app.config';
import { ProfileSessionStorage } from './profile-session.storage';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    AccountsLocalStorage,
    ProfileSessionStorage
  ]
})
export class NostrConfigModule {

  static config(configs: {
    defaultProfile?: {
      picture?: string;
      banner?: string;
    },
    defaultFallback?: RelayRecord;
  }): ModuleWithProviders<NostrConfigModule> {
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

    return {
      ngModule: NostrConfigModule,
      providers: [
        {
          provide: NOSTR_CONFIG_TOKEN,
          useValue: appConfig
        }
      ]
    };
  }
}
