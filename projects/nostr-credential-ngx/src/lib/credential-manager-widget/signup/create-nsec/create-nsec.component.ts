import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { generateSecretKey, nip19 } from 'nostr-tools';
import { FileManagerService } from '../../../file-manager/file-manager.service';
import { NostrSigner } from '../../../profile-service/nostr.signer';
import { QrcodeCredentialService } from '../../../qrcode-credential/qrcode-credential.service';
import { AuthModalSteps } from '../../auth-modal-steps.type';
import { TNostrSecret } from '@belomonte/nostr-ngx';

@Component({
  selector: 'nostr-create-nsec',
  templateUrl: './create-nsec.component.html',
  styleUrl: './create-nsec.component.scss'
})
export class CreateNsecComponent implements OnInit {

  showNsec = true;
  submitted = false;

  nsecQRCode = '';

  generateNsecForm!: FormGroup<{
    qrcodeTitle: FormControl<string | null>;
    nsec: FormControl<TNostrSecret | null>;
  }>;

  @Output()
  changeStep = new EventEmitter<AuthModalSteps>();

  constructor(
    private fb: FormBuilder,
    private nostrSigner: NostrSigner,
    private qrcodeCredentialService: QrcodeCredentialService,
    private fileManagerService: FileManagerService
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.generateNsecForm = this.fb.group({
      qrcodeTitle: ['my nostr account'],
      nsec: [this.nostrSigner.generateNsec()]
    });

    this.renderQrcode();
    this.login();
  }

  generateNsec(): void {
    const nsec = this.nostrSigner.generateNsec();
    this.generateNsecForm.patchValue({ nsec });
    this.renderQrcode();
    this.login();
  }

  renderQrcode(): void {
    const { nsec, qrcodeTitle } = this.generateNsecForm.getRawValue();
    if (!nsec) {
      return;
    }

    this.qrcodeCredentialService
      .nsecQRCode(nsec, qrcodeTitle)
      .then(qrcode => this.nsecQRCode = qrcode);
  }

  copyNsec(): void {
    const raw = this.generateNsecForm.getRawValue();
    const nsec = raw.nsec || '';
    navigator.clipboard.writeText(nsec);
  }

  downloadQrcode(): void {
    const qrcodeTitle = this.generateNsecForm.get('qrcodeTitle')?.value;
    this.fileManagerService.save(this.nsecQRCode, this.qrcodeCredentialService.generateFileName(qrcodeTitle));
  }

  login(): void {
    const { nsec } = this.generateNsecForm.getRawValue();
    if (this.generateNsecForm.valid && nsec) {
      this.nostrSigner.login(nsec);
    }
  }
}
