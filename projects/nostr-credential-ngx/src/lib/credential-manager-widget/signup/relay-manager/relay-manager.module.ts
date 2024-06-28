import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SvgRenderModule } from '../../../svg-render/svg-render.module';
import { MyRelaysComponent } from './my-relays/my-relays.component';
import { RelayDetailComponent } from './relay-detail/relay-detail.component';
import { RelayManagerComponent } from './relay-manager.component';
import { RelaySearchComponent } from './relay-search/relay-search.component';

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
    ReactiveFormsModule,
    FormsModule
  ],
  exports: [
    RelayManagerComponent
  ]
})
export class RelayManagerModule { }
