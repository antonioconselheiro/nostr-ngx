import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NostrMediaModule } from '@belomonte/nostr-ngx';
import { SvgRenderModule } from '../../../svg-render/svg-render.module';
import { CreateNsecComponent } from './create-nsec.component';

@NgModule({
  declarations: [
    CreateNsecComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SvgRenderModule,
    NostrMediaModule
  ],
  exports: [
    CreateNsecComponent
  ]
})
export class CreateNsecFormModule { }
