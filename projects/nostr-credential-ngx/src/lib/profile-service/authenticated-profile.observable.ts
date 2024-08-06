import { Injectable } from '@angular/core';
import { NostrConverter, NostrEventKind, NostrSecretCrypto, NostrService, TNcryptsec, TNostrPublic, TNostrSecret } from '@belomonte/nostr-ngx';
import { readServerConfig } from 'nostr-tools/nip96';
import { BehaviorSubject } from 'rxjs';
import { ProfileSessionStorage } from '../credential-manager-widget/credential-storage/profile-session.storage';
import { IProfile } from '../domain/profile.interface';
import { IUnauthenticatedUser } from '../domain/unauthenticated-user.interface';
import { AccountConverter } from './account.converter';
import { ProfileProxy } from './profile.proxy';

@Injectable({
  providedIn: 'root'
})
export class AuthenticatedProfileObservable extends BehaviorSubject<IProfile | null> {

  static DEFAULT_PROFILE_PICTURE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAMAAAC3Ycb+AAACKFBMVEXM1t3K1Nu7xs6tusOisLqYprGMm6eGlaJ/j5x4iZZzhJJuf45sfYzJ09vBzNSsucKXprGEk6B0hJJmeIdld4bAy9OlsryLmqZxgpC3w8uXpbC+ydGZp7J0hZPL1dyrt8GAkJ3H0tmeq7ZwgZDG0NiaqLNtfoygrbhtfo2jsLtqfIrDzdWDk6CyvsdvgI6cqrTJ09qJmKTDztV8jJm/ytK8x8+6xs66xc5vgI+9ydHBzNN3iJWNnKe3wstneYjG0dhyg5GJmaWotL5sfoyHl6PI0tqap7Jpe4mNnKhneIeIl6OKmaWRoKtrfIuhrrigrrh2h5S1wMm0wMmOnaiFlaFoeomntL5rfYuToq3Ez9aqt8CQn6t6ipezv8icqrWIl6R2hpR1hpTI09qms72WpK+HlqN3h5VpeonCzdSRn6uFlKF6i5h6iphwgY+9yNC7x8+qt8GfrbefrLeElKB+jpt9jZqdq7Wksbu4xMy4w8yCkp+SoKyir7qir7nF0NfFz9eerLa1wcrK1dyHlqKruMGcqbR1hpOxvcawvMWPnanH0dl7i5nI0tl5ipeuusNtf42otb9ugI6QnqqWpLBoeohqe4qUo66bqbOGlqKToa14iJZpe4qvu8R5iZe8x9C5xc25xM3Ez9fCzdW3w8yVpK+qtsCdqrWVo66RoKyUoq62wsqOnamjsLqtucO7xs/Ezta2wsuuusSPnqmvvMWCkZ6SoayptsCVo692ayFsAAAIy0lEQVR4AezBMQEAAAQAMKB/ZbcO2+IDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALJ69tiDBzMJojAIgH1ra/61bdv5Z3UJrGYePnVVKByJxmLxRCIei0Uj4VAw4PclQZal0plszpE3nFw2k06B7MgXiiX5QalYyMMwKmei4kK0UoYxVK3VxbVcrQoDqNFsiUetZgOkV7vTFQXdThukT68/EEWDfg+kx99wJBqMhn8gDfw50STnB6nKh0WjcB6kZDwRrSZjkHfTmWg3m4I8mi/EgMUc5MnSESOcJci91VqMWa9ALm22YtB2A3JlFxOjYjuQC/uuGNbdg352iItx8SPoR/u4WHA6g35y6YoVpQvoB72rWHLtgb76a4k1rT/QNzex6Ab6YixWjUEf3R9i1eMO+uD5z9496Ia2hUEAnmt7jo3g2lZt2zi2att959qI0zXJP98r7L38I4MnLOMm7HiZPHGZsGNlMYEsHMO+zmYC2V/jaJbDJHJwJPuEiXyCI1juWSaS8QMOs7eYTB4OsVP5TCb/FA6yAib0D+yAXwuZUOGvsP1ymFQRbJ/XmdjrsL3OMLFi2B6/FDKxwl9gu0qYXAlsx7VSJvfVNWyzMgooxzaroIAK2JZKSqiCbaqmhGrYhtxSSijNRTJ+Sffr+vFqKKIGtub/Woqo/R+A1VFGHQDLoYwcwF6rp4z612DfUsi3sAYKaYC9RyHv+Xs0UskXjYiuiVKaEF0zpTQjuhYq8SKSW0gphbmIrZViWhFbG8W0IbZ2imlHbB0U04nQbn1BMV/cQmT/Us6/iOw25dxGZHco5w4iu0s5dxHZPcq5h8juU859BPaAgh44ylpLpYNIVTig9HsK+h5xPaQUPxo+oqBHiOsxBT1BXBkU9BRx1VJQ4WVEdZOSfkJUzyjpuUNONDgE/gUlvUBUpynpNKJ6SUmvEFUeJV108pSWBtc40VLtbiEa3FGki5K+QVTf+IMI8AfR1U1J3Yiqh5J6/EH8QfxB/EG8hgjwLkuYP4i+R5T0yE1DtJxxkwoNblxxnpLOI6peSupFVH2U1Ieo3qCkNxBVPyUNIKqfKOlrhPUfBf3n/BAtGYhrkIIGEdcQBQ0hrmEKGnFnBKeHqBiloDEE9jnlfI7IfqScHxHZOOWMI7JzlDOByC5nU8xXkwhtimI+Q2zDPhZq+Zhi/kJwP1PKz4hu3JteLae+oJAvfoESv4kMwqYp5Aps8ill/DEJ2AxlzACw/+spov4m1th5rShrG8umhOwxbLCXWoXL7LVZCrj0GrbYHAXMY4ctMLkF7LLFDCaWsYg9rPI/JvVFFfaxciZ1HaaUtF6Mg+y1q0zm6ms4xHKXmMjS8io79aAcVwCFAfjEHCVnHefGySg2RrXtNrbu1o1t29Y71ubiarr/9xAfwW+0jbIqRtsJfksQWQVWgeAPnpSz4sqf0J+BFyvMK4zgb8bGWUHjYwT/UPWSFfOyiuDfJiZZEZMTZBMQ7haw7AqmBLIVZD9kmT3MJrCHu6GAZVNgcCewl246i2WRNa0jR4BbuM8MS2zmWrgbOQyE0ppZlsxsTalA4CS3/rnh0+y008Nz/W4kDYgcmF8wssOMC/MDkQQSEy4nLF5bWmY7LC9dW0y4LBDIqC1jRf/glqHGd9U/IJB/ERjgv+pbY7j1QL+S0U6guJG299IslrS290YIAAAAAAAAAAAAAAAAAAAAAAAA4P/wZC2lpNk8VZwcId6798jf//G9e2JEcvGUubkkZe0JgWLc1kumH9bF8l/F1j2cLtlwI5DV5krMmUun2WanL52JWdkkkEP6M0MQOyTI8CydpARbpYZ6dkq9oXSLJAHrXrUsiVqvdXISbJeFsoRCy7bJYZC+48+S899JJwdApF5kmVj1kWQfMHnPsoxmvU0ENuvatbLsrLtdBLYQ9opYEcY9gf4FkvYTWTGJ+0n0N7D1qpIVVXmwRX8Ct+cqWXGVh7fpd8At6iar4maUG/0CJopYNcYJ+hEcDbOqajvpG2gbDGaVBR+30WdQGsAaMF5KH8CayBohrhGEtVSyZlS2hJGLSxNZU8Q0cmnPzrPGJJ6Q6xKusQZdE8hFmYpYk4pM5JI6ZlijCjrQlcrQVmMfa9i79u4BPc8oCKBwbX731LZt27Zt27Zt2/b2uoEyHL1bOMHNzDz54fgGXz3ejUO41pU99dieEC8993PDMBIVRjq5gmi0GyV2uzjfanMONc61cTC8ylAkMz/aet8TVXq+t91jZ0uUabnT9PSqAurM6Ge4xwxQWKRW9CgIUaTbBZS6YHKwVa0JajUx+Pr9kKFY9sHc+qMPqvUxtiAp2hDlGhY1FWQM6o2x1KM2Blyx02M6Jky30uPjVUy4+trIg7cJRjQx8fitXwYzyli4xX6BIdf199iIKRu196gzDlPG9VJ+8XMGY84Ujb8IZamtuce8hDlpnuIR70AMGqh38FsDSWLM+AmjPunscboJRjU5rTLIZ8z6rPKFhWEKX1oV62FYvYrqghzDtGPaelS6hmnXKikLMgjjBsVvdGHmqdoS9sG85Zq2h9VxoLqiJ+9AHBio5+m7GRcOaukxoCUutBygJEhJnCipo8eB1jjR+kDs0f9b7NebzsCNGRq2uTdwpJn8Hosv4cilxeKDtMKVfeKDTMSVTPpE6wTOfBEeZDXOfJXdo2vCm/Wig7zCnW+i5+4VcKdCR8FBvuPQRcFBduPQbrk9KiUcSpXiOO7fxNHccVw6LrVHLZyqJTTID5z6ITRIPZyqJ7PHQ9x6GLt0WaqIDLIItxZJ7LEeUWLk2wLHWggM0hbH2gqcvN/BsTsVY5kuy4nYFcoyU1yQe7hWVlqP/QnX0n5hQd7h3Lv4Z7CyvBAWZCvObZXV4/AInBtxWFSQJ4gSa8NWEaSVqCBvIsgUUUHWRpC1knrUXxFBVtQXFOQ+gfvxmRTxSRa/0wFR4qJ0JIGRMTiJ4cnvrCOwTk6PYQRgmJggDwjAgyJ54CdHF8F5TMtp0wAAAABJRU5ErkJggg==';
  static DEFAULT_BANNER_PICTURE = 'data:image/jpeg;base64,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';
 
