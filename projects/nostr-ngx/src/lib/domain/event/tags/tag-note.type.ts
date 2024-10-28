import { TagPointerRelated } from "./tag-pointer-related.type";
import { TagCommon } from "./tag-common.type";

/**
 * Short text note and repost note supported tags
 *
 * General basic tags:
 * https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/01.md
 */
export type TagNote = TagCommon |
  TagPointerRelated<'p'> |
  TagPointerRelated<'e'> |
  ['image', string];
