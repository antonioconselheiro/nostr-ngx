import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { RelayRecord } from 'nostr-tools/relay';
import { NOSTR_CONFIG_TOKEN } from '../injection-token/nostr-config.token';
import { AccountsLocalStorage } from './accounts-local.storage';
import { nostrConfig } from './nostr.config';
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
export class NostrModule {

  static config(configs: {
    defaultProfile?: {
      picture?: string;
      banner?: string;
    },
    defaultFallback?: RelayRecord;
  }): ModuleWithProviders<NostrModule> {
    if (configs.defaultProfile) {
      if (configs.defaultProfile.picture) {
        nostrConfig.defaultProfile.picture = configs.defaultProfile.picture;
      }

      if (configs.defaultProfile.banner) {
        nostrConfig.defaultProfile.banner = configs.defaultProfile.banner;
      }
    }

    if (configs.defaultFallback) {
      nostrConfig.defaultFallback = configs.defaultFallback;
    }

    return {
      ngModule: NostrModule,
      providers: [
        {
          provide: NOSTR_CONFIG_TOKEN,
          useValue: nostrConfig
        }
      ]
    };
  }
}
