import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdbFilter } from './idb.filter';
import { IdbNStore } from './idb.nstore';
import { IO_CACHE_NSTORE_TOKEN } from '../injection-token/io-cache-nstore.token';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    IdbFilter,
    {
      provide: IO_CACHE_NSTORE_TOKEN,
      useClass: IdbNStore
    }
  ]
})
export class IdbCacheModule { }
