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

  createSimple(name: string): void {
    const pool = new SimplePool();
    const poolConfig: IPoolConfig = {
      type: 'simple',
      status: [],
      pool, name
    };
    
    this.pools.push(poolConfig);
  }

  createSmart(name: string): void {
    const pool = new SmartPool();
    const poolConfig: IPoolConfig = {
      type: 'smart',
      status: [],
      pool, name
    };

    this.pools.push(poolConfig);
  }

  createExtended(name: string, extendsFromPool: string): void {
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

  createDerivated(name: string, derivateFromPool: string): void {
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

}
