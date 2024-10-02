import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RELAY_ROUTER_TOKEN } from "../injection-token/relay-router.token";
import { DefaultRouterMatcher } from "./default.router-matcher";
import { NostrPool } from "./nostr.pool";
import { RelayLocalConfigService } from "./relay-local-config.service";
import { RelayRouterService } from "./relay-router.service";

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    RelayRouterService,
    NostrPool,
    RelayLocalConfigService,
    {
      provide: RELAY_ROUTER_TOKEN,
      useClass: DefaultRouterMatcher
    }
  ]
})
export class PoolModule {}