import {Component, Input, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatMenuModule} from "@angular/material/menu";
import {
    AddEditCvExperienceComponent
} from "../../features/jobs/_components/add-edit-cv-experience/add-edit-cv-experience.component";
import {MatDialog} from "@angular/material/dialog";
import {
    AddEditCvCertificationComponent
} from "../../features/jobs/_components/add-edit-cv-certification/add-edit-cv-certification.component";
import {
    AddEditCvEducationComponent
} from "../../features/jobs/_components/add-edit-cv-education/add-edit-cv-education.component";
import {
    DeleteCvDataModalComponent
} from "../../features/jobs/_components/delete-cv-data-modal/delete-cv-data-modal.component";

@Component({
    selector: 'app-cv-card',
    standalone: true,
    imports: [CommonModule, MatMenuModule],
    templateUrl: './cv-card.component.html',
    styleUrls: ['./cv-card.component.scss']
})
export class CvCardComponent implements OnInit {

    @Input() givenData: any;
    @Input() isExperience: boolean;
    @Input() isEducation: boolean;
    @Input() isCertification: boolean;

    displayObject: any;
    type: string;

    constructor(public dialog: MatDialog) {
    }

    ngOnInit() {
        this.makeDisplayObject();
    }

    makeDisplayObject() {
        if (this.isExperience) {
            this.displayObject = {
                title: this.givenData.positionHeld,
                subtitle: this.givenData.companyName,
                startDate: this.givenData.jobStartDate,
                endDate: this.givenData.jobEndDate,
                location: this.givenData.location
            };
            this.type = 'experience';
        } else if (this.isEducation) {
            this.displayObject = {
                title: this.givenData.schoolName,
                subtitle: this.givenData.group,
                startDate: this.givenData.startDate,
                endDate: this.givenData.endDate,
                location: this.givenData.location
            };
            this.type = 'education';
        } else if (this.isCertification) {
            this.displayObject = {
                title: this.givenData.name,
                subtitle: this.givenData.company,
                startDate: this.givenData.dateOfCertification,
                endDate: this.givenData.expirationDate,
                location: this.givenData.certificationId
            };
            this.type = 'certification';
        }
    }

    openEditModal(givenData) {
        if (this.isCertification) {
            this.dialog.open(AddEditCvCertificationComponent, {
                width: '1500px',
                height: '750px',
                data: {
                    givenData: givenData
                }
            });
        } else if (this.isEducation) {
            this.dialog.open(AddEditCvEducationComponent, {
                width: '1500px',
                height: '750px',
                data: {
                    givenData: givenData
                }
            });
        } else if (this.isExperience) {
            this.dialog.open(AddEditCvExperienceComponent, {
                width: '1500px',
                height: '750px',
                data: {
                    givenData: givenData
                }
            });
        }
    }

    openDeleteModal(givenData, type){
        this.dialog.open(DeleteCvDataModalComponent, {
            width: '720px',
            height: '400px',
            data: {
                givenData: givenData,
                type: type
            }
        });
    }
}
