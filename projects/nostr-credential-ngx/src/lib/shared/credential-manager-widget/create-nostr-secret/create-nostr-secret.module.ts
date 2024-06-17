import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgRenderModule } from '../../svg-render/svg-render.module';
import { CreateNostrSecretComponent } from './create-nostr-secret.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FileManagerModule } from '../../file-manager/file-manager.module';

@NgModule({
  declarations: [
    CreateNostrSecretComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SvgRenderModule,
    FileManagerModule
  ],
  exports: [
    CreateNostrSecretComponent
  ]
})
export class CreateNostrSecretFormModule { }
