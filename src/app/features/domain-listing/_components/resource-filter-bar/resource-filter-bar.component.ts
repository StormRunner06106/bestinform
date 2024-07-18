import {ChangeDetectorRef, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {ResourceFilterService} from "../../../../shared/_services/resource-filter.service";
import {firstValueFrom, Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {ResourceType} from "../../../../shared/_models/resource-type.model";
import {NgbAccordion} from "@ng-bootstrap/ng-bootstrap";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DatePipe} from "@angular/common";
import * as moment from "moment";
import {ResourceFilters} from "../../../../shared/_models/resource-filters.model";
import {ResourceTemplate} from "../../../../shared/_models/resource-template.model";
import {MatDatepicker, MatDatepickerInputEvent} from "@angular/material/datepicker";
import {MatDatetimePickerInputEvent} from "@angular-material-components/datetime-picker";
import {CityRecommendation} from "../../../../shared/_models/city-recommendation.model";
import {UserLocationService} from "../../../../shared/_services/user-location.service";
import {User} from "../../../../shared/_models/user.model";

@Component({
    selector: 'app-resource-filter-bar',
    templateUrl: './resource-filter-bar.component.html',
    styleUrls: ['./resource-filter-bar.component.scss'],
    providers: [DatePipe]
})
export class ResourceFilterBarComponent implements OnInit, OnDestroy {
    @ViewChild('acc') accordionRef: NgbAccordion;

    resourceTemplate: ResourceTemplate = null;

    filterForm: FormGroup;
    recommendedCities: CityRecommendation[] = null;
    cityToSearch: string = null;

    allFilterOptionsFalse = true;

    // filter names
    filterSelection = {
        location: false,
        date: false,
        guests: false
    }
    accIsOpen = false;
    activeFilter = '';

    resourceTypeData: ResourceType;

    currentUser: User = null;

    tabIndex=0;

    @Output() filtersSubmitted = new EventEmitter<void>();

    currentDay = moment();
    nextDay = this.currentDay.clone().add(1, 'days');

    private ngUnsubscribe = new Subject<void>();
    crtUserCity: string;
    crtGeoCoordinates:any;
    secondLocation=false;
    currentGeoCoord: { latitude: string; longitude: string; };
    currentCity: string;

    constructor(private resourceFilterService: ResourceFilterService,
                private myComponentRef: ElementRef,
                private fb: FormBuilder,
                private datePipe: DatePipe,
                private userLocationService: UserLocationService,
                private cdr: ChangeDetectorRef) {
    }

    ngOnInit(): void {
        this.getCurrentUserLocation().then(() => {
            this.listenToResourceType();
            this.listenToResourceTemplate();
            this.submitFilters();
        });
    }

    /*@HostListener('document:click', ['$event'])
    clickOutside(event) {
        if(!this.myComponentRef.nativeElement.contains(event.target)) {
            if (this.accIsOpen) {
                this.filterSelection[this.activeFilter] = false;
                this.activeFilter = '';
                this.accordionRef.toggle('ngb-panel');
                this.accIsOpen = false;
            }
        }
    }*/

    async getCurrentUserLocation() {
        this.currentUser = await firstValueFrom(this.userLocationService.getCurrentUser());

         this.initFilterForm();
    }

    //set current location if no location found
    currentLocationFct(){
        this.userLocationService.getCurrentUser()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
            next: res=>{
                // this.currentCity=res.city;
                // this.currentGeoCoord=res.currentGeographicalCoordinates;

                this.filterForm.get('location').patchValue(res.city);
                this.filterForm.get('geographicalCoordinates').patchValue(res.currentGeographicalCoordinates);
            }
        });
    }

    initFilterForm() {
        const today = new Date();
        today.setMinutes(Math.ceil(today.getMinutes() / 15 + ((today.getMinutes() % 15) === 0 ? 1 : 0)) * 15);
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        this.currentGeoCoord=this.currentUser.currentGeographicalCoordinates;
        this.currentCity=this.currentUser.city;

        this.filterForm = this.fb.group({
            location: [this.currentUser.city],
            geographicalCoordinates: [this.currentUser.currentGeographicalCoordinates],
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
    }

    updateFormValue(formControlName: string, value: unknown) {
        this.filterForm.get(formControlName).patchValue(value);

        if(this.filterForm.get('geographicalCoordinates').value){

            this.toggleFilter('date');

        }
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

    submitFilters(): void {
        this.filtersSubmitted.emit();

        let filtersToSend: ResourceFilters;

        // we close the ngb accordion and reset the activeFilter
        if (this.activeFilter !== '') this.toggleFilter(this.activeFilter);

        if (this.resourceTemplate && this.resourceTypeData) {

            if (this.resourceTypeData?.filterOption?.location) {


                filtersToSend = {
                    // city: this.filterForm.get('location').value ? this.filterForm.get('location').value : null
                    geographicalCoordinates: this.filterForm.get('geographicalCoordinates').value || null
                };


                /*const currentUserNewLoc:User= {...this.currentUser,
                    city:this.filterForm.get('location').value,
                    currentGeographicalCoordinates: this.filterForm.get('geographicalCoordinates').value }


                this.userLocationService.updateCurrentUser(currentUserNewLoc)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe({
                    next:(res:any)=>{
                        console.log('succes la update coord', res)
                    },
                    error:(error:any)=>{
                        console.log('eroare la coordonate', error);
                    }
                });

                this.userLocationService.getCurrentUser()
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe({
                    next:(res:User)=>{
                        this.currentUser=res;

                    },
                    error:(error:any)=>{
                        console.log('eroare la currentUser', error);
                    }
                });

                // console.log("noile coordonate", this.filterForm.get('geographicalCoordinates').value);

                console.log('userul cu noua locatie',this.currentUser);*/

            }

            if (this.resourceTemplate.bookingType === 'rentalBooking') {
                filtersToSend = {
                    ...filtersToSend,
                    rentalBookingSearchFilterDTO: {
                        roomNumber: this.resourceTypeData?.filterOption?.adultChildrenAndRoomNumber ? this.filterForm.get('roomsNumber').value : null,
                        adults: (this.resourceTypeData?.filterOption?.adultChildrenAndRoomNumber
                            || this.resourceTypeData?.filterOption?.adultChildrenNumber
                            || this.resourceTypeData?.filterOption?.adultNumber)
                            ? this.filterForm.get('adultsNumber').value : null,
                        children: (this.resourceTypeData?.filterOption?.adultChildrenAndRoomNumber
                            || this.resourceTypeData?.filterOption?.adultChildrenNumber)
                            ? this.filterForm.get('childrenNumber').value : null,
                        startTime: this.resourceTypeData?.filterOption?.dateInterval
                            ? this.datePipe.transform(this.filterForm.get('startDate').value.toDate(), 'yyyy-MM-dd') : null,
                        endTime: this.resourceTypeData?.filterOption?.dateInterval
                            ? this.datePipe.transform(this.filterForm.get('endDate').value.toDate(), 'yyyy-MM-dd') : null

                    }
                };
            }

            if (this.resourceTemplate.bookingType === 'serviceBookingTimeSlots') {
                filtersToSend = {
                    ...filtersToSend,
                    bookingTimeSlotDate: this.resourceTypeData?.filterOption?.dateAsDay
                        ? this.datePipe.transform(this.filterForm.get('dateAsDay').value.toDate(), 'yyyy-MM-dd') : null
                };
            }

            if (this.resourceTemplate.bookingType === 'menu') {
                filtersToSend = {
                    ...filtersToSend,
                    timePickerSearch: {
                        timePickerDate: this.resourceTypeData?.filterOption?.dateAsHour
                            ? this.datePipe.transform(this.filterForm.get('dateAsHour').value.toDate(), 'yyyy-MM-dd') : null,
                        timePickerHour: this.resourceTypeData?.filterOption?.dateAsHour
                            ? this.datePipe.transform(this.filterForm.get('dateAsHour').value.toDate(), 'HH:mm') : null,
                        adults: (this.resourceTypeData?.filterOption?.adultChildrenAndRoomNumber
                            || this.resourceTypeData?.filterOption?.adultChildrenNumber
                            || this.resourceTypeData?.filterOption?.adultNumber)
                            ? this.filterForm.get('adultsNumber').value : null,
                        child: (this.resourceTypeData?.filterOption?.adultChildrenAndRoomNumber
                            || this.resourceTypeData?.filterOption?.adultChildrenNumber)
                            ? this.filterForm.get('childrenNumber').value : null
                    }
                }
            }

            if (this.resourceTemplate.bookingType === 'culturalBooking') {
                filtersToSend = {
                    ...filtersToSend,
                    eventDate: this.resourceTypeData?.filterOption?.dateAsDay
                        ? this.datePipe.transform(this.filterForm.get('dateAsDay').value.toDate(), 'yyyy-MM-dd') : null
                }
            }
        }

        this.resourceFilterService.updateSavedFilters(this.filterForm.value);

        this.resourceFilterService.updateFilters(filtersToSend)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe();
    }

    listenToResourceType() {
        this.resourceFilterService.resourceTypeObs$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    if (res.filterOption) {
                        for (const key of Object.keys(res.filterOption)) {
                            if (res.filterOption[key] === true) {
                                this.allFilterOptionsFalse = false;
                            }
                        }
                    }
                    this.resourceTypeData = res;
                }
            });
    }

    listenToResourceTemplate() {
        this.resourceFilterService.resourceTemplateObs$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    this.resourceTemplate = res;
                }
            });
    }

    searchForCities() {
        if (!this.cityToSearch || this.cityToSearch?.length < 3) {
            this.recommendedCities = null;

            //set user current location, if no location selected
            // this.currentLocationFct();
            this.filterForm.get('location').patchValue(this.currentUser.city);
            this.filterForm.get('geographicalCoordinates').patchValue(this.currentUser.currentGeographicalCoordinates);

            return;
        }

        this.resourceFilterService.getAllCitiesRecommended(this.cityToSearch)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(res => {
                if (!res) return;

                this.recommendedCities = [...res];
            });
    }

    toggleFilter(filterName: string): void {
        // acc is closed, we open it and modify the active filter
        if (!this.accIsOpen) {
            this.filterSelection[filterName] = true;
            this.activeFilter = filterName;
            this.accIsOpen = true;
            this.accordionRef.toggle('ngb-panel');
            return;
        }

        // acc is open and we click the active filter
        if (this.accIsOpen && this.activeFilter === filterName) {
            this.activeFilter = '';
            this.filterSelection[filterName] = false;
            this.accordionRef.toggle('ngb-panel');
            this.accIsOpen = false;
            return;
        }

        // acc is open and we click a different filter
        if (this.accIsOpen && this.activeFilter !== filterName) {
            this.filterSelection[this.activeFilter] = false;
            this.filterSelection[filterName] = true;
            this.activeFilter = filterName;
            return;
        }
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

        this.toggleFilter('guests');

    }

    startHourChanged(event: MatDatetimePickerInputEvent<moment.Moment>, nextElementRef: MatDatepicker<moment.Moment>) {
        if(!moment(event.value).isSameOrAfter(this.nextDay, 'hour')) return;
        this.nextDay = moment(event.value).clone().add(1, 'days');
        this.filterForm.get('endHour').patchValue(this.nextDay);
        nextElementRef.open();
    }

    endHourChanged(event: MatDatetimePickerInputEvent<moment.Moment>) {
        this.nextDay = moment(event.value).clone();
        this.toggleFilter('guests')
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
        // localStorage.removeItem('filterFormData');

    }

}
