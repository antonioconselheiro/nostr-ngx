import { NgModule } from '@angular/core';
import { InMemoryNCache } from './in-memory.ncache';
import { LOCAL_CACHE_TOKEN } from '../injection-token/local-cache.token';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    {
      provide: LOCAL_CACHE_TOKEN,
      useClass: InMemoryNCache
    }
  ]
})
export class InMemoryModule { }
