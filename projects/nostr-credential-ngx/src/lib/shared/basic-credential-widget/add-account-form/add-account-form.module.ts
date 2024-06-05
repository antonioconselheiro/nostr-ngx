import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LoadingWidgetModule } from '../../loading/loading-widget.module';
import { SvgRenderModule } from '../../svg-render/svg-render.module';
import { AddAccountFormComponent } from './add-account-form.component';

@NgModule({
  declarations: [
    AddAccountFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LoadingWidgetModule,
    SvgRenderModule
  ],
  exports: [
    AddAccountFormComponent
  ]
})
export class AddAccountFormModule { }
