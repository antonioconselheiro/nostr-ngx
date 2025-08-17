import { HexString } from "../primitive/hex-string.type";
import { RelayDomain } from "../relay-domain.interface";

/**
 * tag in format [type, hex string, relay address ]
 * https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/01.md
 */
export type TagPointer<Type extends string> = [Type, HexString, RelayDomain]
