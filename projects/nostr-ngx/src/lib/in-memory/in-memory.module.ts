import { NgModule } from '@angular/core';
import { InMemoryEventCache } from './in-memory.event-cache';
import { LOCAL_EVENT_CACHE_TOKEN } from '../injection-token/local-event-cache.token';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    {
      provide: LOCAL_EVENT_CACHE_TOKEN,
      useClass: InMemoryEventCache
    }
  ]
})
export class InMemoryModule { }
