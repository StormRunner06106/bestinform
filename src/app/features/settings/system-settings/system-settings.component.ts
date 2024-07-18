import {DatePipe} from '@angular/common';
import {Component, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Observable, Subject, takeUntil} from 'rxjs';
import {DomainsService} from 'src/app/shared/_services/domains.service';
import {ModalMediaService} from 'src/app/shared/_services/modalmedia.service';
import {ResourcesService} from 'src/app/shared/_services/resources.service';
import {SystemSettingsService} from 'src/app/shared/_services/system-settings.service';
import {TemplatesService} from 'src/app/shared/_services/templates.service';
import {ToastService} from 'src/app/shared/_services/toast.service';
import {ResourceType} from "../../../shared/_models/resource-type.model";

@Component({
    selector: 'app-system-settings',
    templateUrl: './system-settings.component.html',
    styleUrls: ['./system-settings.component.scss'],
    providers: [ModalMediaService, DatePipe]

})
export class SystemSettingsComponent implements OnInit, OnDestroy {

    private ngUnsubscribe = new Subject<void>();

    healthDomId: string;
    travelDomId: string;
    cultureDomId: string;
    educationDomId: string;
    jobsDomId: string;

    eventsDomId: string;
    transportDomId: string;

    //cat de atribute
    categoriesList = [];
    resourceCategoryList = [];
    resourceTypesList = [];
    attributesList = [];
    domainList = [];

    //Forms
    systemSettingsForm: FormGroup;

    itineraryTransportResourceTypes = [];
    itineraryAccommodationResourceTypes = [];
    itineraryDayActivityResourceTypes = [];
    itineraryEatAndDrinksResourceTypes = [];
    itineraryEveningActivityResourceTypes = [];

    rentalBookingResourceTypes$: Observable<ResourceType[]>;
    menuResourceTypes$: Observable<ResourceType[]>;
    ticketBookingResourceTypes$: Observable<ResourceType[]>;

    //populate the form
    systemSettingsData: any;

    constructor(
        private settingsService: SystemSettingsService,
        private fb: FormBuilder,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private toastService: ToastService,
        private resourcesService: ResourcesService,
        private modalMediaService: ModalMediaService,
        private modalService: NgbModal,
        private domainService: DomainsService,
        private templatesService: TemplatesService,
    ) {
    }

    ngOnInit(): void {
        console.log('UNDEFINED?', this.systemSettingsData);
        this.initList();
        this.initForm();
    }

    initForm() {
        this.systemSettingsForm = this.fb.group({
            fitnessForum: this.fb.group({
                enable: [null],
                image: [null],
                nameRo: ['', [this.noWhitespaceValidator]],
                nameEn: ['', [this.noWhitespaceValidator]],
            }),
            medicalForum: this.fb.group({
                enable: [null],
                image: [null],
                nameRo: ['', [this.noWhitespaceValidator]],
                nameEn: ['', [this.noWhitespaceValidator]],
            }),
            nutritionForum: this.fb.group({
                enable: [null],
                image: [null],
                nameRo: ['', [this.noWhitespaceValidator]],
                nameEn: ['', [this.noWhitespaceValidator]],
            }),
            nutritionForumCategory: [''],
            fitnessForumCategory: [''],

            //trips & itineraries
            trip: this.fb.group({
                image: [null],
                enable: [null],
                nameRo: ['', [this.noWhitespaceValidator]],
                nameEn: ['', [this.noWhitespaceValidator]],
            }),
            tripOptions: this.fb.group({
                configuratorItinerary: this.fb.group({
                    image: [null],
                    enable: [null],
                    nameRo: ['', [this.noWhitespaceValidator]],
                    nameEn: ['', [this.noWhitespaceValidator]],
                }),
                itinerary: this.fb.group({
                    image: [null],
                    enable: [null],
                    nameRo: ['', [this.noWhitespaceValidator]],
                    nameEn: ['', [this.noWhitespaceValidator]],
                }),
                holidayOffer: this.fb.group({
                    image: [null],
                    enable: [null],
                    nameRo: ['', [this.noWhitespaceValidator]],
                    nameEn: ['', [this.noWhitespaceValidator]],
                }),
            }),//tripOptions

            journeyThemeCategoryId: [''],
            typeOfDestinationCategoryId: [''],
            typeOfJourneyCategoryId: [''],

            roadTripAttributeId: [''],

            itineraryTransportResourceTypes: [['']],
            itineraryAccommodationResourceTypes: [['']],
            itineraryEatAndDrinksResourceTypes: [['']],
            itineraryDayActivityResourceTypes: [['']],
            itineraryEveningActivityResourceTypes: [['']],

            //jobs
            // job: this.fb.group({
            //   image: [null],
            //   enable: [null],
            //   nameRo: ['',[this.noWhitespaceValidator]],
            //   nameEn: ['' ,[this.noWhitespaceValidator]],
            // }),
            //job option
            jobOptions: this.fb.group({
                myCv: this.fb.group({
                    image: [null],
                    enable: [null],
                    nameRo: ['', [this.noWhitespaceValidator]],
                    nameEn: ['', [this.noWhitespaceValidator]],
                }),
                jobOffers: this.fb.group({
                    image: [null],
                    enable: [null],
                    nameRo: ['', [this.noWhitespaceValidator]],
                    nameEn: ['', [this.noWhitespaceValidator]],
                }),
                candidates: this.fb.group({
                    image: [null],
                    enable: [null],
                    nameRo: ['', [this.noWhitespaceValidator]],
                    nameEn: ['', [this.noWhitespaceValidator]],
                }),
                myJobOffers: this.fb.group({
                    image: [null],
                    enable: [null],
                    nameRo: ['', [this.noWhitespaceValidator]],
                    nameEn: ['', [this.noWhitespaceValidator]],
                }),
            }),//job offers
            //shared exp
            sharedExperience: this.fb.group({
                image: [null],
                enable: [null],
                nameRo: ['', [this.noWhitespaceValidator]],
                nameEn: ['', [this.noWhitespaceValidator]],
            }),
            //Special Resources Category
            culinaryPreferencesId: [''],
            eventCategoryId: [''],
            transportCategoryId: [''],

            //others
            mode: [''],

            //payment Settings
            percentageLoyaltyPointsSpend: [0],
            percentageLoyaltyPointsGain: [0],
            percentageCommission: [0],

            //billing
            smartBillEmail: ['', [Validators.email]],
            smartBillToken: [''],
            smartBillFiscalCode: [''],

            //flights settings
            flightCommission:[0]

        });//systemSettingsForm

    }

