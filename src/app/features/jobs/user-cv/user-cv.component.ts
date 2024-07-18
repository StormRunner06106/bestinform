import {Component, OnInit} from '@angular/core';
import {SystemSettingsService} from "../../../shared/_services/system-settings.service";
import {SystemSetting} from "../../../shared/_models/system-setting.model";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CVService} from "../_services/cv.service";
import {ToastService} from "../../../shared/_services/toast.service";
import {MatDialog} from "@angular/material/dialog";
import {AddEditCvExperienceComponent} from "../_components/add-edit-cv-experience/add-edit-cv-experience.component";
import {
    AddEditCvCertificationComponent
} from "../_components/add-edit-cv-certification/add-edit-cv-certification.component";
import {AddEditCvEducationComponent} from "../_components/add-edit-cv-education/add-edit-cv-education.component";
import {takeUntil} from "rxjs/operators";

@Component({
    selector: 'app-user-cv',
    templateUrl: './user-cv.component.html',
    styleUrls: ['./user-cv.component.scss']
})
export class UserCvComponent implements OnInit {

    constructor(private systemSettings: SystemSettingsService,
                private fb: FormBuilder,
                private cvService: CVService,
                private toastService: ToastService,
                public dialog: MatDialog) {
    }

    myCvImagePath: string;
    cvForm: FormGroup;
    contactCheck = false;

    experienceList = [];
    certificationList = [];
    educationList = [];

    currentCv: any;

    avatarCvUrl = {
        fileName: undefined,
        filePath: undefined
    };
    avatarCvFile: Blob;

    userCvFile: Blob;
    userCvUrl = {
        fileName: undefined,
        filePath: undefined
    }

    percentage = 0;
    percentageDisplay:string;

    ngOnInit() {
        this.getSystemSettings();
        this.getCurrentUserCV();
        this.formInit();
        this.lists();
    }

    getPercentage() {
        this.percentage = 0;
        if (this.avatarCvUrl?.filePath && this.currentCv?.description && this.experienceList.length > 0 && this.educationList.length > 0 && this.certificationList.length > 0 && this.contactCheck) {
            this.percentage = 100;
        } else {
            if (this.avatarCvUrl?.filePath) {
                this.percentage += 16.66;
                this.percentageDisplay = this.percentage.toFixed(2);
            }
            if (this.currentCv?.description) {
                this.percentage += 16.66;
                this.percentageDisplay = this.percentage.toFixed(2);
            }
            if (this.experienceList.length > 0) {
                this.percentage += 16.66;
                this.percentageDisplay = this.percentage.toFixed(2);
            }
            if (this.educationList.length > 0) {
                this.percentage += 16.66;
                this.percentageDisplay = this.percentage.toFixed(2);
            }
            if (this.certificationList.length > 0) {
                this.percentage += 16.66;
                this.percentageDisplay = this.percentage.toFixed(2);
            }
            if (this.contactCheck) {
                this.percentage += 16.66;
                this.percentageDisplay = this.percentage.toFixed(2);
            }

        }

    }

    getSystemSettings() {
        this.systemSettings.getSystemSetting()
            .subscribe({
                next: (settings: SystemSetting) => {
                    this.myCvImagePath = settings.jobOptions.myCv.image.filePath;
                }
            })
    }

    lists() {
        this.cvService.refreshExperienceListData()
            .subscribe({
                next: () => {
                    this.experienceList = this.cvService.experienceList$.getValue();
                    this.getPercentage();
                }
            })

        this.cvService.refreshCertificationListData()
            .subscribe({
                next: () => {
                    this.certificationList = this.cvService.certificationList$.getValue();
                    this.getPercentage();
                }
            })

        this.cvService.refreshEducationListData()
            .subscribe({
                next: () => {
                    this.educationList = this.cvService.educationList$.getValue();
                    this.getPercentage();
                }
            })

    }


    formInit() {
        this.cvForm = this.fb.group({
            description: '',
            address: '',
            telephone: '',
            email: ['', Validators.email],
            linkedin: '',
            linguisticCompetences: [],
            isPublic: [false],
            accept: [false, Validators.requiredTrue]

        })
    }

    getCurrentUserCV() {
        this.cvService.getCurrentUserCV().subscribe({
            next: (currentCV: any) => {
                console.log('CURRENT CV', currentCV);
                if (currentCV) {
                    this.cvForm.patchValue(currentCV);
                    this.currentCv = currentCV;
                    this.cvService.experienceList$.next(currentCV.experience);
                    this.cvService.educationList$.next(currentCV.education);
                    this.cvService.certificationList$.next(currentCV.certificationsAndDegrees);
                    this.experienceList = currentCV.experience;
                    this.educationList = currentCV.education;
                    this.certificationList = currentCV.certificationsAndDegrees;
                    this.avatarCvUrl = currentCV?.avatar ? currentCV.avatar : this.avatarCvUrl;
                    this.userCvUrl = currentCV.pdfCv;
                    if (currentCV.address !== '' && currentCV.telephone !== '' && currentCV.email !== '' && currentCV.linkedin !== '') {
                        this.contactCheck = true;
                    } else {
                        this.contactCheck = false;
                    }
                    this.getPercentage();
                }

            }
        })
    }

