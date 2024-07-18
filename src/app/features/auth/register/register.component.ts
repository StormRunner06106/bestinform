import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {AuthService} from "../../../shared/_services/auth.service";
import {ToastService} from "../../../shared/_services/toast.service";
import {TranslateService} from "@ngx-translate/core";
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {


    registerForm: FormGroup;
    hide = true;
    hideCurrent = true;
    isClient = true;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private authService: AuthService,
        private toastService: ToastService,
        private translate: TranslateService,
        @Inject(MAT_DIALOG_DATA) public data: any,
        // public dialogRef: MatDialogRef<AddEditRoomModalComponent>


    ) {
    }

    ngOnInit(): void {
        this.formInit();
        // console.log('rolul trimis din modal; ar trebui sa fie provider', this.data.role);
    }

    formInit() {
        this.registerForm = this.formBuilder.group({
            lastName: [null, Validators.compose([Validators.required, this.noWhitespaceValidator])],
            firstName: [null, Validators.compose([Validators.required, this.noWhitespaceValidator])],
            email: [null, Validators.compose([Validators.required, Validators.email])],
            password: [null, Validators.compose([Validators.required])],
            confPassword: [null, Validators.compose([Validators.required])],
            roles:[this.data.role],
            termsAndCond: [false, Validators.requiredTrue]

        },
            {validator: this.checkPasswords}
        );


    }
    //no white space validator
    noWhitespaceValidator(control) {
    const isWhitespace = (control && control.value && control.value.toString() || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }


    onSendClick(){
        this.registerForm.markAllAsTouched();
        const user={
            firstName:this.registerForm.value.firstName,
            lastName:this.registerForm.value.lastName,
            email:this.registerForm.value.email,
            password: encodeURI(this.registerForm.value.password),
            roles:[this.registerForm.value.roles]

        }
        // console.log('roles',this.registerForm.value.roles);
        // console.log(user);
        if(this.registerForm.valid===true){
            this.authService.register(user).subscribe((res: { reason: string, success: boolean | string })=>{
                console.log('register',res);
                const id=res.reason;
                if(res.success) {
                    this.toastService.showToast(this.translate.instant("TOAST.SUCCESS"),this.translate.instant("TOAST.REGISTER.SUCCESS"),"success");
                    this.authService.sendRegistrationEmail(id)
                    .subscribe((mail: { reason: string, success: string | boolean }) => {
                        this.toastService.showToast('Info','Un mail de verificare a fost trimis pe adresa dumneavoastră!',"info");
                        
                        // console.log('mail', mail);
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
