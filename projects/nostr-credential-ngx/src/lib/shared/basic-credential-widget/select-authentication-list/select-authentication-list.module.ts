import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectAuthenticationListComponent } from './select-authentication-list.component';
import { ProfileWidgetModule } from '../../profile-widget/profile-widget.module';

@NgModule({
  declarations: [
    SelectAuthenticationListComponent
  ],
  imports: [
    CommonModule,
    ProfileWidgetModule
  ],
  exports: [
    SelectAuthenticationListComponent
  ]
})
export class SelectAuthenticationListModule { }
