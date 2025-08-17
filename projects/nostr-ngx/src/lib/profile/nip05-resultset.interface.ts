import { HexString } from "../domain/event/primitive/hex-string.type"
import { RelayDomain } from "../domain/event/relay-domain.interface"

export interface Nip05Resultset {
  names: {
    [name: string]: HexString
  }
  relays: {
    [pubkey: HexString]: Array<RelayDomain>
  }
}
