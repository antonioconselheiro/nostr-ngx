import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthenticateFormComponent } from './authenticate-form.component';
import { LoadingWidgetModule } from '../../loading/loading-widget.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ProfileWidgetModule } from '../../profile-widget/profile-widget.module';

@NgModule({
  declarations: [
    AuthenticateFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LoadingWidgetModule,
    ProfileWidgetModule
  ],
  exports: [
    AuthenticateFormComponent
  ]
})
export class AuthenticateFormModule { }
