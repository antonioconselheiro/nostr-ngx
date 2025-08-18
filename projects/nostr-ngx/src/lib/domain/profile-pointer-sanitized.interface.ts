import { HexString } from "./event/primitive/hex-string.type";
import { RelayDomainString } from "./event/relay-domain-string.type";

export interface ProfilePointerSanitized {
  pubkey: HexString;
  relays: Array<RelayDomainString>;
}
