import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PoolInteractComponent } from './pool-interact.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NostrModule } from '@belomonte/nostr-ngx';

@NgModule({
  declarations: [
    PoolInteractComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NostrModule,
    FormsModule
  ]
})
export class PoolInteractModule { }
