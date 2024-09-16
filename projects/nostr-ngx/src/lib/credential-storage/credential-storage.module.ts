import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountsLocalStorage } from './accounts-local.storage';
import { ProfileSessionStorage } from './profile-session.storage';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    AccountsLocalStorage,
    ProfileSessionStorage
  ]
})
export class CredentialStorageModule { }
