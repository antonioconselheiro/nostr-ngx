import { TagPointerRelated } from "./tag-pointer-related.type";
import { TagCommon } from "./tag-common.type";

/**
 * Reaction tags
 * https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/25.md
 */
export type TagReaction = TagCommon |
  TagPointerRelated<'p'> |
  TagPointerRelated<'e'> |
  /**
   * for reactions, r tag is used when user reacts to a website
   * ['r', <website url>]
   */
  ['r', string] |

  /**
   * emoji label must happen one only time
   * emoji, <label>, <img url>
   */
  ["emoji", string, string]
