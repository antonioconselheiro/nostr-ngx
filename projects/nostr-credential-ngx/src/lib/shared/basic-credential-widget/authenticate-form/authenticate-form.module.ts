import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LoadingWidgetModule } from '../../loading/loading-widget.module';
import { ProfileWidgetModule } from '../../profile-widget/profile-widget.module';
import { SvgRenderModule } from '../../svg-render/svg-render.module';
import { AuthenticateFormComponent } from './authenticate-form.component';

@NgModule({
  declarations: [
    AuthenticateFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LoadingWidgetModule,
    ProfileWidgetModule,
    SvgRenderModule
  ],
  exports: [
    AuthenticateFormComponent
  ]
})
export class AuthenticateFormModule { }
