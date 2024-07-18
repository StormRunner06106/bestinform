import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SharedExperiencesService} from "../../../../shared/_services/shared-experiences.service";
import {ResourcesService as ResourceService} from "../../_services/resources.service";
import {Resource} from "../../../../shared/_models/resource.model";
import {Subject, takeUntil} from "rxjs";
import {ResourcesService} from "../../../../shared/_services/resources.service";
import {DatePipe} from "@angular/common";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ToastService} from "../../../../shared/_services/toast.service";

@Component({
    selector: 'app-provider-create-shared-experience',
    templateUrl: './provider-create-shared-experience.component.html',
    styleUrls: ['./provider-create-shared-experience.component.scss'],
    providers: [DatePipe]
})
export class ProviderCreateSharedExperienceComponent implements OnInit, OnDestroy {
    private ngUnsubscribe = new Subject<void>();

    currentResource: Resource;
    timeslotsArray = [];
    chosenResourceTimeslots = [];
    bookingTimeslotId: string;
    date: string;
    today = new Date();

    slotChosen: { startHour: string, endHour: string };
    showErrorMsg = false;

    sharedExperienceForm: FormGroup;

    constructor(public dialogRef: MatDialogRef<ProviderCreateSharedExperienceComponent>,
                @Inject(MAT_DIALOG_DATA) public resourceId,
                private sharedExperienceService: SharedExperiencesService,
                private resourceService: ResourceService,
                private resourcesService: ResourcesService,
                private datePipe: DatePipe,
                private fb: FormBuilder,
                private toastService: ToastService) {
    }

    ngOnInit() {
        console.log(this.resourceId);
        this.getCurrentResource();
        this.getTimepickerForResource(this.resourceId);
        this.formInit();
    }

    formInit() {
        this.sharedExperienceForm = this.fb.group({
            name: ['', Validators.required],
            description: [''],
            hasParticipantsLimit: [false],
            participantsMaxNumber: [0]
        })
    }

    getCurrentResource() {
        this.resourceService.getResourceById(this.resourceId)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (resource: Resource) => {
                    this.currentResource = resource;
                }

            })
    }

    getTimepickerForResource(resourceId) {
        this.resourcesService.getTimeslotsByResourceId(resourceId)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (timeslots: any) => {
                    this.timeslotsArray = timeslots;
                    console.log('toate activitatile', timeslots);
                    console.log('TIMESLOTS FOR CHOSEN RS', timeslots[0]?.slotItems);
                    this.bookingTimeslotId = null;
                    this.date = null;
                }
            })
    }

    bookingTimeslotChanged(id) {
        console.log(id);
        this.bookingTimeslotId = id;
        this.date = null;
        this.chosenResourceTimeslots = [];
    }

    dateChanged() {
        console.log(this.datePipe.transform(this.date, 'EEEE'));
        this.slotChosen = undefined;
        this.resourcesService.getAvailableSlotByDate(this.bookingTimeslotId, this.datePipe.transform(this.date, 'yyyy-MM-dd'))
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (timeslots: any) => {
                    console.log('TIMESLOTS FOR CHOSEN RS', timeslots);
                    this.chosenResourceTimeslots = timeslots;
                }
            })
    }

    close() {
        this.dialogRef.close();
    }

    save() {
        this.sharedExperienceForm.markAllAsTouched();
        if (this.sharedExperienceForm.valid) {
            const experienceObj = {
                ...this.sharedExperienceForm.value,
                startDate: this.datePipe.transform(this.date, 'yyyy-MM-dd'),
                startHour: this.slotChosen?.startHour,
                resourceId: this.resourceId,
                timeSlotReservation: {
                    itemsNumber: 1,
                    date: this.datePipe.transform(this.date, 'yyyy-MM-dd'),
                    hour: this.slotChosen?.startHour,
                    bookingTimeSlotId: this.bookingTimeslotId
                }
            }

            console.log('exp', experienceObj);

            this.sharedExperienceService.createSharedExperience(experienceObj)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe({
                    next: (res: { success: boolean, reason: string }) => {
                        console.log('dupa create', res);
                        if (res.success) {
                            this.toastService.showToast('Success', 'Your shared resource was created!', "success");
                            this.close();
                        }
                    }
                })
        }
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
