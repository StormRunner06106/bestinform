import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {CVService} from "../../_services/cv.service";

@Component({
    selector: 'app-delete-cv-data-modal',
    templateUrl: './delete-cv-data-modal.component.html',
    styleUrls: ['./delete-cv-data-modal.component.scss']
})
export class DeleteCvDataModalComponent implements OnInit {

    constructor(private cvService: CVService,
                public dialogRef: MatDialogRef<DeleteCvDataModalComponent>,
                @Inject(MAT_DIALOG_DATA) public data: { givenData: any, type: string }) {
    }

    ngOnInit() {
    }

    close() {
        this.dialogRef.close();
    }

    deleteData() {
        if (this.data.type === 'education') {
            const list = this.cvService.educationList$.getValue()

            // Exclude the ticket by id
            const filtered = list.filter(data => data.index !== this.data.givenData.index);

            // Check if a room was deleted and update the array
            if (filtered.length !== list.length) {
                this.cvService.educationList$.next(filtered);
                this.cvService.refreshEducationList$.next(true);

            } else {
                console.log(`Room not found`);
            }
        } else if (this.data.type === 'experience') {
            const list = this.cvService.experienceList$.getValue()

            // Exclude the ticket by id
            const filtered = list.filter(data => data.index !== this.data.givenData.index);

            // Check if a room was deleted and update the array
            if (filtered.length !== list.length) {
                this.cvService.experienceList$.next(filtered);
                this.cvService.refreshExperienceList$.next(true);
            } else {
                console.log(`Room not found`);
            }
        } else if (this.data.type === 'certification') {
            const list = this.cvService.certificationList$.getValue()

            // Exclude the ticket by id
            const filtered = list.filter(data => data.index !== this.data.givenData.index);

            // Check if a room was deleted and update the array
            if (filtered.length !== list.length) {
                this.cvService.certificationList$.next(filtered);
                this.cvService.refreshCertificationList$.next(true);
            } else {
                console.log(`Room not found`);
            }
        }

        this.dialogRef.close();
    }

}
