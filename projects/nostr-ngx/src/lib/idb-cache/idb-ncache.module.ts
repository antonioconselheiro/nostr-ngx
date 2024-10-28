import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdbNCache } from './idb.ncache';
import { LOCAL_CACHE_TOKEN } from '../injection-token/local-cache.token';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    {
      provide: LOCAL_CACHE_TOKEN,
      useClass: IdbNCache
    }
  ]
})
export class IdbNCacheModule { }
