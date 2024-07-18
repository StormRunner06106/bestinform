import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ResourceModel} from "../../../../_models/resource.model";
import {ResourcesService} from "../../../../_services/resources.service";
import {StepperService} from "../../../../_services/stepper.service";
import {SettingsService} from "../../../../../../shared/_services/settings.service";
import {SystemSettingsService} from "../../../../../../shared/_services/system-settings.service";
import { ResourcesService as DomainService } from "../../../../../../shared/_services/resources.service"
import {DomainsService} from "../../../../../../shared/_services/domains.service";
import {Observable} from "rxjs";
import {CanDeactivateGuard} from "../../../../../../shared/_services/can-deactivate-guard.service";
import {ActivatedRoute, NavigationStart, Router} from "@angular/router";
import {CreateResourceService} from "../../../../../../shared/_services/createResource.service";

@Component({
    selector: 'app-add-new-template',
    templateUrl: './add-new-template.component.html',
    styleUrls: ['./add-new-template.component.scss']
})
export class AddNewTemplateComponent implements OnInit {

    eventsId: string;
    transportId: string;
    categoriesToBeExcluded = [];

    /** Add Stage  - START */
    dataLoaded: boolean;
    step: number;
    providerData: any;

    // Form
    templateForm = new FormGroup({
        domain: new FormControl('', Validators.required),
        categoryId: new FormControl('', Validators.required),
        resourceTypeId: new FormControl('', Validators.required)
    })

    displayForm = new FormGroup({
        domain: new FormControl('', Validators.required),
        categoryId: new FormControl('', Validators.required),
        resourceTypeId: new FormControl('', Validators.required)
    })
    domain: any;
    category: any;
    resourceType: any;


    // Backend Data
    optionsList: ResourceModel[] = [];

    private routeSub: any;

    /** Add Stage  - END */

    constructor(private resourceService: ResourcesService, private stepperService: StepperService,
                private settingService: SystemSettingsService,
                private domainSv:DomainsService,
                private domainService: DomainService,
                private router: Router,
                private route: ActivatedRoute,
                private createResourceService: CreateResourceService) {
    }


    ngOnInit() {
    this.getEventCategId();
    this.getTransportCategId();
    this.getCategoriesId();
    this.providerData = this.createResourceService.providerData$.getValue();

        /*this.routeSub = this.router.events.subscribe((event) => {
            if (event instanceof NavigationStart) {
                // save your data
                if(this.templateForm.value.resourceTypeId){
                    this.stepperService.step$.next(2);
                }else if(this.templateForm.value.resourceTypeId){
                    this.stepperService.step$.next(1);
                }else if(this.templateForm.value.domain){
                    this.stepperService.step$.next(0);
                }


                this.dataForAddStage();

            }
        })*/

        // Listen to step changes
        this.stepperService.getStep().subscribe({
            next: stepNumber => this.step = stepNumber
        })

        this.dataForAddStage();

    }

    getDomain(domainId){
        this.domainSv.getDomainById(domainId).subscribe({
            next:domain => {
                this.domain = domain.nameEn;

            }
        })
    }

    getCategory(categoryId){
        this.domainService.getResourceCategoryById(categoryId).subscribe({
            next: categ => {
                this.category = categ.nameEn;
            }
        })
    }

    getResourceType(resType){
        this.domainService.getResourceTypeById(resType).subscribe({
            next: resType => {
                this.resourceType= resType.nameEn;
            }
        })
    }

    getEventCategId(){
        this.settingService.getSystemSetting().subscribe({
            next: (resp:any)=>{
                this.eventsId = resp.eventCategoryId;
            }
        })
    }

    getTransportCategId(){
        this.settingService.getSystemSetting().subscribe({
            next: (resp: any) => {
                this.transportId = resp.transportCategoryId;
            }
        })
    }

    getCategoriesId(){
        this.settingService.getSystemSetting().subscribe({
            next: (resp: any) => {
               this.categoriesToBeExcluded.push(resp.transportCategoryId);
               this.categoriesToBeExcluded.push(resp.eventCategoryId);

            }
        })
    }

    /** Get BackEnd Data for Options*/
    dataForAddStage() {

        console.log('add stage')
        // Data Loaded
        this.dataLoaded = false

        switch (this.step) {
            case 0:
                this.resourceService.getListOfDomains().subscribe({
                    next: (data: any) => {
                        this.optionsList = data.filter(domain => domain.nameEn !== 'Jobs Market');

                        this.templateForm.patchValue({
                            domain: this.templateForm.value.domain.length > 0 ? this.templateForm.value.domain : data[0].id
                        })

                        this.getDomain(this.templateForm.value.domain);
                        // Data Loaded
                        this.dataLoaded = true;
                        console.log(this.templateForm.get('domain'))
                    },
                    error: (error) => console.log(error)

                })
                break
            case 1:
                this.resourceService.getAllResourceCategoriesByResourceDomain(this.templateForm.value.domain).subscribe({
                    next: (data: any) => {
                        this.optionsList = data;
                        this.categoriesToBeExcluded.forEach(id =>{
                            this.optionsList = this.optionsList.filter(categ => categ.id !== id);
                        })



                        this.getDomain(this.templateForm.value.domain);

                        this.templateForm.patchValue({
                            categoryId: this.templateForm.value.categoryId.length > 0 ? this.templateForm.value.categoryId : data[0].id
                        })
                        this.getCategory(this.templateForm.value.categoryId);
                        // Data Loaded
                        this.dataLoaded = true
                    },
                    error: (error) => console.log(error)
                })
                break
            case 2:
                this.resourceService.getAllResourceTypesByResourceCategory(this.templateForm.value.categoryId).subscribe({
                    next: (data: any) => {
                        this.optionsList = data;
                        this.getCategory(this.templateForm.value.categoryId);


                        this.templateForm.patchValue({
                            resourceTypeId: this.templateForm.value.resourceTypeId.length > 0 ? this.templateForm.value.resourceTypeId : data[0].id
                        })
                        this.getResourceType(this.templateForm.value.resourceTypeId);

                        // Data Loaded
                        this.dataLoaded = true
                    },
                    error: (error) => console.log(error)
                })
                break
            case 3:
                // Add Template Type Object
                this.resourceService.addTemplate(this.templateForm.value)

                break
            default:
                this.optionsList = []
        }
    }

    goToStep(value){
        this.stepperService.step$.next(value);
        this.dataForAddStage();
    }



    /** Go to next step*/
    nextStep() {
        this.stepperService.nextStep()
    }

    /** Go to previous step*/
    prevStep() {
        this.stepperService.prevStep()
    }

    checkIfFirstStep() {
        if (this.step === 0) {
            void this.router.navigate(['../list'], {relativeTo: this.route});
            return;
        }

        this.prevStep();
        this.dataForAddStage();
    }
}
