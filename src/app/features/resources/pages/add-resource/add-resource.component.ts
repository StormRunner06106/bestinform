import {Component, OnDestroy, OnInit} from '@angular/core';
import {ResourcesService} from "../../_services/resources.service";
import {ActivatedRoute, Router} from "@angular/router";
import {StepperService} from "../../_services/stepper.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {RentalBookingService} from "../../_services/rental-booking.service";
import {TicketsBookingService} from "../../_services/tickets-booking.service";
import {TimepickerService} from "../../_services/timepicker.service";
import {ProductListService} from "../../_services/product-list.service";
import {BookingTimeslotsService} from "../../_services/booking-timeslots.service";
import {SystemSettingsService} from "../../../../shared/_services/system-settings.service";
import {SystemSetting} from "../../../../shared/_models/system-setting.model";
import {BehaviorSubject, forkJoin, Observable, Subscription} from "rxjs";
import {ToastService} from "../../../../shared/_services/toast.service";
import {CreateResourceService} from "../../../../shared/_services/createResource.service";
import {UserDataService} from 'src/app/shared/_services/userData.service';
import {User} from 'src/app/shared/_models/user.model';
import {MenuService} from "../../_services/menu.service";
import * as moment from "moment/moment";


@Component({
    selector: 'app-add-resource',
    templateUrl: './add-resource.component.html',
    styleUrls: ['./add-resource.component.scss']
})
export class AddResourceComponent implements OnInit, OnDestroy {


    // Loader
    dataLoaded = false;
    isProviderAccepted: boolean;
    form: FormGroup = this.resourceService.generalInformationForm$.getValue();

    // Resource
    resourceType;

    // Stepper
    step: number;
    stepperStage: string;

    /** Configure/Edit Stage  - START */
    formSections: any = [];
    resourceId: string;
    resourceName: string;

    bookingType: string;

    /** Configure/Edit Stage  - END */

    templateForm = new FormGroup({
        domain: new FormControl('', Validators.required),
        categoryId: new FormControl('', Validators.required),
        resourceTypeId: new FormControl('', Validators.required)
    })

    $fileObservables: Observable<object>[] = [];
    isStaff: boolean;
    isAdmin: boolean;
    isProvider: boolean;

    currentResourceId: string;
    roomsArray: any;
    currentTemplateId: string;
    attributesFromTemplate: any;
    providerData: any;

    isSubmitLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    isSubmitLoading: boolean;
    private unsubscribe: Subscription[] = [];

    constructor(private resourceService: ResourcesService,
                private route: ActivatedRoute,
                private router: Router,
                private stepperService: StepperService,
                private roomService: RentalBookingService,
                private ticketService: TicketsBookingService,
                private timepickerService: TimepickerService,
                private productService: ProductListService,
                private timeslotService: BookingTimeslotsService,
                private userService: UserDataService,
                private toastService: ToastService,
                private createResourceService: CreateResourceService,
                private systemSettings: SystemSettingsService,
                private menuService: MenuService) {

        const loadingSubscr = this.isSubmitLoading$
            .asObservable()
            .subscribe((res) => (this.isSubmitLoading = res));
        this.unsubscribe.push(loadingSubscr);

    }

    private routeSub: any;  // subscription to route observer

