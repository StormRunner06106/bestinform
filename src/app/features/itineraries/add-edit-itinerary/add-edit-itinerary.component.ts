import {Component, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import {Observable, of, Subject, switchMap} from "rxjs";
import {ItinerariesService} from "../_services/itineraries.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ResourceType} from "../../../shared/_models/resource-type.model";
import {Attribute} from "../../../shared/_models/attribute.model";
import {takeUntil} from "rxjs/operators";
import {ToastService} from "../../../shared/_services/toast.service";
import {TranslateService} from "@ngx-translate/core";
import {ModalMediaService} from "../../../shared/_services/modalmedia.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ActivatedRoute, Router} from "@angular/router";
import {Itinerary} from "../../../shared/_models/itinerary.model";
import {LocationService} from "../../../shared/_services/location.service";
import {ResourcesService} from "../../resources/_services/resources.service";

@Component({
    selector: 'app-add-edit-itinerary',
    templateUrl: './add-edit-itinerary.component.html',
    styleUrls: ['./add-edit-itinerary.component.scss'],
    providers: [ModalMediaService]
})
export class AddEditItineraryComponent implements OnInit, OnDestroy {

    rentalBookingResourceTypes$: Observable<ResourceType[]>;
    menuResourceTypes$: Observable<ResourceType[]>;
    ticketBookingResourceTypes$: Observable<ResourceType[]>;

    journeyThemeAttributes: Attribute[];
    typeOfDestinationAttributes: Attribute[];
    typeOfJourneyAttributes: Attribute[];

    itineraryForm: FormGroup;

    isEditMode = false;
    itineraryData: Itinerary;

    private ngUnsubscribe = new Subject<void>();

    countries = [];
    cities = [];

    constructor(private itinerariesService: ItinerariesService,
                private fb: FormBuilder,
                private translate: TranslateService,
                private toastService: ToastService,
                private modalService: NgbModal,
                private modalMediaService: ModalMediaService,
                private route: ActivatedRoute,
                private router: Router,
                private locationService: LocationService,
                private resourceService: ResourcesService) {
    }

    ngOnInit(): void {
        this.initForm();
        this.listenToRoute();
        this.listenToMedia();
        this.getAllAttributesForItinerary();
        this.getAllResourceTypes();
        this.getCountries();
    }

    listenToRoute() {
        this.route.paramMap
            .pipe(
                switchMap(route => {
                    if (route.has('itineraryId')) {
                        this.isEditMode = true;
                        return this.itinerariesService.getItineraryById(route.get('itineraryId'));
                    }
                    return of(null);
                }),
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe({
                next: res => {
                    if (!res) return;

                    this.itineraryData = res;
                    this.getCities(res.resources[0].country);
                    this.itineraryForm.patchValue(this.itineraryData);
                    this.getCoordinates(this.itineraryForm.get('resources.0.city').value);
                },
                error: () => {
                    this.toastService.showToast(
                        this.translate.instant("TOAST.ERROR"),
                        this.translate.instant("TOAST.BOOKING.NOT_FOUND"),
                        "error");
                }
            });
    }

    listenToMedia() {
        this.modalMediaService.currentImagesArray
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((array: any) => {
                if(array.length) {
                    if (array?.[0]?.for === 'itinerary-featuredImg') {
                        this.itineraryForm.get('featuredImage').setValue(array[0].selectedMedia);
                    } else {
                        this.itineraryForm.get('images').setValue(array);
                    }
                }
            });
    }

    removeImage(imageIndex: number): void {
        const modifiedImgArray = this.itineraryForm.get('images').value.slice();
        modifiedImgArray.splice(imageIndex, 1);
        this.modalMediaService.changeImageArray(modifiedImgArray);
    }

    openMedia(content: TemplateRef<unknown>) {
        // this.modalMediaService.sendImagesToService([this.domainImagesForm.value]);
        this.modalService.open(content, {centered: true, size: 'xl'});
    }

    getAllAttributesForItinerary() {
        this.itinerariesService.getCategoryAttributes()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(res => [this.journeyThemeAttributes, this.typeOfDestinationAttributes, this.typeOfJourneyAttributes] = res);
    }

    getAllResourceTypes() {
        this.rentalBookingResourceTypes$ = this.itinerariesService.getRentalBookingResourceTypes();
        this.menuResourceTypes$ = this.itinerariesService.getMenuResourceTypes();
        this.ticketBookingResourceTypes$ = this.itinerariesService.getTicketBookingResourceTypes();
    }

    initForm() {
        this.itineraryForm = this.fb.group({
            name: [null, Validators.required],
            description: [null, Validators.required],
            images: [null],
            featuredImage: [null],
            //
            journeyThemeId: [null, Validators.required],
            typeOfDestinationId: [null, Validators.required],
            typeOfJourneyId: [null, Validators.required],
            //
            accommodationResourceTypes: [null, Validators.required],
            eatAndDrinksResourceTypes: [null, Validators.required],
            dayActivityResourceTypes: [null, Validators.required],
            eveningActivityResourceTypes: [null, Validators.required],
            status: ['active'],
            //
            resources: this.fb.array([
                this.fb.group({
                    country: [null, Validators.required],
                    city: [null, Validators.required],
                    geographicalCoordinates:
                        this.fb.group({
                            longitude: [null, Validators.required],
                            latitude: [null, Validators.required]
                        })
                })
            ]),
            recommendation: [null]
        });
    }

    getCoordinates(event) {
        console.log('get coord', event);
        const name = {
            name: event
        }
        this.resourceService.getCityFilter(0, -1, null, null, name).subscribe({
            next: (city: any) => {
                console.log('get coord 2', city);
                this.itineraryForm.get('resources.0.geographicalCoordinates.latitude').patchValue(city.content[0].geographicalCoordinates.latitude);
                this.itineraryForm.get('resources.0.geographicalCoordinates.longitude').patchValue(city.content[0].geographicalCoordinates.longitude);
            }
        })

    }

    submitItinerary() {
        console.log(this.itineraryForm.value);
        this.itineraryForm.markAllAsTouched();

        if (this.itineraryForm.valid) {

            if (!this.isEditMode) {
                this.itinerariesService.createItinerary(this.itineraryForm.value)
                    .pipe(takeUntil(this.ngUnsubscribe))
                    .subscribe({
                        next: res => {
                            if (res.success) {
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.SUCCESS"),
                                    "Successfully created itinerary",
                                    "success");
                                void this.router.navigate(['../list'], {relativeTo: this.route});
                            }
                        },

                        error: () => {
                            this.toastService.showToast(
                                this.translate.instant("TOAST.ERROR"),
                                this.translate.instant("TOAST.SERVER-ERROR"),
                                "error");
                        }
                    });
            } else {
                this.itinerariesService.updateItinerary(this.itineraryData.id, this.itineraryForm.value)
                    .pipe(takeUntil(this.ngUnsubscribe))
                    .subscribe({
                        next: res => {
                            if (res.success) {
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.SUCCESS"),
                                    "Successfully updated itinerary",
                                    "success");
                                void this.router.navigate(['../list'], {relativeTo: this.route});
                            }
                        },

                        error: () => {
                            this.toastService.showToast(
                                this.translate.instant("TOAST.ERROR"),
                                this.translate.instant("TOAST.SERVER-ERROR"),
                                "error");
                        }
                    });
            }

        } else {
            this.toastService.showToast(
                this.translate.instant("TOAST.ERROR"),
                this.translate.instant("ERROR.REQUIRED-ALL"),
                "error");
        }

    }

    getCountries() {

        this.locationService.getAllCountries()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
            next: (countries: []) => {
                this.countries = countries;
                // console.log(this.countries)
            }
        })
    }


    getCities(event) {
        const country = {
            country: event.value ? event.value : event
        }
        this.locationService.getCityFilter(0, -1, null, null, country)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
            next: (cities: any) => {
                this.cities = cities.content;
            }
        })
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

}
