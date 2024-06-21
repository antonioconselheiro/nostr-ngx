import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TNcryptsec, TNostrSecret } from '@belomonte/nostr-ngx';
import { generateSecretKey, nip19 } from 'nostr-tools';
import { ICreatingAccount } from '../../../domain/creating-account.interface';
import { FileManagerService } from '../../../file-manager/file-manager.service';
import { NostrSigner } from '../../../profile-service/nostr.signer';
import { QrcodeCredentialService } from '../../../qrcode-credential/qrcode-credential.service';
import { AuthModalSteps } from '../../auth-modal-steps.type';

@Component({
  selector: 'nostr-create-nsec-and-ncryptsec',
  templateUrl: './create-nsec-and-ncryptsec.component.html',
  styleUrl: './create-nsec-and-ncryptsec.component.scss'
})
export class CreateNsecAndNcryptsecComponent {

  @Output()
  changeStep = new EventEmitter<AuthModalSteps>();

  @Input()
  creatingAccount: ICreatingAccount | null = null;

  showNsec = true;
  submitted = false;

  nsecQRCode = '';

  generateNcryptsecForm!: FormGroup<{
    qrcodeTitle: FormControl<string | null | undefined>;
    nsec: FormControl<TNostrSecret | null>;
    ncryptsec: FormControl<TNcryptsec | null>;
  }>;

  constructor(
    private fb: FormBuilder,
    private mostrSigner: NostrSigner,
    private qrcodeCredentialService: QrcodeCredentialService,
    private nostrSigner: NostrSigner,
    private fileManagerService: FileManagerService
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    const password = this.creatingAccount?.password || '';
    const nsec = this.mostrSigner.generateNsec();
    const ncryptsec = this.nostrSigner.encryptNsec(password, nsec);

    this.generateNcryptsecForm = this.fb.group({
      qrcodeTitle: [this.creatingAccount?.displayName],
      nsec: [nsec],
      ncryptsec: [ncryptsec],
    });

    this.renderQrcode();
    this.login();
  }

  generateNsec(): void {
    const password = this.creatingAccount?.password || '';
    const nsec = nip19.nsecEncode(generateSecretKey());
    const ncryptsec = this.nostrSigner.encryptNsec(password, nsec);

    this.generateNcryptsecForm.patchValue({ nsec, ncryptsec });
    this.renderQrcode();
    this.login();
  }

  renderQrcode(): void {
    const { nsec, qrcodeTitle } = this.generateNcryptsecForm.getRawValue();
    if (!nsec) {
      return;
    }

    this.qrcodeCredentialService
      .nsecQRCode(nsec, qrcodeTitle)
      .then(qrcode => this.nsecQRCode = qrcode);
  }

  copyNsec(): void {
    const raw = this.generateNcryptsecForm.getRawValue();
    const nsec = raw.nsec || '';
    navigator.clipboard.writeText(nsec);
  }

  downloadQrcode(): void {
    const qrcodeTitle = this.generateNcryptsecForm.get('qrcodeTitle')?.value;
    this.fileManagerService.save(this.nsecQRCode, this.qrcodeCredentialService.generateFileName(qrcodeTitle));
  }

  login(): void {
    const { nsec } = this.generateNcryptsecForm.getRawValue();
    if (this.generateNcryptsecForm.valid && nsec) {
      this.mostrSigner.login(nsec);
    }
  }
}
