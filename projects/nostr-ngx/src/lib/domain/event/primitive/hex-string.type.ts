export type HexDigit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | '';

/**
 * @draft
 * This type represent a hexadecimal string.
 * This not garantee the hex type in string, but it will when the following issue has done in typescript:
 * https://github.com/microsoft/TypeScript/issues/41160
 * 
 * If you use this, your app will receive this type update for check hexadecimal string when it got available.
 * 
 * This kind avoid you send NPub when pubkey is expected and things like that, nostr have lots of kinds of strings.
 */
export type HexString = `${HexDigit}${string}`;
