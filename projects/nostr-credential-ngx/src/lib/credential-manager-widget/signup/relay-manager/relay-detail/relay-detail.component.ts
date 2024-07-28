import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { IProfile } from '../../../../domain/profile.interface';
import { ProfileProxy } from '../../../../profile-service/profile.proxy';
import { TRelayManagerSteps } from '../relay-manager-steps.type';
import { fetchRelayInformation, RelayInformation } from 'nostr-tools/nip11';
import { ExtendedPool, MainPool } from '@belomonte/nostr-ngx';

@Component({
  selector: 'nostr-relay-detail',
  templateUrl: './relay-detail.component.html',
  styleUrl: './relay-detail.component.scss'
})
export class RelayDetailComponent implements OnInit, OnDestroy {

  @Output()
  back = new EventEmitter<void>();

  @Output()
  changeRelayStep = new EventEmitter<TRelayManagerSteps>();

  @Input()
  relay!: string;

  pool?: ExtendedPool;

  loadedDetails: RelayInformation | null = null;
  loadedContactProfile: IProfile | null = null;

  // TODO: formatação dos números precisa ser revista na internacionalização
  numberFormat = '1.0-0';

  constructor(
    private mainPool: MainPool,
    private profileProxy: ProfileProxy
  ) { }

  ngOnInit(): void {
    this.connectPool();
  }

  ngOnDestroy(): void {
    this.disconnectPool();
  }

  private connectPool(): void {
    const pool = this.pool = new ExtendedPool(this.mainPool);
    fetchRelayInformation(this.relay)
      .then(details => {
        pool.ensureRelay(this.relay, { details });
        this.onLoad(details, pool);
      })
      .catch(e => {
        console.error(e);
        pool.ensureRelay(this.relay);
      });
  }

  private disconnectPool(): void {
    if (this.pool) {
      this.pool.destroy();
      delete this.pool;
    }
  }

  private onLoad(details: RelayInformation, pool: ExtendedPool): void {
    this.loadedDetails = details;
    console.info(this.relay, 'details', details);
    this.loadContactAccount(details, pool);
  }

  private loadContactAccount(details: RelayInformation, pool: ExtendedPool): void {
    if (details.pubkey) {
      this.profileProxy
        .loadFromPublicHexa(details.pubkey, pool)
        .then(profile => this.loadedContactProfile = profile)
    }
  }

  getNipLink(nip: number): string {
    const minTwoCharsNumber = 10;
    const zerofilled = nip < minTwoCharsNumber ? '0' + nip : String(nip); 

    return `https://github.com/nostr-protocol/nips/blob/master/${zerofilled}.md`;
  }

  showSupportedNips(loadedDetails: RelayInformation): boolean {
    return loadedDetails.supported_nips?.length && true || false;
  }

  showContact(loadedDetails: RelayInformation): boolean {
    return (loadedDetails.contact || loadedDetails.pubkey) && true || false;
  }

  showSoftware(loadedDetails: RelayInformation): boolean {
    return (loadedDetails.software || loadedDetails.version) && true || false;
  }

  showPublicationLimitations(loadedDetails: RelayInformation): boolean {
    if (!loadedDetails.limitation) {
      return false;
    }

    return (loadedDetails.limitation.max_content_length || 
      loadedDetails.limitation.created_at_lower_limit || 
      loadedDetails.limitation.max_event_tags || 
      loadedDetails.limitation.max_message_length) && true || false;
  }

  showOtherLimitations(loadedDetails: RelayInformation): boolean {
    if (!loadedDetails.limitation) {
      return false;
    }

    return (loadedDetails.limitation.auth_required || 
      loadedDetails.limitation.restricted_writes) && true || false;
  }

  softwareIsName(loadedDetails: RelayInformation): boolean {
    const isUrl = /(https?:\/\/)|(^git\@)/;
    return !isUrl.test(loadedDetails.software);
  }

  softwareHasLink(loadedDetails: RelayInformation): string | null {
    const isHttp = /^https?:\/\//;
    const isGitSsh = /^git@[^ ]+\:[^ ]+.git$/;
    const isGitHttp = /^git\+/;

    if (isHttp.test(loadedDetails.software)) {
      return loadedDetails.software;
    } else if (isGitSsh.test(loadedDetails.software)) {
      return loadedDetails.software.replace(/^git@|.git$/g, '').replace(/:/, '/');
    } else if (isGitHttp.test(loadedDetails.software)) {
      return loadedDetails.software.replace(/^git\+/, '');
    }

    return null;
  }

  contactIsEmail(loadedDetails: RelayInformation): boolean {
    const isEmail = /^[^ ]+@[^ ]+\.[^ ]+$/;
    return isEmail.test(loadedDetails.contact);
  }

  contactIsWebSite(loadedDetails: RelayInformation): boolean {
    const isWebSite = /^[^@ ]+\.[^ ]+$/;
    return isWebSite.test(loadedDetails.contact);
  }

  getLowerLimitTimestamp(loadedDetails: RelayInformation): number {
    const lowerLimit = loadedDetails.limitation?.created_at_lower_limit;
    if (!lowerLimit) {
      return 0;
    }

    return lowerLimit * 1000;
  }

  getUpperLimitTimestamp(loadedDetails: RelayInformation): number {
    return new Date().getTime() + ((loadedDetails.limitation?.created_at_upper_limit || 0) * 1000);
  }
}
