import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AccountsLocalStorage, FileManagerService, NostrSigner, ProfileSessionStorage } from '@belomonte/nostr-ngx';
import { QrcodeService } from '../../../qrcode-service/qrcode.service';
import { AuthModalSteps } from '../../auth-modal-steps.type';
import { NSec } from 'nostr-tools/nip19';

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
  changeStep = new EventEmitter<AuthModalSteps>();

  constructor(
    private fb: FormBuilder,
    private nostrSigner: NostrSigner,
    private qrcodeService: QrcodeService,
    private profileSessionStorage: ProfileSessionStorage,
    private accountsLocalStorage: AccountsLocalStorage,
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

  cancel(): void {
    this.profileSessionStorage.clear();
    if (this.accountsLocalStorage.accounts()) {
      this.changeStep.next('selectAccount')
    } else {
      this.changeStep.next('login');
    }
  }

  login(): void {
    const { nsec } = this.generateNsecForm.getRawValue();
    if (this.generateNsecForm.valid && nsec) {
      this.nostrSigner.login(nsec);
    }
  }
}
