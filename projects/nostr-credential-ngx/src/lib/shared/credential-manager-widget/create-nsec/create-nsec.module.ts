import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FileManagerModule } from '../../file-manager/file-manager.module';
import { SvgRenderModule } from '../../svg-render/svg-render.module';
import { CreateNsecComponent } from './create-nsec.component';

@NgModule({
  declarations: [
    CreateNsecComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SvgRenderModule,
    FileManagerModule
  ],
  exports: [
    CreateNsecComponent
  ]
})
export class CreateNsecFormModule { }