    initList() {
        //lists for select
        this.getDomainList();
        this.getCategories();
        this.getAttributes();
        this.getAllResourceTypes();
        // this.getResourceTypes();
        // this.getItineraryResourceTypeWithName();

        //media
        this.listenToMedia();

        this.getSystemSettings();
    }

    getAttributes() {
        this.templatesService.listAttributesFiltered(0, -1, '', '', '', {})
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (res: any) => {
                    // TODO: nu cred ca requestul asta face ce trebuie, de intrebat - semnat Bogdanel
                    this.attributesList = res.content;
                }
            });
    }

    getAllResourceTypes() {
        this.rentalBookingResourceTypes$ = this.settingsService.getRentalBookingResourceTypes();
        this.menuResourceTypes$ = this.settingsService.getMenuResourceTypes();
        this.ticketBookingResourceTypes$ = this.settingsService.getTicketBookingResourceTypes();
    }

    //get itinerary with name list
    getItineraryResourceTypeWithName() {
        this.settingsService.getItineraryResourceTypeWithName()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (res: any) => {
                    this.itineraryTransportResourceTypes = res.itineraryTransportResourceTypes;
                    this.itineraryAccommodationResourceTypes = res.itineraryAccommodationResourceTypes;
                    this.itineraryEatAndDrinksResourceTypes = res.itineraryEatAndDrinksResourceTypes;
                    this.itineraryDayActivityResourceTypes = res.itineraryDayActivityResourceTypes;
                    this.itineraryEveningActivityResourceTypes = res.itineraryEveningActivityResourceTypes;
                }
            });
    }

    //get existent data, populate form
    getSystemSettings() {
        this.settingsService.getSystemSetting()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (systemData: any) => {
                    this.systemSettingsData = systemData;
                    console.log('SETARI SISTEM', this.systemSettingsData)
                    this.systemSettingsForm.patchValue(this.systemSettingsData);
                }
            });
    }

    //get domain list for category list
    getDomainList() {
        this.domainService.getListOfDomains()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (domains: any) => {
                    console.log(domains);
                    this.domainList = domains;
                    domains.forEach(domain => {
                        switch (domain.key) {
                            case ("travel"):
                                this.travelDomId = domain.id;
                                break;
                            case ("healthcare"):
                                this.healthDomId = domain.id;
                                break;
                            case (" culture"):
                                this.cultureDomId = domain.id;
                                break;
                            case("education"):
                                this.educationDomId = domain.id;
                                break;
                            case("jobs"):
                                this.jobsDomId = domain.id;
                                break;
                        }
                    });
                    this.getResourcesCategories();
                }
            });
    }

    //get resources cat for forum categories
    getResourcesCategories() {

        this.resourcesService.listCategoryFiltered(0, -1, '', '', {})
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (resCategory: any) => {
                    this.resourceCategoryList = resCategory.content;
                }
            });
    }

    //get attributes category
    getCategories() {
        const filter = {
            // domainId: "idDomain"
        }
        this.templatesService.getCategoryList(0, -1, '', '', filter)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (res: any) => {
                    this.categoriesList = res.content;
                }
            });
    }

    getResourceTypes() {
        this.resourcesService.getAllResourceTypes()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (resTypes: any) => {

                    this.resourceTypesList = resTypes
                    console.log('lista de tipuri de resurse', this.resourceTypesList);
                }
            })
    }

    //get media
    listenToMedia() {
        this.modalMediaService.currentImagesArray
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((array: any) => {
                if (array.length) {
                    if (array?.[0]?.for === 'medicalForum-featuredImg') {
                        console.log('test 1', array[0].selectedMedia)
                        this.systemSettingsForm.get('medicalForum.image').setValue(array[0].selectedMedia);
                    } else if (array?.[0]?.for === 'fitnessForum-featuredImg') {
                        this.systemSettingsForm.get('fitnessForum.image').setValue(array[0].selectedMedia);
                    } else if (array?.[0]?.for === 'nutritionForum-featuredImg') {
                        this.systemSettingsForm.get('nutritionForum.image').setValue(array[0].selectedMedia);
                    } else if (array?.[0]?.for === 'trip-featuredImg') {
                        this.systemSettingsForm.get('trip.image').setValue(array[0].selectedMedia);
                    } else if (array?.[0]?.for === 'configuratorItinerary-featuredImg') {
                        this.systemSettingsForm.get('tripOptions.configuratorItinerary.image').setValue(array[0].selectedMedia);
                    } else if (array?.[0]?.for === 'itinerary-featuredImg') {
                        this.systemSettingsForm.get('tripOptions.itinerary.image').setValue(array[0].selectedMedia);
                    } else if (array?.[0]?.for === 'holidayOffer-featuredImg') {
                        this.systemSettingsForm.get('tripOptions.holidayOffer.image').setValue(array[0].selectedMedia);
                    } else if (array?.[0]?.for === 'job-featuredImg') {
                        // this.systemSettingsForm.get('job.image').setValue(array[0].selectedMedia);
                    } else if (array?.[0]?.for === 'myCv-featuredImg') {
                        this.systemSettingsForm.get('jobOptions.myCv.image').setValue(array[0].selectedMedia);
                    } else if (array?.[0]?.for === 'jobOffers-featuredImg') {
                        this.systemSettingsForm.get('jobOptions.jobOffers.image').setValue(array[0].selectedMedia);
                    } else if (array?.[0]?.for === 'candidates-featuredImg') {
                        this.systemSettingsForm.get('jobOptions.candidates.image').setValue(array[0].selectedMedia);
                    } else if (array?.[0]?.for === 'myJobOffers-featuredImg') {
                        this.systemSettingsForm.get('jobOptions.myJobOffers.image').setValue(array[0].selectedMedia);
                    } else if (array?.[0]?.for === 'sharedExperience-featuredImg') {
                        this.systemSettingsForm.get('sharedExperience.image').setValue(array[0].selectedMedia);
                    }
                }
            });
    }

    //media modal
    openMedia(content: TemplateRef<unknown>) {
        // this.modalMediaService.sendImagesToService([this.domainImagesForm.value]);
        this.modalService.open(content, {centered: true, size: 'xl'});
    }

    updateSystemSettings(objForm) {
        this.settingsService.updateSystemSetting(objForm)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (res: any) => {
                    this.toastService.showToast("Success", "Setarile sistemului au fost modificate cu succes!", "success");
                    this.router.navigate(['../../dashboard'], {relativeTo: this.activatedRoute});
                },
                error: (err) => {
                    console.log(err);
                    this.toastService.showToast("Error", "Setarile sistemului nu au fost modificate!", "error");
                }
            });
    }

    //no white space validator
    noWhitespaceValidator(control) {
        const isWhitespace = (control && control.value && control.value.toString() || '').trim().length === 0;
        const isValid = !isWhitespace;
        return isValid ? null : {'whitespace': true};
    }

    saveSettings() {
        console.log('DE TRIMIS', this.systemSettingsForm.value);

        if (this.systemSettingsForm.valid) {
            this.updateSystemSettings(this.systemSettingsForm.value)

        } else {
            // Mark all inputs as touched
            this.systemSettingsForm.markAllAsTouched();
        }


    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

}
