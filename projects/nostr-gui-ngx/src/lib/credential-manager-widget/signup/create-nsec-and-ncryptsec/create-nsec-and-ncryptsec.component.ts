import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AccountsLocalStorage, FileManagerService, Ncryptsec, NostrSigner, NSec, NSecCrypto, ProfileSessionStorage } from '@belomonte/nostr-ngx';
import { CreatingAccount } from '../../../domain/creating-account.interface';
import { QrcodeService } from '../../../qrcode-service/qrcode.service';
import { AuthModalSteps } from '../../auth-modal-steps.type';
import { NostrMetadata } from '@nostrify/nostrify';

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
    ncryptsec: FormControl<Ncryptsec | null>;
  }>;

  constructor(
    private fb: FormBuilder,
    private qrcodeService: QrcodeService,
    private nostrSigner: NostrSigner,
    private nsecCrypto: NSecCrypto,
    private profileSessionStorage: ProfileSessionStorage,
    private accountsLocalStorage: AccountsLocalStorage,
    private fileManagerService: FileManagerService
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    const password = this.creatingAccount?.password || '';
    const nsec = this.nostrSigner.generateNsec();
    const ncryptsec = this.nsecCrypto.encryptNSec(nsec, password);

    this.generateNcryptsecForm = this.fb.group({
      qrcodeTitle: [this.creatingAccount.displayName],
      nsec: [nsec],
      ncryptsec: [ncryptsec]
    });

    this.renderQrcode();
    this.login();
  }

  generateNsec(): void {
    const password = this.creatingAccount?.password || '';
    const nsec = this.nostrSigner.generateNsec();
    const ncryptsec = this.nsecCrypto.encryptNSec(nsec, password);

    this.generateNcryptsecForm.patchValue({ nsec, ncryptsec });
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

  finalize(): void {
    const { nsec, ncryptsec } = this.generateNcryptsecForm.getRawValue();
    if (this.generateNcryptsecForm.valid && nsec && ncryptsec) {
      const metadata: NostrMetadata = { display_name: this.creatingAccount.displayName || '' };
      const account = this.accountsLocalStorage.addNewAccount(nsec, ncryptsec, {}, metadata);

      this.profileSessionStorage.patch({ account });
      this.changeStep.next('relayManager');
    }
  }
}
