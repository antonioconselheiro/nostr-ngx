import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdbNCache } from './idb.ncache';
import { MAIN_NCACHE_TOKEN } from '../injection-token/main-ncache.token';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    {
      provide: MAIN_NCACHE_TOKEN,
      useClass: IdbNCache
    }
  ]
})
export class IdbNCacheModule { }
