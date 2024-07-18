import {Component, OnDestroy, OnInit} from '@angular/core';
import {ItinerariesStore, ItineraryExtraInfo} from "../_services/itineraries.store";
import {ActivatedRoute, Router} from "@angular/router";
import {Itinerary} from "../../../shared/_models/itinerary.model";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {ToastService} from "../../../shared/_services/toast.service";
import {TranslateService} from "@ngx-translate/core";
import {FormControl, Validators} from "@angular/forms";

@Component({
    selector: 'app-edit-itinerary',
    templateUrl: './edit-itinerary.component.html',
    styleUrls: ['./edit-itinerary.component.scss']
})
export class EditItineraryComponent implements OnInit, OnDestroy {

    itineraryData: Itinerary = null;
    itineraryExtraInfo: ItineraryExtraInfo = null;

    newItinerary: Itinerary = null;
    itineraryName = new FormControl('', Validators.required);
    itineraryTotalPrice = 0;
    itineraryPaidAmount = 0;

    confirmBtnDisabled = false;

    private ngUnsubscribe = new Subject<void>();

    constructor(private itinerariesStore: ItinerariesStore,
                private route: ActivatedRoute,
                private router: Router,
                private toastService: ToastService,
                private translate: TranslateService) {
    }

    ngOnInit(): void {
        this.checkForStoreData();
    }


    checkForStoreData() {
        this.itineraryExtraInfo = this.itinerariesStore.getItineraryExtraInfo();

        if (!this.itineraryExtraInfo) {
            void this.router.navigate(['client', 'domain', this.route.snapshot.paramMap.get('domainId'), 'trips']);
        } else {
            if (this.itineraryExtraInfo.itineraryType === 'ai') {
                this.getItineraryData();
            } else if (this.itineraryExtraInfo.itineraryType === 'road-trip') {
                this.getRoadTripData();
            } else if (this.itineraryExtraInfo.itineraryType === 'manual') {
                this.getEmptyItineraryData();
            }
        }
    }

    getItineraryData() {
        this.itinerariesStore.getItineraryWithRecommendations()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    this.itineraryData = res;
                    this.newItinerary = structuredClone(this.itineraryData);
                    this.calculateTotalPrice();
                    console.log(this.itineraryData);
                }
            });
    }

    getRoadTripData() {
        this.itinerariesStore.getRoadTripWithRecommendations()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    this.itineraryData = res;
                    this.newItinerary = structuredClone(this.itineraryData);
                    this.calculateTotalPrice();
                    console.log(this.itineraryData);
                }
            });
    }

    getEmptyItineraryData() {
        this.itinerariesStore.getEmptyItinerary()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    this.itineraryData = res;
                    this.newItinerary = structuredClone(this.itineraryData);
                    this.calculateTotalPrice();
                    console.log(this.itineraryData);
                }
            });
    }

    calculateTotalPrice() {
        this.itineraryTotalPrice = 0;
        this.itineraryTotalPrice += this.newItinerary.transportPrice
            + this.newItinerary.accommodationPrice
            + this.newItinerary.eatAndDrinkPrice
            + this.newItinerary.dayActivityPrice
            + this.newItinerary.eveningActivityPrice;

        this.itineraryPaidAmount = 0;
        this.itineraryPaidAmount += this.newItinerary.transportPaidAmount
            + this.newItinerary.accommodationPaidAmount
            + this.newItinerary.eatAndDrinkPaidAmount
            + this.newItinerary.dayActivityPaidAmount
            + this.newItinerary.eveningActivityPaidAmount;
    }

    handleItineraryChanges(event: Itinerary, step: 'accommodation' | 'eatAndDrinks' | 'dayActivities' | 'eveningActivities') {

        switch (step) {
            case "accommodation": {
                this.newItinerary = {
                    ...this.newItinerary,
                    accommodationPaidAmount: event.accommodationPaidAmount,
                    accommodationPrice: event.accommodationPrice,
                    resources: this.newItinerary.resources.map( (location, locationIndex) => {
                        return {
                            ...location,
                            accommodationResourceRecommended: event.resources[locationIndex].accommodationResourceRecommended
                        }
                    })
                }
                break;
            }

            case "eatAndDrinks": {
                this.newItinerary = {
                    ...this.newItinerary,
                    eatAndDrinkPaidAmount: event.eatAndDrinkPaidAmount,
                    eatAndDrinkPrice: event.eatAndDrinkPrice,
                    resources: this.newItinerary.resources.map( (location, locationIndex) => {
                        return {
                            ...location,
                            eatAndDrinkResourcesRecommended: event.resources[locationIndex].eatAndDrinkResourcesRecommended
                        }
                    })
                }
                break;
            }

            case "dayActivities": {
                this.newItinerary = {
                    ...this.newItinerary,
                    dayActivityPaidAmount: event.dayActivityPaidAmount,
                    dayActivityPrice: event.dayActivityPrice,
                    resources: this.newItinerary.resources.map( (location, locationIndex) => {
                        return {
                            ...location,
                            dayActivityResourcesRecommended: event.resources[locationIndex].dayActivityResourcesRecommended
                        }
                    })
                }
                break;
            }

            case "eveningActivities": {
                this.newItinerary = {
                    ...this.newItinerary,
                    eveningActivityPaidAmount: event.eveningActivityPaidAmount,
                    eveningActivityPrice: event.eveningActivityPrice,
                    resources: this.newItinerary.resources.map( (location, locationIndex) => {
                        return {
                            ...location,
                            eveningActivityResourcesRecommended: event.resources[locationIndex].eveningActivityResourcesRecommended
                        }
                    })
                }
                break;
            }
        }

        this.calculateTotalPrice();
        console.log(this.newItinerary);
    }

    confirmItinerary() {
        this.confirmBtnDisabled = true;
        this.itineraryName.markAllAsTouched();

        if (this.itineraryExtraInfo?.itineraryType !== 'ai') {
            if (this.itineraryName.invalid) {
                this.toastService.showToast(
                    this.translate.instant("TOAST.ERROR"),
                    this.translate.instant("ERROR.REQUIRED-ALL"),
                    "error");
                this.confirmBtnDisabled = false;
                return;
            }
            this.newItinerary.name = this.itineraryName.value;
        }

        this.itinerariesStore.createItinerary(this.newItinerary)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    if (res.success) {
                        this.itinerariesStore.setNewItinerary({
                            ...this.newItinerary,
                            itineraryId: res.reason
                        });
                        void this.router.navigate(['checkout'], {relativeTo: this.route});
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

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

}
