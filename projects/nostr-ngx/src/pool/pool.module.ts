import { CommonModule } from "@angular/common";
import { MainPool } from "./main.pool";
import { NgModule } from "@angular/core";
import { OutboxService } from "./outbox.service";

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    OutboxService,
    MainPool
  ]
})
export class PoolModule {}