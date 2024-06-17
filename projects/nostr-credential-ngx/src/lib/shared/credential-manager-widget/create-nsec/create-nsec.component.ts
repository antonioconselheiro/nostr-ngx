import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { generateSecretKey, nip19 } from 'nostr-tools';
import { toCanvas } from 'qrcode';
import { FileManagerService } from '../../file-manager/file-manager.service';
import { NostrSigner } from '../../profile-service/nostr.signer';
import { AuthModalSteps } from '../auth-modal-steps.type';

@Component({
  selector: 'nostr-create-nsec',
  templateUrl: './create-nsec.component.html',
  styleUrl: './create-nsec.component.scss'
})
export class CreateNsecComponent implements OnInit {

  showNsec = true;
  submitted = false;

  nsecQRCode = '';

  generateNsecForm = this.fb.group({
    nsec: [nip19.nsecEncode(generateSecretKey())],

    qrcodeTitle: ['my nsec']
  });

  @Output()
  changeStep = new EventEmitter<AuthModalSteps>();

  constructor(
    private fb: FormBuilder,
    private mostrSigner: NostrSigner,
    private fileManagerService: FileManagerService
  ) { }

  ngOnInit(): void {
    this.renderQrcode();
  }

  generateNsec(): void {
    const nsec = nip19.nsecEncode(generateSecretKey());
    this.generateNsecForm.patchValue({ nsec });
    this.renderQrcode();
  }

  renderQrcode(): void {
    const raw = this.generateNsecForm.getRawValue();
    const canvas = document.createElement('canvas');
    const nsec = raw.nsec || '';

    canvas.setAttribute('height', '300px');
    canvas.setAttribute('width', '300px');

    toCanvas(canvas, nsec, { margin: 2 }, error => {
      if (error) {
        console.error(error);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (ctx && raw.qrcodeTitle) {
        ctx.fillStyle = '#000';
        ctx.font = '15px "Segoe UI", Roboto, "Noto Sans", Helvetica, Arial, sans-serif';
        ctx.fillText(raw.qrcodeTitle, 17, 15); 
      }

      setTimeout(() => this.nsecQRCode = canvas.toDataURL("image/png"));
    });
  }

  copyNsec(): void {
    const raw = this.generateNsecForm.getRawValue();
    const nsec = raw.nsec || '';
    navigator.clipboard.writeText(nsec);
  }

  downloadQrcode(): void {
    const qrcodeTitle = this.generateNsecForm.get('qrcodeTitle')?.value;
    this.fileManagerService.save(this.nsecQRCode, this.generateFileName(qrcodeTitle));
  }

  private generateFileName(title?: string | null): string {
    let fileName = `nsec qrcode.png`;
    if (title) {
      fileName = `nsec qrcode - ${title.replace(/[,<>:"/\\|?*]/g, '')} - ${new Date().getTime()}.png`;
    }

    return fileName;
  }

  onSubmit(): void {
    const { nsec } = this.generateNsecForm.getRawValue();
    if (this.generateNsecForm.valid && nsec) {
      this.mostrSigner.login(nsec);
    }
  }
}
