import {Component, OnDestroy, OnInit} from '@angular/core';
import {ReservationsService} from "../../../../shared/_services/reservations.service";
import {Subject, takeUntil} from "rxjs";
import {PageEvent} from "@angular/material/paginator";

@Component({
    selector: 'app-flight-bookings',
    templateUrl: './flight-bookings.component.html',
    styleUrls: ['./flight-bookings.component.scss']
})
export class FlightBookingsComponent implements OnInit, OnDestroy {
    private ngUnsubscribe = new Subject<void>();

    size = 3;
    page = 0;
    pageSizeArray = [5, 25, 50, 100];
    sort = 'date';
    dir = 'desc';
    totalElements = 0;

    flightsArray = [];


    constructor(private reservationService: ReservationsService) {
    }

    ngOnInit() {
        this.getFlightReservations();
    }

    getFlightReservations() {
        this.reservationService.getFlights(this.size, this.page, this.sort, this.dir)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (flightsList: any) => {
                    console.log(flightsList);
                    this.flightsArray = flightsList.content;
                    this.totalElements= flightsList.totalElements;
                    console.log('TOTAL ELEMENTS', flightsList.totalElements)
                }
            })
    }

    pageChanged(event: PageEvent) {
        console.log(event)
        this.page = event.pageIndex;
        this.size = event.pageSize;
        this.getFlightReservations();
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
