import {ChangeDetectorRef, Component, Input} from '@angular/core';
import {Subject, Subscription, interval, takeUntil} from 'rxjs';
import {ReservationsService} from 'src/app/shared/_services/reservations.service';
import {ResourcesService} from 'src/app/shared/_services/resources.service';
import {UserDataService} from 'src/app/shared/_services/userData.service';
import {ActivatedRoute} from "@angular/router";
import {Router} from '@angular/router';
import {DatePipe} from '@angular/common'
import {SettingsService} from 'src/app/shared/_services/settings.service';
import {Resource} from 'src/app/shared/_models/resource.model';
import {User} from 'src/app/shared/_models/user.model';
import {StepperService} from "../../resources/_services/stepper.service";
import {SystemSetting} from "../../../shared/_models/system-setting.model";
import {SystemSettingsService} from "../../../shared/_services/system-settings.service";

@Component({
    selector: 'app-reservations-list',
    templateUrl: './reservations-list.component.html',
    styleUrls: ['./reservations-list.component.scss']
})
export class ReservationsListComponent {

    private ngUnsubscribe = new Subject<void>();

    @Input() providerPageId = null;

    providerId: string;
    paramResourceId: string;
    paramEventId: string;
    paramTripId: string;
    userId: string;

    //check data interval
    startDateIntervalValid: boolean;
    endDateIntervalValid: boolean;


    //table
    reservationsList: Array<string> = [];
    displayedReservationsColumns = ['id', 'reservationNumber', 'resourceName', 'guest', 'date', 'bookedOn', 'totalPayment', 'status', 'validityStatus', 'actions'];
    newDisplayedReservationsColumns = [];

    //pagination
    pageSizeArray = [10, 25, 100];
    pageSize = 10;
    pageNumber = 0;
    sorting = 'date';
    dir = 'desc';
    totalElements: number;
    currency: string;

    //filters
    isAdvanced = false;
    filterName: string;
    filterCountry: string;
    filterCity: string;
    filterDomain: string;
    filterCategory: string;
    filterSharedExperiences: boolean;
    filterStatus: string;
    filterStartDate: object;
    filterEndDate: object;
    filterResource: string;

    //get booking type from resource, for setting the table
    bookingTypeName: string;
    resourceTypeName: string;
    //rental booking type, needs number of rooms
    loadedData = false;

    //get role
    isStaff: boolean;
    isAdmin: boolean;
    isProvider: boolean;

    //get categories
    selectedDomain: string;
    categoriesList: Array<any> = [];

    resource: Resource;
    resourcesList: Array<Resource>;

    user: User;

    interval: any;
    categoryEventsId: string;

    noRes: boolean;

    constructor(
        private userService: UserDataService,
        private reservationService: ReservationsService,
        private resourcesService: ResourcesService,
        private cdr: ChangeDetectorRef,
        private route: ActivatedRoute,
        private router: Router,
        public datepipe: DatePipe,
        private settingsService: SettingsService,
        private stepperService: StepperService,
        private systemService: SystemSettingsService
    ) {
    }


    ngOnInit(): void {
        console.log('route', this.route)
        this.getRole();
        this.getSettings();
        this.getProviderId();
        //refresh page

        if (this.providerId || this.paramResourceId) {
            interval(10000)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe(() => {
                    if (this.paramTripId) {
                        this.getTripsList();
                    } else {
                        this.getReservationsList();
                    }

                });
        }



    }


    getSettings() {
        this.settingsService.getCurrentSettings()
            .subscribe((data: any) => {
                this.currency = data?.currency;
            })

        this.systemService.getSystemSetting().subscribe({
            next: (settings: SystemSetting) => {
                this.categoryEventsId = settings.eventCategoryId;
            }
        })
    }

