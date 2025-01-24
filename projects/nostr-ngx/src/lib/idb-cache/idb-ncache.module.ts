import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdbEventCache } from './idb.event-cache';
import { NOSTR_CACHE_TOKEN } from '../injection-token/nostr-cache.token';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    {
      provide: NOSTR_CACHE_TOKEN,
      useClass: IdbEventCache
    }
  ]
})
export class IdbNCacheModule { }
