import { Injectable } from '@angular/core';
import { NostrConverter, NostrEventKind, NostrSecretCrypto, NostrService, TNcryptsec, TNostrPublic, TNostrSecret } from '@belomonte/nostr-ngx';
import { readServerConfig } from 'nostr-tools/nip96';
import { BehaviorSubject } from 'rxjs';
import { ProfileSessionStorage } from '../credential-manager-widget/credential-storage/profile-session.storage';
import { IProfile } from '../domain/profile.interface';
import { IUnauthenticatedUser } from '../domain/unauthenticated-user.interface';
import { AccountConverter } from './account.converter';
import { NostrSigner } from './nostr.signer';
import { ProfileProxy } from './profile.proxy';

@Injectable({
  providedIn: 'root'
})
export class AuthenticatedProfileObservable extends BehaviorSubject<IProfile | null> {
 
  constructor(
    private profileProxy: ProfileProxy,
    private accountConverter: AccountConverter,
    private nostrConverter: NostrConverter,
    private nostrSecretCrypto: NostrSecretCrypto,
    private sessionConfigs: ProfileSessionStorage,
    private nostrService: NostrService,
    private nostrSigner: NostrSigner
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
