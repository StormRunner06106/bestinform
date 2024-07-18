import {Component, Inject} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {CVService} from "../../_services/cv.service";

@Component({
    selector: 'app-add-edit-cv-education',
    templateUrl: './add-edit-cv-education.component.html',
    styleUrls: ['./add-edit-cv-education.component.scss']
})
export class AddEditCvEducationComponent {

    educationForm: FormGroup;
    isEditMode = false;
    lastIndex: number;

    constructor(public dialogRef: MatDialogRef<AddEditCvEducationComponent>,
                @Inject(MAT_DIALOG_DATA) public givenData: { givenData },
                private fb: FormBuilder,
                private cvService: CVService) {
    }

    ngOnInit() {
        this.getLastIndex();
        this.formInit();
        this.checkIfEdit();
    }

    getLastIndex() {
        const educationList = this.cvService.educationList$.getValue();
        this.lastIndex = educationList.length > 0 ? educationList[educationList?.length - 1]?.index : -1;
    }

    formInit() {
        this.educationForm = this.fb.group({
            index: this.givenData ? this.givenData.givenData.index : this.lastIndex +1,
            schoolName: ['', Validators.required],
            group: ['', Validators.required],
            startDate: ['', Validators.required],
            endDate: ['', Validators.required],
            location: ['', Validators.required]
        })
    }

    checkIfEdit() {
        if (this.givenData) {
            this.isEditMode = true;
            this.educationForm.patchValue(this.givenData.givenData);
        } else {
            this.isEditMode = false;
        }
    }

    confirm() {
        this.educationForm.markAllAsTouched();
        if (this.educationForm.valid) {
            if (this.isEditMode) {
                this.updateEducation(this.educationForm.value);
            } else {
                this.createEducation(this.educationForm.value);
            }
        }
    }

    updateEducation(educationValue) {
        const educationList = this.cvService.educationList$.getValue();

        // Find selected ticket by index
        const selectedIndex = educationList.findIndex(obj => obj.index === educationValue.index);

        // Check if the ticket was found and update
        if (selectedIndex !== -1) {
            educationList[selectedIndex] = educationValue;
            this.cvService.educationList$.next(educationList);
            this.cvService.refreshEducationList$.next(true);
            this.close();
        } else {
            console.log('not found');
        }
    }


    createEducation(educationValue) {
        this.cvService.addEducationToList(educationValue);
        this.cvService.refreshEducationList$.next(true);
        this.close();
        console.log(this.cvService.educationList$.getValue());
    }

    close() {
        this.dialogRef.close();
    }
}
