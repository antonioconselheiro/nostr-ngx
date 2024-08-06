import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateNsecAndNcryptsecComponent } from './create-nsec-and-ncryptsec.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SvgRenderModule } from '../../../svg-render/svg-render.module';
import { FileManagerModule } from '../../../file-manager/file-manager.module';

@NgModule({
  declarations: [
    CreateNsecAndNcryptsecComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SvgRenderModule,
    FileManagerModule
  ],
  exports: [
    CreateNsecAndNcryptsecComponent
  ]
})
export class CreateNsecAndNcryptsecModule { }