    ngOnInit(): void {
        this.timepickerService.setFreeEntry(false);
        this.checkIfProviderAccepted();
        this.getDomainId();
        this.providerData = this.createResourceService.providerData$.getValue();

        this.getTripsAndItinerariesIds();
        this.stepperService.getStep().subscribe({
            next: stepNumber => this.step = stepNumber
        })

        this.stepperService.getStepperStage().subscribe({
            next: stage => this.stepperStage = stage
        })

        this.resourceService.getResourceId().subscribe({
            next: id =>
                this.resourceId = id

        })

        this.userService.getCurrentUser().subscribe((response: any) => {
            if (response.roles.includes('ROLE_PROVIDER')) {
                this.isProvider = true;
            }

            if (response.roles.includes('ROLE_STAFF')) {
                this.isStaff = true;
            }

            if (response.roles.includes('ROLE_SUPER_ADMIN')) {
                this.isAdmin = true;
            }
        })

        if (this.resourceService.resourceId$.getValue()) {
            this.currentResourceId = this.resourceService.resourceId$.getValue();
        }


        /*this.routeSub = this.router.events.subscribe((event) => {
            if (event instanceof NavigationStart) {
                // save your data
                console.log('AM PLECAT PA PA');
                this.clearFields();
            }
        });*/


        this.route.params.subscribe((params: any) => {
            // Resource ID - I use this to check if you are on edit page
            this.resourceService.resourceId$.next(params.id);
            this.resourceService.generalInformationForm$.next(new FormGroup({}));
            // this.clearFields();
            // Check if you are on edit page
            if (this.resourceId) {

                // Initiate stepper to Configure/Edit Mode
                this.stepperService.stepperStage$.next('Configure/Edit');
                this.resourceService.generalInformationForm$.next(new FormGroup({}));
                console.log('STEP', this.stepperService.step$.getValue());
                console.log('res template data', this.resourceService.resourceTemplateData$.getValue());

                // Get the resource by ID
                this.resourceService.getResourceById(this.resourceId).subscribe({
                    next: (resourceData: any) => {
                        console.log(resourceData)
                        console.log('RESURSA PE EDIT DE LA BE', resourceData)
                        this.resourceService.bookingType$.next(resourceData?.bookingType);
                        console.log('BOOKING TYPE ADD', this.resourceService.bookingType$.getValue())


                        this.resourceService.resourceTemplateData$.next({
                            ...resourceData,
                            bookingPolicies: resourceData?.bookingPolicies
                        });
                        console.log('RES IN TEMPLATE DATA', this.resourceService.resourceTemplateData$.getValue());
                        this.resourceService.bookingPolicies$.next(resourceData?.bookingPolicies);
                        this.resourceName = resourceData.title;
                        console.log('menu id first', resourceData.menuId);

                        if (resourceData) {
                            // console.log('AM DATELE DE LA RESURSA');
                            // Create Manual Inputs
                            this.form.addControl('id', new FormControl(resourceData.id, Validators.required));
                            this.form.addControl('title', new FormControl(resourceData.title, Validators.required));
                            this.form.addControl('description', new FormControl(resourceData.description, Validators.required));
                            this.form.addControl('specific', new FormControl(resourceData.restaurant.specific, Validators.required));
                            this.form.addControl('address', new FormControl(resourceData.address, Validators.required));
                            this.form.addControl('country', new FormControl(resourceData.country, Validators.required));
                            this.form.addControl('city', new FormControl(resourceData.city, Validators.required));
                            this.form.addControl('sharedExperience', new FormControl(resourceData.sharedExperience));
                            this.form.addControl('forItinerary', new FormControl(resourceData.forItinerary));
                            this.form.addControl('startDate', new FormControl(moment(resourceData.startDate).format('YYYY-MM-DDTHH:mm'), Validators.required));
                            this.form.addControl('endDate', new FormControl(moment(resourceData.endDate).format('YYYY-MM-DDTHH:mm'), Validators.required));

                            this.form.addControl('latitude', new FormControl(resourceData.geographicalCoordinates?.latitude));
                            this.form.addControl('longitude', new FormControl(resourceData.geographicalCoordinates?.longitude));

                            // this.form.addControl('bookingPolicies', new FormControl({
                            //     ...resourceData?.bookingPolicies,
                            //     depositRequired: false
                            // }));
                        }

                        this.resourceService.generalInformationForm$.next(this.form);


                        this.templateForm.controls.categoryId.setValue(resourceData.categoryId);
                        this.templateForm.controls.domain.setValue(resourceData.domain);
                        this.templateForm.controls.resourceTypeId.setValue(resourceData.resourceTypeId);

                        // req de get resource template

                        this.resourceService.addTemplate(this.templateForm.value);

                        this.resourceService.resourceData.next(resourceData);
                        // console.log('resource data start', resourceData)
                        this.resourceService.filesForm$.next(new FormGroup({}));
                        this.resourceService.filesForm$.getValue().addControl('thumbnail', new FormControl(resourceData.restaurant ? resourceData.restaurant.featuredImage : resourceData.featuredImage));
                        this.resourceService.filesForm$.getValue().addControl('thumbnailFile', new FormControl());
                        this.resourceService.filesForm$.getValue().addControl('images', new FormControl(resourceData.restaurant ? resourceData.restaurant.images : resourceData.images));
                        this.resourceService.filesForm$.getValue().addControl('imagesFiles', new FormControl([]));
                        // this.resourceService.filesForm$.getValue().addControl('videos', new FormControl(resourceData.videos));
                        // console.log('files form start', this.resourceService.filesForm$.getValue().controls);

                        // Set Resource Type
                        this.resourceType = resourceData?.bookingType;

                        if (resourceData?.bookingType === 'rentalBooking') {
                            this.resourceService.accommodationPolicy$.next(resourceData?.policy?.accommodationPolicy);
                            // console.log('am policy', this.resourceService.accommodationPolicy$.getValue());
                            // console.log('policy de la req', resourceData.policy);
                        }

                        this.timepickerService.timetableList$.next(resourceData.restaurant ? resourceData.restaurant.timetable : resourceData.timetable);
                        if (resourceData.restaurant) {
                            this.timepickerService.changePolicies$.next(resourceData.restaurant.modificationPolicy);
                            this.timepickerService.changePoliciesData$.next(resourceData.restaurant.modificationPolicyData);
                            this.timepickerService.bookingPolicies$.next(resourceData.restaurant.reservationPolicy);
                            this.timepickerService.bookingPoliciesData$.next(resourceData.restaurant.reservationPolicyData);
                        }

                        this.resourceService.getListResourceTemplateFiltered(0, -1, '', '', this.templateForm.value).subscribe({
                                next: (templateList: any) => {
                                    // console.log('templateList', templateList.content[0]);

                                    // Start from the first tab
                                    // this.stepperService.step$.next(0);

                                    // Change Stepper Stage
                                    this.stepperService.stepperStage$.next('Configure/Edit')

                                    // Store template data in service
                                    // this.resourceService.resourceTemplateData$.next(templateList.content[0])
                                    this.currentTemplateId = templateList.content[0].id;
                                    this.resourceService.getAttributesFromTemplate(templateList.content[0].id).subscribe((data: any) => {
                                        // this.resourceService.attributesFromResourceTemplate$.next(data);
                                        // this.formSections = data;
                                        this.attributesFromTemplate = data;

                                        console.log(resourceData)
                                        console.log(data)
                                        this.searchAttributes(resourceData.attributes, data);
                                        // console.log('FORM SECTIONS', this.formSections);
                                        // this.resourceService.resourceTemplateData$.next(resourceData);

                                        console.log('formSections', this.formSections);
                                        // nu cred ca tre sa stea aici
                                        this.resourceService.attributesFromResourceTemplate$.next(this.formSections);
                                        this.createDynamicForm(this.formSections);

                                        // Data Loaded
                                        this.dataLoaded = true
                                    })


                                }
                            }
                        )

                    },
                    error: (error) => console.log(error)
                })

            } else {
                this.stepperService.stepperStage$.next('Add');
                this.stepperService.step$.next(0);

                this.resourceService.attributesFromResourceTemplate$.next(undefined);

                // Get Selected Templated
                this.resourceService.resourceTemplateType$.subscribe({
                    next: templateType => {

                        console.log('resoursa noua', templateType);

                        // Check if we have a Template Type selected
                        if (templateType !== undefined) {


                            this.resourceService.getListResourceTemplateFiltered(0, -1, '', '', templateType).subscribe({
                                next: (data: { content }) => {

                                    console.log('template resoursa noua', data);
                                    console.log('SUNT PE TEMPLATE CHIAR DACA S A SCHIMBAT')

                                    this.resourceType = data.content[0].bookingType;

                                    this.resourceService.bookingType$.next(data.content[0]?.bookingType);

                                    // Start from the first tab
                                    this.stepperService.step$.next(0)

                                    // Change Stepper Stage
                                    this.stepperService.stepperStage$.next('Configure/Edit')

                                    // Store template data in service
                                    this.resourceService.resourceTemplateData$.next(data.content[0])

                                    // Get Template Attributes
                                    this.resourceService.getAttributesFromTemplate(data.content[0].id).subscribe((data) => {

                                        console.log('GET ATTR FROM TEMPLATE', data);
                                        // Store attributes data in service
                                        this.resourceService.attributesFromResourceTemplate$.next(data);

                                        // Data Loaded
                                        this.dataLoaded = true;
                                    })

                                },
                                error: (error) => console.log(error)
                            })
                        }
                    },
                    error: (error) => console.log(error)
                })

            }
        });
    }

