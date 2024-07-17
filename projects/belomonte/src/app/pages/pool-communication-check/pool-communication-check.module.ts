import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PoolCommunicationCheckComponent } from './pool-communication-check.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    PoolCommunicationCheckComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  exports: [
    PoolCommunicationCheckComponent
  ]
})
export class PoolCommunicationCheckModule { }
