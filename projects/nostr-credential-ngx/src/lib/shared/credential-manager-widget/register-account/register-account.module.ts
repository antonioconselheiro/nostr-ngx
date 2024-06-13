import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterAccountComponent } from './register-account.component';

@NgModule({
  declarations: [
    RegisterAccountComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    RegisterAccountComponent
  ]
})
export class RegisterAccountFormModule { }
