import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaUploader } from './media.uploader';
import { FileManagerService } from './file-manager.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    MediaUploader,
    FileManagerService
  ]
})
export class NostrMediaModule { }
