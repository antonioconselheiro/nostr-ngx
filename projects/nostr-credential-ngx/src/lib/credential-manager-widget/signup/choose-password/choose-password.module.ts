import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NostrMediaModule } from '@belomonte/nostr-ngx';
import { SvgRenderModule } from '../../../svg-render/svg-render.module';
import { TypingCompleteDirective } from '../../../typing-complete/typing-complete.directive';
import { ChoosePasswordComponent } from './choose-password.component';

@NgModule({
  declarations: [
    ChoosePasswordComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SvgRenderModule,
    NostrMediaModule,
    TypingCompleteDirective
  ],
  exports: [
    ChoosePasswordComponent
  ]
})
export class ChoosePasswordModule { }
