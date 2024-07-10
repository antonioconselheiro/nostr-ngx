import { AbstractSimplePool } from 'nostr-tools/pool';

export interface IPoolConfig {
  name: string;
  poolType: 'simple' | 'smart' | 'extended' | 'derivated';
  pool: AbstractSimplePool;
}
