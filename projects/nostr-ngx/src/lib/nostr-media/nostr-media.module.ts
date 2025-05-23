import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FileManagerService } from './file-manager.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    FileManagerService
  ]
})
export class NostrMediaModule { }
