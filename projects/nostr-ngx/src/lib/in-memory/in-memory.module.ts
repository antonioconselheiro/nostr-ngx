import { NgModule } from '@angular/core';
import { InMemoryEventCache } from './in-memory.event-cache';
import { LOCAL_EVENT_CACHE_TOKEN } from '../injection-token/local-event-cache.token';
import { CommonModule } from '@angular/common';
import { InMemoryProfileCache } from './in-memory.profile-cache';
import { LOCAL_PROFILE_CACHE_TOKEN } from '../injection-token/local-profile-cache.token';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    {
      provide: LOCAL_EVENT_CACHE_TOKEN,
      useClass: InMemoryEventCache
    },

    {
      provide: LOCAL_PROFILE_CACHE_TOKEN,
      useClass: InMemoryProfileCache
    }
  ]
})
export class InMemoryModule { }
