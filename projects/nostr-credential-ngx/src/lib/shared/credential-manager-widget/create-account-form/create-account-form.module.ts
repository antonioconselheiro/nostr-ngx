import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateAccountFormComponent } from './create-account-form.component';

@NgModule({
  declarations: [
    CreateAccountFormComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CreateAccountFormComponent
  ]
})
export class CreateAccountFormModule { }
