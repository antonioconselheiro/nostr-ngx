import { Reaction, Repost, ShortTextNote, Zap, ZapRequest } from "nostr-tools/kinds";
import { TagNote } from "./tags/tag-note.type";
import { TagReaction } from "./tags/tag-reaction.type";
import { ZapReceiptTag } from "./tags/tag-zap-receipt.type";
import { TagZapRequest } from "./tags/tag-zap-request.type";

export interface StrictTagTypeMap {
  [ShortTextNote]: TagNote;
  [Repost]: TagNote;
  [Reaction]: TagReaction;
  [Zap]: ZapReceiptTag;
  [ZapRequest]: TagZapRequest;
  [attr: `${number}`]: Array<string>;
}

//  TODO: create speacialized tag object to documented kinds
//  
//  https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/15.md
//  https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/23.md
//  https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/31.md
//  https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/32.md
//  https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/35.md
//  https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/36.md
//  https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/38.md
//  https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/39.md
//  https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/42.md
//  https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/51.md
//  https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/52.md
//  https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/53.md
//  https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/56.md
//  https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/57.md
//  https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/71.md
//  https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/73.md
//  https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/75.md
//  https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/84.md
//  https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/92.md
//  https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/98.md
//  https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/99.md

//  Make these kinds suggest tags too:
//  https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/46.md