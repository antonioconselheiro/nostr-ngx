import { AbstractSimplePool } from 'nostr-tools/pool';

export interface IPoolConfig {
  name: string;
  type: 'simple' | 'smart' | 'extended' | 'derivated';
  pool: AbstractSimplePool;
}
