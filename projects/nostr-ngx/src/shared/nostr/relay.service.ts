import { Injectable } from '@angular/core';

/**
 * TODO:
 * Essa classe deverá ler os relays configurados na ferramenta,
 * os relays publicamente associados a conta e os relays registrados
 * na extensão.
 * 
 * A classe deve conter um método onde ele indica se é capaz ou não
 * de editar os relays default, sendo capaz de editar os públicos e
 * os configurados localmente na ferramenta.
 * 
 * A classe deve ter meios alterar as configurações de relays quando
 * possível.
 */
@Injectable({
  providedIn: 'root'
})
export class RelayService {

  getDefaultReadRelays(): string[] {
    return [
      'ws://umbrel.local:4848'
    ];
  }

  getDefaultWriteRelays(): string[] {
    return [
      'ws://umbrel.local:4848'
    ];
  }
}
