import { StrictTagKinds } from "./strict-tag-kinds.type";
import { StrictTagTypeMap } from "./strict-tag.type-map";

export class StrictTag<Kind extends StrictTagKinds> extends Array<string> {
  constructor(tagArray: StrictTagTypeMap[Kind]) {
    super();
    super.push(...tagArray);
   }
}