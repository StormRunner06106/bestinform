import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from "@angular/forms";
import {StepperService} from "../../../../_services/stepper.service";
import {ResourcesService} from "../../../../_services/resources.service";
import {SystemSettingsService} from "../../../../../../shared/_services/system-settings.service";
import {BehaviorSubject, forkJoin, Observable, Subject, Subscription, takeUntil, tap} from "rxjs";
import {UserDataService} from "../../../../../../shared/_services/userData.service";
import {ActivatedRoute, Router} from "@angular/router";
import {RentalBookingService} from "../../../../_services/rental-booking.service";
import {TicketsBookingService} from "../../../../_services/tickets-booking.service";
import {TimepickerService} from "../../../../_services/timepicker.service";
import {ProductListService} from "../../../../_services/product-list.service";
import {BookingTimeslotsService} from "../../../../_services/booking-timeslots.service";
import {ToastService} from "../../../../../../shared/_services/toast.service";
import {CreateResourceService} from "../../../../../../shared/_services/createResource.service";
import {MenuService} from "../../../../_services/menu.service";
import {CulturalBookingService} from "../../../../_services/cultural-booking.service";
import * as moment from "moment/moment";
import {CustomMapMarker, mapsOptions} from "../../../../../../shared/maps-options";
import {isArray} from "ngx-bootstrap/chronos";

@Component({
    selector: 'app-general-informations',
    templateUrl: './general-informations.component.html',
    styleUrls: ['./general-informations.component.scss'],
})
export class GeneralInformationsComponent implements OnInit, OnDestroy {

    @Input() resourceType: string;
    address: string = '';
    autocompleteService: google.maps.places.AutocompleteService;
    form: FormGroup = this.resourceService.generalInformationForm$.getValue();
    formSections = [];
    formSectionsToSend = [];
    facilitiesTab = {};
    geographicalCoordinates: boolean;
    countries = [];
    currencyEnums: string[] = [
        'EUR',
        'RON',
        'USD'];
    specificEnums: string[] = [
        'FUSION',
        'VEGAN',
        'STREET',
        'FAST_FOOD',
        'BISTRO',
        'GASTRO',
        'BIO',
        'THEMED',
        'BRASSERIE',
        'TAPAS',
        'BUFFET',
        'ETHNIC',
        'INTERNATIONAL',
        'ITALIAN',
        'MEDITERANEAN',
        'ROMANESC'
    ];
    cities = [];
    // Form
    templateForm = new FormGroup({
        domain: new FormControl('', Validators.required),
        categoryId: new FormControl('', Validators.required),
        resourceTypeId: new FormControl('', Validators.required)
    })
    googlemapOptions = mapsOptions;
    public markerPositions: CustomMapMarker[] = [];

    tripsAndItineraries = [];
    tripsAndItinAttributes = [];
    dataLoaded = false;

    tripsItinObj: {
        journeyThemeCategoryId: string,
        typeOfDestinationCategoryId: string,
        typeOfJourneyCategoryId: string
    }

    hasSharedExperience = false;
    hasForItinerary = false;
    hasStartEndDates = false;

    /*today = new Date();
    currentDay = moment(
        this.today.setMinutes(Math.ceil(this.today.getMinutes() / 15 + ((this.today.getMinutes() % 15) === 0 ? 1 : 0)) * 15),
        'DD MM YYYY HH:mm'
    );*/
    currentDay = moment();


    canCreateAttr = false;

    private ngUnsubscribe = new Subject<void>();

    //for save resource
    isAdmin: boolean;
    isProvider: boolean;
    isStaff: boolean;
    autoCompletePlace: any;

    formattedAddress: any;
    resourceId: string;
    roomsArray: any;

    public airportsData: BehaviorSubject<any> = new BehaviorSubject<any>('');
    public nearByData: BehaviorSubject<any> = new BehaviorSubject<any>('');
    public attractionsData: BehaviorSubject<any> = new BehaviorSubject<any>('');
    public publicTransportData: BehaviorSubject<any> = new BehaviorSubject<any>('');

    currentBookingType: string;
    private autocompleteInitialized = false;
    @ViewChild('autocomplete') addressInput: any

    isSubmitLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    isSubmitLoading: boolean;
    private unsubscribe: Subscription[] = [];

    $fileObservables: Observable<object>[] = [];
    private routeSub: any;
    filteredOptions: google.maps.places.AutocompletePrediction[] = [];


    constructor(private stepperService: StepperService, private resourceService: ResourcesService,
                private userService: UserDataService,
                private route: ActivatedRoute,
                private router: Router,
                private roomService: RentalBookingService,
                private ticketService: TicketsBookingService,
                private timepickerService: TimepickerService,
                private productService: ProductListService,
                private timeslotService: BookingTimeslotsService,
                private toastService: ToastService,
                private createResourceService: CreateResourceService,
                private systemSettings: SystemSettingsService,
                private menuService: MenuService,
                private cdr: ChangeDetectorRef,
                private culturalBookingService: CulturalBookingService) {
        const loadingSubscr = this.isSubmitLoading$
            .asObservable()
            .subscribe((res) => (this.isSubmitLoading = res));
        this.unsubscribe.push(loadingSubscr);
        this.autocompleteService = new google.maps.places.AutocompleteService();
    }

