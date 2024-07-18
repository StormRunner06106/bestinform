import {Component, OnDestroy, OnInit} from '@angular/core';
import {of, Subject, switchMap} from "rxjs";
import {GuestsState, TripsStore} from "../_services/trips.store";
import {ActivatedRoute, Router} from "@angular/router";
import {takeUntil} from "rxjs/operators";
import {Trip} from "../../../shared/_models/trip.model";
import {TripRoomEvent} from "../../../standalone-components/trip-room-card/trip-room-card.component";
import {NgbAccordion} from "@ng-bootstrap/ng-bootstrap";
import {ToastService} from "../../../shared/_services/toast.service";

@Component({
    selector: 'app-trip-view',
    templateUrl: './trip-view.component.html',
    styleUrls: ['./trip-view.component.scss']
})
export class TripViewComponent implements OnInit, OnDestroy {

    tripId: string = null;
    tripData: Trip = null;

    guestsState: GuestsState = null;

    accordionRef: NgbAccordion;

    totalPrice = 0;

    private ngUnsubscribe = new Subject<void>();

    constructor(private tripsStore: TripsStore,
                private route: ActivatedRoute,
                private router: Router,
                private toastService: ToastService) {
    }

    ngOnInit(): void {
        this.getGuestsState();
        this.checkRouteForTripId();
    }

    getGuestsState(): void {
        this.guestsState = this.tripsStore.getGuestsState();

        if (!this.guestsState?.adultsNumber && !this.guestsState?.childrenNumber) {
            void this.router.navigate(['../../'], {relativeTo: this.route});
        }
    }

    checkRouteForTripId() {
        this.route.paramMap
            .pipe(
                switchMap( params => {
                    if (params.has('tripId')) {
                        this.tripId = params.get('tripId');
                        return this.tripsStore.getTripById(this.tripId);
                    }
                    return of(null);
                }),
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe({
                next: res => {
                    if (!res) return;

                    this.tripData = {...res};
                    console.log('TRIP', this.tripData);

                    this.initHotelAndRoomsState();
                }
            });
    }

    initHotelAndRoomsState() {
        this.tripsStore.setHotelState(this.tripData?.hotelList[0]?.hotelName);
        this.tripsStore.resetRoomsState();
    }

    handleHotelToggle(accordionRef: NgbAccordion, panelId: string): void {
        this.accordionRef = accordionRef;
        if (this.accordionRef.isExpanded(panelId)) {
            this.tripsStore.setHotelState(this.tripData.hotelList[+panelId].hotelName);
        }
    }

    handleNewRoomNr(event: TripRoomEvent) {
        this.totalPrice += event.priceChange;
        if (event.priceChange > 0) {
            this.tripsStore.increaseRoomQuantity(event.room);
        }
        if (event.priceChange < 0) {
            this.tripsStore.decreaseRoomQuantity(event.room);
        }
    }

    confirmSelection() {
        if (this.totalPrice > 0) {
            void this.router.navigate(['checkout'], {relativeTo: this.route});
        } else {
            this.toastService.showToast('Error', 'Select at least one room', 'error');
        }
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
