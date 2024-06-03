import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CameraObservable } from './camera.observable';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    CameraObservable
  ]
})
export class CameraModule { }
