import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ExtendedPool, MainPool, SmartPool } from '@belomonte/nostr-ngx';
import { IPoolConfig } from './pool-config.interface';
import { globalPoolsStatefull } from '../../global-pools.statefull';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pool-config',
  templateUrl: './pool-config.component.html',
  styleUrl: './pool-config.component.scss'
})
export class PoolConfigComponent implements OnInit, OnDestroy {

  pools: IPoolConfig[] = [];
  subscriptions = new Subscription();

  formPool = this.fb.group({
    name: [''],
    poolType: ['smart'],
    fromPool: ['']
  });

  constructor(
    private fb: FormBuilder,
    private mainPool: MainPool
  ) { }

  ngOnInit(): void {
    this.loadPoolsFromGlobalStatefull();
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  private unsubscribe(): void {
    this.subscriptions.unsubscribe();
  }

  private loadPoolsFromGlobalStatefull(): void {
    this.loadPool('main pool', this.mainPool);
    Object.keys(globalPoolsStatefull).forEach(name => {
      const pool = globalPoolsStatefull[name];
      this.loadPool(name, pool);
    });
  }

  private loadPool(name: string, pool: SmartPool): void {
    const poolConfig: IPoolConfig = {
      name,
      pool,
      status: this.castPoolStatusToArray(pool),
      type: pool instanceof ExtendedPool ? 'extended' : 'smart'
    };

    this.pools.push(poolConfig);

    this.subscriptions.add(pool.observeConnection()
      .subscribe(() => poolConfig.status = this.castPoolStatusToArray(pool)));
  }

  private createSmart(name: string): void {
    const pool = new SmartPool();
    const poolConfig: IPoolConfig = {
      type: 'smart',
      status: this.castPoolStatusToArray(pool),
      pool, name
    };

    this.subscriptions.add(pool.observeConnection()
      .subscribe(() => poolConfig.status = this.castPoolStatusToArray(pool)));

    this.pools.push(poolConfig);
    globalPoolsStatefull[name] = pool;
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

      this.subscriptions.add(pool.observeConnection()
        .subscribe(() => poolConfig.status = this.castPoolStatusToArray(pool)));

      this.pools.push(poolConfig);
      globalPoolsStatefull[name] = pool;
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
