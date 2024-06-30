import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TRelayManagerSteps } from '../relay-manager-steps.type';
import { IRelayDetail } from './relay-detail.interface';
import { NostrEventKind, NostrService } from '@belomonte/nostr-ngx';
import { NostrEvent } from 'nostr-tools';
import { IProfilePicture } from '@belomonte/nostr-credential-ngx';

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

  /**
   * FIXME: usar interface de perfil
   */
  loadedAccountContact: any | null = null;

  // TODO: formatação dos números precisa ser revista na internacionalização
  numberFormat = '1.0-0';

  constructor(
    private nostrService: NostrService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    fetch(this.relay.replace(/^ws/, 'http'), {
      headers: {
        Accept: 'application/nostr+json'
      }
    }).then(res => res.json())
      .then(details => this.onLoad(details));
  }

  private onLoad(details: IRelayDetail): void {
    this.loadedDetails = details;
    console.info(this.relay, 'details', details);
    this.loadContactAccount(details);
  }

  private loadContactAccount(details: IRelayDetail): void {
    if (details.pubkey) {
      //  TODO: preciso reescrever esta requisição de forma que ela fique no cache
      this.nostrService.request([
        {
          authors: [ details.pubkey ],
          kinds: [ NostrEventKind.Metadata ],
          limit: 1
        }
      ], [
        this.relay
      ]).then(data => {
        this.loadedAccountContact = JSON.parse(data[0].content) || null;
      });
    }
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
    return (loadedDetails.contact || loadedDetails.pubkey) && true || false;
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

  contactIsWebSite(loadedDetails: IRelayDetail): boolean {
    const isWebSite = /^[^@ ]+\.[^ ]+$/;
    return isWebSite.test(loadedDetails.contact);
  }
}
