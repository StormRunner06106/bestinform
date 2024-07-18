import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subject, takeUntil} from "rxjs";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {Reservation} from "../../../shared/_models/reservation.model";
import {ReservationsService} from "../../../shared/_services/reservations.service";
import {UserDataService} from "../../../shared/_services/userData.service";
import {SettingsService} from "../../../shared/_services/settings.service";
import {ResourcesService} from "../../../shared/_services/resources.service";
import {ActivatedRoute} from "@angular/router";
import fileSaver from "file-saver";
import {SmartBillService} from "../../../shared/_services/smartbill.service";
import {ToastService} from "../../../shared/_services/toast.service";

@Component({
    selector: 'app-itinerary-bookings',
    templateUrl: './itinerary-bookings.component.html',
    styleUrls: ['./itinerary-bookings.component.scss']
})
export class ItineraryBookingsComponent implements OnInit, OnDestroy {

    private ngUnsubscribe = new Subject<void>();
    // addedReview=new EventEmitter();
    pageItems = [15, 25, 100];

    // MatPaginator Output
    pageEvent: PageEvent;
    page = 0;
    pageSize = 15;
    totalActiveElements: number;
    totalPastElements: number;
    totalCancelledElements: number;

    itinerayId: string;

    @ViewChild(MatPaginator) paginator: MatPaginator;

    //booking list
    activeBookingList: Array<Reservation> = [];
    pastBookingList: Array<Reservation> = [];
    cancelledBookingList: Array<Reservation> = [];
    lastNotReviewedBooking: any;

    //client data
    clientId: string;

    currency: string;

    constructor(
        private reservationService: ReservationsService,
        private userService: UserDataService,
        private settingsService: SettingsService,
        private resourcesService: ResourcesService,
        private cdr: ChangeDetectorRef,
        private route: ActivatedRoute,
        private smartBillService: SmartBillService,
        private toastService: ToastService
    ) {
    }

    ngOnInit(): void {

        this.route.paramMap.subscribe(paramMap => {
            this.itinerayId = paramMap.get('id');
            console.log('itinerary id', this.itinerayId);
        })

        this.getCurrentUser();
    }

    getCurrentUser() {
        this.userService.getCurrentUser()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (client: any) => {

                    this.clientId = client.id;
                    if (this.clientId) {
                        this.initBookingLists();
                    }
                }
            });
    }

    pageChanged(event) {
        this.page = event.pageIndex;
        this.pageSize = event.pageSize

        // Get All Documents List
        this.initBookingLists();
    }

    initBookingLists() {
        this.getActiveBookingList();
        this.getPastBookingList();
        this.getCancelledBookingList();
    }

    //for currency used by client
    getSettings() {
        this.settingsService.getCurrentSettings()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (settings: any) => {
                    this.currency = settings.currency === null ? 'EUR' : settings.currency;
                }
            });
    }


    getActiveBookingList() {
        const activeBookingsObject = {
            status: 'active',
            userId: this.clientId,
            bookingTypes: ["rentalBooking", "menu", "ticketBooking", "culturalBooking", "serviceBookingTimeSlots"],
            itineraryId: this.itinerayId
        }

        this.reservationService.listReservationFiltered(this.page, this.pageSize, 'date', 'desc', activeBookingsObject)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (bookings: any) => {
                    this.totalActiveElements = bookings.totalElements;
                    this.activeBookingList = bookings.content;
                }
            });
    }

    getPastBookingList() {
        const pastBookingsObject = {
            status: 'past',
            userId: this.clientId,
            bookingTypes: ["rentalBooking", "menu", "ticketBooking", "culturalBooking", "serviceBookingTimeSlots"],
            itineraryId: this.itinerayId
        }

        this.reservationService.listReservationFiltered(this.page, this.pageSize, 'date', 'desc', pastBookingsObject)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (bookings: any) => {
                    this.pastBookingList = bookings.content;
                    this.totalPastElements = bookings.totalElements;
                }
            });
    }

    getCancelledBookingList() {
        const activeBookingsObject = {
            status: 'canceled',
            userId: this.clientId,
            bookingTypes: ["rentalBooking", "menu", "ticketBooking", "culturalBooking", "serviceBookingTimeSlots"],
            itineraryId: this.itinerayId
        }

        this.reservationService.listReservationFiltered(this.page, this.pageSize, 'date', 'desc', activeBookingsObject)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (bookings: any) => {
                    this.cancelledBookingList = bookings.content;
                    this.totalCancelledElements = bookings.totalElements;
                }
            });
    }

    //add review to resource
    addReviewToResource(reservationId: string, review: boolean) {
        this.resourcesService.addReviewToResource(reservationId, review).subscribe((reviewData: any) => {
            if (reviewData.success) {
                this.listChanges();
            }
        });

    }

    listChanges() {
        this.resourcesService.triggerListChanges(true);
        this.getPastBookingList();
    }

    downloadBill(series: string, number: string) {
        if (!series || !number) {
            this.toastService.showToast('Eroare', 'Eroare de la server', 'error');
            return;
        }

        this.smartBillService.downloadFile(series, number).subscribe((file: any) => {
            const fileName = 'Factura-Rezervare.pdf';
            const blob = new Blob([file], {type: 'text/json; charset=utf-8'});
            fileSaver.saveAs(blob, fileName);

        }, () => {
            this.toastService.showToast('Eroare', 'Eroare de la server', 'error');
        });
    }


    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

}
