import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ProfileWidgetModule } from '../../profile-widget/profile-widget.module';
import { SvgRenderModule } from '../../svg-render/svg-render.module';
import { SelectAccountComponent } from './select-account.component';

@NgModule({
  declarations: [
    SelectAccountComponent
  ],
  imports: [
    CommonModule,
    ProfileWidgetModule,
    SvgRenderModule
  ],
  exports: [
    SelectAccountComponent
  ]
})
export class SelectAccountModule { }