    get publicTransportForm(): FormGroup {
        return this.resourceService.publicTransportForm;
    }

    get nearByForm(): FormGroup {
        return this.resourceService.nearByForm;
    }

    get attractionsForm(): FormGroup {
        return this.resourceService.attractionsForm;
    }

    get airportsForm(): FormGroup {
        return this.resourceService.airportsForm;
    }

    get avgPriceForm(): FormGroup {
        return this.resourceService.avgPriceForm;
    }

    addNearBy() {
        const newNearBy = new FormGroup({
            location: new FormControl(),
            distanceTo: new FormControl()
        });
        (this.resourceService.nearByForm.get('nearBy') as FormArray).push(newNearBy);
    }

    addTransport() {
        const newTransport = new FormGroup({
            transportType: new FormControl(),
            stationName: new FormControl(),
            distanceTo: new FormControl()
        });
        (this.resourceService.publicTransportForm.get('transports') as FormArray).push(newTransport);
    }

    addAttraction() {
        const newAttraction = new FormGroup({
            attractionName: new FormControl(),
            distanceTo: new FormControl()
        });
        (this.resourceService.attractionsForm.get('attractions') as FormArray).push(newAttraction);
    }

    addAirport() {
        const newAirport = new FormGroup({
            airportName: new FormControl(),
            distanceTo: new FormControl()
        });
        (this.resourceService.airportsForm.get('airports') as FormArray).push(newAirport);
    }

    removeTransport(index: number): void {
        const transportsArray = this.publicTransportForm.get('transports') as FormArray;
        transportsArray.removeAt(index);
    }

    removeNearBy(index: number): void {
        const nearByArray = this.nearByForm.get('nearBy') as FormArray;
        nearByArray.removeAt(index);
    }

    removeAirport(index: number): void {
        const airportsArray = this.airportsForm.get('airports') as FormArray;
        airportsArray.removeAt(index);
    }

    removeAttraction(index: number): void {
        const attractionsArray = this.attractionsForm.get('attractions') as FormArray;
        attractionsArray.removeAt(index);
    }

    ngOnInit() {
        this.addTransport();
        this.addNearBy();
        this.addAirport();
        this.addAttraction();
        // console.log('DATA ON INIT', this.form.value);
        // console.log('DATA ON INIT FROM SERV', this.resourceService.generalInformationForm$.getValue().value);
        // console.log('RESOURCE TEMPLATE DATA', this.resourceService.resourceTemplateData$.getValue().value);

        this.publicTransportForm.valueChanges.subscribe(item => {
            this.publicTransportData.next(item)
        })

        this.nearByForm.valueChanges.subscribe(item => {
            this.nearByData.next(item);
        })

        this.attractionsForm.valueChanges.subscribe(item => {
            this.attractionsData.next(item)
        })

        this.airportsForm.valueChanges.subscribe(item => {
            this.airportsData.next(item);
        })
        // if (this.resourceService.resourceId$.getValue()) {
        //     this.getCities(this.resourceService.resourceTemplateData$.getValue().country);
        // }

        this.formSections = [];
        this.formSectionsToSend = [];
        this.tripsAndItinAttributes = [];
        this.getCountries();
        this.createManualInputs();

        console.log('GENERAL INFO DE LA SERV 1', this.resourceService.generalInformationForm$.getValue())

        console.log('GENERAL-INFO', this.resourceService.resourceTemplateData$.getValue())
        this.tripsItinObj = this.resourceService.tripsItinerariesObject$.getValue();
        // console.log('OBJECT', this.tripsItinObj);
        this.tripsAndItineraries = this.resourceService.settingsTripsItineraries$.getValue();
        // Check if the resource have coordinates
        this.geographicalCoordinates = this.resourceService.resourceTemplateData$.getValue().geographicalCoordinates;
        // this.formSections = this.resourceService.attributesFromResourceTemplate$.getValue().filter(item => item.tabName !== 'facilities');


        // console.log('again',this.formSections);

        // this.form.addControl('title', new FormControl('title', Validators.required));
        // this.form.addControl('description', new FormControl('descr', Validators.required));
        // this.form.addControl('address', new FormControl('adress', Validators.required));
        // this.form.addControl('country', new FormControl('country', Validators.required));
        // this.form.addControl('city', new FormControl('city', Validators.required));
        // this.form.addControl('latitude', new FormControl('13254', Validators.required));
        // this.form.addControl('longitude', new FormControl('654', Validators.required));

        // Form Sections - Filtered

        this.form.controls['address'].valueChanges
            .pipe(
                tap(() => {
                    this.getAutocomplete()
                }),
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe();


        //TO CHECK
        this.resourceService.getAttributesData()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: attributes => {
                    console.log(attributes)
                    if (attributes === undefined) {
                        console.log(attributes)
                        this.formSections = [];
                        this.formSectionsToSend = [];
                        this.tripsAndItinAttributes = [];
                    } else {
                        this.tripsAndItinAttributes = [];
                        this.formSections = attributes;
                        const facilities = attributes.filter(item => item.tabName === 'facilities');
                        this.facilitiesTab = facilities[0];
                        console.log(attributes)
                        this.createDynamicForm(attributes);
                    }


                }
            })
        console.log(this.formSections[1].tabAttributes)


