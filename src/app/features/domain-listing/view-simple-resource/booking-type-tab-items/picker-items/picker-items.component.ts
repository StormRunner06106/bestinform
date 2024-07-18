import {Component, OnDestroy, OnInit} from '@angular/core';
import {BookingTypeItemsService, FilterFormValues} from "../booking-type-items.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {DatePipe} from "@angular/common";
import {ToastService} from "../../../../../shared/_services/toast.service";
import {TranslateService} from "@ngx-translate/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ResourceFilterService} from "../../../../../shared/_services/resource-filter.service";
import {ItinerariesStore} from "../../../../client-trips-itineraries/_services/itineraries.store";
import {BookingPolicies} from "../../../../../shared/_models/itinerary.model";

@Component({
    selector: 'app-picker-items',
    templateUrl: './picker-items.component.html',
    styleUrls: ['./picker-items.component.scss'],
    providers: [DatePipe]
})
export class PickerItemsComponent implements OnInit, OnDestroy {

    availablePickerItems: number = null;
    ignoreAvailability = false;

    formValues: FilterFormValues = null;

    guestsForm: FormGroup = this.fb.group({
        adultsNumber: [1, Validators.min(1)],
        childrenNumber: [0]
    });


    isItineraryModal = false;
    /*eatAndDrinkData: EatAndDrinkResourceRecommended = null;
    resourceFromItinerary: Resource = null;*/

    private ngUnsubscribe = new Subject<void>();

    optionsTodayPayment = 0;

    bookingPolicies: BookingPolicies;

    constructor(private bookingItemsService: BookingTypeItemsService,
                private resourceFilterService: ResourceFilterService,
                private itinerariesStore: ItinerariesStore,
                private router: Router,
                private route: ActivatedRoute,
                private datePipe: DatePipe,
                private toastService: ToastService,
                private translate: TranslateService,
                private fb: FormBuilder) {
    }

    ngOnInit(): void {
        this.checkIfItineraryModal();
        this.listenToFormValues();
    }

    checkIfItineraryModal() {
        this.isItineraryModal = this.resourceFilterService.checkIfItineraryModal();

        /*if (this.isItineraryModal) {
            firstValueFrom(this.itinerariesStore.destinationIndex$).then(index => {
                this.eatAndDrinkData = this.itinerariesStore.getTemporaryData().resources[index]?.eatAndDrinkResourcesRecommended;
                this.resourceFromItinerary = this.resourceFilterService.getResourceFromItinerary();
            });
        }*/
    }

    listenToFormValues() {
        this.bookingItemsService.getFormValues()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    if (!res) {
                        return;
                    }

                    this.formValues = res;
                    this.guestsForm.patchValue(this.formValues);
                    this.optionsTodayPayment = 0;


                    this.getAvailablePickerItems();
                }
            });
    }

    getAvailablePickerItems() {
        this.bookingItemsService.getAvailablePickerItems(
            this.datePipe.transform(this.formValues.dateAsHour.toDate(), 'yyyy-MM-dd'),
            this.datePipe.transform(this.formValues.dateAsHour.toDate(), 'HH:mm')
        )
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
            next: (res: any) => {
                if (res.success) {
                    this.bookingPolicies = res.bookingPolicies;
                    if (this.bookingPolicies) {
                        if (this.bookingPolicies?.depositRequiredAmount !== 0) {
                            this.optionsTodayPayment = (this.bookingPolicies?.depositRequiredAmount);
                        }
                    }

                    this.bookingItemsService.getTimepickerByResourceId()
                        .pipe(takeUntil(this.ngUnsubscribe))
                        .subscribe({
                            next: (timepicker: any) => {
                                if (timepicker?.ignoreAvailability) {
                                    // punem o limita foarte mare de invitati
                                    this.availablePickerItems = 100000;
                                    this.ignoreAvailability = true;
                                } else {
                                    this.availablePickerItems = +res.reason;
                                    this.ignoreAvailability = false;
                                }
                            }
                        })

                } else {
                    this.availablePickerItems = 0;
                    this.toastService.showToast(
                        this.translate.instant("TOAST.ERROR"),
                        this.translate.instant("TOAST.BOOKING.NOT_ENOUGH"),
                        'error'
                    );
                }
            },

            error: () => {
                this.availablePickerItems = 0;

                this.toastService.showToast(
                    this.translate.instant("TOAST.ERROR"),
                    this.translate.instant("TOAST.BOOKING.NOT_ENOUGH"),
                    'error'
                );
            }
        });
    }

    decreaseNrGuests(formControlName: string): void {
        let currentValue = this.guestsForm.get(formControlName).value;
        if (currentValue === 0) {
            return;
        }
        this.guestsForm.get(formControlName).patchValue(--currentValue);

        /*if (this.bookingPolicies) {
            if (this.bookingPolicies?.depositRequiredAmount !== 0) {
                const price = (this.bookingPolicies?.depositRequiredAmount);
                this.optionsTodayPayment = this.optionsTodayPayment - price;
            }
        }*/
    }

    increaseNrGuests(formControlName: string): void {
        let currentValue = this.guestsForm.get(formControlName).value;
        if(this.maxNrOfGuestsReached()) return;
        this.guestsForm.get(formControlName).patchValue(++currentValue);

        /*if (this.bookingPolicies) {
            if (this.bookingPolicies?.depositRequiredAmount !== 0) {
                const price = (this.bookingPolicies?.depositRequiredAmount);
                this.optionsTodayPayment = this.optionsTodayPayment + price;
            }
        }*/

    }

    maxNrOfGuestsReached(): boolean {
        const adultsNumber = this.guestsForm.get('adultsNumber').value;
        const childrenNumber = this.guestsForm.get('childrenNumber').value;
        return adultsNumber + childrenNumber === this.availablePickerItems;
    }

    confirmSelection(): void {

        if (!this.guestsForm.valid) {
            this.toastService.showToast(
                this.translate.instant("TOAST.ERROR"),
                "Select at least one adult",
                "error");
            return;
        }

        this.bookingItemsService.setGuestsState(this.guestsForm.value);
        this.bookingItemsService.setGuestsPrice(this.optionsTodayPayment);
        void this.router.navigate(['checkout'], {relativeTo: this.route});
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
