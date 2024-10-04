import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NostrMediaModule } from '@belomonte/nostr-ngx';
import { SvgRenderModule } from '../../../svg-render/svg-render.module';
import { CreateNsecComponent } from './create-nsec.component';
import { TypingCompleteDirective } from '../../../typing-complete/typing-complete.directive';

@NgModule({
  declarations: [
    CreateNsecComponent
  ],
  imports: [
    CommonModule,
    SvgRenderModule,
    NostrMediaModule,
    ReactiveFormsModule,
    TypingCompleteDirective
  ],
  exports: [
    CreateNsecComponent
  ]
})
export class CreateNsecFormModule { }
