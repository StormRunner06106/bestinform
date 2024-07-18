import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {of, switchMap} from "rxjs";
import {
    AbstractControl,
    AbstractControlOptions,
    FormArray,
    FormBuilder,
    FormGroup,
    ValidationErrors,
    ValidatorFn,
    Validators
} from "@angular/forms";
import * as RandExp from "randexp";
import {DatePipe} from "@angular/common";
import {User} from "../../../shared/_models/user.model";
import {StaffService} from "../../../shared/_services/staff.service";
import {ToastService} from "../../../shared/_services/toast.service";

@Component({
    selector: 'app-add-edit-staff-dashboard',
    templateUrl: './add-edit-staff.component.html',
    styleUrls: ['./add-edit-staff.component.scss'],
    providers: [DatePipe]

})
export class AddEditStaffComponent implements OnInit {

    isEditMode: boolean;
    showPassword = false;
    telephoneValidator = /[1234567890]/;
    today:Date;

    //invalid fields
    invalidFields:Array<any>=[];

    staffData: User;
    staffForm: FormGroup;
    emptyStaffData: User = {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        telephone: '',
        birthdate: '',
        gender: 'male',
        nickname: 'string',
        roles: ['ROLE_STAFF'],
        city: 'Galati'
    };

    declaredGenders = ['male', 'female', 'other'];

    viewEvents: true;
    editEvents: true;

    constructor(private route: ActivatedRoute,
                private router: Router,
                private staffService: StaffService,
                private fb: FormBuilder,
                private toastService: ToastService,
                public datepipe: DatePipe) { }

    ngOnInit(): void {
        this.today=new Date();
        this.initFormGroup();
        this.getUserData();
    }

    initFormGroup() {
        const specialCharacter = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;
        const numbers = /[1234567890]/;
        const upper = /[A-Z]/;
        const lower = /[a-z]/;
        const whiteSpace = /^(?!\s*$).+/;

        this.staffForm = this.fb.group({
                id: [null],
                lastName: [null, Validators.required],
                firstName: [null, Validators.required],
                email: [null, [Validators.required, Validators.email]],
                password: [null, Validators.compose([ Validators.required,
                    Validators.minLength(8),
                    Validators.maxLength(16),
                    this.regexValidator(new RegExp(lower), {lower}),
                    this.regexValidator(new RegExp(numbers), {numbers}),
                    this.regexValidator(new RegExp(upper), {upper}),
                    this.regexValidator(new RegExp(specialCharacter), {specialCharacter}),
                    this.regexValidator(new RegExp(whiteSpace), {whiteSpace})

                ])],
                // telephone: [null,[ Validators.pattern('[- +()0-9]{10,}')]],
                telephone: [null,Validators.compose([ Validators.pattern('^[0-9]*$'), Validators.minLength(10), Validators.maxLength(10)])],
                birthdate: [null,[Validators.max]],
                gender: [null],
                // viewEvents: [false],
                editEvents: [false],
                // viewEditorials: [false],
                editEditorials: [false],
                // viewProviders: [false],
                editProviders: [false],
                roles: [[]]
            }
            // {
            //     validator: this.checkPassword
            //  } as AbstractControlOptions
        );
    }

    regexValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
        return (control: AbstractControl): {[key: string]: any} => {
            if (!control.value) {
                return null;
            }
            const valid = regex.test(control.value);
            return valid ? null : error;
        };
    }

    findInvalidControls(){
        this.invalidFields = [];
        const controls = this.staffForm.controls;
        for (const name in controls) {
            if (controls[name].invalid) {
                this.invalidFields.push(name);
            }
        }
        // this.password=this.invalidFields.includes('travelClass')
        console.log('INVALIDE', this.invalidFields);
    }

    // get user data data if in edit mode, else load empty staff-dashboard data
    getUserData() {
        this.route.paramMap.pipe(
            switchMap((params: any) => {
                console.log("PARAMS", params);
                if(params.get('id')) {
                    this.isEditMode = true;
                    return this.staffService.getUserById(params.get('id'));
                } else {
                    this.isEditMode = false;
                    return of(this.emptyStaffData);
                }
            })
        ).subscribe( staff => {
            this.staffData = staff;
            //   console.log(this.staffData);
            this.staffForm.patchValue(staff);

            // if (this.staffData.roles.includes('ROLE_EVENTS_VIEW')){
            //     this.staffForm.get('viewEvents').setValue(true);
            // }

            if (this.staffData.roles.includes('ROLE_EVENTS_EDIT')){
                this.staffForm.get('editEvents').setValue(true);
            }

            // if (this.staffData.roles.includes('ROLE_EDITORIALS_VIEW')){
            //     this.staffForm.get('viewEditorials').setValue(true);
            // }

            if (this.staffData.roles.includes('ROLE_EDITORIALS_EDIT')){
                this.staffForm.get('editEditorials').setValue(true);
            }

            // if (this.staffData.roles.includes('ROLE_PROVIDERS_VIEW')){
            //     this.staffForm.get('viewProviders').setValue(true);
            // }

            if (this.staffData.roles.includes('ROLE_PROVIDERS_EDIT')){
                this.staffForm.get('editProviders').setValue(true);
            }

            if (this.isEditMode) {
                this.staffForm.get('password').patchValue('');
                this.staffForm.get('password').removeValidators(Validators.required);
                this.staffForm.get('password').updateValueAndValidity();
                this.staffForm.get('email').disable();
                /*this.staffForm.removeValidators(this.checkPassword);
                this.staffForm.updateValueAndValidity();*/
            }
            //console.log(this.staffForm.value);
        });
    }

    submitForm() {
        console.log("erori acumulate",this.staffForm.errors);
        this.findInvalidControls();

        console.log(this.staffForm.value);
        this.staffForm.markAllAsTouched();

        // this.staffForm.get('password').value===null;

        // if( this.staffForm.controls["viewEvents"].value === true && !this.staffForm.controls["roles"].value.includes('ROLE_EVENTS_VIEW')) {
        //     this.staffForm.controls["roles"].setValue([...this.staffForm.controls["roles"].value, 'ROLE_EVENTS_VIEW']);
        // } else if (this.staffForm.controls["viewEvents"].value === false && this.staffForm.controls["roles"].value.includes('ROLE_EVENTS_VIEW')) {
        //     const currentArray = this.staffForm.controls["roles"].value;
        //     const updatedArray = currentArray.filter(item => item !== 'ROLE_EVENTS_VIEW');
        //     this.staffForm.controls["roles"].setValue(updatedArray);
        // }

        if( this.staffForm.controls["editEvents"].value === true && !this.staffForm.controls["roles"].value.includes('ROLE_EVENTS_EDIT')) {
            this.staffForm.controls["roles"].setValue([...this.staffForm.controls["roles"].value, 'ROLE_EVENTS_EDIT']);
        } else if (this.staffForm.controls["editEvents"].value === false && this.staffForm.controls["roles"].value.includes('ROLE_EVENTS_EDIT')) {
            const currentArray = this.staffForm.controls["roles"].value;
            const updatedArray = currentArray.filter(item => item !== 'ROLE_EVENTS_EDIT');
            this.staffForm.controls["roles"].setValue(updatedArray);
        }

        // if( this.staffForm.controls["viewEditorials"].value === true && !this.staffForm.controls["roles"].value.includes('ROLE_EDITORIALS_VIEW')) {
        //     this.staffForm.controls["roles"].setValue([...this.staffForm.controls["roles"].value, 'ROLE_EDITORIALS_VIEW']);
        // } else if (this.staffForm.controls["viewEditorials"].value === false && this.staffForm.controls["roles"].value.includes('ROLE_EDITORIALS_VIEW')) {
        //     const currentArray = this.staffForm.controls["roles"].value;
        //     const updatedArray = currentArray.filter(item => item !== 'ROLE_EDITORIALS_VIEW');
        //     this.staffForm.controls["roles"].setValue(updatedArray);
        // }

        if( this.staffForm.controls["editEditorials"].value === true && !this.staffForm.controls["roles"].value.includes('ROLE_EDITORIALS_EDIT')) {
            this.staffForm.controls["roles"].setValue([...this.staffForm.controls["roles"].value, 'ROLE_EDITORIALS_EDIT']);
        } else if (this.staffForm.controls["editEditorials"].value === false && this.staffForm.controls["roles"].value.includes('ROLE_EDITORIALS_EDIT')) {
            const currentArray = this.staffForm.controls["roles"].value;
            const updatedArray = currentArray.filter(item => item !== 'ROLE_EDITORIALS_EDIT');
            this.staffForm.controls["roles"].setValue(updatedArray);
        }

        // if( this.staffForm.controls["viewProviders"].value === true && !this.staffForm.controls["roles"].value.includes('ROLE_PROVIDERS_VIEW')) {
        //     this.staffForm.controls["roles"].setValue([...this.staffForm.controls["roles"].value, 'ROLE_PROVIDERS_VIEW']);
        // } else if (this.staffForm.controls["viewProviders"].value === false && this.staffForm.controls["roles"].value.includes('ROLE_PROVIDERS_VIEW')) {
        //     const currentArray = this.staffForm.controls["roles"].value;
        //     const updatedArray = currentArray.filter(item => item !== 'ROLE_PROVIDERS_VIEW');
        //     this.staffForm.controls["roles"].setValue(updatedArray);
        // }

        if( this.staffForm.controls["editProviders"].value === true && !this.staffForm.controls["roles"].value.includes('ROLE_PROVIDERS_EDIT')) {
            this.staffForm.controls["roles"].setValue([...this.staffForm.controls["roles"].value, 'ROLE_PROVIDERS_EDIT']);
        } else if (this.staffForm.controls["editProviders"].value === false && this.staffForm.controls["roles"].value.includes('ROLE_PROVIDERS_EDIT')) {
            const currentArray = this.staffForm.controls["roles"].value;
            const updatedArray = currentArray.filter(item => item !== 'ROLE_PROVIDERS_EDIT');
            this.staffForm.controls["roles"].setValue(updatedArray);
        }

        if(this.isEditMode) {
            this.staffForm.controls["password"].setErrors(null);
        }

        if (this.staffForm.valid) {

            // if (this.staffForm.value.birthdate !== null) {
            //     this.staffForm.value.birthdate = this.datepipe.transform(this.staffForm.value.birthdate, 'yyyy-MM-dd')
            // }

            console.log('Form valid', this.staffForm.value)

            // convertim data de nastere din Moment Js in 'YYYY-MM-DD'
            // if (this.staffForm.get('birthdate').value._i) {
            //     const birthdayMoment = this.staffForm.get('birthdate').value._i;
            //     this.staffForm.get('birthdate').patchValue(
            //         birthdayMoment.year.toString() + '-'
            //         + (birthdayMoment.month + 1).toString() + '-'
            //         + birthdayMoment.day.toString()
            //     );
            // }

            if (this.isEditMode) {
                const formValuesWithoutPassword = {...this.staffForm.value};
                const birth = this.datepipe.transform(this.staffForm.value.birthdate, 'yyyy-MM-dd');
                delete formValuesWithoutPassword['password'];
                console.log(this.staffForm.value);
                console.log(formValuesWithoutPassword);
                this.staffService.updateUser(this.staffForm.value.id, {...this.staffData, ...this.staffForm.value, birthdate: birth}).subscribe( (res: { success: true, reason: string }) => {
                    if (res.success) {
                        this.toastService.showToast('Succes', 'Staff modificat', 'success');
                        this.router.navigate(['/private/admin/manage-staff/list']);
                    } else {
                        if(res.reason==="invalidPassword"){

                            this.toastService.showToast('Eroare', 'Parola invalida', 'error');
                        }else{
                            this.toastService.showToast('Eroare', 'Eroare de la server', 'error');

                        }
                    }
                }, error => {
                    console.log(error);
                    this.toastService.showToast('Eroare', 'Eroare de la server', 'error');
                });
            } else {
                const birth = this.datepipe.transform(this.staffForm.value.birthdate, 'yyyy-MM-dd');
                console.log({...this.emptyStaffData, ...this.staffForm.value});
                this.staffService.addUser({...this.emptyStaffData, ...this.staffForm.value, birthdate: birth}).subscribe( (res: { success: boolean, reason: string }) => {
                    if (res.success) {
                        this.toastService.showToast('Succes', 'Contul de staff a fost creat cu succes!', 'success');

                        // trimitem mail de register
                        this.staffService.sendRegistrationEmail(res.reason).subscribe( (res: {success: boolean}) => {
                            if (res.success) {
                                this.toastService.showToast('Succes', 'Email trimis catre user', 'success');
                            } else {
                                this.toastService.showToast('Eroare', 'Eroare de la server', 'error');
                            }
                        });
                        this.router.navigate(['/private/admin/manage-staff/list']);

                    }
                    else {
                        if (res.reason === 'emailExists') {
                            this.toastService.showToast('Eroare', 'Email-ul a mai fost folosit', 'error');

                        } else if (res.reason === 'emailNotValid') {
                            this.toastService.showToast('Eroare', 'Email-ul nu este corect', 'error');

                        } else {
                            this.toastService.showToast('Eroare', 'Eroare de la server', 'error');
                        }
                    }
                }, error => {
                    console.log(error);
                    if(error.error.reason==="invalidPassword"){
                        this.toastService.showToast('Eroare', 'Parola invalidă', 'error');

                    }else if(error.error.reason === "emailExists"){
                        this.toastService.showToast('Eroare','Există deja un cont asociat acestui email!', 'error');

                    }else if(error.error.reason === "emailNotValid"){
                        this.toastService.showToast('Eroare','Emailul este invalid!', 'error');

                    }else if(error.error.reason === "notLoggedIn" || error.error.reson === "tokenExpired"){
                        this.toastService.showToast('Eroare','Pentru a finaliza această acțiune trebuie să fii logat!', 'error');

                    }
                    else{
                        this.toastService.showToast('Eroare', 'Eroare de la server', 'error');

                    }
                });
            }

        } else {
            this.toastService.showToast('Eroare', 'Completati campurile obligatorii', 'error');
        }
    }

    clearFormControl(formControl) {
        this.staffForm.get(formControl).patchValue(this.emptyStaffData[formControl]);
    }

    // checkAll(item: string, event: any) {
    //     console.log('check all', item, event.target.checked);
    //     if(item === 'providers') {
    //         if (event.target.checked === true) {
    //             this.staffForm.controls.viewProviders.setValue(true);
    //         }
    //     }
    //
    //     if(item === 'editorials') {
    //         if (event.target.checked === true) {
    //             this.staffForm.controls.viewEditorials.setValue(true);
    //         }
    //     }
    //
    //     if(item === 'events') {
    //         if (event.target.checked === true) {
    //             this.staffForm.controls.viewEvents.setValue(true);
    //         }
    //     }
    // }

    generatePassword() {
        const randexp = new RandExp(/^(.\d{1})(.[a-z]\d{1})(.[A-Z]\d{1})(.[@$!%*?&]\d{1})(?=.[a-zA-Z]).{0,1}$/).gen();
        // console.log(randexp);
        let generatedPassword = randexp;
        while (generatedPassword.indexOf(' ') !== -1) {
            // console.log(randexp.indexOf(' '));
            generatedPassword = generatedPassword.slice(0, generatedPassword.indexOf(' ')) + generatedPassword.slice(generatedPassword.indexOf(' ') + 1);
        } while (generatedPassword.indexOf('"') !== -1) {
            generatedPassword = generatedPassword.slice(0, generatedPassword.indexOf('"')) + generatedPassword.slice(generatedPassword.indexOf('"') + 1);
        }
        console.log(generatedPassword);
        this.staffForm.get('password').patchValue(generatedPassword);
    }

    resetPassword() {
        this.staffForm.get('password').markAsTouched();

        if (this.staffForm.get('password').valid) {
            console.log(this.staffData.id.toString(), this.staffForm.get('password').value);
            this.staffService.changeUserPassword(this.staffData.id.toString(), this.staffForm.get('password').value).subscribe( (res: { success: boolean, reason: string }) => {
                if (res.success) {
                    this.toastService.showToast('Succes', 'Parola a fost modificata cu succes', 'success');
                } else {
                    this.toastService.showToast('Eroare', 'Parola nu a fost modificata', 'error');
                }
            });
        } else {
            this.toastService.showToast('Eroare', 'Parola nu indeplineste toate criteriile', 'error');
        }
    }

}
