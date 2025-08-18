import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgPoolService } from './ng-pool.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    NgPoolService
  ]
})
export class NgPoolModule { }
