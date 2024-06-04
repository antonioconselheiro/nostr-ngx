import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddAccountFormComponent } from './add-account-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LoadingWidgetModule } from '../../loading/loading-widget.module';
import { TablerIconsModule } from 'angular-tabler-icons';

@NgModule({
  declarations: [
    AddAccountFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LoadingWidgetModule,
    TablerIconsModule
  ],
  exports: [
    AddAccountFormComponent
  ]
})
export class AddAccountFormModule { }
