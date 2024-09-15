import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { FileManagerService, NSec } from '@belomonte/nostr-ngx';
import { NostrSigner } from '../../../profile-service/nostr.signer';
import { QrcodeService } from '../../../qrcode-service/qrcode.service';
import { TAuthModalSteps } from '../../auth-modal-steps.type';

@Component({
  selector: 'nostr-create-nsec',
  templateUrl: './create-nsec.component.html',
  styleUrl: './create-nsec.component.scss'
})
export class CreateNsecComponent implements OnInit {

  submitted = false;

  nsecQRCode = '';

  generateNsecForm!: FormGroup<{
    qrcodeTitle: FormControl<string | null>;
    nsec: FormControl<NSec | null>;
  }>;

  @Output()
  changeStep = new EventEmitter<TAuthModalSteps>();

  constructor(
    private fb: FormBuilder,
    private nostrSigner: NostrSigner,
    private qrcodeService: QrcodeService,
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

    this.qrcodeService
      .qrcodefy(nsec, qrcodeTitle)
      .then(qrcode => this.nsecQRCode = qrcode);
  }

  copyNsec(): void {
    const raw = this.generateNsecForm.getRawValue();
    const nsec = raw.nsec || '';
    navigator.clipboard.writeText(nsec);
  }

  downloadQrcode(): void {
    const qrcodeTitle = this.generateNsecForm.get('qrcodeTitle')?.value;
    const filename = this.qrcodeService.generateFileName(`nsec qrcode - ${qrcodeTitle}`);
    this.fileManagerService.save(this.nsecQRCode, filename);
  }

  login(): void {
    const { nsec } = this.generateNsecForm.getRawValue();
    if (this.generateNsecForm.valid && nsec) {
      this.nostrSigner.login(nsec);
    }
  }
}
