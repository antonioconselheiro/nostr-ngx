import { StrictTagKinds } from "./strict-tag-kinds.type";
import { StrictTag } from "./strict-tag.array";
import { StrictTagTypeMap } from "./strict-tag.type-map";

/**
 * An array used to compose the tags matrix for a nostr event.
 * This can also used as nostr event resultset if this resultset was validated.
 */
export class NostrStrictTags<Kind extends StrictTagKinds> extends Array<StrictTag<Kind>> {
  constructor(tagArray: Array<StrictTagTypeMap[Kind]>) {
    super();
    super.push(...tagArray.map(args => new StrictTag<Kind>(args)));
   }
}
