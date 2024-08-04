import { Injectable } from '@angular/core';
import { NostrSecretCrypto, NostrConverter, TNcryptsec, TNostrPublic, TNostrSecret, NostrEventKind, NostrService } from '@belomonte/nostr-ngx';
import { BehaviorSubject } from 'rxjs';
import { IProfile } from '../domain/profile.interface';
import { IUnauthenticatedUser } from '../domain/unauthenticated-user.interface';
import { ProfileSessionStorage } from '../credential-manager-widget/credential-storage/profile-session.storage';
import { AccountConverter } from './account.converter';
import { ProfileProxy } from './profile.proxy';
import { readServerConfig } from 'nostr-tools/nip96';
import { getToken } from 'nostr-tools/nip98';
import { NostrSigner } from './nostr.signer';

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

    //  FIXME: preciso encontrar os parâmetros corretos para passar ao getToken,
    //  coloquei uns parâmetros fixos mas não deve ser a implementação correta
    const nip98AuthorizationHeader = await getToken(serverConfig.api_url, 'post', e => this.nostrSigner.signEvent(e))
    return Promise.resolve({
      serverApiUrl: serverConfig.api_url,
      nip98AuthorizationHeader
    });
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
