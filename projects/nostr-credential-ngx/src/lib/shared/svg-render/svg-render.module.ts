import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgRenderComponent } from './svg-render.component';

@NgModule({
  declarations: [
    SvgRenderComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SvgRenderComponent
  ]
})
export class SvgRenderModule { }
