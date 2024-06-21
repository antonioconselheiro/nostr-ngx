import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateNsecAndNcryptsecComponent } from './create-nsec-and-ncryptsec.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SvgRenderModule } from '../../../svg-render/svg-render.module';
import { FileManagerModule } from '../../../file-manager/file-manager.module';
import { AutofocusDirective } from '../../../autofocus/autofocus.directive';

@NgModule({
  declarations: [
    CreateNsecAndNcryptsecComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SvgRenderModule,
    FileManagerModule,

    AutofocusDirective
  ],
  exports: [
    CreateNsecAndNcryptsecComponent
  ]
})
export class CreateNsecAndNcryptsecModule { }
