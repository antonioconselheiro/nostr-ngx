import { HexString } from "../primitive/hex-string.type";
import { NostrEventRelation } from "../nostr-event-relation.interface";

/**
 * tag in format [type, hex string, event relation kind ]
 */
export type TagRelated<Type extends string> = [Type, HexString, NostrEventRelation];
