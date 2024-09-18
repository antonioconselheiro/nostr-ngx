import { NostrMetadata } from '@nostrify/nostrify';

export type NostrMetadataCached = NostrMetadata & { pubkey: string };
