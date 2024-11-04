//  TODO: improve this type when this issue is done: https://github.com/microsoft/TypeScript/issues/41160
/**
 * Represents a NIP1 nostr event stringified.
 */
export type StringifiedNostrEvent<Kind extends number = number> =
  `{${string}"pubkey":"${string}"${string}}` & 
  `{${string}"content":"${string}"${string}}` & 
  `{${string}"id":"${string}"${string}}` & 
  `{${string}"created_at":${number}${string}}` & 
  `{${string}"sig":"${string}"${string}}` & 
  `{${string}"kind":${Kind}${string}}`;
