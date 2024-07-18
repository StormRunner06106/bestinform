import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {AuthService} from "../../../shared/_services/auth.service";
import {ToastService} from "../../../shared/_services/toast.service";
import {TranslateService} from "@ngx-translate/core";
import { Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LocationService} from "../../../shared/_services/location.service";

@Component({
  selector: 'app-provider-register',
  templateUrl: './provider-register.component.html',
  styleUrls: ['./provider-register.component.scss']
})
export class ProviderRegisterComponent {

  registerForm: FormGroup;
  hide = true;
  hideCurrent = true;
  isClient = true;

    countries = [];
    cities = [];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService,
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ProviderRegisterComponent>,
    private locationService: LocationService
) {
}

    ngOnInit(): void {
        this.getCountries();

        this.formInit();
      // console.log('rolul trimis din modal; ar trebui sa fie provider', this.data.role);
    }

    //no white space validator
    noWhitespaceValidator(control) {
        const isWhitespace = (control && control.value && control.value.toString() || '').trim().length === 0;
        const isValid = !isWhitespace;
        return isValid ? null : { 'whitespace': true };
        }

    getCountries() {

        this.locationService.getAllCountries().subscribe({
            next: (countries: []) => {
                this.countries = countries;
                console.log('tari', countries)
            }
        })
    }


    getCities(event) {

        const country = {
            country: event.value ? event.value : event
        }
        this.locationService.getCityFilter(0, -1, null, null, country).subscribe({
            next: (cities: any) => {
                console.log(cities);
                this.cities = cities.content;
            }
        })
    }

    formInit() {
      this.registerForm = this.formBuilder.group({
          lastName: [null,  Validators.compose([Validators.required, this.noWhitespaceValidator])],
          firstName: [null,  Validators.compose([Validators.required, this.noWhitespaceValidator])],
          email: [null, Validators.compose([Validators.required, Validators.email])],
          password: [null, Validators.compose([Validators.required])],
          confPassword: [null, Validators.compose([Validators.required])],
          roles:[['ROLE_PROVIDER']],
          companyName: [null, Validators.required],
          telephone: [null, [Validators.required, this.validateTelephoneFormat]],
          fax:[null],
          cui:  [null, Validators.required],
          j: [null, Validators.required],
          billingAddress: this.formBuilder.group({
            city: ['', Validators.required],
            address: ['',Validators.required],
            country:['',Validators.required],
          }),
          termsAndCond: []
      },
          {validator: this.checkPasswords}
      );


    }

    validateTelephoneFormat(control) {
        const isValid = /^\d{10}$/.test(control.value); // Adjust the regex according to your telephone number format
        if (!isValid) {
          return { telephoneFormat: true };
        }
        return null;
      }

    onSendClick(){
      this.registerForm.markAllAsTouched();

      // const user={
      //     firstName:this.registerForm.value.firstName,
      //     lastName:this.registerForm.value.lastName,
      //     email:this.registerForm.value.email,
      //     password:this.registerForm.value.password,
      //     roles:['ROLE_PROVIDER'],

      //     companyName: this.registerForm.value.companyName,
      //     telephone: this.registerForm.value.telephone,
      //     fax: this.registerForm.value.fax,
      //     cui: this.registerForm.value.cui,
      //     j: this.registerForm.value.j,

      // }
      const user={...this.registerForm.value, roles: ['ROLE_PROVIDER'], providerStatus: 'new',
          password: encodeURI(this.registerForm.value.password)}

      console.log('datele din formular provider:',user);


      if(this.registerForm.valid===true){
          this.authService.register(user).subscribe((res: { reason: string, success: boolean | string })=>{
              // console.log('register',res);
              const id=res.reason;
              if(res.success) {
                  this.toastService.showToast(this.translate.instant("TOAST.SUCCESS"),this.translate.instant("TOAST.REGISTER.SUCCESS"),"success");
                  this.authService.sendRegistrationEmail(id).subscribe((mail: { reason: string, success: string | boolean }) => {
                      console.log('mail', mail);
                      this.dialogRef.close();
                      if(mail.success==="false"){
                          if(mail.reason==="alreadyActive"){
                              this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("TOAST.REGISTRATION-EMAIL.ALREADY-ACTIVE"),"error");
                          }else if(mail.reason==="invalidId"){
                              this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("TOAST.REGISTRATION-EMAIL.INVALID-ID"),"error");
                          }else if(mail.reason==="fail"){
                              this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("TOAST.REGISTRATION-EMAIL.FAIL"),"error");
                          }
                      }
                  })
              }else{
                  if(res.success===false){
                      if(res.reason==="emailNotValid"){
                          this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("TOAST.REGISTER.EMAIL-INVALID"),"error");
                      }else if(res.reason==="invalidPassword"){
                          this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("TOAST.REGISTER.PASSWORD-INVALID"),"error");
                      }else if(res.reason==="emailExists"){
                          this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("TOAST.REGISTER.EMAIL-EXISTS"),"error");
                      }else if(res.reason==="invalidRole"){
                          this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("TOAST.REGISTER.INVALID-ROLE"),"error");
                      }
                  }
              }

          },(error)=>{
              console.log(error);
              if(error.error.reason==="emailNotValid"){
                  this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("TOAST.REGISTER.EMAIL-INVALID"),"error");
              }else if(error.error.reason==="invalidPassword"){
                  this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("TOAST.REGISTER.PASSWORD-INVALID"),"error");
              }else if(error.error.reason==="emailExists"){
                  this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("TOAST.REGISTER.EMAIL-EXISTS"),"error");
              }else if(error.error.reason==="invalidRole"){
                  this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("TOAST.REGISTER.INVALID-ROLE"),"error");
              }
          })
      } else {
          this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("ERROR.REQUIRED-ALL"),"error");
      }
  }

    checkPasswords(control: AbstractControl): ValidatorFn {
      const password = control.get('password');
      const confPassword = control.get('confPassword');
      const nameRegexp = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;
      const numbers = /[1234567890]/;
      const upper = /[A-Z]/;
      const lower = /[a-z]/;
      const whiteSpace = /[" "]/;


      //Confirmation ok
      if (password.value?.length > 0 && confPassword.value?.length > 0 && password.value !== confPassword.value) {
          confPassword.setErrors({ passInvalid: true });
          //Password empty, confirmation filled
      } else if (password.value?.length > 0 && confPassword.value?.length === 0) {
          confPassword.setErrors({emptySecond: true});
          //Password filled, confirmation empty
      } else if (password.value?.length === 0 && confPassword.value?.length > 0) {
          password.setErrors({emptyFirst: true});
      }

      //Password required
      if (password.value === null) {
              password.setErrors({requiredPass: true});
      }

      //Confirmation required
      if (confPassword.value === null) {
              confPassword.setErrors({requiredConf: true});
      }

      //Min length password
      if (password.value?.length < 8 ) {
          password.setErrors({passMin: true});
      }

      //Max length password
      if (password.value?.length > 16 ) {
          password.setErrors({passMax: true});
      }

      //At least a special character
      if (password.value && !nameRegexp.test(password.value)){
          password.setErrors({specialCharacter: true})
      }

      //At least a digit
      if (password.value && !numbers.test(password.value)){
          password.setErrors({number: true})
      }

      //At least an upper case
      if (password.value && !upper.test(password.value)){
          password.setErrors({upper: true})
      }

      //At least a lower case
      if (password.value && !lower.test(password.value)){
          password.setErrors({lower: true})
      }

      //No whitespaces
      if (password.value && whiteSpace.test(password.value)){
          password.setErrors({whiteSpace: true})
      }
      return;
  }

}
