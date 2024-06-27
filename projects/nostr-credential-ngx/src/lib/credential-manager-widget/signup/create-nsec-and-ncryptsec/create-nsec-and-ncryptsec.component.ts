import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TNcryptsec, TNostrSecret } from '@belomonte/nostr-ngx';
import { ICreatingAccount } from '../../../domain/creating-account.interface';
import { FileManagerService } from '../../../file-manager/file-manager.service';
import { NostrSigner } from '../../../profile-service/nostr.signer';
import { QrcodeService } from '../../../qrcode-service/qrcode.service';
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

  showNsec = false;
  submitted = false;

  ncryptsecQRCode = '';

  generateNcryptsecForm!: FormGroup<{
    qrcodeTitle: FormControl<string | null | undefined>;
    nsec: FormControl<TNostrSecret | null>;
    ncryptsec: FormControl<TNcryptsec | null>;
  }>;

  constructor(
    private fb: FormBuilder,
    private qrcodeService: QrcodeService,
    private nostrSigner: NostrSigner,
    private fileManagerService: FileManagerService
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    const password = this.creatingAccount?.password || '';
    const nsec = this.nostrSigner.generateNsec();
    const ncryptsec = this.nostrSigner.encryptNsec(password, nsec);

    this.generateNcryptsecForm = this.fb.group({
      qrcodeTitle: [this.creatingAccount?.displayName],
      nsec: [nsec],
      ncryptsec: [ncryptsec]
    });

    this.renderQrcode();
    this.login();
  }

  generateNsec(): void {
    const password = this.creatingAccount?.password || '';
    const nsec = this.nostrSigner.generateNsec();
    const ncryptsec = this.nostrSigner.encryptNsec(password, nsec);

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
    navigator.clipboard.writeText(nsec);
  }

  copyNcryptsec(): void {
    const raw = this.generateNcryptsecForm.getRawValue();
    const ncryptsec = raw.ncryptsec || '';
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
}