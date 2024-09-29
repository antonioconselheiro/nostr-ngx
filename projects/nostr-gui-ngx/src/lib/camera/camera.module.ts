import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CameraObservable } from './camera.observable';
import { SvgRenderModule } from '../svg-render/svg-render.module';
import { CameraComponent } from './camera.component';

@NgModule({
  imports: [
    CommonModule,
    SvgRenderModule
  ],
  providers: [
    CameraObservable
  ],
  declarations: [
    CameraComponent
  ],
  exports: [
    CameraComponent
  ]
})
export class CameraModule { }
