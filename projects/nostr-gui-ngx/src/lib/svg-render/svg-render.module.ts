import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SvgRenderComponent } from './svg-render.component';
import { SVG_RECORD_TOKEN } from './svg-render.token';
import { SvgRecord } from './svg.record';

@NgModule({
  declarations: [
    SvgRenderComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SvgRenderComponent
  ],
  providers: [
    {
      provide: SVG_RECORD_TOKEN,
      useClass: SvgRecord
    }
  ]
})
export class SvgRenderModule { }
