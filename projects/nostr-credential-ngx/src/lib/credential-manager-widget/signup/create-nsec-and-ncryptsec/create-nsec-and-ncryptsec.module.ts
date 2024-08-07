import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateNsecAndNcryptsecComponent } from './create-nsec-and-ncryptsec.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SvgRenderModule } from '../../../svg-render/svg-render.module'
import { NostrMediaModule } from '@belomonte/nostr-ngx';

@NgModule({
  declarations: [
    CreateNsecAndNcryptsecComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SvgRenderModule,
    NostrMediaModule
  ],
  exports: [
    CreateNsecAndNcryptsecComponent
  ]
})
export class CreateNsecAndNcryptsecModule { }
