import {Component, OnDestroy, OnInit} from '@angular/core';
import {StepperService} from "../../_services/stepper.service";
import {ResourcesService} from "../../_services/resources.service";
import {ResourcesService as DomainService} from "../../../../shared/_services/resources.service";
import {Subject, takeUntil} from "rxjs";

@Component({
    selector: 'app-stepper-title-list',
    templateUrl: './stepper-title-list.component.html',
    styleUrls: ['./stepper-title-list.component.scss']
})
export class StepperTitleListComponent implements OnInit, OnDestroy {

    selectedStep: number;
    stepTitleList: Array<{ id, stepName }>;
    stage: string;
    domain: string;
    category: string;
    resourceType: string;

    bookingType: string;

    private ngUnsubscribe = new Subject<void>();


    constructor(private stepperService: StepperService,
                private resourceService: ResourcesService,
                private domainService: DomainService) {
    }

    ngOnInit() {
        this.resourceService.getBookingType().subscribe({
            next: type => {this.bookingType = type;
            console.log('BOOKING TYPE', type)}
        })
        this.stepperService.getStepperStage().subscribe(
            {next: stage => {
                    this.stage = stage;
                    // console.log('sTEPPER title STAGE', this.stage)
                }
            }
        )

        // Listen To Step Changes
        this.stepperService.getStep().subscribe({
            next: step => this.selectedStep = step
        })

        // Listen To Title Steps Changes
        this.stepperService.getStepsTitle().subscribe({
            next: step => {
                if(this.stage === 'Configure/Edit' && this.bookingType !== 'culturalBooking'){
                    this.stepTitleList = step.filter(stepId => stepId.id !== 3)
                    console.log('din stepper title', step)
                }else{
                    this.stepTitleList = step
                }

            }
        })

        // if(this.resourceService.resourceId$.getValue()){
        //     console.log('STEPPER ON EDIT', this.resourceService.resourceTemplateType$.getValue());
        //     this.getDomain(this.resourceService.resourceTemplateData$.getValue().domain);
        //     this.getCategory(this.resourceService.resourceTemplateData$.getValue().categoryId);
        //     this.getResourceType(this.resourceService.resourceTemplateData$.getValue().resourceTypeId);
        // }else{
        //
        // }

        this.resourceService.getTemplateType()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
            next: template =>{
                console.log('TEMPLATE STEPPER', template);
                this.getDomain(template?.domain);
                this.getCategory(template?.categoryId);
                this.getResourceType(template?.resourceTypeId);
            }
        })

    }


    getDomain(domainId){
        this.domainService.getDomainById(domainId).subscribe({
            next:domain => {
                // console.log('dom', domain);
                this.domain = domain?.nameEn;

            }
        })
    }

    getCategory(categoryId){
        this.domainService.getResourceCategoryById(categoryId).subscribe({
            next: categ => {
                this.category = categ?.nameEn;
            }
        })
    }

    getResourceType(resType){
        this.domainService.getResourceTypeById(resType).subscribe({
            next: resType => {
                this.resourceType= resType?.nameEn;
            }
        })
    }

    goToStep(stepValue){
        this.stepperService.stepperStage$.next('Add');
        this.stepperService.step$.next(stepValue);
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
