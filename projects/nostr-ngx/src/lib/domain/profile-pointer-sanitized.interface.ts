import { HexString } from "./event/primitive/hex-string.type";
import { RelayDomain } from "./event/relay-domain.interface";

export interface ProfilePointerSanitized {
  pubkey: HexString;
  relays: Array<RelayDomain>;
}
