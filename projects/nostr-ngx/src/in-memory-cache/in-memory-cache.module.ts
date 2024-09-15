import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InMemoryNCache } from './in-memory.ncache';
import { IN_MEMORY_NCACHE_TOKEN } from '../injection-token/in-memory-ncache.token';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    {
      provide: IN_MEMORY_NCACHE_TOKEN,
      useClass: InMemoryNCache
    }
  ]
})
export class InMemoryCacheModule { }
