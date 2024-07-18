import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {Subject, throttleTime} from "rxjs";
import {Reservation} from "../../shared/_models/reservation.model";
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    ValidatorFn,
    Validators
} from "@angular/forms";
import {ReservationsService} from "../../shared/_services/reservations.service";
import {ToastService} from "../../shared/_services/toast.service";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {
    NGX_MAT_DATE_FORMATS,
    NgxMatDateFormats,
    NgxMatDatetimePickerModule
} from "@angular-material-components/datetime-picker";
import * as moment from "moment/moment";
import {MatDatepicker, MatDatepickerInputEvent, MatDatepickerModule} from "@angular/material/datepicker";
import {NgxMatMomentModule} from "@angular-material-components/moment-adapter";
import {MatMomentDateModule, MomentDateAdapter} from "@angular/material-moment-adapter";
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from "@angular/material/core";
import {MatLegacyFormFieldModule} from "@angular/material/legacy-form-field";
import {MatLegacyInputModule} from "@angular/material/legacy-input";
import {Resource} from "../../shared/_models/resource.model";
import {takeUntil} from "rxjs/operators";
import {Room} from "../../shared/_models/room.model";
import {RoomCardComponent, RoomEvent} from "../room-card/room-card.component";
import {MatDialogRef} from "@angular/material/dialog";

// If using Moment
const CUSTOM_MOMENT_FORMATS: NgxMatDateFormats = {
    parse: {
        dateInput: 'DD MM YYYY HH:mm',
    },
    display: {
        dateInput: 'DD MM YYYY HH:mm',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY'
    },
};

const MY_FORMATS = {
    parse: {
        dateInput: 'DD-MM-YYYY'
    },
    display: {
        dateInput: 'DD-MM-YYYY',
        monthYearLabel: 'YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'YYYY'
    }
};

type RoomWithQty = Room & { reservationQty?: number };

type ReservationRoom = {
    itemId?: string;
    quantity?: number;
    maximumAdultPeople?:number;
    maximumChildren?:number;
    changePolicies?: {
        nonRefundable?: boolean;
        freeCancellation?: {
            freeCancellation?: boolean;
            deadlineDays?: number;
        },
        modifiable?: boolean;
    }
};

