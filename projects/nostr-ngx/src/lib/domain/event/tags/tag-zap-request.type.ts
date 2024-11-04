
import { TagPointerRelated } from "./tag-pointer-related.type";
import { TagCommon } from "./tag-common.type";
import { TagAmountMillisats } from "./tag-amount-millisats.type";
import { TagLnurl } from "./tag-lnurl.type";
import { TagRelayList } from "./tag-relay-list.type";

/**
 * Zap tags:
 * https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/25.md
 */
export type TagZapRequest = TagCommon |
  TagPointerRelated<'p'> |
  TagPointerRelated<'e'> |
  TagAmountMillisats |
  TagLnurl |
  TagRelayList;
