import { Component } from '@angular/core';
import { IPoolConfig } from './pool-config.interface';
import { SimplePool } from 'nostr-tools';
import { DerivatedPool, ExtendedPool, SmartPool } from '@belomonte/nostr-ngx';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-pool-communication-check',
  templateUrl: './pool-communication-check.component.html',
  styleUrl: './pool-communication-check.component.scss'
})
export class PoolCommunicationCheckComponent {

  pools: IPoolConfig[] = [];

  formEventPublish = this.fb.group({
    name: [''],
    poolType: [''],
    fromPool: ['']
  });

  constructor(
    private fb: FormBuilder
  ) { }

  private createSimple(name: string): void {
    const pool = new SimplePool();
    const poolConfig: IPoolConfig = {
      type: 'simple',
      status: [],
      pool, name
    };
    
    this.pools.push(poolConfig);
  }

  private createSmart(name: string): void {
    const pool = new SmartPool();
    const poolConfig: IPoolConfig = {
      type: 'smart',
      status: [],
      pool, name
    };

    this.pools.push(poolConfig);
  }

  private createExtended(name: string, extendsFromPool: string): void {
    const extendsFrom = this.pools.find(pool => pool.name === extendsFromPool);

    if (extendsFrom) {
      const pool = new ExtendedPool(extendsFrom.pool, []);
      const poolConfig: IPoolConfig = {
        type: 'extended',
        status: [],
        pool, name
      };

      this.pools.push(poolConfig);
    }
  }

  private createDerivated(name: string, derivateFromPool: string): void {
    const derivateFrom = this.pools.find(pool => pool.name === derivateFromPool);

    if (derivateFrom) {
      const pool = new DerivatedPool([derivateFrom.pool], []);
      const poolConfig: IPoolConfig = {
        type: 'derivated',
        status: [],
        pool, name
      };

      this.pools.push(poolConfig);
    }
  }

  submitPool(): void {
    if (this.formEventPublish.valid) {
      const form = this.formEventPublish.getRawValue();
      const poolType = form.poolType || '';
      const poolName = form.name || '';
      const fromPool = form.fromPool || '';

      switch (poolType) {
        case 'simple':
          this.createSimple(poolName);
          break;
        case 'smart':
          this.createSmart(poolName);
          break;
        case 'extended':
          this.createExtended(poolName, fromPool);
          break;
        case 'derivated':
          this.createDerivated(poolName, fromPool);
          break;
      }
    }
  }

  addRelay(poolConfig: IPoolConfig, newRelay: string): void {
    if (/^ws/.test(newRelay)) {
      poolConfig.pool.ensureRelay(newRelay);
    }
  }
}