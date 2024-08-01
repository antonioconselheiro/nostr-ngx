import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterAccountComponent } from './register-account.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SvgRenderModule } from '../../../svg-render/svg-render.module';
import { ProfileWidgetModule } from "../../../profile-widget/profile-widget.module";

@NgModule({
  declarations: [
    RegisterAccountComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SvgRenderModule,
    ProfileWidgetModule
],
  exports: [
    RegisterAccountComponent
  ]
})
export class RegisterAccountFormModule { }
