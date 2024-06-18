import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function confirmPasswordValidatorFactory(
  passwordFieldName = 'password',
  confirmPasswordFieldName = 'confirmPassword'
): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const password = formGroup.get(passwordFieldName)?.getRawValue();
    const confirmPassword = formGroup.get(confirmPasswordFieldName)?.getRawValue();

    if (!confirmPassword) {
      return {
        confirmPasswordRequired: true
      };
    }

    if (password !== confirmPassword) {
      return {
        confirmPasswordInvalid: true
      };
    }
    
    return null;
  };
}