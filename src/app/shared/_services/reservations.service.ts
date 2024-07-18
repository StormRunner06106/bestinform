import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from "@angular/common/http";
import {BehaviorSubject, Observable} from 'rxjs';
import {Reservation} from "../_models/reservation.model";
import {Room} from "../_models/room.model";

@Injectable({
    providedIn: 'root'
})

export class ReservationsService {

    reservationId: string = null;

    // Functions For Changes Detection
    private listChanged = new BehaviorSubject(false);
    listChangedObs = this.listChanged.asObservable();

    // Trigger list changes
    triggerListChanges(message: boolean) {
        // Change the subject value
        this.listChanged.next(message);
    }

    constructor(private http: HttpClient) {
    }

    setReservationId(reservationId: string) {
        return this.reservationId = reservationId;
    }

    //list reservations
    listReservationFiltered(page: number, size: number, sort?: string, dir?: string, filters?: object) {
        return this.http.post('/bestinform/listReservationFiltered?page=' + page + '&size=' + size + '&sort=' + sort + '&dir=' + dir, filters);
    }

    //get reservation by id
    getReservationById(reservationId) {
        return this.http.get('/bestinform/getReservationById?reservationId=' + reservationId);
    }

    //change validity status
    changeValidityStatus(status: string, reservationId: string) {
        return this.http.put('/bestinform/changeValidityStatus?status=' + status + '&reservationId=' + reservationId, {});
    }

    //changeReservationStatus
    changeReservationStatus(status: string, reservationId: string, canceledReason: any) {
        return this.http.put('/bestinform/changeReservationStatus?status=' + status + '&reservationId=' + reservationId, canceledReason);
    }

    // createReservationTimeSlot
    createReservationTimeSlot(resourceId: string, reservationObj: Array<object>) {
        return this.http.post('/bestinform/createReservationTimeSlot?resourceId=' + resourceId, reservationObj);
    }

    // createReservationTimePicker
    createReservationTimePicker(resourceId: string, reservationObj: object) {
        return this.http.post('/bestinform/createReservationTimePicker?resourceId=' + resourceId, reservationObj);
    }

    // createReservationRentalBooking
    createReservationRentalBooking(resourceId: string, reservationObj: Array<object>) {
        return this.http.post('/bestinform/createReservationRentalBooking?resourceId=' + resourceId, reservationObj);
    }

    // createReservationProduct
    createReservationProduct(resourceId: string, reservationObj: Array<object>) {
        return this.http.post('/bestinform/createReservationProduct?resourceId=' + resourceId, reservationObj);
    }

    // createReservationCulturalBooking
    createReservationCulturalBooking(resourceId: string, reservationObj: Array<object>) {
        return this.http.post('/bestinform/createReservationCulturalBooking?resourceId=' + resourceId, reservationObj);
    }

    // createReservationCarBooking
    createReservationCarBooking(resourceId: string, reservationObj: object) {
        return this.http.post('/bestinform/createReservationCarBooking?resourceId=' + resourceId, reservationObj);
    }

    // createJobAplication
    createJobAplication(resourceId: string) {
        return this.http.post('/bestinform/createJobAplication?resourceId=' + resourceId, {});
    }


    // buyTickets
    buyTickets(resourceId: string, reservationObj: Array<object>) {
        return this.http.post('/bestinform/buyTickets?resourceId=' + resourceId, reservationObj);
    }

    // getUserListJobApplication
    getUserListJobApplication(resourceId: string) {
        return this.http.get('/bestinform/getUserListJobApplication?resourceId=' + resourceId);
    }

    // getReservationBySlug
    getReservationBySlug(slug: string) {
        return this.http.get('/bestinform/getReservationBySlug?slug=' + slug);
    }

    updateReservation(reservationId: string, reservation: Reservation) {
        return this.http.put<{
            success: boolean,
            reason: string
        }>('/bestinform/updateReservation?reservationId=' + reservationId, reservation);
    }

    // START: CHECK AVAILABILITY (before updating the reservation)
    getNewAvailablePickerItems(bookingTimePickerId: string, date: string, hour: string, reservationId: string) {
        return this.http.get<{
            success: boolean,
            reason: string
        }>('/bestinform/getNewAvailablePickerItems?bookingTimePickerId=' + bookingTimePickerId + '&date=' + date + '&hour=' + hour + '&reservationId=' + reservationId);
    }

    getNewAvailableRooms(resourceId: string, startTime: string, endTime: string, reservationId: string) {
        return this.http.post<{
            items?: Room[],
            totalNights?: number,
            totalPrice?: number
        }>('/bestinform/getNewAvailableRooms?resourceId=' + resourceId + '&startTime=' + startTime + '&endTime=' + endTime + '&reservationId=' + reservationId, {});
    }

    // END: CHECK AVAILABILITY

    //trip reservation
    listTripReservationFiltered(pageNumber: number, pageSize: number, sort: string, dir: string, filters?) {
        return this.http.post('/bestinform/listTripReservationsFiltered?page=' + pageNumber + '&size=' + pageSize + '&sort=' + sort + '&dir=' + dir, filters);
    }

    getTripById(tripId: string) {
        return this.http.get('/bestinform/getTripById?tripId=' + tripId);
    }


    markReservationAsRead(read: boolean, reservationId: string) {
        return this.http.put('/bestinform/markReservationAsRead?read=' + read + '&reservationId=' + reservationId, {});
    }

    //change validity status
    sendClientEmail(reservationId: string, message: string) {
        return this.http.put('/bestinform/sendClientEmail?reservationId=' + reservationId, message);
    }


    //FLIGHTS
    getFlights(size: number, page: number, sort: string, dir: string) {
        return this.http.post('/bestinform/getFlightOrderList?size=' + size + '&page=' + page + '&sort=' + sort + '&dir=' + dir, {});
    }

    getFlightOrderById(flightOrderId: string) {
        return this.http.get('/bestinform/getFlightOrderById?flightOrderId=' + flightOrderId);
    }

    getFlightTickets(flightReservationId: string) {
        return this.http.post('/bestinform/getFlightTickets?flightOrderId=' + flightReservationId, {});
    }
}
