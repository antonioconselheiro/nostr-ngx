import { NostrMetadata } from "@nostrify/nostrify";
import { NostrEvent } from "nostr-tools";
import { ProfilePointer } from "nostr-tools/nip19";

export type AccountResultset = {
  pubkey: string;
  event: NostrEvent & { kind: 0 };
  metadata: NostrMetadata;
  nip05: ProfilePointer | null;
}
