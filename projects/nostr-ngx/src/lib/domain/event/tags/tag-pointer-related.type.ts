import { HexString } from "../primitive/hex-string.type";
import { NostrEventRelation } from "../nostr-event-relation.interface";
import { TagPointer } from "./tag-pointer.type";
import { TagReference } from "./tag-reference.type";

/**
 * Pointer Related
 * Reference an id of a notes or other stuffs, optionally can reference a specific
 * relay where this id will be surelly find, optionally can indicate the relation
 * between this event and the pointed event. 
 * 
 * format [type, hex string, optional relay address, optional event relation kind ]
 * 
 * References:
 * https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/01.md
 */
export type TagPointerRelated<Type extends string> = TagReference<Type> |
  TagPointer<Type> |
  [Type, HexString, WebSocket['url'] | '', NostrEventRelation, ...string[]];
