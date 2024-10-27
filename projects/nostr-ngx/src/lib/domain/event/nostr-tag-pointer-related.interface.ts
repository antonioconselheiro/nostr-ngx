import { HexString } from "./hex-string.type";
import { NostrEventRelation } from "./nostr-event-relation.interface";

/**
 * tag in format [type, hex string, optional relay address, optional event relation kind ]
 * https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/01.md
 */
export type NostrTagPointerRelated<Type extends string> = [Type, HexString] |
  [Type, HexString, WebSocket['url']] |
  [Type, HexString, WebSocket['url'] | '', NostrEventRelation, ...string[]];
