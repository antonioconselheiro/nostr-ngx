import { Injectable } from '@angular/core';
import { HexString } from '@belomonte/nostr-ngx';

// TODO: este serviço deve permitir que o client configure o carregamento de imagens em dois modelos: 
// 1. sem fly weight: nenhuma imagem é carregada para o javascript, é dado ao DOM o controle de carregamento das imagens;
// 2. in memory cached: reserva um espaço de cache para armazenar imagens de perfil mais comumente acessadas, controla o
//  carregamento das imagens logicamente utilizando a solução de flyweight, as guarda em memória e em cache em base64
//  redimencionado (não redimencionado somente no caso de GIFs animadas).
//
// TODO: este serviço deve ser responsável por utilizar a configuração de proxy através do qual a imagem poderá ser tratada
// 
@Injectable({
  providedIn: 'root'
})
export class ProfileImageFlyweight {

  indexedByUrl: { [url: string]: HexString } = {};
  indexedByHash: { [hash: HexString]: string } = {};
  

  constructor() { }
}
