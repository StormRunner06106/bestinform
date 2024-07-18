import {Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Observable, of, Subject, switchMap, tap} from "rxjs";
import {ResourceFilterService, SavedFilters} from "../../../../shared/_services/resource-filter.service";
import {Resource, ResourceAttribute} from "../../../../shared/_models/resource.model";
import {map, takeUntil} from "rxjs/operators";
import {ResourcesService} from "../../../../shared/_services/resources.service";
import {PaginationResponse} from "../../../../shared/_models/pagination-response.model";
import {ResourceType} from "../../../../shared/_models/resource-type.model";
import {ActivatedRoute} from "@angular/router";
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {BookingTypeItemsService} from "../../view-simple-resource/booking-type-tab-items/booking-type-items.service";
import * as moment from "moment";
import {MatDatepicker, MatDatepickerInputEvent} from "@angular/material/datepicker";
import {MatDatetimePickerInputEvent} from "@angular-material-components/datetime-picker";
import {SettingsService} from "../../../../shared/_services/settings.service";
import {SystemSettingsService} from "../../../../shared/_services/system-settings.service";

@Component({
    selector: 'app-resource-tabs',
    templateUrl: './resource-tabs.component.html',
    styleUrls: ['./resource-tabs.component.scss']
})
export class ResourceTabsComponent implements OnInit, OnDestroy {
    @Input() activeTabId: number;

    resourceTypeData: ResourceType = null;
    resourceData: Resource = null;

    savedFilters: SavedFilters = null;
    filterForm: FormGroup;

    // for the about tab
    resourceGeneralInfo: ResourceAttribute = null;
    resourceFacilities: ResourceAttribute = null;
    resourceAbout: ResourceAttribute = null;
    hasFacilitiesTrue = false;

    // for the events tab
    relatedResourcesObs$: Observable<PaginationResponse>;

    // check if there are any filter options in the resource type, so we know if we hide the search button
    allFilterOptionsFalse = true;

    currentDay = moment();
    nextDay = this.currentDay.clone().add(1, 'days');

    isItineraryModal = false;

    eventCategoryId: string;

    @Output() activeTabHasChangedEvent = new EventEmitter<number>();

    private ngUnsubscribe = new Subject<void>();

    constructor(private resourceFilterService: ResourceFilterService,
                private resourcesService: ResourcesService,
                private bookingItemsService: BookingTypeItemsService,
                private settingsService: SystemSettingsService,
                private route: ActivatedRoute,
                private fb: FormBuilder) {
    }

    ngOnInit(): void {
        this.checkIfItineraryModal();
        this.initFilterForm();
        this.listenForResource();
        this.listerForResourceType();
        this.getSystemSettings();
    }

    checkIfItineraryModal() {
        this.isItineraryModal = this.resourceFilterService.checkIfItineraryModal();
    }

    getSystemSettings() {
        this.settingsService.getSystemSetting().subscribe((resp: any) => {
            console.log('Setari', resp);
            this.eventCategoryId = resp.eventCategoryId;
        })
    }

    listenForResource() {
                
        this.resourceFilterService.resourceObs$
            .pipe(
                switchMap( resource => {
                    if (resource) {
                        this.bookingItemsService.setResourceId(resource.id);
                        console.log('model', resource);
                        if (resource.bookingType === 'menu') {
                            return this.resourcesService.getTimepickerByResourceId(resource.id).pipe(map( (timepicker: any) => {
                                this.bookingItemsService.setBookingTimePickerId(timepicker.id);
                                return {
                                    ...resource,
                                    bookingTimePickerId: timepicker.id
                                };
                            }))
                        } else if (resource.bookingType === 'culturalBooking' && resource.culturalBookingIds) {
                            this.bookingItemsService.setCulturalBookingId(resource.culturalBookingIds[0]);
                            return of(resource);
                        } else {
                            return of(resource); // Return null if the condition is not true
                        }

                    }
                }),
                takeUntil(this.ngUnsubscribe)
            ).subscribe({
                next: res => {
                    console.log('resource tabs', res);

                    this.resourceData = {...res};
                    
                    // cand ajungem pe view event
                    if (this.route.snapshot.queryParams?.book === 'ticket' && this.resourceData?.startDate) {
                        const eventDate = moment(new Date(this.resourceData.startDate), 'DD-MM-YYYY');
                        this.filterForm.get('dateAsDay').patchValue(eventDate);
                        this.bookingItemsService.updateFormValues(this.filterForm.value);
                    }

                    if (this.resourceData?.bookingType === 'rentalBooking') {
                        this.filterForm.addValidators(this.startEndDateValidator);
                    }

                    if (this.resourceData?.relatedResources?.length > 0) {
                        this.relatedResourcesObs$ = this.resourcesService
                            .listResourceFiltered(
                            0, -1, null, null,
                            {relatedResource: this.resourceData.id});
                    }

                    if (this.resourceData?.attributes) {
                        console.log('ATRIBUTE RES',this.resourceData?.attributes )
                        this.resourceData.attributes.forEach( attribute => {
                            if (attribute.tabName === 'general_info') {
                                this.resourceGeneralInfo = attribute;
                            }
                            if (attribute.tabName === 'about') {
                                this.resourceAbout = attribute;
                            }
                            if (attribute.tabName === 'facilities') {
                                this.resourceFacilities = attribute;
                                this.countFacilities(attribute.tabAttributes);
                            }
                            if (this.resourceGeneralInfo && this.resourceFacilities) {
                                return;
                            }
                        });
                    }
                }
            });
    }

