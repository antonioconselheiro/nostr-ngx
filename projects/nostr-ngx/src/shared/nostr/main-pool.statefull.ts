import { Injectable } from '@angular/core';
import { SimplePool } from 'nostr-tools';
import { AbstractSimplePool } from 'nostr-tools/abstract-pool';

/**
 * FIXME: talvéz a melhor saída não seja fazer um serviço para uma pool central, apesar de ter uma
 * pool central, ela não deve ser um service singleton, por que haverão outras pools de acordo com
 * o contexto da aplicação
 */
/**
 * Centralize relays information and status
 */
@Injectable({
  providedIn: 'root'
})
export class MainPoolStatefull {

  static currentPool: AbstractSimplePool = new SimplePool();
  static readPool: string[] = [];
  static writePool: string[] = [];
}
