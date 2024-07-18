import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {of, switchMap} from "rxjs";
import {Resource} from "../../../../shared/_models/resource.model";
import {JobService} from "../../_services/job.service";
import {UserDataService} from "../../../../shared/_services/userData.service";
import {User} from "../../../../shared/_models/user.model";
import {AddEditCvEducationComponent} from "../add-edit-cv-education/add-edit-cv-education.component";
import {MatDialog} from "@angular/material/dialog";
import {ApplyJobComponent} from "../apply-job/apply-job.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {response} from "express";
import {ToastService} from "../../../../shared/_services/toast.service";

@Component({
    selector: 'app-view-job',
    templateUrl: './view-job.component.html',
    styleUrls: ['./view-job.component.scss']
})
export class ViewJobComponent implements OnInit {

    constructor(private router: Router,
                private route: ActivatedRoute,
                private jobService: JobService,
                private userDataService: UserDataService,
                public dialog: MatDialog) {
    }

    job: Resource;
    isJobProvider = false;
    candidatesList: any;
    currentUser: User;
    alreadyApplied = false;
    isStaff = false;
    isAdmin = false;

    ngOnInit() {
        this.getJobData();
    }

    getJobData() {
        this.route.paramMap.pipe(
            switchMap((params: any) => {
                if (params.get('id')) {
                    return this.jobService.getResourceById(params.get('id'));
                } else {
                    return of('');
                }
            })
        ).subscribe((job: Resource) => {
            console.log('GET JOB', job);
            this.job = job;
            this.checkJobProvider(job.userId);
            this.getJobCandidates();
        })
    }

    checkJobProvider(userId: string) {
        this.userDataService.getCurrentUser().subscribe({
            next: (currentUser: User) => {
                this.currentUser = currentUser;
                this.isStaff = this.currentUser.roles.includes('ROLE_STAFF');
                this.isAdmin = this.currentUser.roles.includes('ROLE_SUPER_ADMIN');

                if (currentUser.id === userId) {
                    this.isJobProvider = true;
                } else {
                    this.isJobProvider = false;
                    this.getJobCandidates(currentUser.id);
                }
            }
        })
    }

    getJobCandidates(currentUserId?: string) {
        this.jobService.getCandidates(this.job.id).subscribe({
            next: (candidatesList: any) => {
                console.log('candidades', candidatesList);
                this.candidatesList = candidatesList;
                this.checkIfUserApplied(candidatesList, currentUserId);
            }
        })
    }

    checkIfUserApplied(candidatesList, currentUserId) {
        candidatesList.forEach(candidate => {
            if (candidate.id === currentUserId) {
                this.alreadyApplied = true;
            }
        })
    }

    openApplyModal() {
        this.dialog.open(ApplyJobComponent, {
            width: '1500px',
            height: '750px',
            data: {
                userData: this.currentUser,
                route: this.route,
                jobId: this.job.id
            }
        });

    }

    navigateToEditJob() {
        this.router.navigate(['../../edit/', this.job.id], {relativeTo: this.route})
    }


}