import { AuthRequest } from "./auth.request";
import { CloseRequest } from "./close.request";
import { CountRequest } from "./count.request";
import { EventRequest } from "./event.request";
import { ReqRequest } from "./req.request";

/** NIP-01 message from a client to relay. */
export type NostrRequest = AuthRequest | CloseRequest | CountRequest | EventRequest | ReqRequest;