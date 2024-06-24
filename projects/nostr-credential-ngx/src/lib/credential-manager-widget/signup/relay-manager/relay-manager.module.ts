import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RelayManagerComponent } from './relay-manager.component';
import { RelaySearchComponent } from './relay-search/relay-search.component';
import { RelayDetailComponent } from './relay-detail/relay-detail.component';
import { MyRelaysComponent } from './my-relays/my-relays.component';

@NgModule({
  declarations: [
    RelayManagerComponent,
    RelaySearchComponent,
    RelayDetailComponent,
    MyRelaysComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    RelayManagerComponent
  ]
})
export class RelayManagerModule { }
