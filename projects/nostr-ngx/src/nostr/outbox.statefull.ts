import { Injectable } from "@angular/core";

@Injectable()
export class OutboxStatefull {
  static readRelays: Array<WebSocket["url"]> = [];
  static writeRelays: Array<WebSocket["url"]> = [];
}
