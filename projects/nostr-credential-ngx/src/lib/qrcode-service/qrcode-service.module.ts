import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QrcodeService } from './qrcode.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    QrcodeService
  ]
})
export class QrcodeServiceModule { }
