import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {EnrollStepperService} from "../../_services/enroll-stepper.service";
import {AttributesService} from "../../_services/attributes.service";
import {User} from "../../../../../shared/_models/user.model";
import {DatePipe} from "@angular/common";
import {ToastService} from "../../../../../shared/_services/toast.service";

@Component({
    selector: 'app-user-data',
    templateUrl: './user-data.component.html',
    styleUrls: ['./user-data.component.scss'],
    providers: [DatePipe]
})
export class UserDataComponent implements OnInit {

    userDataForm: FormGroup;
    currentUser: User;

    constructor(private fb: FormBuilder,
                private stepperService: EnrollStepperService,
                private dataService: AttributesService,
                private datePipe: DatePipe,
                private toastService: ToastService) {
    }

    ngOnInit() {
        console.log('PREFERENCES', this.dataService.preferences$.getValue())
        this.formInit();
        this.checkIfDataExists();
        this.getCurrentUser();
    }

    formInit() {
        this.userDataForm = this.fb.group({
            birthdate: ['',Validators.required],
            telephone: ['',Validators.required],
            gender: ['male',Validators.required]
        })
    }

    checkIfDataExists() {
        if (this.dataService.userData$.getValue()) {
            this.userDataForm.patchValue(this.dataService.userData$.getValue());
        }
    }

    getCurrentUser() {
        this.dataService.getCurrentUser().subscribe({
            next: (user: User) => {
                this.currentUser = user;
            }
        })
    }

    nextStep() {

        this.userDataForm.markAllAsTouched();
        if (this.userDataForm.valid) {
            const clientInfo = {
                ...this.currentUser,
                preferences: this.dataService.preferences$.getValue(),
                enrollment: true,
                birthdate: this.datePipe.transform(this.userDataForm.value.birthdate, 'yyyy-MM-dd'),
                gender: this.userDataForm.value.gender,
                telephone: this.userDataForm.value.telephone,
            }

            // console.log('CLIENT INFO', clientInfo);

            this.dataService.updateCurrentUser(clientInfo).subscribe({
                    next: (resp: any) => {
                        // console.log(resp);
                        if (resp.success) {
                            this.stepperService.nextStep();
                        }
                    },
                    error: (err: any) => {
                        if (err.reason === 'notExists') {
                            this.toastService.showToast('Error', 'Aces utilizator nu există!', "error");
                        } else if (err.reason === 'notLoggedIn' || err.reason === 'tokenExpired') {
                            this.toastService.showToast('Error', 'Pentru a finaliza această acțiune trebuie să fii logat!', "error");
                        }

                    }

                }
            )

        } else {
            return
        }
    }

    prevStep() {
        this.userDataForm.markAllAsTouched();
        if (this.userDataForm.valid) {
            this.dataService.userData$.next(this.userDataForm.value);
            this.stepperService.prevStep();
        } else {
            return
        }
    }
}
