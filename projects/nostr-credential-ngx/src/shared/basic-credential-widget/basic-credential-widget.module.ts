import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AsyncModalModule } from '@belomonte/async-modal-ngx';
import { CameraModule } from '../camera/camera.module';
import { ProfileWidgetModule } from '../profile-widget/profile-widget.module';
import { AddAccountModalComponent } from './add-account-modal/add-account-modal.component';
import { AuthenticateModalComponent } from './authenticate-modal/authenticate-modal.component';
import { SelectAuthenticationModalComponent } from './select-authentication-modal/select-authentication-modal.component';
import { LoadingWidgetModule } from '../loading/loading-widget.module';

@NgModule({
  imports: [
    CommonModule,
    CameraModule,
    LoadingWidgetModule,
    ReactiveFormsModule,
    AsyncModalModule,
    ProfileWidgetModule
  ],
  declarations: [
    AddAccountModalComponent,
    AuthenticateModalComponent,
    SelectAuthenticationModalComponent
  ],
  exports: [
    AsyncModalModule
  ]
})
export class BasicCredentialWidgetModule { }
