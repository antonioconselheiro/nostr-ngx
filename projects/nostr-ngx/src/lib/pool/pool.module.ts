import { CommonModule } from "@angular/common";
import { NostrPool } from "./nostr.pool";
import { NgModule } from "@angular/core";
import { RelayRouterService } from "./relay-router.service";

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    RelayRouterService,
    NostrPool
  ]
})
export class PoolModule {}