    clearFields() {
        // this.stepperService.step$.next(undefined);
        this.stepperService.stepperStage$.next(undefined);

        this.resourceService.resourceId$.next(undefined);
        this.resourceService.resourceTemplateData$.next(undefined);
        this.resourceService.resourceTemplateType$.next(undefined);
        this.resourceService.attributesFromResourceTemplate$.next(undefined);
        this.resourceService.generalInformationForm$.next(new FormGroup({}));
        this.resourceService.facilitiesForm$.next(new FormGroup({}));
        this.resourceService.filesForm$.next(new FormGroup({}));
        this.resourceService.facilitiesByCategory$.next([]);
        this.resourceService.resourceData.next({
            featuredImage: undefined,
            images: [],
            videos: [],
            restaurant: undefined
        });
        this.resourceService.accommodationPolicy$.next(undefined);
        this.roomService.refreshRoomList$.next(false);
        this.roomService.roomList$.next([]);
        this.roomService.imagesArray$.next([]);
        this.resourceService.travelId$.next(undefined);
        this.resourceService.relatedResources$.next([]);
        this.resourceService.bookingType$.next(undefined);

        this.ticketService.updateArray$.next([]);
        this.ticketService.refreshUpdateArray$.next(false);
        this.ticketService.createArray$.next([]);
        this.ticketService.refreshCreateArray$.next(false);
        this.ticketService.ticketsList$.next([]);
        this.ticketService.refreshTicketList$.next(false);
        this.ticketService.deleteArray$.next([]);

        this.timepickerService.timepickerList$.next([]);
        this.timepickerService.timetableList$.next([]);
        this.timepickerService.timepickerId$.next(undefined);
        this.timepickerService.timePicker$.next(undefined);
        this.timepickerService.changePolicies$.next(undefined);
        this.timepickerService.bookingPolicies$.next(undefined);

        this.resourceService.externalUrl$.next(undefined);

        this.productService.productsList$.next([]);
        this.productService.refreshProductList$.next(false);
        this.productService.deleteProdList$.next([]);

        this.timeslotService.serviceList$.next([]);
        this.timeslotService.refreshServiceList$.next(false);

        this.createResourceService.providerData$.next(undefined);

        this.resourceService.setupListener$.next(undefined);
        this.resourceService.generalInfoListener$.next(undefined);
        this.resourceService.policyRentalListener$.next(undefined);
        this.resourceService.policyMenuListener$.next(undefined);
        this.resourceService.policyListener$.next(undefined);
        this.resourceService.settingsTripsItineraries$.next([]);
        this.resourceService.tripsItinerariesObject$.next({});

        this.menuService.refreshMenuList$.next(false);
        this.menuService.menuList$.next([]);
        this.menuService.menuId$.next(undefined);
    }

    getDomainId() {
        this.resourceService.getListOfDomains().subscribe({
            next: (domainsList: []) => {
                domainsList.forEach((domain: any) => {
                    if (domain.key === 'travel') {
                        this.resourceService.travelId$.next(domain.id);
                    } else if (domain.key === 'healthcare') {
                        this.resourceService.medicalId$.next(domain.id);
                    } else if (domain.key === 'education') {
                        this.resourceService.educationId$.next(domain.id);
                    }
                })
            }
        })
    }

    /** Reinitialize Add Resource*/
    exitResource() {

        // Reset Stepper
        this.stepperService.step$.next(0);
        this.clearFields();


        // Change stepper stage to Add
        this.stepperService.stepperStage$.next('Add')

    }


    getTripsAndItinerariesIds() {
        this.systemSettings.getSystemSetting().subscribe({
            next: (settings: SystemSetting) => {
                // console.log('sett',settings);
                const tripsIds = {
                    journeyThemeCategoryId: settings.journeyThemeCategoryId,
                    typeOfDestinationCategoryId: settings.typeOfDestinationCategoryId,
                    typeOfJourneyCategoryId: settings.typeOfJourneyCategoryId
                }

                this.resourceService.tripsItinerariesObject$.next(tripsIds);

                this.resourceService.addTripsId(settings.journeyThemeCategoryId);
                this.resourceService.addTripsId(settings.typeOfDestinationCategoryId);
                this.resourceService.addTripsId(settings.typeOfJourneyCategoryId);
            }
        })


    }


