import { Backoff } from "websocket-ts";
import { NostrEvent } from "../domain";

export interface RelayOptions {
  /** Respond to `AUTH` challenges by producing a signed kind `22242` event. */
  auth?(challenge: string): Promise<NostrEvent>;
  /** Configure reconnection strategy, or set to `false` to disable. Default: `new ExponentialBackoff(1000)`. */
  backoff?: Backoff | false;
  /** Ensure the event is valid before returning it. Default: `nostrTools.verifyEvent`. */
  verifyEvent?(event: NostrEvent): boolean;
}