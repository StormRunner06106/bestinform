import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {of, Subject, switchMap, take, takeUntil} from "rxjs";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DatePipe, NgTemplateOutlet} from "@angular/common";
import {NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import {Resource} from "../../../shared/_models/resource.model";
import {SharedExperiencesService} from "../../../shared/_services/shared-experiences.service";
import {after} from "node:test";
import {SharedExperience} from "../../../shared/_models/shared-experience.model";
import {ActivatedRoute, Router} from "@angular/router";
import {ResourcesService} from "../../../shared/_services/resources.service";
import {ToastService} from "../../../shared/_services/toast.service";
import moment from 'moment';

@Component({
    selector: 'app-create-shared-experience',
    templateUrl: './create-shared-experience.component.html',
    styleUrls: ['./create-shared-experience.component.scss'],
    providers: [DatePipe]
})
export class CreateSharedExperienceComponent implements OnInit, OnDestroy {

    private ngUnsubscribe = new Subject<void>();
    currentDay = moment();


    sharedExperienceForm: FormGroup;
    chosenResource: Resource;
    gotResource = false;
    sharedId : string;
    isEditMode = false;
    today=new Date();

    emptyData: SharedExperience = {
        name: '',
        slug: '',
        description: '',
        resourceType: '',
        resourceId: null

    }

    currentExperience: SharedExperience;

    @ViewChild('after') after: any;

    constructor(private fb: FormBuilder,
                private datePipe: DatePipe,
                private modalService: NgbModal,
                private sharedExperienceService: SharedExperiencesService,
                private route: ActivatedRoute,
                private resourceService: ResourcesService,
                private toastService: ToastService,
                private router: Router) {
    }

    ngOnInit() {
        this.gotResource = false;
        this.formInit();
        this.checkIfEdit();
    }

    formInit(){
        this.sharedExperienceForm = this.fb.group({
            name: [null, [Validators.required, this.noWhitespaceValidator]],
            description: [null],
            participantsMaxNumber: [0, Validators.min(0)],
            hasParticipantsLimit: [false],
            startDate: [null],
            startHour: [null],
            // endHour:[null,[Validators.required]],
            // endDate: [null, [Validators.required]],
            date: [null],
            hour: [null],
            bookingTimeSlotId: [null],
            dressCode: [null],
            resourceId: [null, Validators.required],
            place: [null],
            city: [null],
            country: [null]
        });
        // this.sharedExperienceForm.get('date').disable();
        // this.sharedExperienceForm.get('hour').disable();
    }

    noWhitespaceValidator(control) {
        const isWhitespace = (control && control.value && control.value.toString() || '').trim().length === 0;
        const isValid = !isWhitespace;
        return isValid ? null : { 'whitespace': true };
      }

      

    getResourceById(resourceId: string){
        this.resourceService.getResourceById(resourceId)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({next:(res:Resource)=>{
                this.chosenResource = res;
                }})
    }

    checkIfEdit(){
        this.route.paramMap.pipe(
            switchMap((params: any)=>{
                if(params.get('slug')){
                    this.isEditMode = true;
                    this.gotResource = true;
                    return this.sharedExperienceService.getSharedExperienceBySlug(params.get('slug'));
                }else {
                    this.isEditMode = false;
                    this.gotResource = false;
                    return of(this.emptyData);
                }
            })
        ).subscribe((experience: SharedExperience)=>{
            console.log('exp pe edit', experience);
            this.sharedExperienceForm.patchValue(experience);
            this.currentExperience = experience;
            this.sharedExperienceForm.get('hour').patchValue(experience.startHour);
            this.sharedExperienceForm.get('date').patchValue(this.datePipe.transform(experience.date, 'yyyy-MM-dd'));
            this.getResourceById(experience.resourceId);
        })
    }


    onEditClick(){
        this.sharedExperienceForm.markAllAsTouched();
        if(this.sharedExperienceForm.valid){
            this.sharedExperienceForm.value.startDate = this.datePipe.transform(this.sharedExperienceForm.value.startDate,'yyyy-MM-dd');
            // this.sharedExperienceForm.value.startDate = this.sharedExperienceForm.value.startDate._d;
            // console.log(this.sharedExperienceForm.value);
            const expToSend = {
                ...this.currentExperience,
                ...this.sharedExperienceForm.value
            }
            console.log('to send', expToSend);
            this.sharedExperienceService.updateSharedExperience(this.currentExperience.id, expToSend)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe({next: (res: {success: boolean, reason: string})=>{
                        console.log('dupa update', res);
                        if(res.success){
                            // this.openModal(this.after);
                            // this.sharedId= res.reason;
                            this.toastService.showToast('Success', 'Experienta impartasita a fost modificata!', 'success');
                            console.log('RUTA', this.route);
                            this.router.navigate([`../../lobby/${this.currentExperience.slug}`], {relativeTo: this.route});
                        }
                    }})
        }
    }

    onCreateClick(){
        this.sharedExperienceForm.markAllAsTouched();
        console.log(this.sharedExperienceForm.value)
        if(this.sharedExperienceForm.valid){
            const experienceObj = {
                ...this.sharedExperienceForm.value,
                timeSlotReservation: {
                    itemsNumber: 1,
                    date: this.sharedExperienceForm.value.date,
                    hour: this.sharedExperienceForm.value.hour,
                    bookingTimeSlotId: this.sharedExperienceForm.value.bookingTimeSlotId
                }
            }
            this.sharedExperienceForm.value.startDate = this.datePipe.transform(this.sharedExperienceForm.value.startDate,'yyyy-MM-dd');
            // this.sharedExperienceForm.value.startDate = this.sharedExperienceForm.value.startDate._d;
            console.log('SHARED EXP OBJ', experienceObj);
            this.sharedExperienceService.createSharedExperience(experienceObj)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe({next: (res: {success: boolean, reason: string})=>{
                    console.log('dupa create', res);
                    if(res.success){
                        this.openModal(this.after);
                        this.sharedId= res.reason;
                    }
                    }})
        }
    }

    openModal(content){
        this.modalService.open(content, {centered: true, size: 'xl'});
    }

    getResourceFromModal(event){
        console.log('EVENT',event);
        this.chosenResource = event;
        this.gotResource = true;
        this.sharedExperienceForm.patchValue({
            resourceId: event.id,
            city: event.city,
            country: event.country,
            place: event.address,
            date: event.chosenDate,
            hour: event.chosenSlot.startHour,
            startDate: event.chosenDate,
            startHour: event.chosenSlot.startHour,
            bookingTimeSlotId: event.bookingTimeslot
        })
        this.modalService.dismissAll();
    }

    clickDeletePlace(){
        this.gotResource= false;
        this.sharedExperienceForm.patchValue({
            resourceId: null,
            city: null,
            country: null,
            place: null,
            date: null,
            hour: null,
            bookingTimeSlotId: null
        })
        console.log(this.sharedExperienceForm.value);
    }


    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
