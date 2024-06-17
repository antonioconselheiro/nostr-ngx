import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { generateSecretKey, nip19 } from 'nostr-tools';
import { FileManagerService } from '../../file-manager/file-manager.service';
import { AuthModalSteps } from '../auth-modal-steps.type';

@Component({
  selector: 'nostr-create-nostr-secret',
  templateUrl: './create-nostr-secret.component.html',
  styleUrl: './create-nostr-secret.component.scss'
})
export class CreateNostrSecretComponent implements OnInit {

  showNostrSecret = true;
  submitted = false;

  generateNostrSecretForm = this.fb.group({
    nostrSecret: [ nip19.nsecEncode(generateSecretKey())],

    qrcodeName: ['']
  });

  @Output()
  changeStep = new EventEmitter<AuthModalSteps>();

  constructor(
    private fb: FormBuilder,
    private fileManagerService: FileManagerService
  ) { }

  ngOnInit(): void {

  }

  generateNostrSecret(): void {
    const nostrSecret = nip19.nsecEncode(generateSecretKey());
    this.generateNostrSecretForm.patchValue({ nostrSecret });
  }

  onSubmit(): void {

  }

  downloadQrcode(): void {
    this.generateNostrSecretForm.getRawValue();
    //this.fileManagerService.save();
  }
}
