import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function ncryptsecValidatorFactory(): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const saveNcryptsecLocalStorage = formGroup.get('saveNcryptsecLocalStorage');
    const password = formGroup.get('password');

    if (saveNcryptsecLocalStorage?.getRawValue() && !password?.getRawValue().length) {
      return {
        passwordIsMandatory: true
      }
    }

    return null;
  };
}