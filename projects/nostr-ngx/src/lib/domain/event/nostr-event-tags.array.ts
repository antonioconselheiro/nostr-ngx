import { StrictTagKinds } from "./strict-tag-kinds.type";
import { StrictTag } from "./strict-tag.array";

export type NostrEventTags<Kind extends StrictTagKinds> = Array<StrictTag<Kind> | string[]>;
