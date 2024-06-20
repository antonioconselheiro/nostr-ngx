import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QrcodeCredentialService } from './qrcode-credential.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    QrcodeCredentialService
  ]
})
export class QrcodeCredentialModule { }
