import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {CVService} from "../../_services/cv.service";

@Component({
    selector: 'app-add-edit-cv-certification',
    templateUrl: './add-edit-cv-certification.component.html',
    styleUrls: ['./add-edit-cv-certification.component.scss']
})
export class AddEditCvCertificationComponent implements OnInit {
    certificationForm: FormGroup;
    isEditMode = false;
    lastIndex : number;


    constructor(public dialogRef: MatDialogRef<AddEditCvCertificationComponent>,
                @Inject(MAT_DIALOG_DATA) public givenData: { givenData },
                private fb: FormBuilder,
                private cvService: CVService) {
    }

    ngOnInit() {
        this.getLastIndex();
        this.formInit();
        this.checkIfEdit();
    }

    getLastIndex(){
        const certificationList = this.cvService.certificationList$.getValue();
        this.lastIndex = certificationList.length > 0 ? certificationList[certificationList?.length - 1].index : -1;
    }


    formInit(){
        this.certificationForm = this.fb.group({
            index: this.givenData ? this.givenData.givenData.index : this.lastIndex + 1,
            name: ['',Validators.required],
            company: ['',Validators.required],
            certificationId: ['',Validators.required],
            dateOfCertification: ['',Validators.required],
            expirationDate: ['',Validators.required],
            certificationLink: ''
        })
    }

    checkIfEdit(){
        if(this.givenData){
            this.isEditMode = true;
            this.certificationForm.patchValue(this.givenData.givenData);
        }else{
            this.isEditMode = false;
        }
    }

    confirm(){
        this.certificationForm.markAllAsTouched();
        if(this.certificationForm.valid){
            if(this.isEditMode){
                this.updateCertification(this.certificationForm.value);
            }else{
                this.createCertification(this.certificationForm.value);

            }
        }
    }

    updateCertification(certificationValue){
        const certificationList = this.cvService.certificationList$.getValue();

        // Find selected ticket by index
        const selectedIndex = certificationList.findIndex(obj => obj.index === certificationValue.index);

        // Check if the ticket was found and update
        if (selectedIndex !== -1) {
            certificationList[selectedIndex] = certificationValue;
            this.cvService.certificationList$.next(certificationList);
            this.cvService.refreshCertificationList$.next(true);
            this.close();
        } else {
            console.log('not found');
        }
    }

    createCertification(certificationValue){
        this.cvService.addCertificationToList(certificationValue);
        this.cvService.refreshCertificationList$.next(true);
        this.close();
        console.log(this.cvService.certificationList$.getValue());
    }

    close(){
        this.dialogRef.close();
    }
}