        // this.resourceService.listenForGeneralInfo()
        //     .pipe(takeUntil(this.ngUnsubscribe))
        //     .subscribe({
        //         next: listener => {
        //             //  console.log('LISTENER AICI', listener)
        //             if (listener) {
        //                 this.form.markAllAsTouched();
        //                 if (this.form.valid) {
        //                     // this.makeFormSectionsToSend();
        //                 } else {
        //                     return
        //                 }
        //             }
        //         }
        //     })


        // this.createDynamicForm(this.formSections);

        //for save resource
        if (this.resourceService.resourceId$.getValue()) {
            this.resourceId = this.resourceService.resourceId$.getValue();
        }

        this.currentBookingType = this.resourceService.resourceTemplateData$.getValue().bookingType;

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
        });

        /*this.routeSub = this.router.events.subscribe((event) => {
            if (event instanceof NavigationStart) {
                // save your data
                console.log('AM PLECAT PA PA');
                this.clearFields();
            }
        });*/

    }


    private getAutocomplete(): void {
        const {latitude, longitude} = this.form.controls;
        setTimeout(() => {
            if (google.maps.places) {
                this.autocompleteInitialized = true;

                if (google.maps.places) {
                    const autocomplete = new google.maps.places.Autocomplete(
                        this.addressInput.nativeElement,
                        {
                            componentRestrictions: {country: 'RO'}
                        }
                    );
                    google.maps.event.addListener(autocomplete, 'place_changed', () => {

                        this.autoCompletePlace = autocomplete.getPlace();
                        if (this.autoCompletePlace && this.autoCompletePlace.address_components) {
                            // Check if the place is a street
                            const isStreet = this.autoCompletePlace.address_components.some(component =>
                                component.types.includes('route')
                            );

                            if (isStreet) {
                                // Prefill latitude and longitude only if it's a street
                                latitude.setValue(this.autoCompletePlace.geometry?.location?.lat(), {emitEvent: true});
                                longitude.setValue(this.autoCompletePlace.geometry?.location?.lng(), {emitEvent: true});

                                // Update marker positions
                                this.updateMarkerPosition(latitude.value, longitude.value);
                                this.centerMap(latitude.value, longitude.value);
                                this.cdr.detectChanges(); // Manually trigger change detection


                            } else {
                                // Clear latitude and longitude if it's not a street
                                latitude.setValue('', {emitEvent: true});
                                longitude.setValue('', {emitEvent: true});

                                // Clear marker positions
                                this.markerPositions = [];
                            }
                        }
                    });
                }
            }
        }, 500);
        this.cdr.detectChanges();

        if (this.autoCompletePlace) {
            this.autoCompletePlace.formatted_address = this.formattedAddress ? this.formattedAddress : this.autoCompletePlace?.formatted_address;
        }
    }

    updateMarkerPosition(latitude: number, longitude: number): void {
        this.markerPositions = [{lat: latitude, lng: longitude}];
        this.cdr.detectChanges(); // Manually trigger change detection
    }

    centerMap(latitude: number, longitude: number): void {
        this.googlemapOptions = {
            center: {lat: latitude, lng: longitude},
            zoom: 16,
        } as any;
    }


    /** Input Column Creator*/
    columnSize(size) {
        switch (size) {
            case 'full_row':
                return 'col-12'
            case 'half_row':
                return 'col-md-6 col-12'
            default:
                return 'col-12'
        }
    }

    createManualInputs() {

        this.form = this.resourceService.generalInformationForm$.getValue();
        console.log('initial form', {...this.form.value});
        console.log('initial state', {...this.resourceService.generalInformationForm$.getValue().value});

        if (this.resourceService.resourceId$.getValue()) {
            this.getCities(this.form.value.country);
        }
        // else if (this.form.value.country) {
        //     this.getCities(this.form.value.country);
        // }

        if (this.resourceService.resourceTemplateData$.getValue().bookingType === 'serviceBookingTimeSlots') {
            //  console.log('E IN TRAVEL');
            console.log('E IN TRAVEL', this.resourceService.travelId$.getValue());
            this.form.addControl('sharedExperience', new FormControl(this.resourceService.resourceId$.getValue() ? this.resourceService.resourceTemplateData$.getValue().sharedExperience : null))
            this.hasSharedExperience = true;
        } else {
            this.hasSharedExperience = false;
        }

        console.log('general info form', this.form.value);

        //if healthcare or education domain, hide "used for itineraries"
        if ((this.resourceService.medicalId$.getValue() === this.resourceService.resourceTemplateType$.getValue().domain) || (this.resourceService.educationId$.getValue() === this.resourceService.resourceTemplateType$.getValue().domain)) {
            this.form.addControl('forItinerary', new FormControl(this.resourceService.resourceId$.getValue() ? this.resourceService.resourceTemplateData$.getValue().forItinerary : null))
            this.hasForItinerary = true;
        } else {
            this.hasForItinerary = false;
        }

        // Create Manual Inputs
        this.form.addControl('title', new FormControl(this.resourceService.resourceId$.getValue() ? this.resourceService.resourceTemplateData$.getValue().title : null, Validators.required));
        this.form.addControl('description', new FormControl(this.resourceService.resourceId$.getValue() ? this.resourceService.resourceTemplateData$.getValue().description : null, Validators.required));

        if (this.resourceType === 'menu') {
            this.form.addControl('specific', new FormControl(this.resourceService.resourceId$.getValue() ? this.resourceService.resourceTemplateData$.getValue().specific : null, Validators.required));
            this.form.addControl('currency', new FormControl(this.resourceService.resourceId$.getValue() ? this.resourceService.resourceTemplateData$.getValue().currency : null, Validators.required))
        }
        this.form.addControl('address', new FormControl(this.resourceService.resourceId$.getValue() ? this.resourceService.resourceTemplateData$.getValue().address : null, Validators.required));
        this.form.addControl('country', new FormControl(this.resourceService.resourceId$.getValue() ? this.resourceService.resourceTemplateData$.getValue().country : null, Validators.required));
        this.form.addControl('city', new FormControl(this.resourceService.resourceId$.getValue() ? this.resourceService.resourceTemplateData$.getValue().city : null, Validators.required));
        this.form.addControl('sharedExperience', new FormControl(this.resourceService.resourceId$.getValue() ? this.resourceService.resourceTemplateData$.getValue().sharedExperience : null));
        this.form.addControl('forItinerary', new FormControl(this.resourceService.resourceId$.getValue() ? this.resourceService.resourceTemplateData$.getValue().forItinerary : null));

        if (this.resourceService.resourceTemplateData$.getValue().bookingType === 'culturalBooking') {
            this.form.addControl(
                'startDate',
                new FormControl(this.resourceService.resourceId$.getValue()
                    ? moment(this.resourceService.resourceTemplateData$.getValue().startDate).format('YYYY-MM-DDTHH:mm')
                    : this.currentDay.format('YYYY-MM-DDTHH:mm'), Validators.required));
            this.form.addControl(
                'endDate',
                new FormControl(this.resourceService.resourceId$.getValue()
                    ? moment(this.resourceService.resourceTemplateData$.getValue().endDate).format('YYYY-MM-DDTHH:mm')
                    : this.currentDay.format('YYYY-MM-DDTHH:mm'), Validators.required));
            this.hasStartEndDates = true;
        } else {
            this.hasStartEndDates = false;
        }
        // this.form.addControl('latitude', new FormControl(this.resourceService.resourceTemplateData$.getValue().geographicalCoordinates?.latitude));
        // this.form.addControl('longitude', new FormControl(this.resourceService.resourceTemplateData$.getValue().geographicalCoordinates?.longitude));

        this.form.addControl('latitude', new FormControl(this.resourceService.resourceId$.getValue() ? this.resourceService.resourceTemplateData$.getValue().geographicalCoordinates?.latitude : 0));
        this.form.addControl('longitude', new FormControl(this.resourceService.resourceId$.getValue() ? this.resourceService.resourceTemplateData$.getValue().geographicalCoordinates?.longitude : 0));
        // this.dataLoaded = true;
        // console.log('GENERAL INFO DE LA SERV', this.resourceService.generalInformationForm$.getValue())
        console.log('after form', {...this.form.value});
        console.log('after state', {...this.resourceService.generalInformationForm$.getValue().value});
    }

    private convertDataToCorrectFormat(): void {

    }

    /** Create Dynamic Form */
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
                        if (Array.isArray(multipleValue)) {
                            this.form.get(inputField.name).patchValue(multipleValue);
                        } else {
                            this.form.get(inputField.name).patchValue((multipleValue as string).split(','));

                        }
                        // this.form.get(inputField.name).patchValue(multipleValue.length > 0 ? multipleValue.split(',') : []);
                    }
                    const findTripIndex = this.tripsAndItineraries.find(attr => attr === inputField.categoryId);
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
                        this.form.addControl(inputField.name, new FormControl(inputField.attributeValue ? (inputField.attributeValue).split(',') : []))
                    }

                    this.form.addControl(inputField.name, new FormControl(inputField.attributeValue ? inputField.attributeValue : '', inputField.propertyRequired ? Validators.required : null));
                    const findTripIndex = this.tripsAndItineraries.find(attr => attr === inputField.categoryId);
                    // if (findTripIndex && section.tabName === 'general_info') {
                    //     this.tripsAndItinAttributes.push(inputField);
                    //     const sectionsFiltered = section.tabAttributes.filter(attr => attr.id !== inputField.id);
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

        this.resourceService.getRestaurantById(this.resourceService.resourceId$.getValue()).subscribe((values: any) => {
            this.formSections[1].tabAttributes.forEach(item => {
                if (!item.attributeValue) {
                    if (item.slug === 'public-transportation') {
                        const parsedArrayOfTransports: any = values?.about?.publicTransportation.map(items => {
                            return JSON.parse(items)
                        })

                        console.log(parsedArrayOfTransports)

                        const transportsFormArray = this.publicTransportForm.get('transports') as FormArray;
                        transportsFormArray.clear();

                        parsedArrayOfTransports.forEach(item => {
                            console.log(item)
                            const {transportType, stationName, distanceTo} = item;
                            //
                            const newTransport = new FormGroup({
                                transportType: new FormControl(transportType),
                                stationName: new FormControl(stationName),
                                distanceTo: new FormControl(distanceTo)
                            });

                            transportsFormArray.push(newTransport);
                        });

                    }
                } else {
                    if (item.slug === 'public-transportation') {
                        const parsedArrayOfTransports: any = JSON.parse(item.attributeValue)
                        const transportsFormArray = this.publicTransportForm.get('transports') as FormArray;
                        transportsFormArray.clear();
                        parsedArrayOfTransports.transports.forEach(item => {
                            const { transportType, stationName, distanceTo } = item;
                            const newTransport = new FormGroup({
                                transportType: new FormControl(transportType),
                                stationName: new FormControl(stationName),
                                distanceTo: new FormControl(distanceTo)
                            });

                            transportsFormArray.push(newTransport);

                        })
                    }
                }



                if (!item.attributeValue) {
                    if (item.slug === 'airport-distance') {
                        const airportFormArray = this.airportsForm.get('airports') as FormArray;
                        const parsedJson = JSON.parse(values?.about?.airportDistance);
                        airportFormArray.clear();
                        parsedJson.items.forEach(airport => {
                            console.log(airport)
                            if (airport.name !== null || airport.distance !== null) {
                                const newAirport = new FormGroup({
                                    airportName: new FormControl(airport.name),
                                    distanceTo: new FormControl(airport.distance)
                                });

                                airportFormArray.push(newAirport);
                            }
                        });

                    }

                } else {
                    if (item.slug === 'airport-distance') {
                        const airportFormArray = this.airportsForm.get('airports') as FormArray;
                        const parsedJson = JSON.parse(item.attributeValue);
                        airportFormArray.clear();
                        parsedJson.airports.forEach(airport => {
                            console.log(airport)
                            if (airport.name !== null || airport.distance !== null) {
                                const newAirport = new FormGroup({
                                    airportName: new FormControl(airport.airportName),
                                    distanceTo: new FormControl(airport.distanceTo)
                                });

                                airportFormArray.push(newAirport);
                            }
                        });

                    }
                }

                if (!item.attributeValue) {
                    if (item.slug === 'what\'s-nearby') {
                        const nearByFormArray = this.nearByForm.get('nearBy') as FormArray;
                        const parsedJson = JSON.parse(values?.about?.nearBy);

                        nearByFormArray.clear();

                        parsedJson.items.forEach(nearBy => {
                            console.log(nearBy)
                            if (nearBy.name !== null || nearBy.distance !== null) {
                                const newNearBy = new FormGroup({
                                    location: new FormControl(nearBy.name),
                                    distanceTo: new FormControl(nearBy.distance)
                                });

                                nearByFormArray.push(newNearBy);
                            }


                        });

                    }
                } else {
                    if (item.slug === 'what\'s-nearby') {
                        const nearByFormArray = this.nearByForm.get('nearBy') as FormArray;
                        const parsedJson = JSON.parse(item?.attributeValue);

                        nearByFormArray.clear();

                        parsedJson.nearBy.forEach(nearBy => {
                            if (nearBy.name !== null || nearBy.distance !== null) {
                                const newNearBy = new FormGroup({
                                    location: new FormControl(nearBy.location),
                                    distanceTo: new FormControl(nearBy.distanceTo)
                                });

                                nearByFormArray.push(newNearBy);
                            }


                        });

                    }
                }

            })
        })

        console.log(this.formSections[1].tabAttributes)
        this.formSections[1].tabAttributes = this.formSections[1].tabAttributes.map(item => {
            if (item.name === 'Public transportation' || item.name === 'What\'s nearby' || item.name === 'Airport distance') {
                item.hide = true;
            }
            return item;
        })
        // // this.dataLoaded = true;
        // console.log('lalallaalal', this.formSections);
        // console.log('FORM', this.form.value);

    }

    makeFormSectionsToSend() {
        this.formSectionsToSend = [];
        this.formSectionsToSend = this.formSections;
        this.formSectionsToSend.push(this.facilitiesTab);
        this.formSectionsToSend.map(section => {
            if (section.tabName === 'general_info') {
                this.tripsAndItinAttributes.forEach(attr => {
                    attr = {
                        ...attr,
                        attributeValue: this.form.get(attr.name).value
                    }
                    return section.tabAttributes.push(attr)
                })
            } else {
                try {
                    section.tabAttributes.forEach(attribute => {
                        if (attribute.valueType === 'multiple-select') {
                            this.form.get(attribute.name).patchValue(this.form?.get(attribute.name).value.join());
                        }

                    })
                } catch (error) {
                }

            }

        })

    }

    getCountries() {

        this.resourceService.getAllCountries().subscribe({
            next: (countries: []) => {
                this.countries = countries;
            }
        })
    }

    getCurrency(event): void {
        if (event?.value) {
            this.form.get('currency').patchValue(event.value);
        }
    }

    getSpecific(event): void {
        if (event?.value) {
            this.form.get('specific').patchValue(event.value);
        }
    }

    getCities(event): void {
        if (event?.value) {
            this.form.get('latitude').patchValue(0);
            this.form.get('longitude').patchValue(0);
        }

        const country = {
            country: event?.value ? event.value : event
        }
        this.resourceService.getCityFilter(0, -1, null, null, country).subscribe({
            next: (cities: any) => {
                this.cities = cities.content;
            }
        })
    }

    getCoordinates(event) {
        const name = {
            name: event.value
        }
        this.resourceService.getCityFilter(0, -1, null, null, name).subscribe({
            next: (city: any) => {
                this.form.get('latitude').patchValue(city.content[0].geographicalCoordinates.latitude);
                this.form.get('longitude').patchValue(city.content[0].geographicalCoordinates.longitude);
            }
        })

    }


    /** Go to next step*/
    nextStep() {

        // // Mark as touched
        this.form.markAllAsTouched()

        this.makeFormSectionsToSend();

        // // Check form validation
        if (this.form.invalid) {
            return
        }

        // Go the next step
        this.stepperService.nextStep();
        // this.resourceService.attributesFromResourceTemplate$.next(this.formSectionsToSend);
    }

    //for save resource
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

        this.ticketService.updateArray$.next([]);
        this.ticketService.refreshUpdateArray$.next(false);
        this.ticketService.createArray$.next([]);
        this.ticketService.refreshCreateArray$.next(false);
        this.ticketService.ticketsList$.next([]);
        this.ticketService.refreshTicketList$.next(false);
        this.ticketService.deleteArray$.next([]);

        this.culturalBookingService.culturalRoom$.next(null);

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


    private stringifyObjects(arr): any {
        return arr.transports.map(obj => {
            const newObj = {};
            for (let key in obj) {
                newObj[key] = String(obj[key]);
            }
            return JSON.stringify(newObj);
        });
    }

    saveResource() {
        this.isSubmitLoading = true;
        this.roomsArray = this.roomService.roomList$.getValue();

        const combineForms: any = new FormGroup({
            ...this.resourceService.generalInformationForm$.getValue().controls,
            ...this.resourceService.facilitiesForm$.getValue().controls,
            ...this.resourceService.filesForm$.getValue().controls,
            ...this.resourceService.airportsForm.controls,
            ...this.resourceService.nearByForm.controls,
            ...this.resourceService.attractionsForm.controls,
            ...this.resourceService.publicTransportForm.controls,
        })

        // Empty array
        const formData = [];

        // Sort form inputs by tabName
        for (const control in combineForms.controls) {
            this.resourceService.attributesFromResourceTemplate$.getValue().forEach((section) => {
                section.tabAttributes.forEach(attribute => {
                    if (attribute.name === control) {

                        if (attribute.name.includes('Airport')) {
                            formData.push({
                                tabName: section.tabName,
                                attributeName: control,
                                attributeId: attribute.id,
                                attributeValue: JSON.stringify(this.airportsData.getValue()),
                                attributeIconPath: attribute.icon.filePath
                            })
                        }

                        if (attribute.name.includes('Attractions')) {
                            formData.push({
                                tabName: section.tabName,
                                attributeName: control,
                                attributeId: attribute.id,
                                attributeValue: JSON.stringify(this.attractionsData.getValue()),
                                attributeIconPath: attribute.icon.filePath
                            })
                        }

                        if (attribute.name.includes('What\'s nearby')) {
                            formData.push({
                                tabName: section.tabName,
                                attributeName: control,
                                attributeId: attribute.id,
                                attributeValue: JSON.stringify(this.nearByData.getValue()),
                                attributeIconPath: attribute.icon.filePath
                            })
                        }

                        if (attribute.name.includes('Public transportation')) {
                            formData.push({
                                tabName: section.tabName,
                                attributeName: control,
                                attributeId: attribute.id,
                                attributeValue: JSON.stringify(this.publicTransportData.getValue()),
                                attributeIconPath: attribute.icon.filePath
                            })
                        }

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

                        console.log(formData)
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

        console.log('start date', combineForms.value?.startDate);

        // Formatted Form Object
        const formObject = {
            title: combineForms.value.title,
            description: combineForms.value.description,
            specific: combineForms.value.specific,
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
            bookingPolicies: combineForms.value?.bookingPolicies
                ? {
                    depositRequiredPercentage: combineForms.value.bookingPolicies?.depositRequiredPercentage || 0,
                    depositRequiredAmount: combineForms.value.bookingPolicies?.depositRequiredAmount || 0,
                    advancePartialPaymentPercentage: combineForms.value.bookingPolicies?.advancePartialPaymentPercentage || 0,
                    advanceFullPayment: combineForms.value.bookingPolicies?.advanceFullPayment || false,
                }
                : this.resourceService.resourceTemplateData$.getValue()?.bookingPolicies,
            startDate: (combineForms.value?.startDate !== 'Invalid date' && this.currentBookingType === 'culturalBooking') ? moment(combineForms.value?.startDate)?.format('YYYY-MM-DDTHH:mm') : null,
            endDate: (combineForms.value?.endDate !== 'Invalid date' && this.currentBookingType === 'culturalBooking') ? moment(combineForms.value?.endDate)?.format('YYYY-MM-DDTHH:mm') : null,
            domain: this.resourceService.resourceTemplateType$.getValue().domain,
            resourceTypeId: this.resourceService.resourceTemplateType$.getValue().resourceTypeId,
            bookingType: this.resourceService.resourceTemplateData$.getValue().bookingType,
            timetable: this.timepickerService.timetableList$.getValue().length > 0 ? this.timepickerService.timetableList$.getValue() : (!this.resourceService.resourceTemplateData$.getValue().timetable ? [] : this.resourceService.resourceTemplateData$.getValue().timetable),
            policy: this.resourceService.accommodationPolicy$.getValue() ? (Object.keys(this.resourceService.accommodationPolicy$.getValue()).length === 0 ? this.resourceService.resourceTemplateData$.getValue().policy : {accommodationPolicy: this.resourceService.accommodationPolicy$.getValue()}) : this.resourceService.resourceTemplateData$.getValue().policy,
            externalUrl: this.resourceService.externalUrl$.getValue(),
            sharedExperience: combineForms.value.sharedExperience,
            forItinerary: combineForms.value.forItinerary
        }

        if (this.resourceType === 'menu') {
            formObject['specific'] = combineForms.value.specific;
            formObject['currency'] = combineForms.value.currency;
        }


        console.log('FORM OBJ', formObject);

        if (this.resourceService.resourceId$.getValue()) {
            this.updateResource(formObject, combineForms);
            //added for policies check on menu
            // if (this.currentBookingType === 'menu' && this.timepickerService.timepickerId$.getValue()) {
            //     if ((this.timepickerService.changePolicies$.getValue().nonRefundable ||
            //             this.timepickerService.changePolicies$.getValue().modifiable ||
            //             (this.timepickerService.changePolicies$.getValue().freeCancellation.freeCancellation &&
            //                 this.timepickerService.changePolicies$.getValue().freeCancellation.deadlineDays > 0)) &&
            //         (this.timepickerService.bookingPolicies$.getValue().depositRequired && this.timepickerService.bookingPolicies$.getValue().depositRequiredAmount > 0) ) {
            //         this.updateResource(formObject, combineForms);
            //     } else {
            //         this.toastService.showToast('Eroare', 'Nu ai completat politicile de modificare și rezervare!', 'error');
            //         this.isSubmitLoading$.next(false);
            //     }
            //     //if not menu, everything works like before
            // } else {
            //     this.updateResource(formObject, combineForms);
            // }

        }

    }

    updateResource(formObject: object, combineForms: any) {
        this.resourceService.updateResource(this.resourceService.resourceId$.getValue(), formObject).subscribe({
            next: (data: any) => {
                console.log(data);

                const currentRelatedRes = this.resourceService.relatedResources$.getValue();
                const resourceRelatedRes = this.resourceService.resourceTemplateData$.getValue()?.relatedResources;
                if (resourceRelatedRes?.length > 0 && currentRelatedRes?.length > 0 && currentRelatedRes[0]?.id === resourceRelatedRes[0]) {
                    // nu fac nimic
                } else if (resourceRelatedRes?.length > 0 && currentRelatedRes?.length > 0 && currentRelatedRes[0]?.id !== resourceRelatedRes[0]) {
                    this.$fileObservables.push(this.resourceService.removeRelatedResource(resourceRelatedRes[0], this.resourceService.resourceId$.getValue()));
                    this.$fileObservables.push(this.resourceService.addRelatedresources(currentRelatedRes[0].id, this.resourceService.resourceId$.getValue()));
                } else if ((resourceRelatedRes?.length === 0 || !resourceRelatedRes) && currentRelatedRes?.length > 0) {
                    this.$fileObservables.push(this.resourceService.addRelatedresources(currentRelatedRes[0].id, this.resourceService.resourceId$.getValue()));
                } else if (resourceRelatedRes?.length > 0 && currentRelatedRes?.length === 0) {
                    this.$fileObservables.push(this.resourceService.removeRelatedResource(resourceRelatedRes[0], this.resourceService.resourceId$.getValue()));
                }

                // console.log('IMAGINE', combineForms.value.thumbnail);
                // console.log('IMAGINE', this.resourceService.resourceData.getValue().featuredImage);
                // console.log('cond', combineForms.value.thumbnail !== this.resourceService.resourceData.getValue().featuredImage)
                if (combineForms.value.thumbnail && (combineForms.value.thumbnail !== this.resourceService.resourceData.getValue().featuredImage)) {
                    const thumbnailData = new FormData();
                    thumbnailData.append('file', combineForms.value.thumbnail);
                    //A. Tache refactor this
                    // this.$fileObservables.push(this.resourceService.uploadResourceImage(this.resourceService.resourceId$.getValue(), thumbnailData));
                }

                if (combineForms.value.images?.length > 0) {
                    const newImages = combineForms.value.images.filter(x => this.resourceService.resourceData.getValue().images.indexOf(x) === -1);
                    console.log('Diferenta arrays', newImages);

                    if (newImages.length > 0) {
                        const imagesData = new FormData();
                        newImages.forEach(galleryFile => {
                            imagesData.append('files', galleryFile);
                        });
                        //A. Tache refactor this
                        // this.$fileObservables.push(this.resourceService.uploadDocAttachements(this.resourceService.resourceId$.getValue(), 'image', imagesData));
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
                        //A. Tache refactor this
                        // this.$fileObservables.push(this.resourceService.uploadDocAttachements(this.resourceService.resourceId$.getValue(), 'video', videosData));
                    }
                }

                if (data.success) {


                    if (this.ticketService.createArray$.getValue().length > 0) {
                        // Create new tickets
                        this.$fileObservables.push(this.ticketService.createTickets(this.resourceId, this.ticketService.createArray$.getValue()));
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
                                this.productService.createProduct(this.resourceId, product).subscribe({
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

                                            const attachArray = this.productService.attachmentArray$.getValue();
                                            attachArray.forEach(attach => {
                                                console.log('ATTACHMENT', attach)
                                                if (product.id === attach.id) {
                                                    console.log('imaginea cu id-ul ' + product.id + ' va avea astea', attach);
                                                    if (attach.attachmentFile !== undefined) {
                                                        const thumbnailData = new FormData();
                                                        thumbnailData.append('file', attach.attachmentFile);
                                                        console.log('thumb data', thumbnailData);

                                                        // this.$fileObservables.push( this.roomService.uploadRoomThumbnail(resp.reason, thumbnailData));
                                                        this.productService.uploadAttachmentForProduct(respAdd.reason, thumbnailData).subscribe({
                                                            next: thumb => {
                                                                console.log('attachment uploadat', thumb);
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

                                                    this.productService.attachmentArray$.next([]);
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


                                            const attachArray = this.productService.attachmentArray$.getValue();
                                            attachArray.forEach(attach => {
                                                console.log('ATTACHMENT', attach)
                                                if (product.id === attach.id) {
                                                    console.log('imaginea cu id-ul ' + product.id + ' va avea astea', attach);
                                                    if (attach.attachmentFile !== undefined) {
                                                        const thumbnailData = new FormData();
                                                        thumbnailData.append('file', attach.attachmentFile);
                                                        console.log('thumb data', thumbnailData);

                                                        // this.$fileObservables.push( this.roomService.uploadRoomThumbnail(resp.reason, thumbnailData));
                                                        this.productService.uploadAttachmentForProduct(product.id, thumbnailData).subscribe({
                                                            next: thumb => {
                                                                console.log('attachment uploadat', thumb);
                                                            }, error: (error) => {
                                                                if (error.error.reason === 'fileSizeTooBig') {
                                                                    this.toastService.showToast("Eroare", "Fisierul incărcat este prea mare! Încărcați o imagine mai mica de 2 MB!", "error");
                                                                } else if (error.error.reason === 'wrongExtension') {
                                                                    this.toastService.showToast("Eroare", "Formatul fisierului nu este permis!", "error");
                                                                } else {
                                                                    this.toastService.showToast("Eroare", "A aparut o problemă la încărcarea atasamentului!", "error");
                                                                }
                                                            }


                                                        })
                                                    }

                                                    this.productService.attachmentArray$.next([]);
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
                                this.$fileObservables.push(this.timeslotService.createService(this.resourceId, service))
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

                    // cultural booking
                    if (this.currentBookingType === 'culturalBooking' && this.culturalBookingService.culturalRoom$.getValue()) {
                        const modifiedCulturalRoom = this.culturalBookingService.culturalRoom$.getValue();
                        this.$fileObservables.push(this.culturalBookingService.updateCulturalRoom(modifiedCulturalRoom.id, modifiedCulturalRoom));
                    }

                    //menu-booking
                    if (this.currentBookingType === 'menu' && this.timepickerService.timepickerId$.getValue()) {
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
                    if (this.currentBookingType === 'menu') {
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
        const transportsArray = this.resourceService.publicTransportForm.get('transports') as FormArray;
        const nearByArray = this.resourceService.nearByForm.get('nearBy') as FormArray;
        const attractionsArray = this.resourceService.attractionsForm.get('attractions') as FormArray;
        const airportsArray = this.resourceService.airportsForm.get('airports') as FormArray;
        transportsArray.clear();
        nearByArray.clear();
        attractionsArray.clear();
        airportsArray.clear();
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
        this.routeSub?.unsubscribe();
    }

    protected readonly mapsOptions = mapsOptions;
}
