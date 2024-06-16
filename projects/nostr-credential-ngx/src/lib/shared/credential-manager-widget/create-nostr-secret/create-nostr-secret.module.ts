import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgRenderModule } from '../../svg-render/svg-render.module';
import { CreateNostrSecretComponent } from './create-nostr-secret.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    CreateNostrSecretComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SvgRenderModule
  ],
  exports: [
    CreateNostrSecretComponent
  ]
})
export class CreateNostrSecretFormModule { }
