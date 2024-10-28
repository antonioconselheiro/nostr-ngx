import { Reaction, Repost, ShortTextNote, Zap } from "nostr-tools/kinds";

/**
 * all nostr kind that have tag signature available for the kind will have the kind included in this union type
 */
export type StrictTagKinds = ShortTextNote | Repost | Reaction | Zap;
