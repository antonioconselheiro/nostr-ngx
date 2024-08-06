import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChoosePasswordComponent } from './choose-password.component';
import { SvgRenderModule } from '../../../svg-render/svg-render.module';
import { FileManagerModule } from '../../../file-manager/file-manager.module';
import { TypingCompleteDirective } from '../../../typing-complete/typing-complete.directive';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    ChoosePasswordComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SvgRenderModule,
    FileManagerModule,

    TypingCompleteDirective
  ],
  exports: [
    ChoosePasswordComponent
  ]
})
export class ChoosePasswordModule { }