    searchAttributes(resourceAttributes, templateAttributes) {

        this.formSections = [];

        if (!resourceAttributes) resourceAttributes = templateAttributes;

        templateAttributes.forEach(templateTab => {
                console.log('test 1', templateTab)
                resourceAttributes.forEach(resourceTab => {
                        console.log('intram?');
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
                                        console.log('suntem aici, n-avem atr');
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

                            this.formSections.push({
                                tabName: templateTab.tabName,
                                tabAttributes: array
                            })

                        }

                    }
                )

                //after combining the resource attributes with the template attributes, see if you have all the template tabs
                const findTab = this.formSections.find(section => templateTab.tabName === section.tabName);
                // console.log('find tab',findTab);
                //if not, add the tab with the name of the missing one and an empty array
                if (!findTab) {
                    console.log('find tab?', templateTab);
                    this.formSections.push({
                        tabName: templateTab.tabName,
                        tabAttributes: templateTab.tabAttributes
                    })
                }

            }
        )

    }


    /** Submit Form*/
    onSubmit() {


        // Mark all inputs as touched
        // this.form.markAllAsTouched()

        // Check if the form is INVALID
        // if (this.form.invalid) {
        //     return
        // }


        // // Empty array
        // const formData = [];
        //
        // // Sort form inputs by tabName
        // for (const control in this.form.controls) {
        //     this.formSections.forEach((section: any) => {
        //         section.tabAttributes.forEach(attribute => {
        //             if (attribute.name === control) {
        //                 formData.push({
        //                     tabName: section.tabName,
        //                     attributeName: control,
        //                     attributeId: attribute.id,
        //                     attributeValue: this.form.get(control).value,
        //                     attributeIconPath: attribute.icon.filePath
        //                 });
        //             }
        //         });
        //     });
        // }
        //
        // const attributes = formData.reduce((acc, item) => {
        //     const index = acc.findIndex(x => x.tabName === item.tabName);
        //     if (index !== -1) {
        //         acc[index].tabAttributes.push({
        //             attributeId: item.attributeId,
        //             attributeValue: item.attributeValue
        //         });
        //     } else {
        //         acc.push({
        //             tabName: item.tabName, tabAttributes: [{
        //                 attributeId: item.attributeId,
        //                 attributeValue: item.attributeValue
        //             }]
        //         });
        //     }
        //     return acc;
        // }, []);
        //
        // // Formatted Form Object
        // const formObject = {
        //     title: this.form.value.title,
        //     description: this.form.value.description,
        //     slug: this.resourceId ? '' : this.form.value.title,
        //     attributes: attributes
        // }
        //
        // // Check if you are on edit or create
        // if (this.resourceId) {
        //     this.resourceService.updateResource(this.resourceId, formObject).subscribe({
        //         next: (data) => console.log(data)
        //     })
        // } else {
        //     this.resourceService.addResource(formObject).subscribe({
        //         next: (data: any) => {
        //             console.log(data)
        //
        //             // TODO Delete Later - l-am facut pentru a putea ajunge pe pagina de edit
        //             this.resourceId = data.reason
        //
        //
        //             // TODO Uncomment when you are done here
        //             // Redirect to List Page
        //             // this.router.navigate(['/private/provider/resources/' + this.resourceId])
        //         },
        //         error: (error) => console.log(error)
        //     })
        // }
    }

    checkIfProviderAccepted() {
        this.userService.getCurrentUser().subscribe((currentUser: User) => {
            if (currentUser.roles.includes('ROLE_PROVIDER') && currentUser.approvedStatus === null) {
                this.isProviderAccepted = false;
                this.router.navigate(['/private/provider/resources/my-list']);
                // this.toastService.showToast("Error", "Nu aveti permisiunea necesară pentru a adăuga resurse. Luați legătura cu administratorul.", 'error')
            } else {
                this.isProviderAccepted = false;
            }
        })
    }

    saveResource() {
        this.roomsArray = this.roomService.roomList$.getValue();
        this.seeWhere();

        const combineForms: any = new FormGroup({
            ...this.resourceService.generalInformationForm$.getValue().controls,
            ...this.resourceService.facilitiesForm$.getValue().controls,
            ...this.resourceService.filesForm$.getValue().controls
        })

        console.log('FILES FORM', this.resourceService.filesForm$.getValue())

        console.log('Form-uri combinate', combineForms.value)
        console.log('Atribute', this.resourceService.attributesFromResourceTemplate$.getValue())
        console.log('Form-uri combinate 2', this.resourceService.resourceTemplateData$.getValue());
        console.log('Form-uri combinate 3', this.resourceService.resourceTemplateType$.getValue());


        // Empty array
        const formData = [];

        // Sort form inputs by tabName
        for (const control in combineForms.controls) {
            this.resourceService.attributesFromResourceTemplate$.getValue().forEach((section) => {
                section.tabAttributes.forEach(attribute => {
                    if (attribute.name === control) {
                        if (attribute.valueType === 'multiple-select') {
                            console.log('ATTR SENT', attribute, combineForms.get(control).value)
                            formData.push({
                                tabName: section.tabName,
                                attributeName: control,
                                attributeId: attribute.id,
                                attributeValue: Array.isArray(combineForms.get(control).value) ? combineForms.get(control).value.join() : combineForms.get(control).value,
                                attributeIconPath: attribute.icon.filePath
                            });
                        } else {
                            formData.push({
                                tabName: section.tabName,
                                attributeName: control,
                                attributeId: attribute.id,
                                attributeValue: combineForms.get(control).value,
                                attributeIconPath: attribute.icon.filePath
                            });
                        }

                    }
                });
            });
        }

        console.log('FORM DATA', formData);
        const attributes = formData.reduce((acc, item) => {
            const index = acc.findIndex(x => x.tabName === item.tabName);
            if (index !== -1) {
                acc[index].tabAttributes.push({
                    attributeId: item.attributeId,
                    attributeValue: item.attributeValue
                });
            } else {
                acc.push({
                    tabName: item.tabName,
                    tabAttributes: [{
                        attributeId: item.attributeId,
                        attributeValue: item.attributeValue
                    }]
                });
            }
            return acc;
        }, []);

        console.log('sa ne uitam aici', this.resourceService.resourceTemplateData$.getValue());

        // Formatted Form Object
        const formObject = {
            title: combineForms.value.title,
            description: combineForms.value.description,
            address: combineForms.value.address,
            country: combineForms.value.country,
            city: combineForms.value.city,
            slug: this.resourceService.resourceId$.getValue() ? '' : combineForms.value.title,
            featuredImage: combineForms.value.thumbnail,
            images: this.resourceService.resourceData.getValue().images,
            videos: this.resourceService.resourceData.getValue().videos !== null ? this.resourceService.resourceData.getValue().videos : [],
            geographicalCoordinates: {
                latitude: combineForms.value.latitude,
                longitude: combineForms.value.longitude
            },
            attributes: attributes,
            categoryId: this.resourceService.resourceTemplateType$.getValue().categoryId,
            domain: this.resourceService.resourceTemplateType$.getValue().domain,
            resourceTypeId: this.resourceService.resourceTemplateType$.getValue().resourceTypeId,
            bookingType: this.resourceService.resourceTemplateData$.getValue().bookingType,
            timetable: this.timepickerService.timetableList$.getValue().length > 0 ? this.timepickerService.timetableList$.getValue() : (!this.resourceService.resourceTemplateData$.getValue().timetable ? [] : this.resourceService.resourceTemplateData$.getValue().timetable),
            policy: this.resourceService.accommodationPolicy$.getValue() ? (Object.keys(this.resourceService.accommodationPolicy$.getValue()).length === 0 ? this.resourceService.resourceTemplateData$.getValue().policy : {accommodationPolicy: this.resourceService.accommodationPolicy$.getValue()}) : this.resourceService.resourceTemplateData$.getValue().policy,
            modificationPolicy: this.timepickerService.changePolicies$.getValue(),
            reservationPolicy: this.timepickerService.bookingPolicies$.getValue(),
            modificationPolicyData: this.timepickerService.changePoliciesData$.getValue(),
            reservationPolicyData: this.timepickerService.bookingPoliciesData$.getValue(),
            externalUrl: this.resourceService.externalUrl$.getValue(),
            sharedExperience: combineForms.value.sharedExperience,
            forItinerary: combineForms.value.forItinerary
        }


        console.log('FORM OBJ', formObject);

        if (this.resourceService.resourceId$.getValue()) {

            //added for policies check on menu
            if (this.resourceType === 'menu' && this.timepickerService.timepickerId$.getValue()) {
                if ((this.timepickerService.changePolicies$.getValue().nonRefundable ||
                        this.timepickerService.changePolicies$.getValue().modifiable ||
                        (this.timepickerService.changePolicies$.getValue().freeCancellation.freeCancellation &&
                            this.timepickerService.changePolicies$.getValue().freeCancellation.deadlineDays > 0)) &&
                    (this.timepickerService.bookingPolicies$.getValue().depositRequired && this.timepickerService.bookingPolicies$.getValue().depositRequiredAmount > 0)) {
                    this.updateResource(formObject, combineForms);
                } else {
                    this.toastService.showToast('Eroare', 'Nu ai completat politicile de modificare și rezervare!', 'error');
                    this.isSubmitLoading$.next(false);
                }
                //if not menu, everything works like before
            } else {
                this.updateResource(formObject, combineForms);
            }

        }
    }

    updateResource(formObject: object, combineForms: any) {
        this.resourceService.updateResource(this.resourceService.resourceId$.getValue(), formObject).subscribe({
            next: (data: any) => {
                console.log(data);
                // console.log('IMAGINE', combineForms.value.thumbnail);
                // console.log('IMAGINE', this.resourceService.resourceData.getValue().featuredImage);
                // console.log('cond', combineForms.value.thumbnail !== this.resourceService.resourceData.getValue().featuredImage)
                if (combineForms.value.thumbnail && (combineForms.value.thumbnail !== this.resourceService.resourceData.getValue().featuredImage)) {
                    const thumbnailData = new FormData();
                    thumbnailData.append('file', combineForms.value.thumbnail);
                    this.$fileObservables.push(this.resourceService.uploadResourceImage(this.resourceService.resourceId$.getValue(), thumbnailData));
                }

                if (combineForms.value.images?.length > 0) {
                    const newImages = combineForms.value.images.filter(x => this.resourceService.resourceData.getValue().images.indexOf(x) === -1);
                    console.log('Diferenta arrays', newImages);

                    if (newImages.length > 0) {
                        const imagesData = new FormData();
                        newImages.forEach(galleryFile => {
                            imagesData.append('files', galleryFile);
                        });
                        this.$fileObservables.push(this.resourceService.uploadDocAttachements(this.resourceService.resourceId$.getValue(), 'image', imagesData));
                    }
                }


                if (combineForms.value.videos?.length > 0) {
                    const newVideos = combineForms.value.videos.filter(x => this.resourceService.resourceData.getValue().videos.indexOf(x) === -1);
                    console.log('Diferenta arrays', newVideos);


                    if (newVideos.length > 0) {
                        const videosData = new FormData();
                        newVideos.forEach(videoFile => {
                            videosData.append('files', videoFile);
                        });
                        this.$fileObservables.push(this.resourceService.uploadDocAttachements(this.resourceService.resourceId$.getValue(), 'video', videosData));
                    }
                }

                if (data.success) {
                    // console.log('TICKETs');
                    // console.log('CREATE ARRAY', this.ticketService.createArray$.getValue());
                    // console.log('current res id', this.currentResourceId);

                    // this.timepickerService.timetableList$.next([]);
                    //ticket-booking
                    // this.ticketService.ticketsList$.next([]);


                    if (this.ticketService.createArray$.getValue().length > 0) {
                        // Create new tickets
                        this.$fileObservables.push(this.ticketService.createTickets(this.currentResourceId, this.ticketService.createArray$.getValue()));
                        // this.ticketService.createTickets(this.currentResourceId, this.ticketService.createArray$.getValue()).subscribe({
                        //     next: (tickets: { success: boolean, reason: string }) => {
                        //         if (tickets.success) {
                        //             // console.log('SE ADAUGA TICKETELE PUSE PE UPDATE', tickets);
                        //             this.ticketService.createArray$.next([]);
                        //             console.log(this.ticketService.createArray$.getValue());
                        //         }
                        //     }
                        // })
                    } else {
                        console.log('n-am in create');
                    }


                    if (this.ticketService.updateArray$.getValue().length > 0) {
                        console.log('am in update');
                        //Update tickets
                        const updateArray = this.ticketService.updateArray$.getValue();
                        updateArray.forEach(ticket => {
                            this.$fileObservables.push(this.ticketService.updateTicket(ticket.id, ticket));
                            // this.ticketService.updateTicket(ticket.id, ticket).subscribe({
                            //     next: (tickets: { success: boolean, reason: string }) => {
                            //         if (tickets.success) {
                            //             // console.log('SE FACE UPDATE LA TICKETS PE UPDATE', tickets);
                            //             this.ticketService.updateArray$.next([]);
                            //         }
                            //     }
                            // })
                        })
                    } else {
                        console.log('n-am in update');
                    }


                    if (this.ticketService.deleteArray$.getValue().length > 0) {
                        //Delete tickets
                        const deleteArray = this.ticketService.deleteArray$.getValue();
                        deleteArray.forEach(ticket => {
                            // console.log('ticket de sters', ticket)
                            this.$fileObservables.push(this.ticketService.deleteTicket(ticket.id));
                            // this.ticketService.deleteTicket(ticket.id).subscribe({
                            //     next: (tickets: { success: boolean, reason: string }) => {
                            //         if (tickets.success) {
                            //             console.log('SE FACE DELETE LA TICKETS PE UPDATE', tickets);
                            //             this.ticketService.deleteArray$.next([]);
                            //         }
                            //     },
                            //     error: err => {
                            //         console.log(err);
                            //     }
                            //
                            // })
                        })

                    }

                    if (this.productService.productsList$.getValue().length > 0) {
                        const prodArray = this.productService.productsList$.getValue();
                        prodArray.forEach(product => {
                            if (product.state === 'add') {
                                this.productService.createProduct(this.currentResourceId, product).subscribe({
                                    next: (respAdd: { success: boolean, reason: string }) => {
                                        if (respAdd) {
                                            const imagArray = this.productService.imagesArray$.getValue();
                                            console.log('array', imagArray);
                                            imagArray.forEach(imageObj => {
                                                if (product.id === imageObj.id) {
                                                    console.log('imaginea cu id-ul ' + product.id + ' va avea astea', imageObj);
                                                    if (imageObj.imageFile !== undefined) {
                                                        const thumbnailData = new FormData();
                                                        thumbnailData.append('images', imageObj.imageFile);
                                                        console.log('thumb data', thumbnailData);

                                                        // this.$fileObservables.push( this.roomService.uploadRoomThumbnail(resp.reason, thumbnailData));
                                                        this.productService.uploadImageForProduct(respAdd.reason, thumbnailData).subscribe({
                                                            next: thumb => {
                                                                console.log('thumbnail uploadat', thumb);
                                                            }, error: (error) => {
                                                                if (error.error.reason === 'fileSizeTooBig') {
                                                                    this.toastService.showToast("Eroare", "Fisierul incărcat este prea mare! Încărcați o imagine mai mica de 2 MB!", "error");
                                                                } else if (error.error.reason === 'wrongExtension') {
                                                                    this.toastService.showToast("Eroare", "Formatul fisierului nu este permis!", "error");
                                                                } else {
                                                                    this.toastService.showToast("Eroare", "A aparut o problemă la încărcarea imaginii!", "error");
                                                                }
                                                            }
                                                        })
                                                    }

                                                    this.productService.imagesArray$.next([]);
                                                }
                                            })
                                        }
                                    }
                                })
                            } else if (product.state === 'update') {
                                this.productService.updateProduct(product.id, product).subscribe({
                                    next: (respUpdate: { success: boolean, reason: string }) => {
                                        console.log('update prod', respUpdate);
                                        if (respUpdate) {
                                            const imagArray = this.productService.imagesArray$.getValue();
                                            console.log('array', imagArray);
                                            imagArray.forEach(imageObj => {
                                                if (product.id === imageObj.id) {
                                                    console.log('imaginea cu id-ul ' + product.id + ' va avea astea', imageObj);
                                                    if (imageObj.imageFile !== undefined) {
                                                        const thumbnailData = new FormData();
                                                        thumbnailData.append('images', imageObj.imageFile);
                                                        console.log('thumb data', thumbnailData);

                                                        // this.$fileObservables.push( this.roomService.uploadRoomThumbnail(resp.reason, thumbnailData));
                                                        this.productService.uploadImageForProduct(product.id, thumbnailData).subscribe({
                                                            next: thumb => {
                                                                console.log('thumbnail uploadat', thumb);
                                                            }, error: (error) => {
                                                                if (error.error.reason === 'fileSizeTooBig') {
                                                                    this.toastService.showToast("Eroare", "Fisierul incărcat este prea mare! Încărcați o imagine mai mica de 2 MB!", "error");
                                                                } else if (error.error.reason === 'wrongExtension') {
                                                                    this.toastService.showToast("Eroare", "Formatul fisierului nu este permis!", "error");
                                                                } else {
                                                                    this.toastService.showToast("Eroare", "A aparut o problemă la încărcarea imaginii!", "error");
                                                                }
                                                            }
                                                        })
                                                    }

                                                    this.productService.imagesArray$.next([]);
                                                }
                                            })
                                        }
                                    }
                                })
                            }
                        })
                    }

                    //product list
                    if (this.productService.deleteProdList$.getValue().length > 0) {
                        const deleteProdArray = this.productService.deleteProdList$.getValue();
                        deleteProdArray.forEach(product => {
                            this.productService.deleteProduct(product.id).subscribe({
                                next: (respAdd: { success: boolean, reason: string }) => {
                                    if (respAdd) {
                                        const imagArray = this.productService.imagesArray$.getValue();
                                        console.log('array', imagArray);
                                        imagArray.forEach(imageObj => {
                                            if (product.id === imageObj.id) {
                                                console.log('imaginea cu id-ul ' + product.id + ' va avea astea', imageObj);
                                                if (imageObj.imageFile !== undefined) {
                                                    const thumbnailData = new FormData();
                                                    thumbnailData.append('images', imageObj.imageFile);
                                                    console.log('thumb data', thumbnailData);

                                                    // this.$fileObservables.push( this.roomService.uploadRoomThumbnail(resp.reason, thumbnailData));
                                                    this.productService.uploadImageForProduct(respAdd.reason, thumbnailData).subscribe({
                                                        next: thumb => {
                                                            console.log('thumbnail uploadat', thumb);
                                                        }, error: (error) => {
                                                            if (error.error.reason === 'fileSizeTooBig') {
                                                                this.toastService.showToast("Eroare", "Fisierul incărcat este prea mare! Încărcați o imagine mai mica de 2 MB!", "error");
                                                            } else if (error.error.reason === 'wrongExtension') {
                                                                this.toastService.showToast("Eroare", "Formatul fisierului nu este permis!", "error");
                                                            } else {
                                                                this.toastService.showToast("Eroare", "A aparut o problemă la încărcarea imaginii!", "error");
                                                            }
                                                        }
                                                    })
                                                }

                                                this.productService.imagesArray$.next([]);
                                            }
                                        })
                                    }
                                }
                            });
                        })
                    }


                    //service time slot
                    if (this.timeslotService.serviceList$.getValue().length > 0) {
                        const serviceArray = this.timeslotService.serviceList$.getValue();
                        serviceArray.forEach(service => {
                            if (service.state === 'add') {
                                this.$fileObservables.push(this.timeslotService.createService(this.currentResourceId, service))
                            } else if (service.state === 'update') {
                                this.$fileObservables.push(this.timeslotService.updateServiceByServiceId(service.id, service));
                            }
                        })
                    }

                    if (this.timeslotService.deleteServiceList$.getValue().length > 0) {
                        const deleteServArray = this.timeslotService.deleteServiceList$.getValue();
                        deleteServArray.forEach(service => {
                            this.$fileObservables.push(this.timeslotService.deleteService(service.id));
                        })
                    }

                    //rental-booking
                    if (this.roomsArray.length > 0) {
                        this.roomsArray.forEach(room => {
                            if (room.state === 'add') {
                                this.roomService.createRoom(this.resourceService.resourceId$.getValue(), room).subscribe({
                                    next: (resp: { success: boolean, reason: string }) => {
                                        // console.log('adaugare camera pe edit resursa', resp);
                                        if (resp.success) {
                                            const imagArray = this.roomService.imagesArray$.getValue();
                                            console.log('array', imagArray);
                                            imagArray.forEach(imageObj => {
                                                if (room.id === imageObj.id) {
                                                    console.log('imaginea cu id-ul ' + room.id + ' va avea astea', imageObj);
                                                    if (imageObj.featuredImage !== undefined) {
                                                        const thumbnailData = new FormData();
                                                        thumbnailData.append('file', imageObj.featuredImage);
                                                        console.log('thumb data', thumbnailData);

                                                        // this.$fileObservables.push( this.roomService.uploadRoomThumbnail(resp.reason, thumbnailData));
                                                        this.roomService.uploadRoomThumbnail(resp.reason, thumbnailData).subscribe({
                                                            next: thumb => {
                                                                console.log('thumbnail uploadat', thumb);
                                                            }
                                                        })
                                                    }

                                                    if (imageObj.gallery.length > 0) {
                                                        const imagesData = new FormData();
                                                        imageObj.gallery.forEach(galleryFile => {
                                                            if (galleryFile.state === 'upload') {
                                                                imagesData.append('images', galleryFile.file);
                                                            }

                                                        });

                                                        // this.$fileObservables.push(this.roomService.uploadRoomGallery(resp.reason, imagesData));
                                                        this.roomService.uploadRoomGallery(resp.reason, imagesData).subscribe({
                                                            next: gallery => {
                                                                console.log('galerie uploadata', gallery);
                                                            }
                                                        })
                                                    }

                                                    this.roomService.imagesArray$.next([]);
                                                }
                                            })
                                        }
                                    }
                                })
                            } else if (room.state === 'update') {

                                this.roomService.updateRoom(room.id, room).subscribe({
                                    next: (resp: { success: boolean, reason: string }) => {
                                        // console.log('editare camera pe edit resursa', resp);
                                        const imagArray = this.roomService.imagesArray$.getValue();
                                        console.log('array', imagArray);
                                        imagArray.forEach(imageObj => {
                                            if (room.id === imageObj.id) {
                                                console.log('imaginea cu id-ul ' + room.id + ' va avea astea', imageObj);
                                                if (imageObj.featuredImage !== undefined) {
                                                    const thumbnailData = new FormData();
                                                    thumbnailData.append('file', imageObj.featuredImage);
                                                    console.log('thumb data', thumbnailData);

                                                    // this.$fileObservables.push(this.roomService.uploadRoomThumbnail(room.id, thumbnailData));
                                                    this.roomService.uploadRoomThumbnail(room.id, thumbnailData).subscribe({
                                                        next: thumb => {
                                                            console.log('thumbnail uploadat', thumb);
                                                        }
                                                    })
                                                }

                                                if (imageObj.gallery.length > 0) {
                                                    console.log('inainte de gall', imageObj.gallery);
                                                    const imagesData = new FormData();
                                                    imageObj.gallery.forEach(galleryFile => {
                                                        if (galleryFile.state === 'upload') {
                                                            imagesData.append('images', galleryFile.file);
                                                        }

                                                    });

                                                    // this.$fileObservables.push( this.roomService.uploadRoomGallery(room.id, imagesData));
                                                    this.roomService.uploadRoomGallery(room.id, imagesData).subscribe({
                                                        next: gallery => {
                                                            console.log('galerie uploadata', gallery);
                                                        }
                                                    })
                                                }

                                                this.roomService.imagesArray$.next([]);
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }

                    if (this.roomService.deleteArray$.getValue().length > 0) {
                        const deleteRooms = this.roomService.deleteArray$.getValue();
                        deleteRooms.forEach(room => {
                            this.$fileObservables.push(this.roomService.deleteRoom(room.id));
                            // this.roomService.deleteRoom(room.id).subscribe({
                            //     next: (resp: { success: boolean, reason: string }) => {
                            //         console.log('stergere camera', resp);
                            //         if (resp.success) {
                            //             this.roomService.deleteArray$.next([]);
                            //         }
                            //     }
                            // })
                        })
                    }


                    //menu-booking
                    if (this.resourceType === 'menu' && this.timepickerService.timepickerId$.getValue()) {
                        console.log('TIMEPICKER', this.timepickerService.timePicker$.getValue());
                        const timePicker = {
                            timetables: this.timepickerService.getFreeEntry() ? [] : this.timepickerService.timePicker$.getValue().timetables,
                            changePolicies: this.timepickerService.changePolicies$.getValue(),
                            bookingPolicies: this.timepickerService.bookingPolicies$.getValue(),
                            ignoreAvailability: this.timepickerService.getFreeEntry()
                        }
                        console.log('TIMEPICKER', this.timepickerService.timePicker$.getValue());

                        this.$fileObservables.push(this.timepickerService.updateTimepicker(this.timepickerService.timepickerId$.getValue(), timePicker));

                        console.log('TIME PICKER ON', timePicker)

                        //to check
                        // if(this.timepickerService.timepickerId$.getValue()){
                        //     this.$fileObservables.push(this.timepickerService.updateTimepicker(this.timepickerService.timepickerId$.getValue(), this.timepickerService.timePicker$.getValue()));
                        //
                        // }else{
                        //     this.$fileObservables.push(this.timepickerService.createTimepicker(this.resourceId, this.timepickerService.timePicker$.getValue()));
                        // }


                    }

                    //menu
                    if (this.resourceType === 'menu') {
                        console.log('menuList', this.menuService.menuList$.getValue());
                        console.log('menu id', this.resourceService.resourceTemplateData$.getValue().menuId);
                        console.log('menu id', this.menuService.menuId$.getValue());
                        if (this.menuService.menuId$.getValue() && this.menuService.menuList$.getValue().length > 0) {

                            this.$fileObservables.push(this.menuService.updateMenu(this.menuService.menuId$.getValue(), this.menuService.menuList$.getValue()));
                        } else {
                            if (this.menuService.menuList$.getValue().length > 0) {
                                this.$fileObservables.push(this.menuService.createMenu(this.resourceId, this.menuService.menuList$.getValue()));
                            }
                        }

                    }


                }

                if (this.$fileObservables.length > 0) {
                    forkJoin(...this.$fileObservables).subscribe((forkRes: any) => {
                        this.toastService.showToast('succes', 'Resursa a fost actualizată cu succes', 'success');
                        setTimeout(() => {
                            if (this.isProvider) {
                                this.isSubmitLoading$.next(false);
                                this.router.navigate(['/private/provider/resources/my-list'], {state: {submit: true}});
                            } else if (this.isStaff) {
                                this.isSubmitLoading$.next(false);
                                this.router.navigate(['/private/staff/resources/list'], {state: {submit: true}});
                            } else if (this.isAdmin) {
                                this.isSubmitLoading$.next(false);
                                this.router.navigate(['/private/admin/resources/list'], {state: {submit: true}});
                            }
                        }, 3000);
                    });
                } else {
                    this.toastService.showToast('succes', 'Resursa a fost actualizată cu succes', 'success');
                    setTimeout(() => {
                        if (this.isProvider) {
                            this.isSubmitLoading$.next(false);
                            this.router.navigate(['/private/provider/resources/my-list'], {state: {submit: true}});
                        } else if (this.isStaff) {
                            this.isSubmitLoading$.next(false);
                            this.router.navigate(['/private/staff/resources/list'], {state: {submit: true}});
                        } else if (this.isAdmin) {
                            this.isSubmitLoading$.next(false);
                            this.router.navigate(['/private/admin/resources/list'], {state: {submit: true}});
                        }
                    }, 3000);
                }

            },
            error: (error) => {
                this.toastService.showToast('Eroare', 'A aparut o problema tehnica!', 'error');
                this.isSubmitLoading$.next(false);
                console.log(error)
            }
        })

    }

    seeWhere() {
        // console.log('STEP', this.stepperService.step$.getValue())
        // console.log('form', this.resourceService.generalInformationForm$.getValue())
        // console.log('attr temp', this.attributesFromTemplate);
        // console.log('MENUID', this.resourceService.resourceTemplateData$.getValue().menuId);

        if (this.stepperService.step$.getValue() === 2) {
            this.resourceService.setupListener$.next(true);
        }

        if (this.stepperService.step$.getValue() === 0) {
            this.resourceService.generalInfoListener$.next(true);
            console.log('il fac pe general info true')
        }

        if (this.stepperService.step$.getValue() === 3 && this.resourceType === 'rentalBooking') {
            this.resourceService.policyRentalListener$.next(true);
        }

        if (this.stepperService.step$.getValue() === 3 && this.resourceType === 'menu') {
            this.resourceService.policyMenuListener$.next(true);
        }

        if (this.stepperService.step$.getValue() === 3 && this.resourceType !== 'rentalBooking' && this.resourceType !== 'menu') {
            this.resourceService.policyListener$.next(true);
        }
    }

    createDynamicForm(formSection) {

        // Loop through from Sections

        // console.log('create trips', this.tripsAndItinAttributes)

        this.formSections = formSection.filter(item => item.tabName !== 'facilities');
        // console.log('create sections', this.formSections)
        for (const section of formSection) {
            // Loop through section attributes
            for (const inputField of section.tabAttributes) {

                if (this.form.contains(inputField.name)) {
                    if (inputField.valueType === 'multiple-select') {
                        let multipleValue: [] = this.form.get(inputField.name).value;
                        console.log('MULTIPLE SELECT', multipleValue, Array.isArray(multipleValue))
                        if (Array.isArray(multipleValue)) {
                            this.form.get(inputField.name).patchValue(multipleValue);
                        } else {
                            this.form.get(inputField.name).patchValue((multipleValue as string).split(','));

                        }
                        // this.form.get(inputField.name).patchValue(multipleValue.length > 0 ? multipleValue.split(',') : []);
                    }
                    // const findTripIndex = this.tripsAndItineraries.find(attr => attr === inputField.categoryId);
                    // if (findTripIndex && section.tabName === 'general_info') {
                    //     this.tripsAndItinAttributes.push(inputField);
                    //     console.log('TRIPS LALA 1', this.tripsAndItinAttributes);
                    //     const sectionsFiltered = section.tabAttributes.filter(attr => attr.id !== inputField.id);
                    //     // console.log('filter',sectionsFiltered)
                    //     this.formSections.map(sectionToChange => {
                    //         if (sectionToChange.tabName === 'general_info') {
                    //             return sectionToChange.tabAttributes = sectionsFiltered;
                    //         }
                    //     })
                    //
                    // }
                } else {
                    if (inputField.valueType === 'toggle') {
                        this.form.addControl(inputField.name, new FormControl(inputField.attributeValue ? inputField.attributeValue : 'false'));
                    } else if (inputField.valueType === 'multiple-select') {
                        console.log('MULTIPLE SELECT FIRST', inputField.attributeValue)
                        this.form.addControl(inputField.name, new FormControl(inputField.attributeValue ? (inputField.attributeValue).split(',') : []))
                    }

                    this.form.addControl(inputField.name, new FormControl(inputField.attributeValue ? inputField.attributeValue : '', inputField.propertyRequired ? Validators.required : null));
                    // const findTripIndex = this.tripsAndItineraries.find(attr => attr === inputField.categoryId);
                    // if (findTripIndex && section.tabName === 'general_info') {
                    //     this.tripsAndItinAttributes.push(inputField);
                    //     console.log('TRIPS LALA 2', this.tripsAndItinAttributes);
                    //     const sectionsFiltered = section.tabAttributes.filter(attr => attr.id !== inputField.id);
                    //     // console.log('filter',sectionsFiltered)
                    //     this.formSections.map(sectionToChange => {
                    //         if (sectionToChange.tabName === 'general_info') {
                    //             return sectionToChange.tabAttributes = sectionsFiltered;
                    //         }
                    //     })
                    //
                    // }

                }


            }


        }
        // // this.dataLoaded = true;
        // console.log('lalallaalal', this.formSections);
        // console.log('FORM', this.form.value);
        // console.log('trips ATRTR', this.tripsAndItinAttributes);

    }


    ngOnDestroy() {
        this.routeSub?.unsubscribe();
        this.clearFields();
    }

}
