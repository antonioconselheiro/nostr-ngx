import { CommonModule } from "@angular/common";
import { NostrPool } from "./nostr.pool";
import { NgModule } from "@angular/core";
import { RouterService } from "./router.service";

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    RouterService,
    NostrPool
  ]
})
export class PoolModule {}