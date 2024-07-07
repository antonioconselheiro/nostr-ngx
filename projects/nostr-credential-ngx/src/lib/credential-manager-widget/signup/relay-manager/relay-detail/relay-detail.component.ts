import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IProfile } from '../../../../domain/profile.interface';
import { ProfileProxy } from '../../../../profile-service/profile.proxy';
import { TRelayManagerSteps } from '../relay-manager-steps.type';
import { fetchRelayInformation, RelayInformation } from 'nostr-tools/nip11';
import { RelayInformationTemp } from '@belomonte/nostr-ngx';

@Component({
  selector: 'nostr-relay-detail',
  templateUrl: './relay-detail.component.html',
  styleUrl: './relay-detail.component.scss'
})
export class RelayDetailComponent implements OnInit {

  @Output()
  back = new EventEmitter<void>();

  @Output()
  changeRelayStep = new EventEmitter<TRelayManagerSteps>();

  @Input()
  relay!: string;

  loadedDetails: RelayInformation & RelayInformationTemp | null = null;

  loadedContactProfile: IProfile | null = null;

  // TODO: formatação dos números precisa ser revista na internacionalização
  numberFormat = '1.0-0';

  constructor(
    private profileProxy: ProfileProxy
  ) { }

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    fetchRelayInformation(this.relay)
      .then((details) => this.onLoad(details as RelayInformation & RelayInformationTemp));
  }

  private onLoad(details: RelayInformation & RelayInformationTemp): void {
    this.loadedDetails = details;
    console.info(this.relay, 'details', details);
    this.loadContactAccount(details);
  }

  private loadContactAccount(details: RelayInformation & RelayInformationTemp): void {
    if (details.pubkey) {
      this.profileProxy
        .loadFromPublicHexa(details.pubkey, [this.relay])
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

  showPublicationLimitations(loadedDetails: RelayInformation & RelayInformationTemp): boolean {
    if (!loadedDetails.limitation) {
      return false;
    }

    return (loadedDetails.limitation.max_content_length || 
      loadedDetails.limitation.created_at_lower_limit || 
      loadedDetails.limitation.max_event_tags || 
      loadedDetails.limitation.max_message_length) && true || false;
  }

  showOtherLimitations(loadedDetails: RelayInformation & RelayInformationTemp): boolean {
    if (!loadedDetails.limitation) {
      return false;
    }

    return (loadedDetails.limitation.auth_required || 
      loadedDetails.limitation.restricted_writes) && true || false;
  }

  softwareIsName(loadedDetails: RelayInformation & RelayInformationTemp): boolean {
    const isUrl = /(https?:\/\/)|(^git\@)/;
    return !isUrl.test(loadedDetails.software);
  }

  softwareHasLink(loadedDetails: RelayInformation & RelayInformationTemp): string | null {
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

  contactIsEmail(loadedDetails: RelayInformation & RelayInformationTemp): boolean {
    const isEmail = /^[^ ]+@[^ ]+\.[^ ]+$/;
    return isEmail.test(loadedDetails.contact);
  }

  contactIsWebSite(loadedDetails: RelayInformation & RelayInformationTemp): boolean {
    const isWebSite = /^[^@ ]+\.[^ ]+$/;
    return isWebSite.test(loadedDetails.contact);
  }
}
