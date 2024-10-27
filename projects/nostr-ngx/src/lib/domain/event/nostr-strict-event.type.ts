import { verifiedSymbol } from "nostr-tools";
import { HexString } from "./hex-string.type";
import { NostrEventTags } from "./nostr-event-tags.array";
import { NostrStrictTags } from "./nostr-strict-tags.array";
import { StrictTagKinds } from "./strict-tag-kinds.type";

/**
 * Strict Nostr Event
 */
export type NostrStrictEvent<Kind extends StrictTagKinds = StrictTagKinds> = {
  /** 32-bytes lowercase hex-encoded sha256 of the serialized event data. */
  id: HexString;
  /** 32-bytes lowercase hex-encoded public key of the event creator */
  pubkey: HexString;
  /** Unix timestamp in seconds. */
  created_at: number;
  /** Integer between 0 and 65535. */
  kind: Kind;
  /** Matrix of arbitrary strings. */
  tags: NostrStrictTags<Kind> | NostrEventTags<Kind>;
  /** Arbitrary string. */
  content: string;
  /** 64-bytes lowercase hex of the signature of the sha256 hash of the serialized event data, which is the same as the `id` field. */
  sig: HexString;

  [verifiedSymbol]?: boolean
}