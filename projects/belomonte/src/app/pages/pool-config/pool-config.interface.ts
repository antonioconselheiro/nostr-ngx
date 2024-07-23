import { SmartPool } from '@belomonte/nostr-ngx';

export interface IPoolConfig {
  name: string;
  type: 'smart' | 'extended';
  pool: SmartPool;
  status: Array<{ relay: string, connected: boolean }>;
}
