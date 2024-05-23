import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsyncModalModule } from '@belomonte/async-modal-ngx';
import { AuthenticateModalComponent } from './authenticate-modal/authenticate-modal.component';
import { SelectAuthenticationModalComponent } from './select-authentication-modal/select-authentication-modal.component';
import { AddAccountModalComponent } from './add-account-modal/add-account-modal.component';
import { CameraModule } from '../camera/camera.module';

@NgModule({
  imports: [
    CommonModule,
    AsyncModalModule,
    CameraModule
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
