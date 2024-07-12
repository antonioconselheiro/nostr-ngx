import { AbstractSimplePool } from 'nostr-tools/pool';

export interface IPoolConfig {
  name: string;
  type: 'simple' | 'smart' | 'extended' | 'derivated';
  pool: AbstractSimplePool;
  status: Array<{ relay: string, connected: boolean }>;
}
