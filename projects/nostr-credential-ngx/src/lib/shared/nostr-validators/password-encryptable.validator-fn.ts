import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { generateSecretKey, nip19 } from 'nostr-tools';
import * as nip49 from 'nostr-tools/nip49';

export function passwordEncrytableValidatorFactory(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    try {
      //  encrypt a random nsec with this password to check it
      const nsecBytes = generateSecretKey(); 
      const ncryptsec = nip49.encrypt(nsecBytes, control.value);
      const decryptedNsec = nip19.nsecEncode(nip49.decrypt(ncryptsec, control.value));
      const originalNsec = nip19.nsecEncode(nsecBytes);
  
      if (decryptedNsec !== originalNsec) {
        return {
          invalidPassword: true
        };
      }
    } catch {
      return {
        invalidPassword: true
      }
    }

    return null;
  };
}
