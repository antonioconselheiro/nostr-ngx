import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ProfileWidgetModule } from '../../profile-widget/profile-widget.module';
import { SvgRenderModule } from '../../svg-render/svg-render.module';
import { SelectAuthenticationListComponent } from './select-authentication-list.component';

@NgModule({
  declarations: [
    SelectAuthenticationListComponent
  ],
  imports: [
    CommonModule,
    ProfileWidgetModule,
    SvgRenderModule
  ],
  exports: [
    SelectAuthenticationListComponent
  ]
})
export class SelectAuthenticationListModule { }
