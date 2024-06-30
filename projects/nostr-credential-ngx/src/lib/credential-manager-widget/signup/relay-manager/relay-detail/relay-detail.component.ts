import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TRelayManagerSteps } from '../relay-manager-steps.type';
import { IRelayDetail } from './relay-detail.interface';

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

  loadedDetails: IRelayDetail | null = null;

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    fetch(this.relay.replace(/^ws/, 'http'), {
      headers: {
        Accept: 'application/nostr+json'
      }
    }).then(res => res.json())
      .then(details => {this.loadedDetails = details; console.info(this.relay, 'details', details);});
  }

  getNipLink(nip: number): string {
    const minTwoCharsNumber = 10;
    const zerofilled = nip < minTwoCharsNumber ? '0' + nip : String(nip); 

    return `https://github.com/nostr-protocol/nips/blob/master/${zerofilled}.md`;
  }

  showSupportedNips(loadedDetails: IRelayDetail): boolean {
    return loadedDetails.supported_nips?.length && true || false;
  }

  showContact(loadedDetails: IRelayDetail): boolean {
    return loadedDetails.contact && true || false;
  }

  showSoftware(loadedDetails: IRelayDetail): boolean {
    return (loadedDetails.software || loadedDetails.version) && true || false;
  }

  showPublicationLimitations(loadedDetails: IRelayDetail): boolean {
    if (!loadedDetails.limitation) {
      return false;
    }

    return (loadedDetails.limitation.max_content_length || 
      loadedDetails.limitation.created_at_lower_limit || 
      loadedDetails.limitation.max_event_tags || 
      loadedDetails.limitation.max_message_length) && true || false;
  }

  showOtherLimitations(loadedDetails: IRelayDetail): boolean {
    if (!loadedDetails.limitation) {
      return false;
    }

    return (loadedDetails.limitation.auth_required || 
      loadedDetails.limitation.restricted_writes) && true || false;
  }

  softwareIsName(loadedDetails: IRelayDetail): boolean {
    const isUrl = /(https?:\/\/)|(^git\@)/;
    return !isUrl.test(loadedDetails.software);
  }

  softwareHasLink(loadedDetails: IRelayDetail): string | null {
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

  contactIsEmail(loadedDetails: IRelayDetail): boolean {
    const isEmail = /^[^ ]+@[^ ]+\.[^ ]+$/;
    return isEmail.test(loadedDetails.contact);
  }

  contactIsHexadecimal(loadedDetails: IRelayDetail): boolean {
    const isHexadecimal = /^[a-f0-9]+$/;
    return isHexadecimal.test(loadedDetails.contact);
  }
}
