import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, Validators} from "@angular/forms";
import {TranslateService} from "@ngx-translate/core";
import {Router} from "@angular/router";
import {UserDataService} from 'src/app/shared/_services/userData.service';
import {ToastService} from "../../shared/_services/toast.service";
import {User} from "../../shared/_models/user.model";
import {DashboardHeaderComponent} from "../dashboard-header/dashboard-header.component";
import {SharedModule} from "../../shared/shared.module";
import {DatePipe} from "@angular/common";
import { City } from 'src/app/shared/_models/city.model';
import { CityRecommendation } from 'src/app/shared/_models/city-recommendation.model';
import { Subject, takeUntil } from 'rxjs';
import { ResourceFilterService } from 'src/app/shared/_services/resource-filter.service';


@Component({
    selector: 'app-edit-account',
    standalone: true,
    templateUrl: './edit-account.component.html',
    styleUrls: ['./edit-account.component.scss'],
    imports: [DashboardHeaderComponent, SharedModule, FormsModule],
    providers: [DatePipe]
})
export class EditAccountComponent implements OnInit {

    private ngUnsubscribe = new Subject<void>();

    user: User;
    imgPath = "assets/images/others/user.jpg";
    oldImage: string;

    clientAccountForm: FormGroup;
    isClient: boolean;

    today=new Date();

    //city
    @Input() detectedCity: City;

    recommendedCities: CityRecommendation[] = null;
    cityToSearch: string = null;
    hideCitySuggestion=false;

    constructor(public userData: UserDataService,
                public formBuilder: FormBuilder,
                private toastService: ToastService,
                private translate: TranslateService,
                private router: Router,
                public datepipe: DatePipe,
                private resourceFilterService: ResourceFilterService) {
    }

    ngOnInit(): void {
        this.formInit();
        this.userInit();
    }

    userInit() {

        this.userData.getCurrentUser().subscribe((res: User) => {
            // console.log('USEER', res);
            this.user = res;

            if (res.roles.includes('ROLE_CLIENT')) {
                this.isClient = true;
            }
            this.imgPath = res.avatar?.filePath;
            this.oldImage = res.avatar?.filePath;
            //console.log(this.user);
            this.clientAccountForm.patchValue(this.user);
            this.hideCitySuggestion=true;

            console.log(this.clientAccountForm.value);
        })
    }


    formInit() {

        this.clientAccountForm = this.formBuilder.group({
            firstName: [null, Validators.required],
            lastName: [null, Validators.required],
            email: null,
            birthdate: null,
            gender: null,
            telephone: [null,  Validators.pattern('[- +()0-9]+')],
            description: null,
            city: null,
            currentGeographicalCoordinates: null,
            country: null

            // location: [this.detectedCity.name],
            // geographicalCoordinates: [this.detectedCity.geographicalCoordinates],
            // country: [this.detectedCity.country]

        })

        this.clientAccountForm.get('email').disable();
    }

    onSaveClick() {
        this.clientAccountForm.markAllAsTouched();
        this.clientAccountForm.get("birthdate").setValue(this.datepipe.transform(this.clientAccountForm.value.birthdate, 'yyyy-MM-dd'));
        console.log('FORM VALUE', this.clientAccountForm.value);


        if (this.clientAccountForm.valid) {

            this.userData.updateUserProfile(this.clientAccountForm.value).subscribe((res: { success: boolean, reason: string }) => {
                console.log('Res edit account', res);
                if (res.success) {
                    this.userInit();
                    this.toastService.showToast(this.translate.instant("TOAST.SUCCESS"), this.translate.instant("TOAST.UPDATE-CURRENT-USER.SUCCESS"), "success");
                } else {
                    this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("TOAST.UPDATE-CURRENT-USER.ERROR"), "error");
                }
            }, () => {
                this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("TOAST.UPDATE-CURRENT-USER.ERROR"), "error")
            });
        } else {
            this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("ERROR.REQUIRED-ALL"), "error");
        }
    }

    uploadAvatar(event) {
        const reader = new FileReader();
        const file: File = event.target.files[0];
        //console.log('event',file);
        if (file) {
            const formData = new FormData();
            formData.append("file", file);
            reader.readAsDataURL(file);

            reader.onload = () => {

                this.imgPath = reader.result as string;
            };


            // console.log(formData);
            this.userData.uploadAvatar(formData).subscribe((res: { success: boolean }) => {
                    if (res.success === true) {
                        this.toastService.showToast(this.translate.instant("TOAST.SUCCESS"), this.translate.instant("TOAST.UPLOAD-AVATAR.SUCCESS"), "success");
                    } else {
                        console.log('eroare upload 1');
                        this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("TOAST.UPLOAD-AVATAR.ERROR"), "error")
                    }
                },
                error => {
                    console.log('eroare upload');
                    if(error.error.reason === 'fileSizeTooBig') {
                        this.toastService.showToast('Error', 'Fișierul încărcat este prea mare. Trebuie să aibă maxim 2MB.', "error");
                    } else {
                        this.toastService.showToast('Error', 'Fișierul NU a fost încărcat!', "error");
                    }
                    this.imgPath = this.oldImage;
                })
        }

    }

    onDeleteAvatar() {
        this.userData.deleteProfileImage().subscribe((res: { success: boolean }) => {
            // console.log(res);
            if (res.success) {
                this.imgPath = 'assets/images/others/user.jpg';
                this.toastService.showToast(this.translate.instant("TOAST.SUCCESS"), this.translate.instant("TOAST.DELETE-AVATAR.SUCCESS"), "success");
            } else {
                this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("TOAST.DELETE-AVATAR.ERROR"), "error");
            }
        })
    }

    //select city
    searchForCities() {
        this.hideCitySuggestion=false;

        if (!this.cityToSearch || this.cityToSearch?.length < 3) {
            this.recommendedCities = null;
            return;
        }

        this.resourceFilterService.getAllCitiesRecommended(this.cityToSearch)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(res => {
                if (!res) return;

                this.recommendedCities = [...res];
            });
    }

    updateFormValue(formControlName: string, value: unknown) {
        this.clientAccountForm.get(formControlName).patchValue(value);

        this.hideCitySuggestion=true;
    }

    clearFormControl(formControl) {
        this.clientAccountForm.get(formControl).patchValue(null);
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
