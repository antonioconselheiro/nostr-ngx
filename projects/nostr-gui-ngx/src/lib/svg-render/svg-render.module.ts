import { NgModule } from '@angular/core';
import { SvgRenderComponent } from './svg-render.component';
import { CommonModule } from '@angular/common';

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
