import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { nip19 } from 'nostr-tools';

export function nsecValidatorFactory(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {

    //  I'm not the 'required' validator
    if (!control.value) {
      return null;
    }

    try {
      const { type } = nip19.decode(control.value);

      if (type === 'npub') {
        return {
          invalidNpubGivenInstead: true
        }
      } else if (type === 'nsec') {
        return null;
      }

      return {
        invalidNSec: true
      };
    } catch {
      return {
        invalidNSec: true
      };
    }

  };
}