  constructor(
    private profileProxy: ProfileProxy,
    private accountConverter: AccountConverter,
    private nostrConverter: NostrConverter,
    private nostrSecretCrypto: NostrSecretCrypto,
    private sessionConfigs: ProfileSessionStorage,
    private nostrService: NostrService
  ) {
    const session = sessionConfigs.read();
    const profile = session.sessionFrom === 'sessionStorage' && session.nsec && session.profile || null;

    super(profile)
  }

  getCurrentAuthProfile(): IProfile | null {
    return this.getValue();
  }

  getCurrentPubKey(): string | null {
    const profile = this.getValue();
    if (!profile) {
      return null;
    }

    return this.nostrConverter.castNostrPublicToPubkey(profile.npub);
  }

  // TODO: as configurações dos serviços de imagem NÃO RETORNAM as informações exigidas para compor
  //  nip98AuthorizationHeader, então para implementar precisarei incluir as urls de login e método
  //  associados as urls dos servidores de imagem mais conhecidos.
  //  https://primal.net/e/note182duc5fwl62m8gavrpjkruu4ak2tygfp8q8wlxdrmc9g0r4zq8jsy2k9ex
  //  TODO: Se o servidor de imagem não for conhecido pela aplicação e exigir autenticação com NIP98, então
  //  terei que responder com um erro que dê meios ao usuário de abrir um issue no github 
  //  FIXME: solve cyclomatic complexity
  // eslint-disable-next-line complexity
  async getUploadFileConfigs(): Promise<{ serverApiUrl: string, nip98AuthorizationHeader: string }> {
    const pubkey = this.getCurrentPubKey();
    const defaultConfigs = { serverApiUrl: 'https://nostr.build', nip98AuthorizationHeader: '' }
  
    if (!pubkey) {
      return Promise.resolve(defaultConfigs);
    }
  
    const [fileServer] = await this.nostrService.request([
      {
        kinds: [ NostrEventKind.FileServerPreference ],
        authors: [ pubkey ],
        limit: 1
      }
    ]);

    if (!fileServer) {
      return Promise.resolve(defaultConfigs);
    }
    
    // TODO: não é prioritário, mas se o usuário tem mais de um servidor de imagem
    //  cadastrado então seria bom dar a opção para que escolha em qual ele deseja publicar
    const [server] = fileServer.tags.find(([type, value]) => type === 'server' && value) || [];
    if (!server) {
      return Promise.resolve(defaultConfigs);
    }
    
    const serverConfig = await readServerConfig(server);
    if (!serverConfig.plans) {
      return Promise.resolve({
        serverApiUrl: serverConfig.api_url,
        nip98AuthorizationHeader: ''
      });
    }

    if (serverConfig.plans['free'] && !serverConfig.plans['free'].is_nip98_required) {
      return Promise.resolve({
        serverApiUrl: serverConfig.api_url,
        nip98AuthorizationHeader: ''
      });
    }

    console.error(`Prefered file server ${server} is not free and has no implementation in this client to authenticate`);
    //  FIXME: aqui estou retornando as configurações padrão de upload,
    //  mas seria bom encontrar uma forma de responder com algum tipo de erro
    //  indicando que não há implementação para autenticar no servidor de imagens
    //  configurado 
    return Promise.resolve(defaultConfigs);
  }

