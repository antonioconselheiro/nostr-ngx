import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PoolConfigComponent } from './pool-config.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    PoolConfigComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  exports: [
    PoolConfigComponent
  ]
})
export class PoolConfigModule { }
