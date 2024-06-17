import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EncryptNostrSecretComponent } from './encrypt-nostr-secret.component';

@NgModule({
  declarations: [
    EncryptNostrSecretComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    EncryptNostrSecretComponent
  ]
})
export class EncryptNostrSecretModule { }
