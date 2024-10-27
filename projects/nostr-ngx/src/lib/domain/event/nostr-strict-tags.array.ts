import { StrictTagKinds } from "./strict-tag-kinds.type";
import { StrictTag } from "./strict-tag.array";
import { StrictTagTypeMap } from "./strict-tag.type-map";

export class NostrStrictTags<Kind extends StrictTagKinds> extends Array<StrictTag<Kind>> {
  constructor(tagArray: Array<StrictTagTypeMap[Kind]>) {
    super();
    super.push(...tagArray.map(args => new StrictTag<Kind>(args)));
   }
}