  authenticateWithNostrSecret(nsec: TNostrSecret, saveNostrSecretInSessionStorage = false): Promise<IProfile> {
    const user = this.nostrConverter.convertNsecToNpub(nsec);
    this.sessionConfigs.clear();

    if (saveNostrSecretInSessionStorage) {
      this.sessionConfigs.patch({ nsec });
    }

    return this.loadProfile(user.npub);
  }

  authenticateAccount(account: IUnauthenticatedUser, password: string, saveNostrSecretInSessionStorage = false): Promise<IProfile> {
    const nsec = this.accountConverter.decryptAccount(account, password);
    const user = this.nostrConverter.convertNsecToNpub(nsec);
    this.sessionConfigs.clear();
    this.sessionConfigs.patch({ ncryptsec: account.ncryptsec });

    if (saveNostrSecretInSessionStorage) {
      this.sessionConfigs.patch({ nsec });
    }

    return this.loadProfile(user.npub);
  }

  authenticateEncryptedEncode(ncryptsec: TNcryptsec, password: string, saveNostrSecretInSessionStorage = false): Promise<IProfile> {
    const nsec = this.nostrSecretCrypto.decryptNcryptsec(ncryptsec, password);
    const user = this.nostrConverter.convertNsecToNpub(nsec);
    this.sessionConfigs.clear();
    this.sessionConfigs.patch({ ncryptsec });

    if (saveNostrSecretInSessionStorage) {
      this.sessionConfigs.patch({ nsec });
    }

    return this.loadProfile(user.npub);
  }

  private loadProfile(npub: TNostrPublic): Promise<IProfile> {
    return this.profileProxy
      .load(npub)
      .then(profile => {
        this.sessionConfigs.patch({ profile });
        this.next(profile);

        return Promise.resolve(profile);
      });
  }

  logout(): void {
    this.next(null);
    sessionStorage.clear();
  }
}
