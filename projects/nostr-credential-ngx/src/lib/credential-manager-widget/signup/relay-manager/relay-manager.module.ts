import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RelayManagerComponent } from './relay-manager.component';
import { RelaySearchComponent } from './relay-search/relay-search.component';
import { RelayDetailComponent } from './relay-detail/relay-detail.component';
import { MyRelaysComponent } from './my-relays/my-relays.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SvgRenderModule } from '../../../svg-render/svg-render.module';

@NgModule({
  declarations: [
    RelayManagerComponent,
    RelaySearchComponent,
    RelayDetailComponent,
    MyRelaysComponent
  ],
  imports: [
    CommonModule,
    SvgRenderModule,
    ReactiveFormsModule
  ],
  exports: [
    RelayManagerComponent
  ]
})
export class RelayManagerModule { }
