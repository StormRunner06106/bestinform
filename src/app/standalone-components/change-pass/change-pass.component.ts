import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, FormsModule, ValidatorFn, Validators} from "@angular/forms";
import {UserDataService} from "../../shared/_services/userData.service";
import {ToastService} from "../../shared/_services/toast.service";
import {TranslateService} from "@ngx-translate/core";
import {Router} from "@angular/router";
import {DashboardHeaderComponent} from "../dashboard-header/dashboard-header.component";
import {SharedModule} from "../../shared/shared.module";
import {response} from "express";

@Component({
    selector: 'app-change-pass',
    standalone: true,
    imports: [DashboardHeaderComponent, SharedModule, FormsModule],
    templateUrl: './change-pass.component.html',
    styleUrls: ['./change-pass.component.scss']
})
export class ChangePassComponent implements OnInit {

    changePassForm: FormGroup;
    hide = true;
    hideCurrent = true;
    hideOld = true;
    twoFA = false;
    currentSettings: any;

    constructor(public formBuilder: FormBuilder,
                public userData: UserDataService,
                private toastService: ToastService,
                private translate: TranslateService,
                private router: Router) {
    }

    ngOnInit(): void {
        this.formInit();
        this.getCurrentUserSettings();
    }

    getCurrentUserSettings() {
        this.userData.getCurrentSetting().subscribe({
            next: (userSettings: any) => {
                this.currentSettings = userSettings;
                this.twoFA = userSettings.twoFactorAuthentication;
                console.log(userSettings)
            }
        })
    }

    updateTwoFA() {
        console.log('2fa', this.twoFA);
        this.userData.updateCurrentSetting({...this.currentSettings, twoFactorAuthentication: this.twoFA})
            .subscribe({
                next: (resp: {success: boolean, reason: string}) => {
                    this.toastService.showToast('Success', this.twoFA ? 'Autentificarea in doi pasi a fost activata!' : 'Autentificarea in doi pasi a fost dezactivata!', 'success');
                }
            })
    }

    formInit() {
        this.changePassForm = this.formBuilder.group({
                oldPassword: [null, Validators.compose([Validators.required])],
                newPassword: [null, Validators.compose([Validators.required])],
                confPassword: [null, Validators.compose([Validators.required])]

            },
            {validator: this.checkPasswords}
        );


    }