    getResources(resource) {

        this.userService.getUserById(resource.userId).subscribe((resp: User) => {
            this.user = resp;
        })

        console.log('PARAM EVENT', this.paramEventId)
        console.log('PARAM RES', this.paramResourceId)
        const filters = {
            userId: this.resource.userId,
            excludedCategories: this.paramResourceId ? [this.categoryEventsId] : undefined,
            categoryId: this.paramEventId ? this.categoryEventsId : undefined
        }

        this.resourcesService.listResourceFiltered(0, -1, 'date', 'desc', filters).subscribe((resp: any) => {
            console.log('resp res', resp);
            this.resourcesList = resp.content;
        })
    }

    getRole() {
        this.userService.getCurrentUser()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (response: User) => {
                    this.isStaff = response.roles.includes('ROLE_STAFF');
                    this.isAdmin = response.roles.includes('ROLE_SUPER_ADMIN');
                    this.isProvider = response.roles.includes('ROLE_PROVIDER');
                }
            });
    }

    //get resource by id to get resource type ID
    getResourceInfo(idResource) {
        this.resourcesService.getResourceById(idResource)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (response: Resource) => {
                    this.resource = response;
                    this.filterResource = response?.id;
                    this.bookingTypeName = response?.bookingType;
                    this.setTableHeaderByResourceType(this.bookingTypeName);
                    this.getResources(response);
                }
            });
    }

    getTripInfo(tripId: string) {
        this.reservationService.getTripById(tripId)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (trip: any) => {
                    this.resource = trip;
                    this.setTableHeaderByResourceType();

                }
            })
    }

    changeDisp() {
        console.log('schimba disp');
        this.stepperService.stepperStage$.next('Configure/Edit');
        this.stepperService.step$.next(2);
        this.router.navigate(['../../resources/edit', this.filterResource], {relativeTo: this.route});
    }

    resourceChanged() {
        console.log('s-a schimbat resursa');
        if (this.paramResourceId) {
            this.router.navigate(['../../reservations/list'], {
                queryParams: {resourceid: this.filterResource},
                relativeTo: this.route
            },);

        } else if (this.paramEventId) {
            this.router.navigate(['../../reservations/list'], {
                queryParams: {eventid: this.filterResource},
                relativeTo: this.route
            },);
        }
    }

    setTableHeaderByResourceType(bookingTypeName?) {
        if (this.paramTripId) {
            this.newDisplayedReservationsColumns = ['id', 'reservationNumber', 'resourceName', 'checkIn', 'checkOut', 'status', 'actions'];

        } else {
            //get resourceType by idResource to get resourceTypeName,for table header
            this.resourcesService.getResourceTypeById(bookingTypeName)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe({
                    next: (resType) => {
                        console.log('resursa luata', resType)
                        // this.bookingTypeName=resType.nameEn
                        // console.log('TIPUL DE RESURSA Nume',this.resourceTypeName);

                        //set Table header
                        if (bookingTypeName === 'rentalBooking') {
                            this.newDisplayedReservationsColumns = ['id', 'reservationNumber', 'checkIn', 'checkOut', 'nights', 'bookedRooms', 'validityStatus', 'actions'];

                        } else if (bookingTypeName === 'menu') {
                            this.newDisplayedReservationsColumns = ['id', 'reservationNumber', 'restaurantDate', 'nrPersons', 'validityStatus', 'actions'];
                        } else if (bookingTypeName === undefined) {
                            this.newDisplayedReservationsColumns = ['id', 'reservationNumber', 'resourceName', 'guest', 'date', 'bookedOn', 'totalPayment', 'status', 'validityStatus', 'actions'];
                        } else {
                            this.newDisplayedReservationsColumns = ['id', 'reservationNumber', 'resourceName', 'guest', 'date', 'bookedOn', 'totalPayment', 'status', 'validityStatus', 'actions'];
                        }
                        console.log('Arrayul selectat:', this.newDisplayedReservationsColumns);
                    }
                });
        }

    }


    //get the provider's slug from url
    getProviderId() {
        if (this.providerPageId) {
            this.providerId = this.providerPageId;
            this.getReservationsList();
        } else if (this.router.url.includes('my-list')) {

            this.userService.getCurrentUser().subscribe((userData: any) => {
                this.providerId = userData.id;
                this.getReservationsList();
            })
        } else {
            this.route.queryParams
                .subscribe(params => {
                        //lista full
                        if (params === null) {
                            this.providerId = null;
                            this.getReservationsList();

                        } else if (params.providerid !== undefined) {
                            this.providerId = params.providerid;
                            this.getReservationsList();

                        } else if (params.eventid !== undefined) {
                            this.paramEventId = params.eventid;
                            //ia resura dupa id ca sa salvam tipul
                            this.getResourceInfo(params.eventid);
                            this.getReservationsList();
                        } else if (params.tripid !== undefined) {
                            this.paramTripId = params.tripid;
                            // this.getResourceInfo(params.tripId);
                            this.getTripInfo(params.tripid);
                            this.getTripsList();
                        } else  if (params.resourceid !== undefined) {
                            this.paramResourceId = params.resourceid;
                            //ia resura dupa id ca sa salvam tipul
                            this.getResourceInfo(params.resourceid);
                            this.getReservationsList();
                        } else {
                            console.log('caz else');
                            this.reservationsList = [];
                            this.noRes = true;
                        }
                    }
                );
        }
    }

    getTripsList() {
        const startDate = this.filterStartDate !== undefined ? (this.datepipe.transform(this.filterStartDate.toString(), "yyyy-MM-dd")) : null;
        const endDate = this.filterEndDate !== undefined ? (this.datepipe.transform(this.filterEndDate.toString(), "yyyy-MM-dd")) : null;

        const filter = {
            tripId: this.paramTripId,
            startDate: this.filterStartDate !== undefined ? startDate : null,
            endDate: this.filterEndDate !== undefined ? endDate : null

        }

        if ((filter.startDate === null) && (filter.endDate !== null)) {
            this.startDateIntervalValid = false;
        } else if ((filter.startDate !== null) && (filter.endDate === null)) {
            this.endDateIntervalValid = false;
        } else {
            this.startDateIntervalValid = true;
            this.endDateIntervalValid = true;

        }

        if (this.startDateIntervalValid && this.endDateIntervalValid) {
            this.reservationService.listTripReservationFiltered(this.pageNumber, this.pageSize, this.sorting, this.dir, filter)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe({
                    next: (tripList: any) => {
                        this.reservationsList = tripList.content;

                        this.totalElements = tripList.totalElements;
                        console.log('LISTA', this.reservationsList);
                        this.loadedData = true;
                    }
                })
        }
    }


    //get list of reservation
    getReservationsList() {
        const startDate = this.filterStartDate !== undefined ? (this.datepipe.transform(this.filterStartDate.toString(), "yyyy-MM-dd")) : null;
        const endDate = this.filterEndDate !== undefined ? (this.datepipe.transform(this.filterEndDate.toString(), "yyyy-MM-dd")) : null;

        const filter = {
            resourceId: this.paramResourceId !== undefined ? this.paramResourceId : (this.paramEventId !== undefined ? this.paramEventId : undefined),
            // resourceName:this.filterName !== '' ? this.filterName : null,
            // resourceDomain: this.filterDomain !== '' ? this.filterDomain : null,
            providerId: this.providerId !== undefined ? this.providerId : null,
            // country:this.filterCountry !== '' ? this.filterCountry : null ,
            // city: this.filterCity !== '' ? this.filterCity : null ,
            startDate: this.filterStartDate !== undefined ? startDate : null,
            endDate: this.filterEndDate !== undefined ? endDate : null

            // TO DO - daca avem query params adaugam camp pt filtrare providerId: din ruta
        }

        if ((filter.startDate === null) && (filter.endDate !== null)) {
            this.startDateIntervalValid = false;
        } else if ((filter.startDate !== null) && (filter.endDate === null)) {
            this.endDateIntervalValid = false;
        } else {
            this.startDateIntervalValid = true;
            this.endDateIntervalValid = true;

        }

        if (this.startDateIntervalValid && this.endDateIntervalValid) {
            this.reservationService.listReservationFiltered(this.pageNumber, this.pageSize, this.sorting, this.dir, filter)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe({
                    next: (res: any) => {
                        this.reservationsList = res.content;

                        this.totalElements = res.totalElements;
                        console.log('LISTA', this.reservationsList);
                        this.loadedData = true;
                    }
                });
        }

    }

    //pagination
    pageChanged(event) {
        this.pageNumber = event.pageIndex;
        this.pageSize = event.pageSize;

        if(this.paramTripId){
        this.getTripsList();
        }else{
            this.getReservationsList();
        }
    }

    //apply filter
    applyFilter(event?) {
        console.log('eventul de pe applyFilter', event);
        if (event.direction) {
            this.dir = event.direction;
            if (event.active === 'resourceName') {
                this.sorting = 'name';
            } else if (event.active === 'guest') {
                this.sorting = 'userId';
            } else if (event.active === 'bookedOn') {
                this.sorting = 'date';
            } else if (event.active === 'totalPayment') {
                this.sorting = 'totalPrice';
            } else {
                this.sorting = event.active;
            }

            // Go to first page
            // this.paginator.firstPage();

            // Listen to layout changes
            this.cdr.detectChanges();

            console.log('EVENT DIN REZERVARI', event);
            this.getReservationsList();
        } else {
            this.getReservationsList();

        }
    }

    //sorting
    // applyFilter(event?) {
    //     if (event.direction) {
    //         console.log(event);
    //         this.dir = event.direction;
    //         // this.dir = (event.direction === 'desc') || (event.direction === '') ? 'asc' : '';

    //         this.sorting = (event.active === 'title') ? 'companyName' : event.active;

    //         // Go to first page
    //         this.paginator.firstPage();

    //         // Listen to layout changes
    //         this.cdr.detectChanges();

    //         // Get All Documents List
    //         this.initiateData();
    //     }
    // }

    //display advenced filter
    advancedClick() {
        this.isAdvanced = !this.isAdvanced;
    }

    //get catecories
    getCategories(event?) {
        this.categoriesList = [];
        this.selectedDomain = event;

        this.resourcesService.getAllResourceCategoriesByResourceDomain(this.selectedDomain).subscribe((categories: any) => {
            categories.forEach(element => {
                this.categoriesList.push(element.nameEn);
            });
        })
    }

    calculateNrRooms(roomsArray) {
        let rooms = 0;
        roomsArray?.forEach(element => {
            rooms = rooms + element.quantity;
        })

        return rooms;
    }

    //calculate the number of dayes between check-in - check-out
    calculateNrNights(startData, endData): number {
        if ((startData !== undefined && endData !== undefined) || (startData !== null && endData !== null)) {
            //check-in data
            const a = new Date(startData);
            //check-out data
            const b = new Date(endData);
            //calculate num of days

            const numOfDays = Math.floor((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / (1000 * 60 * 60 * 24));

            return numOfDays;
            //   this.nights=numOfDays
            //   console.log('NUMARUL DE NOPTI', this.nights);
            // }else{
            //   this.nights=0;
            // }
        }
    }

    //clear filters
    clearFields() {
        this.filterName = undefined;
        this.filterCountry = undefined;
        this.filterCity = undefined;
        this.filterDomain = undefined;
        this.filterCategory = undefined;
        this.filterSharedExperiences = undefined;
        this.filterStatus = undefined;
        this.filterStartDate = undefined;
        this.filterEndDate = undefined;

        this.cdr.detectChanges();

        this.getReservationsList();
    }

    //clear
    clearfilterName() {
        this.filterName = undefined;
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
        clearInterval(this.interval);

    }


}