@Component({
    selector: 'app-edit-reservation-modal',
    standalone: true,
    imports: [CommonModule, NgxMatDatetimePickerModule, NgxMatMomentModule, MatMomentDateModule, ReactiveFormsModule, MatLegacyFormFieldModule, TranslateModule, MatLegacyInputModule, MatDatepickerModule, RoomCardComponent, FormsModule],
    templateUrl: './edit-reservation-modal.component.html',
    styleUrls: ['./edit-reservation-modal.component.scss'],
    providers: [
        {provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_MOMENT_FORMATS},
        {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
        {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
        DatePipe
    ]
})
export class EditReservationModalComponent implements OnInit, OnDestroy {
    @Input() reservation: Reservation;
    // new object that we return to the parent component
    modifiedReservation: Reservation;
    @Input() resource: Resource;

    newAvailability: FormGroup;

    allRooms: RoomWithQty[] = null;
    selectedRooms: ReservationRoom[] = [];
    totalNights: number;

    currentDay = moment();
    nextDay = this.currentDay.clone().add(1, 'days');

    private ngUnsubscribe = new Subject<void>();

    constructor(private reservationsService: ReservationsService,
                private fb: FormBuilder,
                private toastService: ToastService,
                private translate: TranslateService,
                private datePipe: DatePipe,
                private activeModal: MatDialogRef<EditReservationModalComponent>) {
    }

    ngOnInit(): void {
        this.checkBookingTypeAndInitForm();
    }

    checkBookingTypeAndInitForm(): void {
        if (this.reservation.bookingType === 'menu') {
            this.newAvailability = this.fb.group({
                dateAsHour: [moment(new Date(this.reservation.checkIn), 'DD MM YYYY HH:mm'), Validators.required],
                adultsNumber: [
                    this.reservation?.reservationTimePicker?.adults,
                    [Validators.min(1), Validators.required]
                ],
                childrenNumber: [
                    this.reservation?.reservationTimePicker?.children,
                    Validators.min(0)
                ]
            });
        } else if (this.reservation.bookingType === 'rentalBooking') {
            this.newAvailability = this.fb.group({
                startDate: [moment(new Date(this.reservation.checkIn), 'DD MM YYYY'), Validators.required],
                endDate: [moment(new Date(this.reservation.checkOut), 'DD MM YYYY'), Validators.required],
                /*adultsNumber: [this.reservation?.rentalBooking?.adults, [Validators.min(1), Validators.required]],
                childrenNumber: [this.reservation?.rentalBooking?.children]*/
            });
            this.newAvailability.addValidators(this.startEndDateValidator);

            if (this.reservation?.rentalBooking?.items?.length > 0) {
                console.log('rezzzz', this.reservation);
                this.selectedRooms = [...this.reservation.rentalBooking.items];

                /*this.reservation.rentalBooking.items.forEach( item => {
                    if (item?.changePolicies?.modifiable) {
                        this.selectedRooms.push(item);
                    }
                });*/
            }

            this.getNewAvailableRooms();

            this.newAvailability.valueChanges
                .pipe(
                    throttleTime(500),
                    takeUntil(this.ngUnsubscribe)
                ).subscribe(() => {
                if (this.newAvailability.valid) {
                    this.getNewAvailableRooms();
                }
            });
        }
    }

    getNewAvailableRooms() {
        this.reservationsService.getNewAvailableRooms(
            this.resource.id,
            this.datePipe.transform(this.newAvailability.value.startDate.toDate(), 'yyyy-MM-dd'),
            this.datePipe.transform(this.newAvailability.value.endDate.toDate(), 'yyyy-MM-dd'),
            this.reservation.id)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    this.totalNights = res.totalNights;
                    this.allRooms = [...res.items];
                    this.allRooms.forEach((room, index) => {
                        const matchingReservationRoom = this.reservation.rentalBooking.items.find(item => item.itemId === room.id);

                        if (matchingReservationRoom) {
                            this.allRooms[index] = {
                                ...room,
                                changePolicies: {
                                    ...matchingReservationRoom?.changePolicies,
                                    modifiable: matchingReservationRoom?.changePolicies ? matchingReservationRoom?.changePolicies?.modifiable : false
                                },
                                reservationQty: matchingReservationRoom?.quantity
                            };
                        } else {
                            this.allRooms[index] = {
                                ...room,
                                reservationQty: 0
                            };
                        }
                    });
                    // sortam descrescator dupa nr de camere selectate
                    this.allRooms.sort((room1, room2) => {
                        if (room1.reservationQty < room2.reservationQty) {
                            return 1;
                        } else if (room1.reservationQty > room2.reservationQty) {
                            return -1;
                        }
                        return 0;
                    });
                    console.log(this.allRooms);
                },

                error: () => {
                    this.toastService.showToast(
                        this.translate.instant("TOAST.ERROR"),
                        this.translate.instant("TOAST.SERVER-ERROR"),
                        "error");
                }
            });
    }

    startEndDateValidator(form: AbstractControl): ValidatorFn {
        const startDate = form.get('startDate');
        const endDate = form.get('endDate');

        if (endDate.value && startDate.value >= endDate.value) {
            startDate.setErrors({startDateIsHigherOrEqual: true});
        } else {
            startDate.setErrors(null);
        }

        return;
    }

    decreaseNrGuests(formControlName: string): void {
        let currentValue = this.newAvailability.get(formControlName).value;
        if (currentValue === 0) {
            return;
        }
        this.newAvailability.get(formControlName).patchValue(--currentValue);
    }

    increaseNrGuests(formControlName: string): void {
        console.log('increase?', formControlName)
        let currentValue = this.newAvailability.get(formControlName).value;
        this.newAvailability.get(formControlName).patchValue(++currentValue);
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

    handleNewRoomNr(event: RoomEvent) {
        console.log('event', event, this.selectedRooms);
        if (event.number > 0) {
            const foundRoomIndex = this.selectedRooms.findIndex(selectedRoom => selectedRoom.itemId === event.room.id);
            if (foundRoomIndex >= 0) {
                this.selectedRooms[foundRoomIndex].quantity += 1;
            } else {
                console.log(event);
                this.selectedRooms.push({
                    itemId: event.room.id,
                    quantity: 1,
                    maximumAdultPeople: event.room.maximumAdultPeople,
                    maximumChildren: event.room.maximumChildren,
                    changePolicies: {...event.room.changePolicies}
                });
            }
        }
        if (event.number < 0) {
            const foundRoomIndex = this.selectedRooms.findIndex(selectedRoom => selectedRoom.itemId === event.room.id);
            if (foundRoomIndex >= 0) {
                if (this.selectedRooms[foundRoomIndex].quantity > 1) {
                    this.selectedRooms[foundRoomIndex].quantity -= 1;
                } else {
                    this.selectedRooms.splice(foundRoomIndex, 1);
                }
            }
        }
        console.log(this.selectedRooms);
    }

    editReservation() {
        console.log(this.newAvailability.value);
        this.newAvailability.markAllAsTouched();
        if (this.newAvailability.valid) {

            console.log('new', this.selectedRooms)




            if (this.reservation.bookingType === 'menu') {
                this.reservationsService.getNewAvailablePickerItems(
                    this.resource.bookingTimePickerId,
                    this.datePipe.transform(this.newAvailability.value.dateAsHour.toDate(), 'yyyy-MM-dd'),
                    this.datePipe.transform(this.newAvailability.value.dateAsHour.toDate(), 'HH:mm'),
                    this.reservation.id
                ).pipe(takeUntil(this.ngUnsubscribe))
                    .subscribe({
                        next: res => {
                            if (res.success) {
                                const newReservationTimePicker = {
                                    reservationTimePicker: {
                                        ...this.reservation.reservationTimePicker,
                                        adults: this.newAvailability.value.adultsNumber,
                                        children: this.newAvailability.value.childrenNumber,
                                        time: this.datePipe.transform(this.newAvailability.value.dateAsHour.toDate(), 'yyyy-MM-dd') + 'T' + this.datePipe.transform(this.newAvailability.value.dateAsHour.toDate(), 'HH:mm') + 'Z'
                                    }
                                };
                                this.modifiedReservation = {
                                    ...this.reservation,
                                    ...newReservationTimePicker
                                };

                                this.reservationsService.updateReservation(
                                    this.reservation.id,
                                    newReservationTimePicker
                                )
                                    .pipe(takeUntil(this.ngUnsubscribe))
                                    .subscribe({
                                        next: res => {
                                            if (res.success) {
                                                this.toastService.showToast(
                                                    this.translate.instant("TOAST.SUCCESS"),
                                                    'Your reservation has been updated',
                                                    "success");
                                                this.activeModal.close(this.modifiedReservation);
                                            }
                                        },

                                        error: err => {
                                            if (err.error.reason === 'notAvailable') {
                                                this.toastService.showToast(
                                                    this.translate.instant("TOAST.ERROR"),
                                                    this.translate.instant("TOAST.BOOKING.ERROR_NR_PEOPLE"),
                                                    "error");
                                            } else {
                                                this.toastService.showToast(
                                                    this.translate.instant("TOAST.ERROR"),
                                                    this.translate.instant("TOAST.SERVER-ERROR"),
                                                    "error");
                                            }
                                        }
                                    });
                            }
                        },

                        error: err => {
                            if (err.error.reason === 'wronglyEnteredDate' || err.error.reason === 'notAvailableTimePicker') {
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.BOOKING.INVALID_DATE"),
                                    "error");
                            }
                        }
                    });
            } else if (this.reservation.bookingType === 'rentalBooking') {
                let totalAdults = 0;
                let totalChildren = 0;

                this.selectedRooms.forEach((room) => {
                    totalAdults += room.maximumAdultPeople * room.quantity;
                    totalChildren += room.maximumChildren * room.quantity;
                });

                const newReservationRentalBooking = {
                    rentalBooking: {
                        ...this.reservation.rentalBooking,
                        adults: totalAdults,
                        children: totalChildren,
                        start: this.datePipe.transform(this.newAvailability.value.startDate.toDate(), 'yyyy-MM-dd'),
                        end: this.datePipe.transform(this.newAvailability.value.endDate.toDate(), 'yyyy-MM-dd'),
                        items: this.selectedRooms
                    }
                };
                this.modifiedReservation = {
                    ...this.reservation,
                    ...newReservationRentalBooking
                };

                this.reservationsService.updateReservation(this.reservation.id, newReservationRentalBooking)
                    .pipe(takeUntil(this.ngUnsubscribe))
                    .subscribe({
                        next: res => {
                            if (res.success) {
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.SUCCESS"),
                                    'Your reservation has been updated',
                                    "success");
                                this.activeModal.close(this.modifiedReservation);
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

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
