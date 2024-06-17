import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EncryptNsecComponent } from './encrypt-nsec.component';
import { SvgRenderModule } from '../../svg-render/svg-render.module';
import { FileManagerModule } from '../../file-manager/file-manager.module';
import { TypingCompleteDirective } from '../../typing-complete/typing-complete.directive';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    EncryptNsecComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SvgRenderModule,
    FileManagerModule,

    TypingCompleteDirective
  ],
  exports: [
    EncryptNsecComponent
  ]
})
export class EncryptNsecModule { }
