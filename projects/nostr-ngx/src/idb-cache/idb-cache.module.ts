import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdbFilter } from './idb.filter';
import { IdbNStore } from './idb.nstore';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    IdbFilter,
    IdbNStore
  ]
})
export class IdbCacheModule { }
