import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LoadingWidgetModule } from '../../loading/loading-widget.module';
import { SvgRenderModule } from '../../svg-render/svg-render.module';
import { LoginFormComponent } from './login-form.component';

@NgModule({
  declarations: [
    LoginFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LoadingWidgetModule,
    SvgRenderModule
  ],
  exports: [
    LoginFormComponent
  ]
})
export class LoginFormModule { }
