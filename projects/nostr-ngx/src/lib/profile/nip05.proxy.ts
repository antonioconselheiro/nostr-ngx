import { Injectable } from "@angular/core";
import { Nip05, NIP05_REGEX } from "nostr-tools/nip05";
import { ProfilePointer } from "nostr-tools/nip19";
import { Nip05Resultset } from "./nip05-resultset.interface";

/**
 * Help avoid reload already loaded info
 */
@Injectable({
  providedIn: 'root'
})
export class Nip05Proxy {

  private loaded: {
    [domain: string]: Nip05Resultset
  } = { };

  async queryProfile(nip05: Nip05 | undefined): Promise<ProfilePointer | null> {
    if (!nip05) {
      return null;
    }

    const match = nip05.match(NIP05_REGEX);
    if (!match) return null;
    const [, name = '_', domain] = match;
    const resultset = this.loaded[domain];

    if (resultset) {
      const pointer = this.parse(name, resultset);
      if (pointer) {
        return pointer;
      }
    }

    return this.loadProfile(domain, name);
  }

  private parse(name: string, json: Nip05Resultset): ProfilePointer | null {
    const pubkey = json.names[name];
    return pubkey ? { pubkey, relays: json.relays?.[pubkey] } : null;
  }

  private async loadProfile(domain: string, name: string): Promise<ProfilePointer | null> {
    try {
      const url = `https://${domain}/.well-known/nostr.json?name=${name}`;
      const res = await fetch(url, { redirect: 'manual' });
      if (res.status !== 200) {
        throw Error('Wrong response code');
      }

      //  FIXME: talvéz uma validação do formato deste json aqui seja uma boa ideia
      const json: Nip05Resultset = await res.json();
      const map = this.loaded[domain] = this.loaded[domain] || { names: {}, relays: {} };
      map.names = { ...map.names, ...json.names };
      map.relays = { ...map.relays, ...json.relays };

      return this.parse(name, json);
    } catch {
      return null;
    }
  }

}