import { SmartPool } from '@belomonte/nostr-ngx';

export const globalPoolsStatefull: {
  pools: Record<string, SmartPool>;
} = {
  pools: {}
}