    startEndDateValidator(form: AbstractControl): ValidatorFn {
        const startDate = form.get('startDate');
        const endDate = form.get('endDate');

        if (endDate.value && startDate.value > endDate.value) {
            startDate.setErrors({startDateIsHigher: true});
        } else {
            startDate.setErrors(null);
        }

        return;
    }

    listerForResourceType() {
        // const resourceTypeId = this.route.snapshot.paramMap.get('resourceTypeId');

        this.resourceFilterService.resourceTypeObs$
            .pipe(
                switchMap( res => {
                    if (!res) {
                        return of(null);
                        // return this.resourcesService.getResourceTypeById(resourceTypeId);
                    }
                    return of(res);
                }),
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe({
                next: res => {
                    if (!res) return;

                    this.resourceTypeData = {...res};

                    if (res?.filterOption) {
                        for (const key of Object.keys(res.filterOption)) {
                            if (res.filterOption[key] === true && key !== 'location') {
                                this.allFilterOptionsFalse = false;
                            }
                        }
                    }
                }
            });
    }

    initFilterForm() {
        const today = new Date();
        today.setMinutes(Math.ceil(today.getMinutes() / 15 + ((today.getMinutes() % 15) === 0 ? 1 : 0)) * 15);
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        this.filterForm = this.fb.group({
            // date filter options
            dateAsDay: [moment(today, 'DD-MM-YYYY')],
            dateAsHour: [moment(today, 'DD MM YYYY HH:mm')],
            startDate: [moment(today, 'DD-MM-YYYY')],
            endDate: [moment(tomorrow, 'DD-MM-YYYY')],
            startHour: [moment(today, 'DD MM YYYY HH:mm')],
            endHour: [moment(tomorrow, 'DD MM YYYY HH:mm')],
            // guests filter options
            adultsNumber: [1, Validators.min(1)],
            childrenNumber: [0, Validators.min(0)],
            roomsNumber: [1, Validators.min(1)]
        });

        this.savedFilters = this.resourceFilterService.getSavedFilters();
        this.filterForm.patchValue(this.savedFilters);
        this.bookingItemsService.updateFormValues(this.filterForm.value);
    }

    decreaseNrGuests(formControlName: string): void {
        let currentValue = this.filterForm.get(formControlName).value;
        if (currentValue === 0) {
            return;
        }
        this.filterForm.get(formControlName).patchValue(--currentValue);
    }

    increaseNrGuests(formControlName: string): void {
        let currentValue = this.filterForm.get(formControlName).value;
        this.filterForm.get(formControlName).patchValue(++currentValue);
    }

    applyFilters() {
        if (!this.filterForm.valid) {
            this.filterForm.markAllAsTouched();
            return;
        }

        this.bookingItemsService.updateFormValues(this.filterForm.value);
    }

    activeTabHasChanged(event: number) {
            this.activeTabId = event;
            this.activeTabHasChangedEvent.emit(event);
    }

    startDateChanged(event: MatDatepickerInputEvent<moment.Moment>, nextElementRef: MatDatepicker<moment.Moment>) {
        if(!moment(event.value).isSameOrAfter(this.nextDay, 'day')) {
            this.nextDay = moment(event.value).clone().add(1, 'days');
            return;
        } else {
            this.nextDay = moment(event.value).clone().add(1, 'days');
            this.filterForm.get('endDate').patchValue(this.nextDay);
            nextElementRef.open();
        }



    }

    endDateChanged(event: MatDatepickerInputEvent<moment.Moment>) {
        this.nextDay = moment(event.value).clone();
    }

    startHourChanged(event: MatDatetimePickerInputEvent<moment.Moment>, nextElementRef: MatDatepicker<moment.Moment>) {
        if(!moment(event.value).isSameOrAfter(this.nextDay, 'hour')) return;
        this.nextDay = moment(event.value).clone().add(1, 'days');
        this.filterForm.get('endHour').patchValue(this.nextDay);
        nextElementRef.open();
    }

    endHourChanged(event: MatDatetimePickerInputEvent<moment.Moment>) {
        this.nextDay = moment(event.value).clone();
    }

    countFacilities(facilitiesAttr){
        // console.log('FACILITIES TAB', facilitiesAttr);
        facilitiesAttr.forEach(attr => {
            if(attr.attributeValue === 'true'){
                this.hasFacilitiesTrue = true;
            }
        })
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
