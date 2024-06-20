import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FileManagerModule } from '../../../file-manager/file-manager.module';
import { SvgRenderModule } from '../../../svg-render/svg-render.module';
import { CreateNsecComponent } from './create-nsec.component';
import { AutofocusDirective } from '../../../autofocus/autofocus.directive';

@NgModule({
  declarations: [
    CreateNsecComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SvgRenderModule,
    FileManagerModule,

    AutofocusDirective
  ],
  exports: [
    CreateNsecComponent
  ]
})
export class CreateNsecFormModule { }
