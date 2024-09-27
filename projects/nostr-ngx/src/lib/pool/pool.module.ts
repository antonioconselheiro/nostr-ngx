import { CommonModule } from "@angular/common";
import { NostrPool } from "./nostr.pool";
import { NgModule } from "@angular/core";
import { RelayRouterService } from "./relay-router.service";
import { RelayLocalConfigService } from "./relay-local-config.service";
import { RelayPublicConfigService } from "./relay-public-config.service";

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    RelayRouterService,
    NostrPool,
    RelayLocalConfigService,
    RelayPublicConfigService
  ]
})
export class PoolModule {}