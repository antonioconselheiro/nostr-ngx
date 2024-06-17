import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, ValidationErrors } from '@angular/forms';
import { generateSecretKey, nip19 } from 'nostr-tools';
import { FileManagerService } from '../../file-manager/file-manager.service';
import { AuthModalSteps } from '../auth-modal-steps.type';
import { TCreateNsecFields } from './create-nsec-fields.type';
import { NostrSigner } from '../../profile-service/nostr.signer';

@Component({
  selector: 'nostr-create-nsec',
  templateUrl: './create-nsec.component.html',
  styleUrl: './create-nsec.component.scss'
})
export class CreateNsecComponent {

  showNsec = true;
  submitted = false;

  generateNsecForm = this.fb.group({
    nsec: [nip19.nsecEncode(generateSecretKey())],

    qrcodeName: ['']
  });

  @Output()
  changeStep = new EventEmitter<AuthModalSteps>();

  constructor(
    private fb: FormBuilder,
    private mostrSigner: NostrSigner,
    private fileManagerService: FileManagerService
  ) { }

  generateNsec(): void {
    const nsec = nip19.nsecEncode(generateSecretKey());
    this.generateNsecForm.patchValue({ nsec });
  }

  getFormControlErrors(fieldName: TCreateNsecFields): ValidationErrors | null {
    return this.generateNsecForm.controls[fieldName].errors;
  }

  downloadQrcode(): void {
    this.generateNsecForm.getRawValue();
    //this.fileManagerService.save();
  }

  onSubmit(): void {
    const { nsec } = this.generateNsecForm.getRawValue();
    if (this.generateNsecForm.valid && nsec) {
      this.mostrSigner.login(nsec);
    }
  }
}