    onSaveClick() {
        console.log('merge');
        const oldPass = this.changePassForm.value.oldPassword;
        const newPass = this.changePassForm.value.newPassword;
        console.log(oldPass, newPass);
        this.changePassForm.markAllAsTouched();
        if (this.changePassForm.valid) {
            this.userData.changePassword(oldPass, newPass).subscribe((res: { reason: string, success: boolean | string }) => {
                    console.log('PAROLA A FOST SCHIMBATA');
                    if (res.success === true) {
                        this.toastService.showToast(this.translate.instant("TOAST.SUCCESS"), this.translate.instant("TOAST.CHANGE-PASS.SUCCESS"), "success");
                        // this.router.navigate(['/private/staff/account']);

                        // section o sa fie client sau private, iar role o sa fie rolul userului dar doar pe sectiunea private
                        const [section, role] = this.router.url.split('/').slice(1, 3);

                        if (section === 'client') {
                            void this.router.navigate(['/client/dashboard']);
                        } else if (section === 'private' && role) {
                            void this.router.navigate(['private', role, 'dashboard']);
                        }
                    }
                },
                error => {
                    console.log('PAROLA NUUU A FOST SCHIMBATA');
                    if (error.error.reason === "invalidOldPassword") {
                        console.log('1');
                        this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("TOAST.CHANGE-PASS.INVALID-OLD-PASS"), "error");
                    } else if (error.error.reason === "notLoggedIn") {
                        console.log('2');
                        this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("TOAST.CHANGE-PASS.NOT-LOGGEDIN"), "error");
                    } else if (error.error.reason === "invalidPassword") {
                        console.log('3');
                        this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("TOAST.CHANGE-PASS.INVALID-PASS"), "error");
                    } else if (error.error.reason === "cannotUseAnOldPassword") {
                        console.log('4');
                        this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("TOAST.CHANGE-PASS.PASSWORD-USED"), "error");
                    } else if (error.error.reason === "sendResetUserPassword") {
                        console.log('4');
                        this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("TOAST.CHANGE-PASS.PASSWORD-USED"), "error");
                    } else if (error.error.reason === "accountNotActive") {
                        console.log('4');
                        this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("TOAST.CHANGE-PASS.NOT-ACTIVE"), "error");
                    }
                })
        }
    }

    checkPasswords(control: AbstractControl): ValidatorFn {
        const password = control.get('newPassword');
        const oldPassword = control.get('oldPassword');
        const confPassword = control.get('confPassword');
        const nameRegexp = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;
        const numbers = /[1234567890]/;
        const upper = /[A-Z]/;
        const lower = /[a-z]/;
        const whiteSpace = /[" "]/;


        //Confirmation ok
        if (password.value?.length > 0 && confPassword.value?.length > 0 && password.value !== confPassword.value) {
            confPassword.setErrors({passInvalid: true});
            //Password empty, confirmation filled
        } else if (password.value?.length > 0 && confPassword.value?.length === 0) {
            confPassword.setErrors({emptySecond: true});
            //Password filled, confirmation empty
        } else if (password.value?.length === 0 && confPassword.value?.length > 0) {
            password.setErrors({emptyFirst: true});
        }

        if (oldPassword.value === password.value) {
            password.setErrors({samePass: true});
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
        if (password.value?.length < 8) {
            password.setErrors({passMin: true});
        }

        //Max length password
        if (password.value?.length > 16) {
            password.setErrors({passMax: true});
        }

        //At least a special character
        if (password.value && !nameRegexp.test(password.value)) {
            password.setErrors({specialCharacter: true})
        }

        //At least a digit
        if (password.value && !numbers.test(password.value)) {
            password.setErrors({number: true})
        }

        //At least an upper case
        if (password.value && !upper.test(password.value)) {
            password.setErrors({upper: true})
        }

        //At least a lower case
        if (password.value && !lower.test(password.value)) {
            password.setErrors({lower: true})
        }

        //No whitespaces
        if (password.value && whiteSpace.test(password.value)) {
            password.setErrors({whiteSpace: true})
        }
        return;
    }

    // checkPasswords(control: AbstractControl): ValidatorFn {
    //   const password = control.get('newPassword');
    //   const nameRegexp: RegExp = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    //   const numbers: RegExp = /[1234567890]/;
    //   const upper: RegExp = /[A-Z]/;
    //   const lower: RegExp = /[a-z]/;
    //   const whiteSpace: RegExp= /[" "]/;
    //
    //   let errorsObject = {};
    //
    //
    //   //Password required
    //   /*if (password.value === null) {
    //       password.setErrors({requiredPass: true});
    //   }*/
    //
    //   //Min length password
    //   if (password.value?.length < 8 ) {
    //     // password.setErrors({passMin: true});
    //     errorsObject = {...errorsObject, passMin: true};
    //   }
    //
    //   //Max length password
    //   if (password.value?.length > 16 ) {
    //     // password.setErrors({passMax: true});
    //     errorsObject = {...errorsObject, passMax: true};
    //   }
    //
    //   //At least a special character
    //   if (password.value && !nameRegexp.test(password.value)){
    //     // password.setErrors({specialCharacter: true})
    //     errorsObject = {...errorsObject, specialCharacter: true};
    //   }
    //
    //   //At least a digit
    //   if (password.value && !numbers.test(password.value)){
    //     // password.setErrors({number: true})
    //     errorsObject = {...errorsObject, number: true};
    //   }
    //
    //   //At least an upper case
    //   if (password.value && !upper.test(password.value)){
    //     // password.setErrors({upper: true})
    //     errorsObject = {...errorsObject, upper: true};
    //   }
    //
    //   //At least a lower case
    //   if (password.value && !lower.test(password.value)){
    //     // password.setErrors({lower: true})
    //     errorsObject = {...errorsObject, lower: true};
    //   }
    //
    //   //No whitespaces
    //   if (password.value && whiteSpace.test(password.value)){
    //     // password.setErrors({whiteSpace: true})
    //     errorsObject = {...errorsObject, whiteSpace: true};
    //   }
    //
    //   console.log(errorsObject);
    //
    //   if (Object.keys(errorsObject).length === 0) {
    //     password.setErrors(null);
    //   } else {
    //     password.setErrors(errorsObject);
    //   }
    //   return;
    // }


}
