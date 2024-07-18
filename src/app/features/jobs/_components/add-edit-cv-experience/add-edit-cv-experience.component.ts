import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CVService} from "../../_services/cv.service";

@Component({
    selector: 'app-add-edit-cv-experience',
    templateUrl: './add-edit-cv-experience.component.html',
    styleUrls: ['./add-edit-cv-experience.component.scss']
})
export class AddEditCvExperienceComponent implements OnInit {

    experienceForm: FormGroup;
    isEditMode = false;

    lastIndex:number;


    constructor(public dialogRef: MatDialogRef<AddEditCvExperienceComponent>,
                @Inject(MAT_DIALOG_DATA) public givenData: { givenData },
                private fb: FormBuilder,
                private cvService: CVService) {
    }

    ngOnInit() {
        this.getLastIndex();
        this.formInit();
        this.checkIfEdit();
    }

    formInit() {
        this.experienceForm = this.fb.group({
            index: [this.givenData ? this.givenData.givenData.index : this.lastIndex + 1],
            positionHeld: ['', Validators.required],
            typeOfContract: '',
            companyName: ['', Validators.required],
            location: '',
            jobStartDate: '',
            jobEndDate: '',
            description: ''
        })
    }

    getLastIndex(){
        const experienceList = this.cvService.experienceList$.getValue();
        this.lastIndex = experienceList.length > 0 ? experienceList[experienceList?.length - 1].index : -1;
    }

    checkIfEdit() {
        if (this.givenData) {
            this.isEditMode = true;
            this.experienceForm.patchValue(this.givenData.givenData);
        } else {
            this.isEditMode = false;
        }
    }

    confirm(){
        this.experienceForm.markAllAsTouched();
        if(this.experienceForm.valid){
            if(this.isEditMode){
                this.updateExperience(this.experienceForm.value);
            }else{
                this.createExperience(this.experienceForm.value);
            }
        }else{
            return
        }
    }

    updateExperience(experienceValue){
        const experienceList = this.cvService.experienceList$.getValue();

        // Find selected ticket by index
        const selectedIndex = experienceList.findIndex(obj => obj.index === experienceValue.index);

        // Check if the ticket was found and update
        if (selectedIndex !== -1) {
            experienceList[selectedIndex] = experienceValue;
            this.cvService.experienceList$.next(experienceList);
            this.cvService.refreshExperienceList$.next(true);
            this.close();
        } else {
            console.log('not found');
        }
    }

    createExperience(experienceValue){
        this.cvService.addExperienceToList(experienceValue);
        this.cvService.refreshExperienceList$.next(true);
        this.close();
        console.log(this.cvService.experienceList$.getValue());
    }

    close() {
        this.dialogRef.close();
    }
}
