import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NostrWatchApi {

  listOnlineRelays(): Promise<object> {
    return fetch('https://api.nostr.watch/v1/online').then(response => response.json());
  }

  listPublicRelays(): Promise<object> {
    return fetch('https://api.nostr.watch/v1/public').then(response => response.json());
  }

  listPaidRelays(): Promise<object> {
    return fetch('https://api.nostr.watch/v1/paid').then(response => response.json());
  }

  listOfflineRelays(): Promise<object> {
    return fetch('https://api.nostr.watch/v1/offline').then(response => response.json());
  }

  listRelaysByNipSupport(nip: number): Promise<object> {
    return fetch(`https://api.nostr.watch/v1/nip/${nip}`).then(response => response.json());
  }
}










