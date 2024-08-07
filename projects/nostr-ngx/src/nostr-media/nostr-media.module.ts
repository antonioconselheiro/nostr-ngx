import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaUploader } from './media-uploader';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    MediaUploader
  ]
})
export class NostrMediaModule { }
