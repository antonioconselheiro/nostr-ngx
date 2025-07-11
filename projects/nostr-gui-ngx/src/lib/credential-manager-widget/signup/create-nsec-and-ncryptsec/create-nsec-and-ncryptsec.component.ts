import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AccountFactory, AccountsLocalStorage, FileManagerService, NostrConverter, NostrSigner, NSecCrypto, ProfileSessionStorage, RelayLocalConfigService } from '@belomonte/nostr-ngx';
import { NostrMetadata } from '@nostrify/nostrify';
import { Ncryptsec, NPub, NSec } from 'nostr-tools/nip19';
import { CreatingAccount } from '../../../domain/creating-account.interface';
import { QrcodeService } from '../../../qrcode-service/qrcode.service';
import { AuthModalSteps } from '../../auth-modal-steps.type';

@Component({
  selector: 'nostr-create-nsec-and-ncryptsec',
  templateUrl: './create-nsec-and-ncryptsec.component.html',
  styleUrl: './create-nsec-and-ncryptsec.component.scss'
})
export class CreateNsecAndNcryptsecComponent implements OnInit {

  @Output()
  changeStep = new EventEmitter<AuthModalSteps>();

  @Input()
  creatingAccount!: CreatingAccount;

  submitted = false;
  
  showNcryptsec = false;
  ncryptsecQRCode = '';

  generateNcryptsecForm!: FormGroup<{
    qrcodeTitle: FormControl<string | null | undefined>;
    nsec: FormControl<NSec | null>;
    npub: FormControl<NPub | null>;
    ncryptsec: FormControl<Ncryptsec | null>;
  }>;

  constructor(
    private fb: FormBuilder,
    private nsecCrypto: NSecCrypto,
    private nostrSigner: NostrSigner,
    private qrcodeService: QrcodeService,
    private nostrConverter: NostrConverter,
    private accountFactory: AccountFactory,
    private accountsLocalStorage: AccountsLocalStorage,
    private profileSessionStorage: ProfileSessionStorage,
    private relayLocalConfigService: RelayLocalConfigService,
    private fileManagerService: FileManagerService
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    const password = this.creatingAccount?.password || '';
    const nsec = this.nostrSigner.generateNsec();
    const { npub } = this.nostrConverter.convertNSecToPublicKeys(nsec);
    const ncryptsec = this.nsecCrypto.encryptNSec(nsec, password);

    this.generateNcryptsecForm = this.fb.group({
      qrcodeTitle: [this.creatingAccount.displayName],
      nsec: [nsec],
      npub: [npub],
      ncryptsec: [ncryptsec]
    });

    this.renderQrcode();
    this.login();
  }

  generateNsec(): void {
    const password = this.creatingAccount?.password || '';
    const nsec = this.nostrSigner.generateNsec();
    const { npub } = this.nostrConverter.convertNSecToPublicKeys(nsec);
    const ncryptsec = this.nsecCrypto.encryptNSec(nsec, password);

    this.generateNcryptsecForm.patchValue({ nsec, npub, ncryptsec });
    this.renderQrcode();
    this.login();
  }

  renderQrcode(): void {
    const { ncryptsec, qrcodeTitle } = this.generateNcryptsecForm.getRawValue();
    if (!ncryptsec) {
      return;
    }

    this.qrcodeService
      .qrcodefy(ncryptsec, qrcodeTitle)
      .then(qrcode => this.ncryptsecQRCode = qrcode);
  }

  copyNsec(): void {
    const raw = this.generateNcryptsecForm.getRawValue();
    const nsec = raw.nsec || '';
    //  FIXME: validar se não vou precisar de permissões especiais para fazer isso dentro de um app android
    navigator.clipboard.writeText(nsec);
  }

  copyNcryptsec(): void {
    const raw = this.generateNcryptsecForm.getRawValue();
    const ncryptsec = raw.ncryptsec || '';
    //  FIXME: validar se não vou precisar de permissões especiais para fazer isso dentro de um app android
    navigator.clipboard.writeText(ncryptsec);
  }

  downloadQrcode(): void {
    const qrcodeTitle = this.generateNcryptsecForm.get('qrcodeTitle')?.value;
    const filename = this.qrcodeService.generateFileName(`ncryptsec qrcode - ${qrcodeTitle}`);
    this.fileManagerService.save(this.ncryptsecQRCode, filename);
  }

  login(): void {
    const { nsec } = this.generateNcryptsecForm.getRawValue();
    if (this.generateNcryptsecForm.valid && nsec) {
      this.nostrSigner.login(nsec);
    }
  }

  cancel(): void {
    this.profileSessionStorage.clear();
    if (this.accountsLocalStorage.accounts()) {
      this.changeStep.next('selectAccount')
    } else {
      this.changeStep.next('login');
    }
  }

  async finalize(): Promise<void> {
    const { nsec, ncryptsec } = this.generateNcryptsecForm.getRawValue();
    if (this.generateNcryptsecForm.valid && nsec && ncryptsec) {
      const metadata: NostrMetadata = { display_name: this.creatingAccount.displayName || '' };
      const relays = await this.relayLocalConfigService.getCurrentUserRelays();
      const defaultRelays = this.relayLocalConfigService.getDefaultRelays();
      const account = this.accountFactory.createAccount(nsec, ncryptsec, metadata, relays || defaultRelays);
      
      this.accountsLocalStorage.addAccount(account);
      this.profileSessionStorage.patch({ account });
      this.changeStep.next('relayManager');
    }
  }
}
