import { HexString } from "../domain/event/primitive/hex-string.type"
import { RelayDomainString } from "../domain/event/relay-domain-string.type"

export interface Nip05Resultset {
  names: {
    [name: string]: HexString
  }
  relays: {
    [pubkey: HexString]: Array<RelayDomainString>
  }
}
