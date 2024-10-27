import { Repost, ShortTextNote } from "nostr-tools/kinds";
import { NostrNoteTag } from "./nostr-note-tag.interface";

export interface StrictTagTypeMap {
  [ShortTextNote]: NostrNoteTag;
  [Repost]: NostrNoteTag;
  [attr: `${number}`]: Array<string>;
}
