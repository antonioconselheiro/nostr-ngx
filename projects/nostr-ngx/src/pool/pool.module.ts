import { CommonModule } from "@angular/common";
import { MainPool } from "./main.pool";
import { NgModule } from "@angular/core";
import { RouterService } from "./router.service";

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    RouterService,
    MainPool
  ]
})
export class PoolModule {}