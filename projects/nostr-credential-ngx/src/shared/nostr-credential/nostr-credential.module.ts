import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AccountManagerStatefull } from './account-manager.statefull';
import { NostrCredentialService } from './nostr-credential.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    NostrCredentialService,
    AccountManagerStatefull
  ]
})
export class NostrCredentialModule { }
