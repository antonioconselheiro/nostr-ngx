import { HexString } from "./hex-string.type";
import { NostrCommonTag } from "./nostr-common-tag.interface";
import { NostrTagPointerRelated } from "./nostr-tag-pointer-related.interface";

/**
 * Short text note and repost note supported tags
 *
 * General basic tags:
 * https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/01.md
 * 
 */
export type NostrNoteTag = NostrCommonTag |
  NostrTagPointerRelated<'p'> |
  NostrTagPointerRelated<'e'> |
  ['a', `${number}:${HexString}:${string}`] |
  ['a', `${number}:${HexString}:${string}`, WebSocket['url']] |
  ['d', string] |
  ['k', `${number}`] |
  ['image', string];