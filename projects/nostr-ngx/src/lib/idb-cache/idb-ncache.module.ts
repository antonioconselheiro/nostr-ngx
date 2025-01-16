import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdbEventCache } from './idb.event-cache';
import { LOCAL_EVENT_CACHE_TOKEN } from '../injection-token/local-event-cache.token';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    {
      provide: LOCAL_EVENT_CACHE_TOKEN,
      useClass: IdbEventCache
    }
  ]
})
export class IdbNCacheModule { }
