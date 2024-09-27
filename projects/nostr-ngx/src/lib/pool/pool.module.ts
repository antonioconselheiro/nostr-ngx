import { CommonModule } from "@angular/common";
import { NostrPool } from "./nostr.pool";
import { NgModule } from "@angular/core";
import { RelayRouterService } from "./relay-router.service";
import { RelayLocalConfigService } from "./relay-local-config.service";
import { RelayPublicConfigService } from "./relay-public-config.service";
import { DefaultRouterMatcher } from "./default.router-matcher";
import { RELAY_ROUTER_TOKEN } from "../injection-token/relay-router.token";

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    RelayRouterService,
    NostrPool,
    RelayLocalConfigService,
    RelayPublicConfigService,
    {
      provide: RELAY_ROUTER_TOKEN,
      useClass: DefaultRouterMatcher
    }
  ]
})
export class PoolModule {}