    deleteCvAvatar() {
        this.cvService.deleteCvAvatar().subscribe({
            next: (resp: { success: boolean, reason: string }) => {
                if (resp) {
                    this.toastService.showToast('Success', 'Avatarul a fost sters!', "success");
                    this.avatarCvUrl = {
                        fileName: undefined,
                        filePath: undefined
                    };
                }
            },
            error: err => {
                if (err.reason === 'notExists') {
                    this.toastService.showToast('Error', 'Avatarul nu exista!', "error");
                } else if (err.reason === 'notLoggedIn' || err.reason === 'tokenExpired') {
                    this.toastService.showToast('Error', 'Pentru a finaliza aceasta actiune trebuie sa fii logat!', "error");
                }
            }
        })
    }

    uploadAvatar(event) {
        if (event.target.files && event.target.files[0]) {
            this.avatarCvUrl.fileName = event.target.files[0].name;
            this.avatarCvFile = event.target.files[0];

            const reader = new FileReader();
            reader.onload = () => this.avatarCvUrl.filePath = reader.result;
            reader.readAsDataURL(this.avatarCvFile);
        }

        if (this.avatarCvFile) {
            const avatarCv = new FormData();
            avatarCv.append('avatar', this.avatarCvFile);

            this.cvService.uploadCVAvatar(avatarCv).subscribe({
                next: (resp: any) => {
                    console.log(resp);
                    if(resp.success){
                        this.toastService.showToast('Success', 'Avatarul a fost incarcat!', 'success');
                    }
                }, error: (error)=>{
                    if(error.error.reason === 'fileSizeTooBig'){
                        this.toastService.showToast("Eroare", "Fisierul incărcat este prea mare! Încărcați o imagine mai mica de 2 MB!", "error");
                    } else if(error.error.reason === 'wrongExtension'){
                        this.toastService.showToast("Eroare", "Formatul fisierului nu este permis!", "error");
                    }else{
                        this.toastService.showToast("Eroare", "A aparut o problemă la încărcarea imaginii!", "error");
                    }
                }
            })
        }
    }

    uploadCvFile(event) {
        if (event.target.files && event.target.files[0]) {
            this.userCvUrl.fileName = event.target.files[0].name;
            this.userCvFile = event.target.files[0];

            const reader = new FileReader();
            reader.onload = () => this.userCvUrl.filePath = reader.result;
            reader.readAsDataURL(this.userCvFile);
        }

        if (this.userCvFile) {
            const cvFile = new FormData();
            cvFile.append('cvFile', this.userCvFile);

            this.cvService.uploadCVFile(cvFile).subscribe({
                next: (resp: any) => {
                    console.log(resp);
                    this.toastService.showToast('Success', 'CV-ul a fost incarcat!', "success");
                }
            })
        }
    }


    deleteCvFile() {
        this.userCvFile = undefined;
        this.userCvUrl = {
            fileName: undefined,
            filePath: undefined
        }
    }


    openAddExperienceModal() {
        this.dialog.open(AddEditCvExperienceComponent, {
            width: '1500px',
            height: '750px',
            data: undefined
        });
    }

    openAddCertificationModal() {
        this.dialog.open(AddEditCvCertificationComponent, {
            width: '1500px',
            height: '750px',
            data: undefined
        });
    }

    openAddEducationModal() {
        this.dialog.open(AddEditCvEducationComponent, {
            width: '1500px',
            height: '750px',
            data: undefined
        });
    }


    submitForm() {
        this.cvForm.markAllAsTouched();
        if (this.cvForm.valid) {
            const cvToSend = {
                ...this.currentCv,
                ...this.cvForm.value,
                certificationsAndDegrees: this.certificationList,
                education: this.educationList,
                experience: this.experienceList
            }
            if(this.currentCv){
                this.cvService.updateCurrentUserCV(cvToSend).subscribe({
                    next: (response: { success: boolean, reason: string }) => {
                        console.log('SUBMIT', response);
                        if (response.success) {
                            this.cvForm.reset();
                            this.toastService.showToast('Success','CV-ul a fost modificat!', 'success');
                            this.getCurrentUserCV();
                        }
                    }
                })
            }else{
                this.cvService.createCv(cvToSend).subscribe({
                    next:(response:{success: boolean, reason: string})=>{
                        if (response.success) {
                            this.cvForm.reset();
                            this.toastService.showToast('Success','CV-ul a fost creat!', 'success');
                            this.getCurrentUserCV();
                        }
                    }
                })
            }

            console.log('SEND', cvToSend);

        } else {
            console.log('no');
            this.toastService.showToast('Error', 'Completati toate campurile necesare!', 'error')
            return
        }
    }

}
