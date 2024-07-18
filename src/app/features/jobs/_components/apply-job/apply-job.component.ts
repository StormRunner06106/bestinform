import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {CVService} from "../../_services/cv.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastService} from "../../../../shared/_services/toast.service";

@Component({
    selector: 'app-apply-job',
    templateUrl: './apply-job.component.html',
    styleUrls: ['./apply-job.component.scss']
})
export class ApplyJobComponent implements OnInit {

    userForm: FormGroup;
    currentCv: any;

    constructor(private fb: FormBuilder,
                public dialogRef: MatDialogRef<ApplyJobComponent>,
                @Inject(MAT_DIALOG_DATA) public userData: { userData },
                @Inject(MAT_DIALOG_DATA) public route: { route },
                @Inject(MAT_DIALOG_DATA) public jobId: { jobId },
                private cvService: CVService,
                private router: Router,
                private toastService: ToastService) {
    }

    ngOnInit() {
        console.log(this.userData.userData);
        this.formInit();
        this.userForm.patchValue(this.userData.userData);
        this.getServiceData();
    }

    formInit() {
        this.userForm = this.fb.group({
            firstName: '',
            lastName: '',
            email: '',
            telephone: '',
            country: ''
        })
    }

    getServiceData() {
        this.cvService.getCurrentUserCV().subscribe({
            next: (currentCv: any) => {
                this.currentCv = currentCv;
                console.log(currentCv);
            }
        })
    }

    navigateToCv() {
        console.log(this.route)
        this.router.navigate(['../../my-cv'], {relativeTo: this.route.route});
        this.dialogRef.close();
    }

    applyToJob() {
        this.cvService.applyToJob(this.jobId.jobId).subscribe({
            next: (response: { reason: string, success: boolean }) => {
                if (response.success) {
                    this.toastService.showToast('Succes', 'Ai aplicat la acest job', 'success');
                    this.dialogRef.close();
                    this.router.navigate(['../../my-cv'], {relativeTo: this.route.route});
                }
            },
        error:err=>{
                if(err.reason==='alreadyExists'){
                    this.toastService.showToast('Error', 'Ai aplicat deja la acest job!', 'error');
                }else if(err.reason==='cannotApplyToYourJob'){
                    this.toastService.showToast('Error', 'Nu poti aplica la propriul job!', 'error');
                }else if(err.reason==='notAvailable'){
                    this.toastService.showToast('Error', 'Acest job nu este valabil!', 'error');
                }else{
                    this.toastService.showToast('Error', 'Nu poti aplica la acest job!', 'error');
                }
        }
        })
    }
}
