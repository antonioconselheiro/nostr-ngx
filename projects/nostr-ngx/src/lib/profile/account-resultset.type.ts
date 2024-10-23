import { NostrMetadata } from "@nostrify/nostrify";
import { ProfilePointer } from "nostr-tools/nip19";
import { NostrEvent } from "../domain/nostr-event.interface";
import { kinds } from "nostr-tools";

export type AccountResultset = {
  pubkey: string;
  event: NostrEvent<typeof kinds.Metadata>;
  metadata: NostrMetadata;
  nip05: ProfilePointer | null;
}
