import {ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {forkJoin, Observable, of, startWith, Subject, switchMap, throwError} from "rxjs";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {MatLegacyChipInputEvent as MatChipInputEvent} from "@angular/material/legacy-chips";
import {catchError, map, takeUntil} from "rxjs/operators";
import {
    MatLegacyAutocompleteSelectedEvent as MatAutocompleteSelectedEvent
} from "@angular/material/legacy-autocomplete";
import * as moment from "moment";
import {Resource} from "../../../shared/_models/resource.model";
import {EventsService} from "../../../shared/_services/events.service";
import {ToastService} from "../../../shared/_services/toast.service";
import {SystemSettingsService} from "../../../shared/_services/system-settings.service";
import {SystemSetting} from "../../../shared/_models/system-setting.model";
import {ResourcesService} from "../../../shared/_services/resources.service";
import {ResourceType} from "../../../shared/_models/resource-type.model";
import {TranslateService} from "@ngx-translate/core";
import {TemplatesService} from "../../../shared/_services/templates.service";
import {Template} from "../../resource-templates/_models/template.model";
import {TemplateFilterModel} from "../../../shared/_models/template-filter.model";
import {Category} from "../../../shared/_models/category.model";
import {DatePipe} from "@angular/common";
import {UserDataService} from 'src/app/shared/_services/userData.service';
import {
    AddEditTicketComponent
} from "../../resources/components/stepper-content/configurate-edit/setup/ticket-booking/add-edit-ticket/add-edit-ticket.component";
import {MatDialog} from "@angular/material/dialog";
import {
    DeleteTicketComponent
} from "../../resources/components/stepper-content/configurate-edit/setup/ticket-booking/delete-ticket/delete-ticket.component";
import {AddEditEventTicketComponent} from "../components/add-edit-event-ticket/add-edit-event-ticket.component";
import {EventTicketService} from "../_services/event-ticket.service";
import {DeleteEventTicketComponent} from "../components/delete-event-ticket/delete-event-ticket.component";
import {LocationService} from "../../../shared/_services/location.service";
import {CreateResourceService} from "../../../shared/_services/createResource.service";
import {MatDatepicker, MatDatepickerInputEvent} from "@angular/material/datepicker";

@Component({
    selector: 'app-add-edit-event',
    templateUrl: './add-edit-event.component.html',
    styleUrls: ['./add-edit-event.component.scss'],
    providers: [DatePipe]
})
export class AddEditEventComponent implements OnInit, OnDestroy {
    displayedResourcesColumns = ['title', 'address', 'category', 'purchase', 'status', 'actions'];
    pageNumberChoose: number;
    pageSizeChoose: number;
    dataSourceChoose = [];
    filterTitleChoose: string;

    dataSourceRelated = [];
    pageNumberRelated: number;
    pageSizeRelated: number;
    totalElementsRelated: number;

    resToBeAdded = [];

    pageSizeArray = [10, 25, 100];
    sorting = "date";
    dir = 'desc';
    totalElements: number;

    // information about filters and pagination
    paginationInfo: any;


    isEditMode: boolean;
    ticketList = [];
    countries = [];
    cities = [];

    // images url and files
    thumbnailUrl = {
        fileName: undefined,
        filePath: undefined
    };
    thumbnailFile: Blob;
    galleryUrls = [];
    galleryFiles = [];

    $fileObservables: Observable<object>[] = [];

    minDate: string;
    categoryEvent: string;
    resourceTypes: Array<ResourceType>;

    // Material Chips
    separatorKeysCodes: number[] = [ENTER, COMMA];
    addOnBlur = true;
    benefitCtrl = new FormControl('');
    benefits = [];
    filteredBenefits: Observable<string[]>;
    allBenefits: string[] = ['Parcare gratuita', 'Aer conditionat', 'Bauturi gratis', 'Cabina foto', 'Candy bar'];

    eventData: Resource;
    eventForm: FormGroup;
    allowedToSubmitEvent = true;
    emptyEventData: Resource = {
        title: '',
        slug: '',
        description: '',
        categoryId: '634fa85b74d11420d8f572d6',
        domain: ''
    };

    domainIdForEventCategory: string;
    currentLanguage: string;
    slugSuggestion: string;
    currentTemplateId: string;
    template: Template;
    tabs: any;
    bookingTypeForCurrentTemplate: string;

    //check the users role
    isAdmin: boolean;
    isStaff: boolean;
    isProvider: boolean;

    attributesArray: any;

    form = new FormGroup({
        title: new FormControl('')
    });

    geographicalCoordinates: FormGroup;

    providerData: {
        providerId: string,
        companyName: string,
        cui: string
    }

    currentDay = moment();
    nextDay = this.currentDay.clone().add(1, 'days');


    @ViewChild('benefitInput') benefitInput: ElementRef<HTMLInputElement>;
    private ngUnsubscribe = new Subject<void>();
    userAcceptedTerms: any;

    eventCategoryId;
    jobCategoryId;

    tripsItinObj: {
        journeyThemeCategoryId: string,
        typeOfDestinationCategoryId: string,
        typeOfJourneyCategoryId: string
    }

    tripsAndItineraries = [];

    constructor(private route: ActivatedRoute,
                private router: Router,
                private fb: FormBuilder,
                private eventsService: EventsService,
                private toastService: ToastService,
                private systemSettingsService: SystemSettingsService,
                private resourceService: ResourcesService,
                private translate: TranslateService,
                private templatesService: TemplatesService,
                private datePipe: DatePipe,
                private usersService: UserDataService,
                private ticketService: EventTicketService,
                public dialog: MatDialog,
                private locationService: LocationService,
                private createResourceService: CreateResourceService,
                private systemService: SystemSettingsService,
                private resourcesService: ResourcesService) {

        this.filteredBenefits = this.benefitCtrl.valueChanges.pipe(
            startWith(null),
            map((fruit: string | null) => (fruit ? this._filter(fruit) : this.allBenefits.slice())),
        );
    }


    ngOnInit(): void {
        this.runAfterAsyncOperations();

        this.checkTermsAndConditions();
        this.getCountries();
        this.pageSizeChoose = 10;
        this.pageNumberChoose = 1;

        this.pageNumberRelated = 1;
        this.pageSizeRelated = 10;

        this.resToBeAdded = [];

        this.currentLanguage = this.translate.currentLang;
        this.translate.onLangChange
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    this.currentLanguage = res.lang;
                }
            });

        this.createResourceService.providerData().subscribe({
            next: providerData => {
                console.log('PROVIDER DATA', providerData);
                if (providerData) {
                    this.providerData = providerData;
                }

            }
        })

        this.initFormGroup();
        this.getEventData();
        this.getResourceCategories();
        this.ticketsList();

        // this.applyFilterForRelatedRes();
    }

    user: any;

    getEventCategoryId(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.systemService.getSystemSetting().subscribe({
                next: (resp: SystemSetting) => {
                    this.eventCategoryId = resp.eventCategoryId;
                    console.log('RES SETTINGS', resp);
                    console.log('id categorie event', this.eventCategoryId);
                    resolve(); // Resolve the promise once the operation is complete
                },
                error: err => {
                    reject(err); // Reject the promise if there's an error
                }
            });
        });
    }

    getTripsAndItinerariesIds(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.systemService.getSystemSetting().subscribe({
                next: (resp: SystemSetting) => {
                    // this.eventCategoryId = resp.eventCategoryId;
                    console.log('RES SETTINGS for trips itin', resp);
                    this.tripsAndItineraries.push(resp?.journeyThemeCategoryId);
                    this.tripsAndItineraries.push(resp?.typeOfDestinationCategoryId);
                    this.tripsAndItineraries.push(resp?.typeOfJourneyCategoryId);

                    this.tripsItinObj = {
                        journeyThemeCategoryId: resp?.journeyThemeCategoryId,
                            typeOfDestinationCategoryId: resp?.typeOfDestinationCategoryId,
                            typeOfJourneyCategoryId: resp?.typeOfJourneyCategoryId
                    }
                    resolve(); // Resolve the promise once the operation is complete
                },
                error: err => {
                    reject(err); // Reject the promise if there's an error
                }
            });
        });
    }

    getJobCategoryId(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.resourcesService.getListOfDomains().subscribe({
                next: (domains: any) => {
                    domains.forEach(domain => {
                        if (domain.key === 'jobs') {
                            this.resourcesService.listCategoryFiltered(0, 1, null, null, { domainId: domain.id })
                                .subscribe({
                                    next: (category: any) => {
                                        this.jobCategoryId = category.content[0].id;
                                        resolve(); // Resolve the promise once the operation is complete
                                    },
                                    error: err => {
                                        reject(err); // Reject the promise if there's an error
                                    }
                                });
                        }
                    });
                }
            });
        });
    }

    getCurrentUser(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.usersService.getCurrentUser().subscribe({
                next: (response: any) => {
                    this.user = response;
                    if (response.roles.includes('ROLE_PROVIDER')) {
                        this.isProvider = true;
                    }

                    if (response.roles.includes('ROLE_STAFF')) {
                        this.isStaff = true;
                    }

                    if (response.roles.includes('ROLE_SUPER_ADMIN')) {
                        this.isAdmin = true;
                    }

                    resolve(); // Resolve the promise once the operation is complete
                },
                error: err => {
                    reject(err); // Reject the promise if there's an error
                }
            });
        });
    }


    async runAfterAsyncOperations() {
        try {
            await this.getEventCategoryId();
            await this.getJobCategoryId();
            await this.getCurrentUser();
            await this.getTripsAndItinerariesIds();

            //  async operations are complete, you can now call the next function
            this.applyFilter();

        } catch (error) {
            console.error('Error occurred:', error);
        }
    }



    initFormGroup() {
        this.eventForm = this.fb.group({
            title: ['', Validators.required],
            slug: [''],
            shortDescription: ['', Validators.required],
            description: ['', Validators.required],
            categoryId: this.categoryEvent,
            resourceTypeId: [null, Validators.required],
            domain: this.domainIdForEventCategory,
            address: [null, Validators.required],
            country: [null, Validators.required],
            city: [null, Validators.required],
            geographicalCoordinates: this.geographicalCoordinates = this.fb.group({
                latitude: [null],
                longitude: [null]
            }),
            status: ['Draft'],
            attributes: this.attributesArray,
            bookingType: this.bookingTypeForCurrentTemplate,
            startDate: [null, Validators.required],
            endDate: [null, Validators.required],
            filterTitleChoose: ['']

        });
    }

    getResourceCategories() {
        this.systemSettingsService.getSystemSetting().subscribe((setting: SystemSetting) => {
            console.log('sys set eveniment categ', setting.eventCategoryId);
            this.categoryEvent = setting.eventCategoryId;
            this.getDomain(setting.eventCategoryId);
            this.resourceService.getAllResourceTypesByResourceCategory(setting.eventCategoryId).subscribe((resourceTypes: Array<ResourceType>) => {
                console.log('restypes', resourceTypes);
                this.resourceTypes = resourceTypes;
            })
        })
    }

    getDomain(idCategory: string) {
        console.log('id categ', idCategory)
        this.resourceService.getResourceCategoryById(idCategory).subscribe((category: Category) => {
            console.log('category', category);
            this.domainIdForEventCategory = category.domainId;
        })
    }

    selectedResourceType(value) {
        // console.log('res value',value);
        const filterObj = {
            resourceTypeId: value
        }
        this.tabs = [];

        this.templatesService.listResourceTemplateFiltered(0, -1, '', '', filterObj)
            .subscribe((template: TemplateFilterModel) => {
                    if (template.content.length === 1) {
                        this.currentTemplateId = template.content[0].id;
                        this.template = template.content[0];
                        console.log('TEMPLATE', template.content[0]);
                        this.bookingTypeForCurrentTemplate = template.content[0].bookingType;
                        this.getTemplateData();
                    }
                }
            )
    }

    getTemplateData() {
        this.resourceService.getAttributesFromTemplate(this.currentTemplateId).subscribe((attributeTabs: any) => {
            console.log('array cu taburile de atribute', attributeTabs);
            if(this.isEditMode){
                this.compareAttributes(this.eventData.attributes, attributeTabs);
                this.tabs.forEach(tab => {
                    this.createForm(tab);
                })
            }else{
                this.tabs = attributeTabs;
                attributeTabs.forEach((attributeTab: any) => {
                    this.createForm(attributeTab);
                    console.log('attr tab', attributeTab)
                })
            }

        })
    }

    compareAttributes(eventAttr, templateAttributes){

        this.tabs = [];
        // console.log('res', eventAttr);
        // console.log('temp', templateAttributes);

        templateAttributes.forEach(templateTab => {
            eventAttr.forEach(resourceTab => {
                        //verify if you are in the same tab
                        if (templateTab.tabName === resourceTab.tabName) {
                            const array = [];
                            templateTab.tabAttributes.forEach(templateAttribute => {
                                    if (resourceTab.tabAttributes?.length > 0) {
                                        resourceTab.tabAttributes.forEach(resourceAttribute => {
                                            //see if the attributes have the same id
                                            if (templateAttribute.id === resourceAttribute.attributeId) {
                                                //if they have the same id and the attribute is not already in the array
                                                const attributeIndex = array.findIndex(attr => attr.id === templateAttribute.id);
                                                if (attributeIndex === -1) {
                                                    //push the attribute from template adding the value from resource
                                                    array.push({
                                                        ...templateAttribute,
                                                        attributeValue: resourceAttribute.attributeValue
                                                    })

                                                }

                                            } else {
                                                //if the attributes dont have the same id, see if you can find it in the resource

                                                const find = resourceTab.tabAttributes.find(attr => attr.attributeId === templateAttribute.id);
                                                const attributeIndex = array.findIndex(attr => attr.id === templateAttribute.id);
                                                //if the attribute isnt on the resource and it isnt on the array
                                                if (attributeIndex === -1 && !find) {
                                                    //push the attribute with no value
                                                    // console.log('template attr not found', templateAttribute)
                                                    array.push({
                                                        ...templateAttribute,
                                                        attributeValue: ''
                                                    })
                                                }
                                            }


                                        })
                                    } else {
                                        const attributeIndex = array.findIndex(attr => attr.id === templateAttribute.id);
                                        if (attributeIndex === -1) {
                                            //push the attribute with no value
                                            // console.log('template attr not found', templateAttribute)
                                            array.push({
                                                ...templateAttribute,
                                                attributeValue: ''
                                            })
                                        }
                                    }


                                }
                            )

                            this.tabs.push({
                                tabName: templateTab.tabName,
                                tabAttributes: array
                            })

                        }

                    }
                )

                //after combining the resource attributes with the template attributes, see if you have all the template tabs
                const findTab = this.tabs.find(section => templateTab.tabName === section.tabName);
                // console.log('find tab',findTab);
                //if not, add the tab with the name of the missing one and an empty array
                if (!findTab) {
                    this.tabs.push({
                        tabName: templateTab.tabName,
                        tabAttributes: []
                    })
                }
            }
        )

    }


    createForm(tab) {
        // console.log('CREATE FORM', tab);
        for (let inputField of tab.tabAttributes) {
            // console.log('CREATE INPUT', inputField);
            if (inputField.valueType === 'toggle') {
                this.form.addControl(inputField.name, new FormControl(inputField.attributeValue ? inputField.attributeValue : 'false'));
            }else if(inputField.valueType === 'multiple-select'){
                // console.log('MULTIPLE SELECT', this.isEditMode, inputField.attributeValue.split(','));
                this.form.addControl(inputField.name, new FormControl(inputField.attributeValue ? inputField.attributeValue.split(',') : []));
            }
            this.form.addControl(inputField.name, new FormControl(inputField.attributeValue ? inputField.attributeValue : '', inputField.propertyRequired ? Validators.required : null));
        }

        // console.log('form', this.form.value);
    }

    // get event data data if in edit mode, else load empty event data
    getEventData() {
        this.route.paramMap.pipe(
            switchMap((params: any) => {
                if (params.get('id')) {
                    this.isEditMode = true;
                    this.ticketService.eventId$.next(params.get('id'));
                    return this.eventsService.getResourceById(params.get('id'));
                } else {
                    this.isEditMode = false;
                    this.resToBeAdded = [];
                    return of(this.emptyEventData);
                }
            })
        ).subscribe((event: Resource) => {
            this.eventData = event;
            console.log('EVENT', this.eventData);
            this.eventForm.patchValue(event);
            // this.totalElementsRelated = event.relatedResources.length;
            if(event.relatedResources?.length > 0){
                this.getRelatedResource(event.relatedResources[0]);
            }

            if (this.eventForm.value.resourceTypeId) {
                this.geographicalCoordinates.patchValue(event.geographicalCoordinates);

                this.selectedResourceType(this.eventForm.value.resourceTypeId);
                for (let attributeTab of event.attributes) {
                    this.createForm(attributeTab);
                    console.log('attr tabs for edit', attributeTab);
                }
            }


            if (this.isEditMode) {
                if(event.country){
                    console.log('event country', event.country)
                    this.getCities(event.country);
                }
                this.thumbnailUrl = Object.assign({}, event.featuredImage);
                this.galleryUrls = Object.assign([], event.images);
                // console.log(this.galleryUrls);
                if (!event.featuredImage) {
                    this.thumbnailUrl = {
                        fileName: undefined,
                        filePath: undefined
                    };
                }
            }

        });
    }

    // getRelatedResources(relatedResourcesIds){
    //     if(this.resToBeAdded.length < relatedResourcesIds.length) {
    //         relatedResourcesIds.forEach(resource => {
    //             this.eventsService.getResourceById(resource)
    //                 .pipe(takeUntil(this.ngUnsubscribe))
    //                 .subscribe({
    //                     next: res => {
    //                         this.addToRelatedRes(res);
    //                     }
    //                 })
    //         })
    //     }
    // }

    getRelatedResource(relatedResourcesId){
        this.eventsService.getResourceById(relatedResourcesId)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    this.addToRelatedRes(res);
                }
            })

    }

    removeBenefit(benefit: string): void {
        const index = this.benefits.indexOf(benefit);

        if (index >= 0) {
            this.benefits.splice(index, 1);
        }
    }

    addBenefit(event: MatChipInputEvent): void {
        console.log(event);
        // Add our benefit
        // if (value) {
        //   this.benefits.push(value);
        // }

        // Clear the input value
        event.chipInput.clear();
        //this.benefitCtrl.setValue(null);

        // console.log(this.benefits);
        console.log(this.benefits);
    }

    selected(event: MatAutocompleteSelectedEvent): void {
        this.benefits.push(event.option.viewValue);
        // this.benefitInput.nativeElement.value = '';
        this.benefitCtrl.setValue(null);
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();

        return this.allBenefits.filter(benefit => benefit.toLowerCase().includes(filterValue));
    }

    submitEvent() {
        if (!this.allowedToSubmitEvent) return;

        this.allowedToSubmitEvent = false;

        console.log('valorile eventului',this.eventForm.value);
        /*console.log(this.benefits);
        console.log(this.thumbnailUrl);
        console.log(this.galleryUrls);*/
        this.makeAttributesForm();
        this.eventForm.markAllAsTouched();

        if (this.eventForm.valid) {

            if (this.isEditMode) {
                this.eventForm.get('domain').setValue(this.domainIdForEventCategory);
                this.eventForm.get('categoryId').setValue(this.categoryEvent);
                this.eventForm.get('attributes').setValue(this.attributesArray);
                this.eventForm.get('bookingType').setValue(this.bookingTypeForCurrentTemplate);
                console.log('value', this.eventForm.value);

                const formToSend = {
                    ...this.eventData,
                    ...this.eventForm.value,
                    startDate: this.datePipe.transform(this.eventForm.value.startDate, 'yyyy-MM-dd') + 'T' + this.datePipe.transform(this.eventForm.value.startDate, 'HH:mm') + 'Z',
                    endDate: this.datePipe.transform(this.eventForm.value.endDate, 'yyyy-MM-dd') + 'T' + this.datePipe.transform(this.eventForm.value.endDate, 'HH:mm') + 'Z'

                };

                console.log('FORM TO SEND',formToSend);
                // console.log(this.eventData);
                this.eventsService.updateResource(this.eventData.id, formToSend).subscribe((res: any) => {
                    console.log(res);
                    if (res.success) {

                        //tickets
                        if (this.ticketService.ticketsList$.getValue().length > 0) {
                            const ticketsList = this.ticketService.ticketsList$.getValue();
                            ticketsList.forEach(ticket => {
                                if (ticket.state === 'add') {
                                    this.$fileObservables.push(this.ticketService.createTicket(this.eventData.id, ticket));
                                } else if (ticket.state === 'update') {
                                    this.$fileObservables.push(this.ticketService.updateTicket(ticket.id, ticket));
                                }
                            })
                        }

                        if (this.ticketService.deleteArray$.getValue().length > 0) {
                            const deleteTicketsArray = this.ticketService.deleteArray$.getValue();
                            deleteTicketsArray.forEach(ticket => {
                                this.$fileObservables.push(this.ticketService.deleteTicket(ticket.id));
                            })
                        }

                        if (this.thumbnailFile) {
                            const thumbnailData = new FormData();
                            thumbnailData.append('file', this.thumbnailFile);
                            // if(this.thumbnailFile !==undefined){
                                this.$fileObservables.push(this.eventsService.uploadResourceImage(this.eventData.id, thumbnailData));
                            // }else if(this.thumbnailFile ===undefined){
                            //     this.$fileObservables.push(this.eventsService.deleteResourceFeatureImage(this.eventData.id));
                            // }
                        }

                        if (this.galleryFiles.length > 0) {
                            const imagesData = new FormData();
                            this.galleryFiles.forEach(galleryFile => {
                                imagesData.append('files', galleryFile);
                            });
                            this.$fileObservables.push(this.eventsService.uploadDocAttachements(this.eventData.id, 'image', imagesData));
                        }

                        // if(this.dataSourceRelated){
                        //     const resourcesToAdd = [];
                        //     this.dataSourceRelated.forEach(resource => {
                        //             resourcesToAdd.push(resource.id);
                        //     })
                        //
                        //     // this.$fileObservables.push(this.eventsService.addRelatedresources(this.eventData.id,resourcesToAdd));
                        //
                        // }

                        if(this.resToBeAdded.length > 0 &&  this.eventData?.relatedResources?.length > 0){
                            if(this.resToBeAdded[0].id === this.eventData.relatedResources[0]){
                                // nu fac nimic
                            }else{
                                this.$fileObservables.push(this.eventsService.removeRelatedResource(this.eventData.id, this.eventData.relatedResources[0]));
                                this.$fileObservables.push(this.eventsService.addRelatedresources( this.resToBeAdded[0].id, this.eventData.id));
                            }
                        }else if(this.resToBeAdded?.length === 0 && this.eventData?.relatedResources?.length > 0){
                            this.$fileObservables.push(this.eventsService.removeRelatedResource(this.eventData.id, this.eventData?.relatedResources[0]));
                        } else if(this.resToBeAdded.length > 0 && (this.eventData?.relatedResources === null || this.eventData?.relatedResources.length === 0)) {
                            this.$fileObservables.push(this.eventsService.addRelatedresources( this.resToBeAdded[0].id, this.eventData.id));
                        }

                        if (this.$fileObservables.length > 0) {
                            forkJoin(...this.$fileObservables).subscribe((forkRes: any) => {
                                this.toastService.showToast('succes', 'Eveniment modifcat cu succes', 'success');
                                this.router.navigate(['../../list'],  { relativeTo: this.route });
                                this.ticketService.ticketsList$.next([]);
                                this.ticketService.refreshTicketList$.next(false);
                                this.ticketService.eventId$.next(undefined);
                                this.ticketService.deleteArray$.next([]);
                            }, () => {
                                this.allowedToSubmitEvent = true;
                                this.toastService.showToast('Eroare', 'Eroare de la server', 'error');
                            });
                        } else {
                            this.toastService.showToast('succes', 'Eveniment modifcat cu succes', 'success');
                            this.router.navigate(['../../list'],  { relativeTo: this.route });
                        }
                    } else {
                        this.toastService.showToast('Eroare', 'Eroare de la server', 'error');
                    }
                }, error => {
                    this.allowedToSubmitEvent = true;
                    this.toastService.showToast('Eroare', 'Eroare de la server', 'error');
                });

            }
            else {
                this.eventForm.get('domain').setValue(this.domainIdForEventCategory);
                this.eventForm.get('categoryId').setValue(this.categoryEvent);
                this.eventForm.get('attributes').setValue(this.attributesArray);
                this.eventForm.get('bookingType').setValue(this.bookingTypeForCurrentTemplate);
                const formToSend = {
                    ...this.eventForm.value,
                    startDate: this.datePipe.transform(this.eventForm.value.startDate, 'yyyy-MM-dd') + 'T' + this.datePipe.transform(this.eventForm.value.startDate, 'HH:mm') + 'Z',
                    endDate: this.datePipe.transform(this.eventForm.value.endDate, 'yyyy-MM-dd') + 'T' + this.datePipe.transform(this.eventForm.value.endDate, 'HH:mm') + 'Z'

                }
                console.log('value', formToSend);
                const providerId = (this.createResourceService.providerData$.getValue()?.providerId && (this.isStaff || this.isAdmin)) ? this.createResourceService.providerData$.getValue().providerId : null;
                this.eventsService.addResource(this.eventForm.value, providerId).subscribe((res: { success: boolean, reason: string }) => {
                        console.log(res);
                        if (res.success) {

                            //add tickets
                            if (this.ticketService.ticketsList$.getValue().length > 0) {
                                const ticketList = this.ticketService.ticketsList$.getValue();
                                ticketList.forEach(ticket => {
                                    this.$fileObservables.push(this.ticketService.createTicket(res.reason, ticket));
                                })
                            }

                            if (this.thumbnailFile) {
                                const thumbnailData = new FormData();
                                thumbnailData.append('file', this.thumbnailFile);
                                this.$fileObservables.push(this.eventsService.uploadResourceImage(res.reason, thumbnailData));

                            }


                            if (this.galleryFiles.length > 0) {
                                const imagesData = new FormData();
                                this.galleryFiles.forEach(galleryFile => {
                                    imagesData.append('files', galleryFile);
                                });
                                this.$fileObservables.push(this.eventsService.uploadDocAttachements(res.reason, 'image', imagesData));
                            }

                            // if(this.dataSourceRelated.length > 0){
                            //     const resourceIds = [];
                            //     this.dataSourceRelated.forEach(res => {
                            //         resourceIds.push(res.id);
                            //     })
                            //     this.$fileObservables.push(this.eventsService.addRelatedresources(res.reason, resourceIds));
                            // }

                            if(this.resToBeAdded.length > 0){
                                this.$fileObservables.push(this.eventsService.addRelatedresources(this.resToBeAdded[0].id, res.reason ));
                            }


                            if (this.$fileObservables.length > 0) {
                                console.log('avem si alte chestii de rulat');
                                forkJoin(...this.$fileObservables).subscribe(() => {
                                    this.toastService.showToast('succes', 'Eveniment adaugat cu succes', 'success');
                                    // this.router.navigate(['/private/staff/events/list']);
                                    this.ticketService.ticketsList$.next([]);
                                    this.ticketService.eventId$.next(undefined);
                                    if (this.isAdmin) {
                                        console.log('sunt admin dc nu plec');
                                        this.router.navigate(['/private/admin/events/list']);
                                    } else if (this.isStaff) {
                                        this.router.navigate(['/private/staff/events/list']);

                                    } else if (this.isProvider) {
                                        this.router.navigate(['/private/provider/events/list']);

                                    } else {
                                        console.log('ce sunt? nu admin dc nu plec');

                                        return;
                                    }

                                }, error => {
                                    console.log(error);
                                    this.allowedToSubmitEvent = true;
                                    this.toastService.showToast('Eroare', 'Eroare de la server', 'error');
                                });
                            } else {
                                console.log('NU avem si alte chestii de rulat');

                                this.toastService.showToast('succes', 'Eveniment adaugat cu succes', 'success');

                                if (this.isAdmin) {
                                    this.router.navigate(['/private/admin/events/list']);
                                } else if (this.isStaff) {
                                    this.router.navigate(['/private/staff/events/list']);

                                } else if (this.isProvider) {
                                    this.router.navigate(['/private/provider/events/list']);

                                } else {
                                    return;
                                }
                            }
                        } else {
                            this.toastService.showToast('Eroare', 'Eroare de la server', 'error');
                        }
                    },
                    () => {
                        this.allowedToSubmitEvent = true;
                        this.toastService.showToast('Eroare', 'Eroare de la server', 'error');
                    });
            }

        } else {
            this.toastService.showToast('Eroare', 'Completati campurile obligatorii', 'error');
        }
    }

    onThumbnailChange(event) {
        if (event.target.files && event.target.files[0]) {
            this.thumbnailUrl.fileName = event.target.files[0].name;
            this.thumbnailFile = event.target.files[0];

            const reader = new FileReader();
            reader.onload = () => this.thumbnailUrl.filePath = reader.result;
            reader.readAsDataURL(this.thumbnailFile);
        }
    }

    removeThumbnail() {
        this.thumbnailUrl = {
            fileName: undefined,
            filePath: undefined
        };
        this.thumbnailFile = undefined;

        // this.eventsService.deleteResourceFeatureImage(this.eventData.id).subscribe((data:any)=>{
        //     console.log('imagine stearsa',data);
        // });

    }

    onImageChange(event, inputRef: HTMLInputElement) {
        if (event.target.files && event.target.files[0]) {
            this.galleryUrls.push({
                fileName: event.target.files[0].name,
                filePath: undefined
            });
            this.galleryFiles.push(event.target.files[0]);


            const reader = new FileReader();
            reader.onload = () => {
                this.galleryUrls[this.galleryUrls.length - 1].filePath = reader.result;
                inputRef.value = null;
            };
            reader.readAsDataURL(this.galleryFiles[this.galleryFiles.length - 1]);
        }
    }

    removeImage(index: number) {
        this.galleryUrls.splice(index, 1);
        this.galleryFiles.splice(index, 1);

        if (this.isEditMode && this.eventData.images.length > 0) {
            this.eventData.images.splice(index, 1);
        }
    }

    clearFormControl(formControl) {
        if (formControl === 'shortDescription') {
            this.eventForm.get(formControl).patchValue('');
            return;
        }

        this.eventForm.get(formControl).patchValue(this.emptyEventData[formControl]);
    }

    //create slug suggestion
    createSlug(title: string) {
        const insertedTitle = title.toLocaleLowerCase();
        this.slugSuggestion = insertedTitle.split(' ').join('-');
        console.log(this.slugSuggestion);
        this.eventForm.get("slug").patchValue(this.slugSuggestion);
        // this.cdr.detectChanges();
    }

    columnSize(size) {
        switch (size) {
            case 'full_row':
                return 'col-12'
            case 'half_row':
                return 'col-12 col-lg-6'
            default:
                return 'col-12'
        }
    }

    //Takes FORM values and creates attributes array
    makeAttributesForm() {
        this.attributesArray = [];
        console.log('make attrs', this.tabs)

        if (this.tabs?.length) {
            this.tabs.forEach((tab, indexTab: number) => {
                this.attributesArray.push({
                    tabName: tab.tabName,
                    tabAttributes: []
                });
                for (const control in this.form.controls) {
                    tab.tabAttributes.forEach((attribute) => {
                        if (attribute.name === control) {
                            this.attributesArray[indexTab].tabAttributes.push({
                                attributeId: attribute.id,
                                attributeValue: (attribute.valueType === 'datetime' ? this.datePipe.transform(this.form.get(control).value, "yyyy-MM-dd") : (attribute.valueType === 'multiple-select'? this.form.get(control).value.join() : this.form.get(control).value))
                            });
                        }
                    });
                }
            })
        }


        console.log('FORM OBJ', this.attributesArray);
    }


    // -------------------------------- TICKETS -----------------------------------

    openAddModal() {
        this.dialog.open(AddEditEventTicketComponent, {
            width: '1500px',
            height: '750px',
            data: undefined
        });
    }

    openEditModal(ticket) {
        this.dialog.open(AddEditEventTicketComponent, {
            width: '1500px',
            height: '750px',
            data: {
                ticket: ticket
            }
        });
    }

    openDeleteModal(ticket, index) {
        this.dialog.open(DeleteEventTicketComponent, {
            width: '720px',
            height: '400px',
            data: {
                ticket: ticket,
                index: index
            }
        });
    }

    ticketsList() {
        this.ticketService.ticketsList$.next([]);
        // this.ticketService.refreshTicketList$.next(false);

        if (this.ticketService.eventId$.getValue()) {
            this.ticketService.getTicketList(this.ticketService.eventId$.getValue())
                .subscribe({
                    next: (ticketList: any) => {
                        if (this.ticketService.ticketsList$.getValue().length === 0) {
                            this.ticketService.ticketsList$.next(ticketList);
                            this.ticketList = ticketList;
                        } else {
                            this.ticketList = ticketList;
                        }

                    }
                })
        }

        this.ticketService.refreshTicketListData()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: () => {
                    // Check if you are on EDIT Mode
                    if (this.ticketService.eventId$.getValue()) {
                        this.ticketList = this.ticketService.ticketsList$.getValue();
                    } else {
                        // Get Room List
                        this.ticketService.ticketListData().subscribe({
                            next: ticketList => {
                                this.ticketList = ticketList;
                            }
                        })

                    }
                }
            })
    }


    getCountries() {

        this.locationService.getAllCountries().subscribe({
            next: (countries: []) => {
                this.countries = countries;
            }
        })
    }


    getCities(event) {
        console.log('CITY', event)
        if (event?.value) {
            this.eventForm.get('geographicalCoordinates.latitude').patchValue(0);
            this.eventForm.get('geographicalCoordinates.longitude').patchValue(0);
        }

        const country = {
            country: event?.value ? event.value : event
        }

        if(country){
            this.locationService.getCityFilter(0, -1, null, null, country).subscribe({
                next: (cities: any) => {
                    console.log(cities);
                    this.cities = cities.content;
                }
            })
        }

    }

    getCoordinates(event) {
        const name = {
            name: event.value
        }
        if(name){
            this.locationService.getCityFilter(0, -1, null, null, name).subscribe({
                next: (city: any) => {
                    this.eventForm.get('geographicalCoordinates.latitude').patchValue(city.content[0].geographicalCoordinates.latitude);
                    this.eventForm.get('geographicalCoordinates.longitude').patchValue(city.content[0].geographicalCoordinates.longitude);
                }
            })
        }


    }

    applySort(event) {
        console.log(event);
        if (event.direction) {
            this.dir = event.direction;
        }
        this.applyFilter();
    }


    // list of resources from backend
    applyFilter(event?) {
        console.log('APPLY FILTER 1')

        const filterObject = {
            title: this.eventForm.value.filterTitleChoose !== '' ? this.eventForm.value.filterTitleChoose : null,
            userId: this.isProvider ? this.user.id : this.createResourceService.providerData$.getValue()?.providerId,
            excludedCategories: [this.eventCategoryId, this.jobCategoryId]
        }

        console.log('FILTER OBJ', filterObject)


        this.eventsService.listResourceFiltered(this.pageNumberChoose - 1, this.pageSizeChoose, this.sorting, this.dir, filterObject).subscribe((res: object) => {
            console.log('marimea paginii din apply FIlter', this.pageSizeChoose);
            this.paginationInfo = res;
            this.totalElements = res["totalElements"];
            this.dataSourceChoose = res["content"];
            console.log(this.resToBeAdded);

        });

        //get total number of elements
        // this.paginationInit(filterObject);

    }

    pageChanged(event) {
        this.pageNumberChoose = event.pageIndex + 1;
        this.pageSizeChoose = event.pageSize;
        this.applyFilter();
    }

    //End resources from backend

    //Related resources
    // applyFilterForRelatedRes(event?) {
    //     this.dataSourceRelated = [...this.resToBeAdded];
    //
    //     console.log('DIN EVENT', this.resToBeAdded)
    // }

    // pageChangedForRelatedRes(event) {
    //     console.log(event);
    //     this.pageNumberRelated = event.pageIndex + 1;
    //     this.pageSizeRelated = event.pageSize;
    //     this.applyFilterForRelatedRes();
    // }

    addToRelatedRes(resource) {
        console.log(resource)
        console.log(this.resToBeAdded)
        if(this.resToBeAdded.length > 0){
            this.toastService.showToast('Error', 'Exista deja o resursa asociata acestui eveniment!', "error");
        }else{
            this.resToBeAdded.push(resource);
        }
        // const resourcesFiltered = this.resToBeAdded.find(res => res.id === resource.id);
        // // console.log(resourcesFiltered);
        // if(resourcesFiltered){
        //     this.toastService.showToast('Error', 'Aceasta resursa este deja asociata!', "error");
        // }else if (!resourcesFiltered) {
        //     this.resToBeAdded.push(resource);
        //     // this.pageNumberRelated = this.resToBeAdded.length;
        //     // this.totalElementsRelated = this.resToBeAdded.length;
        //     // this.applyFilterForRelatedRes();
        // }
    }

    removeResource(resource){
        const resourceFiltered = this.dataSourceRelated.filter(res => res.id !== resource);
        console.log('REMOVE', resourceFiltered);
        this.resToBeAdded = [...resourceFiltered];
        this.totalElementsRelated = this.resToBeAdded.length;
        // this.applyFilterForRelatedRes();
    }

    removeRelatedResource(){
        this.resToBeAdded = [];
    }


    startDateChanged(event: MatDatepickerInputEvent<moment.Moment>, nextElementRef: MatDatepicker<moment.Moment>) {
        // TODO: min end date ramane blocat pe alta zi decat cea corecta
        /*this.nextDay = moment(event.value).clone().add(1, 'days');
        this.newAvailability.get('endDate').patchValue(this.nextDay);
        if (!moment(event.value).isSameOrAfter(this.nextDay, 'day')) return;*/
        nextElementRef.open();
    }

    endDateChanged(event: MatDatepickerInputEvent<moment.Moment>) {
        // this.nextDay = moment(event.value).clone();
    }

    checkTermsAndConditions(){
        this.usersService.getCurrentSetting()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
            next: (settings:any)=>{
                console.log('setari', settings);
                this.userAcceptedTerms=settings?.acceptTermsAndConditions;
            }
        });
    }

    ngOnDestroy() {
        this.createResourceService.providerData$.next(undefined);
    }

}
