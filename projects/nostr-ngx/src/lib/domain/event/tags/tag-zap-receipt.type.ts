
import { Zap } from "nostr-tools/kinds";
import { HexString } from "../primitive/hex-string.type";
import { StringifiedNostrEvent } from "../primitive/stringified-event.type";
import { TagBolt11 } from "./tag-bolt11.type";
import { TagCommon } from "./tag-common.type";
import { TagPointerRelated } from "./tag-pointer-related.type";

/**
 * Zap tags:
 * https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/57.md#appendix-e-zap-receipt-event
 */
export type ZapReceiptTag = TagCommon |
  TagPointerRelated<'p'> |
  TagPointerRelated<'e'> |
  TagBolt11 |
  [ "description", StringifiedNostrEvent<Zap> ] |
  [ "preimage", HexString ]
