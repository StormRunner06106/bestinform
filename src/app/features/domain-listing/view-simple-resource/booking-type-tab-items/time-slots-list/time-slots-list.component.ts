import {Component, OnDestroy, OnInit} from '@angular/core';
import {distinctUntilChanged, firstValueFrom, Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {BookingTypeItemsService, FilterFormValues} from "../booking-type-items.service";
import {AvailableTimeSlot, TimeSlot} from "../../../../../shared/_models/time-slot.model";
import {ActivatedRoute, Router} from "@angular/router";
import {DatePipe} from "@angular/common";
import {ToastService} from "../../../../../shared/_services/toast.service";

@Component({
    selector: 'app-time-slots-list',
    templateUrl: './time-slots-list.component.html',
    styleUrls: ['./time-slots-list.component.scss'],
    providers: [DatePipe]
})
export class TimeSlotsListComponent implements OnInit, OnDestroy {

    allTimeSlots: TimeSlot[] = null;
    availableTimeSlotsMap = new Map<TimeSlot, AvailableTimeSlot[]>;
    selectedTimeSlot: AvailableTimeSlot[] = null;

    formValues: FilterFormValues = null;

    private ngUnsubscribe = new Subject<void>();

    constructor(private bookingItemsService: BookingTypeItemsService,
                private router: Router,
                private route: ActivatedRoute,
                private datePipe: DatePipe,
                private toastService: ToastService) {
    }

    ngOnInit(): void {
        this.listenToFormValues();
    }

    listenToFormValues() {
        this.bookingItemsService.getFormValues()
            .pipe(
                distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
                takeUntil(this.ngUnsubscribe),
                ).subscribe({
                next: res => {
                    if (!res) {
                        return;
                    }

                    this.formValues = res;

                    this.getBookingTimeSlots();


                }
            });
    }

    getBookingTimeSlots() {
        this.bookingItemsService.getBookingTimeSlotListByResourceId()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    this.availableTimeSlotsMap = new Map<TimeSlot, AvailableTimeSlot[]>;
                    this.allTimeSlots = [...res];
                    this.selectedTimeSlot = [];

                    if (this.allTimeSlots) {
                        this.allTimeSlots.forEach(timeSlot => {
                            this.availableTimeSlotsMap.set(timeSlot, []);
                            this.selectedTimeSlot.push(null);
                        });
                    }

                    if (this.formValues?.dateAsDay) {
                        this.getAvailableSlotsByDate();
                    }
                }
            });
    }

    getAvailableSlotsByDate() {
        if (this.allTimeSlots && this.formValues?.dateAsDay) {
            this.allTimeSlots.forEach(async timeSlot => {
                const availableTimeSlots = await firstValueFrom(this.bookingItemsService.getAvailableSlotsByDate(
                    timeSlot.id,
                    this.datePipe.transform(this.formValues.dateAsDay.toDate(), 'yyyy-MM-dd')))
                    .catch(() => {
                        this.toastService.showToast(
                            'error',
                            `Nu exista ore disponibile pentru ${timeSlot.name}`,
                            'error'
                        );
                    });

                if (availableTimeSlots) {
                    this.availableTimeSlotsMap.set(timeSlot, availableTimeSlots);
                }
            });
        }
    }

    resetOtherRadioGroups(timeSlotIndex: number): void {
        if (!this.selectedTimeSlot) {
            return;
        }
        for (let i = 0; i < this.selectedTimeSlot.length; i++) {
            if (i !== timeSlotIndex) {
                this.selectedTimeSlot[i] = null;
            }
        }
    }

    bookTimeSlot(timeSlot: TimeSlot, timeSlotIndex: number) {
        console.log('time slot trimis', timeSlot)
        this.bookingItemsService.setTimeSlotState(timeSlot, this.selectedTimeSlot[timeSlotIndex]);
        void this.router.navigate(['checkout'], {relativeTo: this.route});
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
