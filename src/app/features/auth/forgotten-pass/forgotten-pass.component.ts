import { Component, OnInit } from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {AuthService} from "../../../shared/_services/auth.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ToastService} from "../../../shared/_services/toast.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-forgotten-pass',
  templateUrl: './forgotten-pass.component.html',
  styleUrls: ['./forgotten-pass.component.scss']
})
export class ForgottenPassComponent implements OnInit {

  formPass:FormGroup;
  emailSent=false;
  hide=true;

  constructor(
      public formbuilder: FormBuilder,
      public router: Router,
      public authService: AuthService,
      public http:HttpClient,
      private toastService: ToastService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.formInit();
  }


  // cancelAction(){
  //   console.log('cancel action');
  //   this.authService.triggerUserChanges(false);
  // }

  formInit(){
    this.formPass=this.formbuilder.group({
      userEmail: [null, Validators.compose([Validators.required, Validators.email])],
      userResetCode: [null, Validators.compose([Validators.required])],
      userPassword: [null, Validators.compose([Validators.required])]
    },
        {validator: this.checkPasswords})
  }

  onSendCodeClick(){
    console.log('TRIMIT MAIL');
  this.formPass.get('userEmail').markAsTouched();
    if(this.formPass.get('userEmail').valid){
      console.log('bene bos');
      this.authService.sendResetUserPassword(this.formPass.value.userEmail).subscribe((res: {reason: string, success: boolean})=>{
            console.log(res);
            if(res.success) {
              this.emailSent = true;
              this.toastService.showToast(this.translate.instant("TOAST.SUCCESS"),this.translate.instant("TOAST.FORGOTPASS-EMAIL.SUCCESS"),"success");
            } else{
              if(res.reason==="emailNotFound"){
                this.toastService.showToast(this.translate.instant("TOAST.ERROR"),this.translate.instant("TOAST.FORGOTPASS-EMAIL.EMAIL-NOT-FOUND"),"error");
              }else if(res.reason==="fail"){
                this.toastService.showToast(this.translate.instant("TOAST.ERROR"),this.translate.instant("TOAST.FORGOTPASS-EMAIL.FAIL"),"error");
              }else if(res.reason==="sendEmailFail"){
                this.toastService.showToast(this.translate.instant("TOAST.ERROR"),this.translate.instant("TOAST.FORGOTPASS-EMAIL.FAIL"),"error");
              }else if(res.reason==="accountNotActive"){
                this.toastService.showToast(this.translate.instant("TOAST.ERROR"),this.translate.instant("TOAST.FORGOTPASS-EMAIL.NOT-ACTIVE"),"error");
              }
            }
          },
          (error)=>{
            console.log(error.error.reason);
            if(error.error.reason==="emailNotFound"){
              this.toastService.showToast(this.translate.instant("TOAST.ERROR"),this.translate.instant("TOAST.FORGOTPASS-EMAIL.EMAIL-NOT-FOUND"),"error");
            }else if(error.error.reason==="fail"){
              this.toastService.showToast(this.translate.instant("TOAST.ERROR"),this.translate.instant("TOAST.FORGOTPASS-EMAIL.FAIL"),"error");
            }else if(error.error.reason==="sendEmailFail"){
              this.toastService.showToast(this.translate.instant("TOAST.ERROR"),this.translate.instant("TOAST.FORGOTPASS-EMAIL.FAIL"),"error");
            }else if(error.error.reason==="accountNotActive"){
              this.toastService.showToast(this.translate.instant("TOAST.ERROR"),this.translate.instant("TOAST.FORGOTPASS-EMAIL.NOT-ACTIVE"),"error");
            }
          })
    }else{
      console.log('sal bos')
    }
  }

  onResetPassword(){
    console.log('SCHIMB PAROLA');
    this.formPass.markAllAsTouched();
    if(this.formPass.valid){
      console.log('formular valid');

      // const passwordString = JSON.stringify(this.formPass.value.userPassword);
      // const encodedPassword = btoa(passwordString);
      const encodedPassword = encodeURI(this.formPass.value.userPassword);

      const password={
        userEmail:this.formPass.value.userEmail,
        userResetCode:this.formPass.value.userResetCode,
        userPassword:encodedPassword
      }
      console.log('vezi obiect trimis',password);
      this.authService.resetPassword(password).subscribe((reset: {reason: string, success: boolean})=>{
        console.log(reset);
        if(reset.success){
          this.toastService.showToast(this.translate.instant("TOAST.SUCCESS"),this.translate.instant("TOAST.RESET-PASS.SUCCESS"),"success");
        }else{
          if(reset.reason==="invalidEmail"){
            this.toastService.showToast(this.translate.instant("TOAST.ERROR"),this.translate.instant("TOAST.RESET-PASS.INVALID-EMAIL"),"error");
          }else if(reset.reason==="invalidCode"){
            this.toastService.showToast(this.translate.instant("TOAST.ERROR"),this.translate.instant("TOAST.RESET-PASS.USER-NOT-FOUND"),"error");
          }else if(reset.reason==="invalidPassword"){
            this.toastService.showToast(this.translate.instant("TOAST.ERROR"),this.translate.instant("TOAST.RESET-PASS.INVALID-PASS"),"error");
          }else if(reset.reason==="cannotUseAnOldPassword"){
            this.toastService.showToast(this.translate.instant("TOAST.ERROR"),"Nu poți folosi o parola veche!","error");
          }
          // else if(reset.reason==="accountNotActive"){
          //   this.toastService.showToast(this.translate.instant("TOAST.ERROR"),this.translate.instant("TOAST.RESET-PASS.NOT-ACTIVE"),"error");
          // }
        }
        this.authService.triggerUserChanges(true);
      }, error =>{
        console.log(error);
        if(error.error.reason==="invalidEmail"){
          this.toastService.showToast(this.translate.instant("TOAST.ERROR"),this.translate.instant("TOAST.RESET-PASS.INVALID-EMAIL"),"error");
        }else if(error.error.reason==="invalidCode"){
          this.toastService.showToast(this.translate.instant("TOAST.ERROR"),this.translate.instant("TOAST.RESET-PASS.USER-NOT-FOUND"),"error");
        }else if(error.error.reason==="invalidPassword"){
          this.toastService.showToast(this.translate.instant("TOAST.ERROR"),this.translate.instant("TOAST.RESET-PASS.INVALID-PASS"),"error");
        }else if(error.error.reason==="cannotUseAnOldPassword"){
          this.toastService.showToast(this.translate.instant("TOAST.ERROR"),"Nu poți folosi o parola veche!","error");
        }
      })
    }else{ console.log('formular invalid');}

  }


  checkPasswords(control: AbstractControl): ValidatorFn {
    const password = control.get('userPassword');
    const nameRegexp = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;
    const numbers = /[1234567890]/;
    const upper = /[A-Z]/;
    const lower = /[a-z]/;
    const whiteSpace = /[" "]/;



    //Password required
    if (password.value === null) {
      password.setErrors({requiredPass: true});
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
    // else {
    //     password.setErrors(null);
    //     confPassword.setErrors(null);
    // }
    return;
  }


}
