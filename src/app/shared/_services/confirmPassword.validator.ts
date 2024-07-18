import {
  FormGroup
} from '@angular/forms';

export class ConfirmPasswordValidator {
  //reciveves the password and the confirmation value as parameters
  static mustMatch(controlName: string, matchingControlName: string) {
    //receives as parameter the form that will be validated and then it takes the values we need and puts them in the two variables
    return (formGroup: FormGroup) => {

      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (control && matchingControl) {

        if (matchingControl?.errors && !matchingControl?.errors.mustMatch) {
          return;
        }

        // set error on matchingControl if validation fails
        if (control?.value !== matchingControl?.value) {
          matchingControl.setErrors({mustMatch: true});
        } else {
          matchingControl?.setErrors(null);
        }
        return null;
      }
    };
  }
}
