import { HexString } from "../domain/event/primitive/hex-string.type"

export interface Nip05Resultset {
  names: {
    [name: string]: HexString
  }
  relays: {
    [pubkey: HexString]: Array<WebSocket['url']>
  }
}
