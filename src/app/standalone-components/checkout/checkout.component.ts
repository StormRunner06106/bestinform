import {Component, OnDestroy, OnInit} from '@angular/core';
import {of, Subject, switchMap} from "rxjs";
import {ResourceFilterService} from "../../shared/_services/resource-filter.service";
import {takeUntil} from "rxjs/operators";
import {Resource} from "../../shared/_models/resource.model";
import {User} from "../../shared/_models/user.model";
import {UserDataService} from "../../shared/_services/userData.service";
import {FormBuilder, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {
    BookingTypeItemsService, CulturalBooking,
    FilterFormValues,
    ProductBooking,
    RentalBooking, SelectedSeat,
    TicketBooking, TimePickerReservation,
    TimeSlotBooking
} from "../../features/domain-listing/view-simple-resource/booking-type-tab-items/booking-type-items.service";
import {Ticket} from "../../shared/_models/ticket.model";
import * as moment from "moment";
import {ToastService} from "../../shared/_services/toast.service";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {CommonModule, DatePipe, KeyValuePipe, TitleCasePipe} from "@angular/common";
import {Room} from "../../shared/_models/room.model";
import {AvailableTimeSlot, TimeSlot} from "../../shared/_models/time-slot.model";
import {Product} from "../../shared/_models/product.model";
import {GuestsState, TripReservation, TripsStore} from "../../features/client-trips-itineraries/_services/trips.store";
import {MatLegacyFormFieldModule} from "@angular/material/legacy-form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatLegacySelectModule} from "@angular/material/legacy-select";
import {MatLegacyInputModule} from "@angular/material/legacy-input";
import {Trip, TripRoom} from "../../shared/_models/trip.model";
import {SystemSettingsService} from "../../shared/_services/system-settings.service";
import {SystemSetting} from "../../shared/_models/system-setting.model";
import {MatLegacySlideToggleModule} from "@angular/material/legacy-slide-toggle";
import {MatRadioButton, MatRadioModule} from "@angular/material/radio";
import {
    ItinerariesStore,
    ItineraryExtraInfo
} from "../../features/client-trips-itineraries/_services/itineraries.store";
import {Itinerary} from "../../shared/_models/itinerary.model";
import {PriceBookingPoliciesPipe} from "../../shared/_pipes/price-booking-policies.pipe";
import {CulturalRoom} from "../../shared/_models/cultural-room.model";
import {TicketService} from "../../shared/_services/tickets.service";
import {
    IPlaneTicket
} from "../../features/domain-listing/transportation/available-plane-tickets-list/available-plane-tickets-list.component";
import {
    ITrainTicket
} from "../../features/domain-listing/transportation/available-train-tickets-list/available-train-tickets-list.component";

@Component({
    selector: 'app-checkout',
    standalone: true,
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.scss'],
    imports: [
        CommonModule,
        DatePipe,
        KeyValuePipe,
        TitleCasePipe,
        ReactiveFormsModule,
        MatLegacyFormFieldModule,
        MatIconModule,
        MatLegacySelectModule,
        MatLegacyInputModule,
        MatLegacySlideToggleModule,
        FormsModule,
        TranslateModule,
        MatRadioModule,
        PriceBookingPoliciesPipe
    ],
    providers: [DatePipe]
})
export class CheckoutComponent implements OnInit, OnDestroy {

    resourceData: Resource = null;
    bookingType: string = null;

    currentUserData: User = null;

    systemSettings: SystemSetting = null;

    userDetailsForm = this.fb.group({
        firstName: [null],
        lastName: [null],
        email: [null],
        telephone: [null],
        country: [null]
    });

    specialRequest: string = null;

    filterFormValues: FilterFormValues = null;

    totalPrice = 0;
    loyaltyPointsInCurrencySpent = 0;
    loyaltyPointsInCurrencyGained = 0;
    useLoyaltyPoints = false;
    disabledLoyaltyPoints: boolean;

    // checkout items depending on booking type
    ticketState: Map<Ticket, number> = null;
    numberOfTickets = 0;
    ticketsPrice = 0;

    culturalRoomState: CulturalRoom = null;
    selectedSeats: SelectedSeat[] = null;
    culturalTicketsPrice = 0;

    roomState: Map<Room, number> = null;
    numberOfRooms = 0;
    roomsPrice = 0
    numberOfAdults = 0;

    timeSlotState: Map<TimeSlot, AvailableTimeSlot> = null;
    selectedTimeSlot: TimeSlot = null;
    selectedAvailableTimeSlot: AvailableTimeSlot = null;
    selectedTimeSlotMinutes: number = null;

    productState: Map<Product, number> = null;
    selectedProduct: Product = null;
    selectedProductQuantity: number = null;

    guestsState: GuestsState = null;


    // trips state
    tripState: Trip = null;
    tripGuestsState: GuestsState = null;
    hotelState: string = null;
    tripRoomsState: Map<TripRoom, number> = null;
    tripTotalPrice = 0;

    // itineraries state
    itineraryState: Itinerary & { itineraryId: string } = null;
    itineraryExtraInfo: ItineraryExtraInfo = null;
    itineraryTotalPrice = 0;

    checkoutType: 'resource' | 'trip' | 'itinerary' | 'transport';

    // transport
    currentCar: IPlaneTicket;
    carState = false;
    carTotalPrice = 0;

    ticketsState = false;
    currentTicket: IPlaneTicket;

    private ngUnsubscribe = new Subject<void>();

    constructor(private resourceFilterService: ResourceFilterService,
                private userDataService: UserDataService,
                private fb: FormBuilder,
                private router: Router,
                private route: ActivatedRoute,
                private bookingItemsService: BookingTypeItemsService,
                private toastService: ToastService,
                private translate: TranslateService,
                private datePipe: DatePipe,
                private tripsStore: TripsStore,
                private systemSettingsService: SystemSettingsService,
                private itinerariesStore: ItinerariesStore,
                private transportService: TicketService) {
    }

    ngOnInit(): void {
        this.verifyCheckoutType();
        this.getCurrentUserData();
        this.getSystemSettings();
    }

    verifyCheckoutType() {
        console.log('HERE', this.router.url.includes('itinerary'))
        const currentRoute = this.route.snapshot.paramMap;
        // resursa normala
        if (currentRoute.has('resourceId')) {
            this.checkoutType = 'resource';
            this.listenToFilterFormValues();
            this.listenForResource();

        // trip
        } else if (currentRoute.has('tripId')) {
            this.checkoutType = 'trip';
            this.tripState = this.tripsStore.getTripState();
            this.tripGuestsState = this.tripsStore.getGuestsState();
            this.hotelState = this.tripsStore.getHotelState();
            this.tripRoomsState = this.tripsStore.getRoomsState();

            for (const entry of this.tripRoomsState.entries()) {
                this.tripTotalPrice += entry[0].price * entry[1];
            }
            this.totalPrice = this.tripTotalPrice;

            if (!this.tripState) {
                void this.router.navigate(['../'], {relativeTo: this.route});
            }

            // itinerariu
        } else if (currentRoute.has('carId')) {
            this.checkoutType = 'transport';
            this.carState = true;
            this.totalPrice = this.carTotalPrice;
            this.getCarData(currentRoute.get('carId'));
        } else if (currentRoute.has('trainId')) {
            this.checkoutType = 'transport';
            this.ticketsState = true;
            this.totalPrice = this.carTotalPrice;
            this.getTrainData(currentRoute.get('trainId'));
        } else if (currentRoute.has('planeId')) {
            this.checkoutType = 'transport';
            this.ticketsState = true;
            this.totalPrice = this.carTotalPrice;
            this.getPlaneData(currentRoute.get('planeId'));
        } else {
            this.checkoutType = 'itinerary';
            this.itineraryState = this.itinerariesStore.getNewItinerary();
            this.itineraryExtraInfo = this.itinerariesStore.getItineraryExtraInfo();

            if (!this.itineraryState) {
                void this.router.navigate(['client', 'domain', this.route.snapshot.paramMap.get('domainId'), 'trips']);
                return;
            }

            this.itineraryTotalPrice += this.itineraryState.transportPrice
                + this.itineraryState.accommodationPrice
                + this.itineraryState.eatAndDrinkPrice
                + this.itineraryState.dayActivityPrice
                + this.itineraryState.eveningActivityPrice;

            this.totalPrice += this.itineraryState.transportPaidAmount
                + this.itineraryState.accommodationPaidAmount
                + this.itineraryState.eatAndDrinkPaidAmount
                + this.itineraryState.dayActivityPaidAmount
                + this.itineraryState.eveningActivityPaidAmount;
        }
    }

    getCarData(carId) {
        this.transportService.getCars()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (carList: any) => {
                    this.currentCar = carList.find(car => car.id == carId);
                    this.totalPrice += this.currentCar?.price;
                }
            })
    }

    getPlaneData(planeId) {
        this.transportService.getPlaneTickets()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (planeList: any) => {
                    this.currentTicket = planeList.find(plane => plane.transportNumber == planeId.toUpperCase());
                    this.totalPrice += this.currentTicket?.price;
                }
            })
    }

    getTrainData(trainId) {
        this.transportService.getTrainTickets()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (trainList: any) => {
                    this.currentTicket = trainList.find(train => train.transportNumber == trainId.toUpperCase());
                    this.totalPrice += this.currentTicket?.price;
                }
            })
    }

    listenForResource() {
        this.resourceFilterService.resourceObs$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    if (!res) {
                        void this.router.navigate(['../'], {relativeTo: this.route});
                    }

                    this.resourceData = {...res};
                    console.log('RESOURCE DATA: ', this.resourceData);
                    this.bookingType = this.resourceData?.bookingType;

                    if (this.bookingType === 'ticketBooking') {
                        this.ticketState = this.bookingItemsService.getTicketState();
                        this.ticketState.forEach((value, key) => {
                            console.log('ticket', value, key);
                            this.numberOfTickets += value;
                            this.ticketsPrice += value * key.price;
                            if (key.bookingPolicies) {
                                if (key.bookingPolicies?.advanceFullPayment) {
                                    this.totalPrice += value * key.price;

                                } else if (key.bookingPolicies?.advancePartialPaymentPercentage !== 0) {
                                    this.totalPrice += value * (key.price * key.bookingPolicies?.advancePartialPaymentPercentage / 100);

                                } else if (key.bookingPolicies?.depositRequiredAmount !== 0) {
                                    this.totalPrice += value * (key.bookingPolicies?.depositRequiredAmount);

                                } else if (key.bookingPolicies?.depositRequiredPercentage !== 0) {
                                    this.totalPrice += value * (key.price * key.bookingPolicies?.depositRequiredPercentage / 100);
                                }
                            }
                        });
                    }

                    if (this.bookingType === 'culturalBooking') {
                        this.culturalRoomState = this.bookingItemsService.getSelectedCulturalRoom();
                        this.selectedSeats = this.bookingItemsService.getSelectedSeats();
                        this.culturalTicketsPrice = this.selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

                        if (this.resourceData?.bookingPolicies) {
                            if (this.resourceData.bookingPolicies?.advanceFullPayment) {
                                this.totalPrice = this.culturalTicketsPrice;

                            } else if (this.resourceData?.bookingPolicies?.advancePartialPaymentPercentage !== 0) {
                                this.totalPrice = this.culturalTicketsPrice * this.resourceData?.bookingPolicies?.advancePartialPaymentPercentage / 100;

                            } else if (this.resourceData?.bookingPolicies?.depositRequiredAmount !== 0) {
                                this.totalPrice = this.resourceData?.bookingPolicies?.depositRequiredAmount;

                            } else if (this.resourceData?.bookingPolicies?.depositRequiredPercentage !== 0) {
                                this.totalPrice = this.culturalTicketsPrice * this.resourceData.bookingPolicies?.depositRequiredPercentage / 100;

                            }
                        }
                    }

                    if (this.bookingType === 'rentalBooking') {
                        this.roomState = this.bookingItemsService.getRoomState();
                        console.log('CAMERE PT TOTAL ', this.roomState);
                        this.roomState.forEach((value, key) => {
                            this.numberOfRooms += value;
                            this.roomsPrice += value * key.totalPrice;
                            this.numberOfAdults += key.maximumAdultPeople * value;
                            if (key.bookingPolicies) {
                                if (key.bookingPolicies?.advanceFullPayment) {
                                    this.totalPrice += value * key.totalPrice;

                                } else if (key.bookingPolicies?.advancePartialPaymentPercentage !== 0) {
                                    this.totalPrice += value * (key.totalPrice * key.bookingPolicies?.advancePartialPaymentPercentage / 100);

                                } else if (key.bookingPolicies?.depositRequiredAmount !== 0) {
                                    this.totalPrice += value * (key.bookingPolicies?.depositRequiredAmount);

                                } else if (key.bookingPolicies?.depositRequiredPercentage !== 0) {
                                    this.totalPrice += value * (key.totalPrice * key.bookingPolicies?.depositRequiredPercentage / 100);
                                }
                            }
                        });
                    }

                    if (this.bookingType === 'serviceBookingTimeSlots') {
                        this.timeSlotState = this.bookingItemsService.getTimeSlotState();
                        for (const entry of this.timeSlotState.entries()) {
                            this.selectedTimeSlot = entry[0];
                            this.selectedAvailableTimeSlot = entry[1];

                            if (this.selectedTimeSlot.bookingPolicies) {
                                if (this.selectedTimeSlot.bookingPolicies?.advanceFullPayment) {
                                    this.totalPrice += this.selectedTimeSlot.price;

                                } else if (this.selectedTimeSlot.bookingPolicies?.advancePartialPaymentPercentage !== 0) {
                                    this.totalPrice += (this.selectedTimeSlot.price * this.selectedTimeSlot.bookingPolicies?.advancePartialPaymentPercentage / 100);

                                } else if (this.selectedTimeSlot.bookingPolicies?.depositRequiredAmount !== 0) {
                                    this.totalPrice += (this.selectedTimeSlot.bookingPolicies?.depositRequiredAmount);

                                } else if (this.selectedTimeSlot.bookingPolicies?.depositRequiredPercentage !== 0) {
                                    this.totalPrice += (this.selectedTimeSlot.price * this.selectedTimeSlot.bookingPolicies?.depositRequiredPercentage / 100);
                                }
                            }
                        }
                        this.calculateLengthOfTimeSlot();
                    }

                    if (this.bookingType === 'productsList') {
                        this.productState = this.bookingItemsService.getProductState();
                        for (const entry of this.productState.entries()) {
                            this.selectedProduct = entry[0];
                            this.selectedProductQuantity = entry[1];
                        }
                        this.totalPrice = this.selectedProduct.price;
                    }

                    if (this.bookingType === 'menu') {
                        this.guestsState = this.bookingItemsService.getGuestsState();
                        this.totalPrice = this.bookingItemsService.getGuestsPrice();
                    }
                }
            });
    }

    getCurrentUserData() {
        this.userDataService.getCurrentUser()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    this.currentUserData = {...res};
                    this.userDetailsForm.patchValue(this.currentUserData);
                    this.userDetailsForm.get('country').patchValue(this.currentUserData?.billingAddress?.country);

                    if (this.checkoutType === 'itinerary') return;

                    this.useLoyaltyPoints = this.currentUserData.loyaltyPoints > 0 && this.totalPrice > 0;
                    this.disabledLoyaltyPoints = this.currentUserData.loyaltyPoints === 0 || this.totalPrice === 0;
                    if (this.useLoyaltyPoints) {
                        this.loyaltyPointsInCurrencySpent = this.currentUserData.loyaltyPoints * this.systemSettings.percentageLoyaltyPointsSpend;
                        this.loyaltyPointsInCurrencyGained = this.systemSettings.percentageLoyaltyPointsGain * (this.totalPrice - this.loyaltyPointsInCurrencySpent);
                    }

                }
            });
    }

    getSystemSettings() {
        this.systemSettingsService.systemSetting$
            .pipe(
                switchMap(res => {
                    if (!res) {
                        return this.systemSettingsService.getSystemSetting();
                    }
                    return of(res);
                }),
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe({
                next: res => {
                    this.systemSettings = {...res};
                    console.log(this.systemSettings);
                }
            });
    }

    listenToFilterFormValues() {
        this.bookingItemsService.getFormValues()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    if (!res) {
                        return;
                    }

                    this.filterFormValues = {...res};

                    // here we check for missing default values
                    if (!this.filterFormValues.dateAsDay) {
                        this.filterFormValues.dateAsDay = moment();
                    }
                }
            });
    }

    calculateLengthOfTimeSlot(): void {
        const endHour = new Date();
        const startHour = new Date();
        endHour.setHours(+this.selectedAvailableTimeSlot.endHour.split(':')[0]);
        endHour.setMinutes(+this.selectedAvailableTimeSlot.endHour.split(':')[1]);
        startHour.setHours(+this.selectedAvailableTimeSlot.startHour.split(':')[0]);
        startHour.setMinutes(+this.selectedAvailableTimeSlot.startHour.split(':')[1]);
        this.selectedTimeSlotMinutes = (endHour.getTime() - startHour.getTime()) / 60000;
    }

    checkReservationType() {
        if (this.tripState) {
            this.createTripReservation();
        } else if (this.itineraryState) {
            this.createItineraryReservation();
        } else {
            this.createResourceReservation();
        }
    }

    createTripReservation() {
        const tripReservation: TripReservation = {
            adults: this.tripGuestsState.adultsNumber,
            children: this.tripGuestsState.childrenNumber,
            hotelName: this.hotelState,
            loyaltyPoints: this.useLoyaltyPoints,
            items: Array.from(this.tripRoomsState).map(([key, value]) => {
                return {
                    name: key.name,
                    quantity: value
                }
            })
        }

        this.tripsStore.createTripReservation(tripReservation)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    if (res.success) {
                        this.toastService.showToast(
                            this.translate.instant("TOAST.SUCCESS"),
                            this.translate.instant("TOAST.BOOKING.SUCCESS"),
                            "success");
                        console.log('TRIP checkout', res);
                        // void this.router.navigate(['/client/booking-confirmation'], {relativeTo: this.route});
                        this.bookingItemsService.executeOneTimePaymentTripReservation(res.reason).subscribe((resp: any) => {
                            const redirectUrl = resp.reason;
                            window.location.href = redirectUrl;
                        })
                    }
                },
                error: err => {
                    switch (err.reason) {
                        case 'notAvailable':
                            this.toastService.showToast(
                                this.translate.instant("TOAST.ERROR"),
                                this.translate.instant("TOAST.BOOKING.NOT_AVAILABLE"),
                                "error");
                            break;

                        case 'notExists':
                            this.toastService.showToast(
                                this.translate.instant("TOAST.ERROR"),
                                this.translate.instant("TOAST.BOOKING.NOT_FOUND"),
                                "error");
                            break;

                        case 'invalidId':
                            this.toastService.showToast(
                                this.translate.instant("TOAST.ERROR"),
                                this.translate.instant("TOAST.BOOKING.INVALID_ID"),
                                "error");
                            break;

                        default:
                            this.toastService.showToast(
                                this.translate.instant("TOAST.ERROR"),
                                this.translate.instant("TOAST.SERVER-ERROR"),
                                "error");
                    }
                }
            });
    }

    createItineraryReservation() {

        console.log('Itinerary state:', {
            ...this.itineraryState,
            adults: this.itineraryExtraInfo.adultsNumber,
            children: this.itineraryExtraInfo.childrenNumber
        });

        this.itinerariesStore.createItineraryReservation({
            ...this.itineraryState,
            adults: this.itineraryExtraInfo.adultsNumber,
            children: this.itineraryExtraInfo.childrenNumber
        }).pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    if (res.success) {
                        this.toastService.showToast(
                            this.translate.instant("TOAST.SUCCESS"),
                            this.translate.instant("TOAST.BOOKING.SUCCESS"),
                            "success");
                        console.log('ITINERARY checkout', res);
                        // void this.router.navigate(['/client/booking-confirmation'], {relativeTo: this.route});
                        this.bookingItemsService.executeOneTimePaymentItinerary(this.itineraryState.itineraryId).subscribe((resp: any) => {
                            const redirectUrl = resp.reason;
                            window.location.href = redirectUrl;
                        })
                    }
                },
                error: err => {
                    switch (err.reason) {
                        case 'notAvailable':
                            this.toastService.showToast(
                                this.translate.instant("TOAST.ERROR"),
                                this.translate.instant("TOAST.BOOKING.NOT_AVAILABLE"),
                                "error");
                            break;

                        case 'notExists':
                            this.toastService.showToast(
                                this.translate.instant("TOAST.ERROR"),
                                this.translate.instant("TOAST.BOOKING.NOT_FOUND"),
                                "error");
                            break;

                        case 'invalidId':
                            this.toastService.showToast(
                                this.translate.instant("TOAST.ERROR"),
                                this.translate.instant("TOAST.BOOKING.INVALID_ID"),
                                "error");
                            break;

                        default:
                            this.toastService.showToast(
                                this.translate.instant("TOAST.ERROR"),
                                this.translate.instant("TOAST.SERVER-ERROR"),
                                "error");
                    }
                }
            });
    }

    createResourceReservation() {

        if (this.bookingType === 'ticketBooking') {
            const ticketBooking: TicketBooking = {
                tickets: Array.from(this.ticketState).map(([key, value]) => {
                    return {
                        itemId: key.id,
                        quantity: value
                    }
                }),
                date: this.datePipe.transform(this.filterFormValues.dateAsDay.toDate(), 'yyyy-MM-dd'),
                loyaltyPoints: this.useLoyaltyPoints,
                specialRequest: this.specialRequest
            };

            this.bookingItemsService.createReservationTicketBooking(ticketBooking)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe({
                    next: res => {
                        if (res.success) {
                            this.toastService.showToast(
                                this.translate.instant("TOAST.SUCCESS"),
                                this.translate.instant("TOAST.BOOKING.SUCCESS"),
                                "success");
                            void this.router.navigate(['../booking-confirmation'], {relativeTo: this.route});
                            this.bookingItemsService.executeStripeOneTimePayment(res.reason).subscribe((resp: any) => {
                                if (resp.reason === 'bookingWithoutPayment') {
                                    void this.router.navigate(['/client/booking-confirmation']);
                                } else {
                                    const redirectUrl = resp.reason;
                                    window.location.href = redirectUrl;
                                }
                            })
                        }
                    },
                    error: err => {
                        switch (err.error.reason) {
                            case 'notEnoughTickets':
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.BOOKING.ERROR_NR_TICKETS"),
                                    "error");
                                break;

                            case 'invalidId':
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.BOOKING.INVALID_ID"),
                                    "error");
                                break;

                            case 'invalidDateToBookTicket':
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.BOOKING.INVALID_DATE"),
                                    "error");
                                break;

                            case 'notAvailable':
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.BOOKING.NOT_AVAILABLE"),
                                    "error"
                                );
                                break;

                            case 'seatNotFound':
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.BOOKING.NOT_FOUND"),
                                    "error");
                                break;

                            default:
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.SERVER-ERROR"),
                                    "error");
                        }
                    }
                });
        }

        if (this.bookingType === 'culturalBooking') {
            // TODO: ce date punem?
            const culturalBooking: CulturalBooking = {
                seats: this.selectedSeats,
                date: moment(this.resourceData?.startDate).format('YYYY-MM-DD'),
                loyaltyPoints: this.useLoyaltyPoints
            }

            this.bookingItemsService.createReservationCulturalBooking(culturalBooking)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe({
                    next: res => {
                        if (res.success) {
                            this.toastService.showToast(
                                this.translate.instant("TOAST.SUCCESS"),
                                this.translate.instant("TOAST.BOOKING.SUCCESS"),
                                "success");
                            // void this.router.navigate(['../booking-confirmation'], {relativeTo: this.route});
                            this.bookingItemsService.executeStripeOneTimePayment(res.reason).subscribe((resp: any) => {
                                if (resp.reason === 'bookingWithoutPayment') {
                                    void this.router.navigate(['/client/booking-confirmation']);
                                } else {
                                    const redirectUrl = resp.reason;
                                    window.location.href = redirectUrl;
                                }
                            })
                        }
                    },
                    error: err => {
                        switch (err.error.reason) {
                            case 'notAvailable':
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.BOOKING.NOT_AVAILABLE"),
                                    "error");
                                break;

                            case 'invalidId':
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.BOOKING.INVALID_ID"),
                                    "error");
                                break;

                            case 'seatNotFound':
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.BOOKING.NOT_FOUND"),
                                    "error");
                                break;

                            default:
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.SERVER-ERROR"),
                                    "error");
                        }
                    }
                });
        }

        if (this.bookingType === 'rentalBooking') {
            const rentalBooking: RentalBooking = {
                items: Array.from(this.roomState).map(([key, value]) => {
                    return {
                        itemId: key.id,
                        quantity: value
                    }
                }),
                start: this.datePipe.transform(this.filterFormValues.startDate.toDate(), 'yyyy-MM-dd'),
                end: this.datePipe.transform(this.filterFormValues.endDate.toDate(), 'yyyy-MM-dd'),
                adults: this.numberOfAdults,
                children: this.filterFormValues.childrenNumber,
                loyaltyPoints: this.useLoyaltyPoints,
                specialRequest: this.specialRequest
            };

            this.bookingItemsService.createReservationRentalBooking(rentalBooking)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe({
                    next: res => {
                        console.log(res);
                        if (res.success) {
                            this.toastService.showToast(
                                this.translate.instant("TOAST.SUCCESS"),
                                this.translate.instant("TOAST.BOOKING.SUCCESS"),
                                "success");

                            // void this.router.navigate(['../booking-confirmation'], {relativeTo: this.route});

                            this.bookingItemsService.executeStripeOneTimePayment(res.reason).subscribe((resp: any) => {
                                if (resp.reason === 'bookingWithoutPayment') {
                                    void this.router.navigate(['/client/booking-confirmation']);
                                } else {
                                    const redirectUrl = resp.reason;
                                    window.location.href = redirectUrl;
                                }
                            })

                        }
                    },
                    error: err => {
                        console.log(err);
                        switch (err.error.reason) {
                            case 'invalidId':
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.BOOKING.INVALID_ID"),
                                    "error");
                                break;

                            case 'notAvailable':
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.BOOKING.NOT_AVAILABLE"),
                                    "error");
                                break;

                            case 'itemNotFound':
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.BOOKING.NOT_FOUND"),
                                    "error");
                                break;

                            case 'notEnoughItems':
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.BOOKING.NOT_ENOUGH"),
                                    "error");
                                break;

                            case 'notEnoughRoomForPeople':
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.BOOKING.NOT_ENOUGH"),
                                    "error");
                                break;

                            case 'rentForMinimumStayOrMore':
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.BOOKING.RENT_MIN_STAY"),
                                    "error");
                                break;

                            case 'unavailableRoom':
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.BOOKING.NOT_AVAILABLE"),
                                    "error");
                                break;

                            default:
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.SERVER-ERROR"),
                                    "error");
                        }
                    }
                });
        }

        if (this.bookingType === 'serviceBookingTimeSlots') {
            const timeSlotBooking: TimeSlotBooking = {
                itemsNumber: 1,
                date: this.datePipe.transform(this.filterFormValues.dateAsDay.toDate(), 'yyyy-MM-dd'),
                hour: this.selectedAvailableTimeSlot.startHour,
                loyaltyPoints: this.useLoyaltyPoints,
                bookingTimeSlotId: this.selectedTimeSlot.id,
                specialRequest: this.specialRequest
            };

            this.bookingItemsService.createReservationTimeSlot(timeSlotBooking)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe({
                    next: res => {
                        console.log(res);
                        if (res.success) {
                            this.toastService.showToast(
                                this.translate.instant("TOAST.SUCCESS"),
                                this.translate.instant("TOAST.BOOKING.SUCCESS"),
                                "success");
                            // void this.router.navigate(['../booking-confirmation'], {relativeTo: this.route});
                            this.bookingItemsService.executeStripeOneTimePayment(res.reason).subscribe((resp: any) => {
                                if (resp.reason === 'bookingWithoutPayment') {
                                    void this.router.navigate(['/client/booking-confirmation']);
                                } else {
                                    const redirectUrl = resp.reason;
                                    window.location.href = redirectUrl;
                                }
                            })
                        }
                    },
                    error: err => {
                        switch (err.error.reason) {
                            case 'invalidId':
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.BOOKING.INVALID_ID"),
                                    "error");
                                break;

                            case 'notAvailable':
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.BOOKING.NOT_AVAILABLE"),
                                    "error");
                                break;

                            case 'wrongTimeEntered':
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.BOOKING.INVALID_DATE"),
                                    "error");
                                break;

                            case 'notAvailableItems':
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.BOOKING.NOT_AVAILABLE"),
                                    "error");
                                break;

                            case 'timeSlotNotAvailable':
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.BOOKING.NOT_AVAILABLE"),
                                    "error");
                                break;

                            default:
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.SERVER-ERROR"),
                                    "error");
                        }
                    }
                });
        }

        if (this.bookingType === 'productsList') {
            const productBooking: ProductBooking = {
                products: [this.selectedProduct.id],
                loyaltyPoints: this.useLoyaltyPoints,
                specialRequest: this.specialRequest
            };

            this.bookingItemsService.createReservationProduct(productBooking)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe({
                    next: res => {
                        if (res.success) {
                            this.toastService.showToast(
                                this.translate.instant("TOAST.SUCCESS"),
                                this.translate.instant("TOAST.BOOKING.SUCCESS"),
                                "success");
                            // void this.router.navigate(['../booking-confirmation'], {relativeTo: this.route});
                            this.bookingItemsService.executeStripeOneTimePayment(res.reason).subscribe((resp: any) => {
                                if (resp.reason === 'bookingWithoutPayment') {
                                    // void this.router.navigate(['/client/booking-confirmation']);
                                    // temporary fix
                                    void this.router.navigate(['/client/dashboard/profile'], {queryParams: {tab: 'courses'}});
                                } else {
                                    const redirectUrl = resp.reason;
                                    window.location.href = redirectUrl;
                                }
                            })
                        }
                    },
                    error: err => {
                        switch (err.error.reason) {
                            case 'invalidId':
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.BOOKING.INVALID_ID"),
                                    "error");
                                break;

                            case 'notAvailable':
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.BOOKING.NOT_AVAILABLE"),
                                    "error");
                                break;

                            case 'productNotFound':
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.BOOKING.NOT_FOUND"),
                                    "error");
                                break;

                            default:
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.SERVER-ERROR"),
                                    "error");
                        }
                    }
                });
        }

        if (this.bookingType === 'menu') {
            const timePickerReservation: TimePickerReservation = {
                adults: this.guestsState.adultsNumber,
                children: this.guestsState.childrenNumber,
                loyaltyPoints: this.useLoyaltyPoints,
                specialRequest: this.specialRequest,
                // TODO: FORMATUL ASTA NU REPREZINTA ORA CORECTA
                time: this.datePipe.transform(this.filterFormValues.dateAsHour.toDate(), 'yyyy-MM-dd') + 'T' + this.datePipe.transform(this.filterFormValues.dateAsHour.toDate(), 'HH:mm') + 'Z'
            };

            console.log('time picker res', timePickerReservation);

            this.bookingItemsService.createReservationTimePicker(timePickerReservation)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe({
                    next: res => {
                        console.log('res time picker', res);
                        if (res.success) {
                            this.toastService.showToast(
                                this.translate.instant("TOAST.SUCCESS"),
                                this.translate.instant("TOAST.BOOKING.SUCCESS"),
                                "success");
                            void this.router.navigate(['../booking-confirmation'], {relativeTo: this.route});
                            this.bookingItemsService.executeStripeOneTimePayment(res.reason).subscribe((resp: any) => {
                                if (resp.reason === 'bookingWithoutPayment') {
                                    void this.router.navigate(['/client/booking-confirmation']);
                                } else {
                                    const redirectUrl = resp.reason;
                                    window.location.href = redirectUrl;
                                }
                            })
                        }
                    },
                    error: err => {
                        switch (err.error.reason) {
                            case 'invalidId':
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.BOOKING.INVALID_ID"),
                                    "error");
                                break;

                            case 'notAvailable':
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.BOOKING.NOT_AVAILABLE"),
                                    "error");
                                break;

                            case 'wronglyEnteredNumberOfPeople':
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.BOOKING.ERROR_NR_PEOPLE"),
                                    "error");
                                break;

                            case 'wrongTimeEntered':
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.BOOKING.INVALID_DATE"),
                                    "error");
                                break;

                            default:
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.SERVER-ERROR"),
                                    "error");
                        }
                    }
                });
        }
    }

    recalculateTotalPrice() {
        if (this.useLoyaltyPoints) {
            this.loyaltyPointsInCurrencySpent = this.currentUserData.loyaltyPoints * this.systemSettings.percentageLoyaltyPointsSpend;
            this.loyaltyPointsInCurrencyGained = this.systemSettings.percentageLoyaltyPointsGain * (this.totalPrice - this.loyaltyPointsInCurrencySpent);
        } else {
            this.loyaltyPointsInCurrencySpent = 0;
            this.loyaltyPointsInCurrencyGained = 0;
        }
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

}
