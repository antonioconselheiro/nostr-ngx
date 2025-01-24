import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NOSTR_CACHE_TOKEN } from '../injection-token/nostr-cache.token';
import { InMemoryEventCache } from './in-memory.event-cache';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    {
      provide: NOSTR_CACHE_TOKEN,
      useClass: InMemoryEventCache
    }
  ]
})
export class InMemoryModule { }
