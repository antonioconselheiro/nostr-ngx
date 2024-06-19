import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountsLocalStorage } from './accounts-local.storage';
import { ProfileSessionStorage } from './profile-session.storage';
import { CredentialManagerStateStorage } from './credential-manager-state.storage';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    AccountsLocalStorage,
    ProfileSessionStorage,
    CredentialManagerStateStorage
  ]
})
export class CredentialStorageModule { }
