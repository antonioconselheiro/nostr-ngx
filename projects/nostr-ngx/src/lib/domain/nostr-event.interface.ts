import { verifiedSymbol } from 'nostr-tools'

export interface NostrEvent<T extends number = number> {
  kind: T
  tags: string[][]
  content: string
  created_at: number
  pubkey: string
  id: string
  sig: string
  [verifiedSymbol]?: boolean
}
