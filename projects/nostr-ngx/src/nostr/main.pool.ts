import { Injectable } from '@angular/core';
import { SmartPool } from '../pool/smart.pool';

@Injectable({
  providedIn: 'root'
})
export class MainPool extends SmartPool {

  constructor() {
    super();
  }
}
