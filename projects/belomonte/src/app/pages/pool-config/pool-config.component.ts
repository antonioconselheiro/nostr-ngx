import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ExtendedPool, SmartPool } from '@belomonte/nostr-ngx';
import { IPoolConfig } from './pool-config.interface';

@Component({
  selector: 'app-pool-config',
  templateUrl: './pool-config.component.html',
  styleUrl: './pool-config.component.scss'
})
export class PoolConfigComponent {

  pools: IPoolConfig[] = [];

  formPool = this.fb.group({
    name: [''],
    poolType: ['smart'],
    fromPool: ['']
  });

  constructor(
    private fb: FormBuilder
  ) { }

  private createSmart(name: string): void {
    const pool = new SmartPool();
    const poolConfig: IPoolConfig = {
      type: 'smart',
      status: this.castPoolStatusToArray(pool),
      pool, name
    };

    pool.observeConnection()
      .subscribe(() => poolConfig.status = this.castPoolStatusToArray(pool));

    this.pools.push(poolConfig);
  }

  private createExtended(name: string, extendsFromPool: string): void {
    const extendsFrom = this.pools.find(pool => pool.name === extendsFromPool);

    if (extendsFrom) {
      const pool = new ExtendedPool(extendsFrom.pool);
      const poolConfig: IPoolConfig = {
        type: 'extended',
        status: this.castPoolStatusToArray(pool),
        pool, name
      };

      pool.observeConnection()
        .subscribe(() => poolConfig.status = this.castPoolStatusToArray(pool));

      this.pools.push(poolConfig);
    }
  }

  private castPoolStatusToArray(pool: SmartPool): Array<{ relay: string, connected: boolean }> {
    return Array.from(pool.listConnectionStatus().entries())
      .map(([relay, connected]) => ({ relay, connected }));
  }

  submitPool(event: SubmitEvent): void {
    event.preventDefault();

    if (this.formPool.valid) {
      const form = this.formPool.getRawValue();
      const poolType = form.poolType || '';
      const poolName = form.name || '';
      const fromPool = form.fromPool || '';

      switch (poolType) {
        case 'smart':
          this.createSmart(poolName);
          break;
        case 'extended':
          this.createExtended(poolName, fromPool);
          break;
      }

      this.formPool.reset();
    }
  }

  addRelay(poolConfig: IPoolConfig, newRelay: string): void {
    if (/^ws/.test(newRelay)) {
      poolConfig.pool.ensureRelay(newRelay);
    }
  }
}
