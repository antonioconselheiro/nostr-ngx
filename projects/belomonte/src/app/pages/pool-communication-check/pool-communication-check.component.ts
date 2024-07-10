import { Component } from '@angular/core';
import { IPoolConfig } from './pool-config.interface';

@Component({
  selector: 'app-pool-communication-check',
  templateUrl: './pool-communication-check.component.html',
  styleUrl: './pool-communication-check.component.scss'
})
export class PoolCommunicationCheckComponent {
  pools: IPoolConfig[] = [];
}
