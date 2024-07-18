import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Country} from "../../../shared/_models/country.model";
import {Location} from "../../../shared/_models/location.model";
import {TripsPagination} from "../../../shared/_models/trips-pagination.model";
import {of, tap} from "rxjs";
import {Trip, TripRoom} from "../../../shared/_models/trip.model";

export type TripsFilter = {
    name?: string;
    userId?: string;
    countryId?: string;
    locationId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
};

export type GuestsState = {
    adultsNumber: number;
    childrenNumber: number;
}

export type TripReservation = {
    adults?: number;
    children?: number;
    hotelName?: string;
    loyaltyPoints?: boolean;
    items?: Array<{
        name?: string;
        quantity?: number;
    }>;
}

@Injectable({
    providedIn: 'root'
})
export class TripsStore {

    constructor(private http: HttpClient) {
    }

    // START: COUNTRY
    private countryState: Country = null;

    setCountryState(country: Country) {
        this.countryState = {...country};
    }

    getCountryById(countryId: string) {
        if (this.countryState?.id === countryId) {
            return of(this.countryState);
        }
        return this.http.get<Country>('/bestinform/getCountryById?countryId=' + countryId);
    }

    getCountryList() {
        return this.http.get<Country[]>('/bestinform/getCountryList');
    }

    // END: COUNTRY


    // START: CITY
    getLocationListByCountryId(countryId: string) {
        return this.http.get<Location[]>('/bestinform/getLocationListByCountryId?countryId=' + countryId);
    }

    listTripsFiltered(page: number, size: number, sort: string, dir: string, filters: TripsFilter) {
        return this.http.post<TripsPagination>('/bestinform/listTripsFiltered?page=' + page + '&size=' + size + '&sort=' + sort + '&dir=' + dir, filters);
    }
    // END: CITY


    // START: TRIPS
    private tripState: Trip = null;

    setTripState(trip: Trip): void {
        this.tripState = {...trip};
    }

    getTripState(): Trip {
        return this.tripState;
    }

    getTripById(tripId: string) {
        if (this.tripState?.id === tripId) {
            return of(this.tripState);
        }
        return this.http.get<Trip>('/bestinform/getTripById?tripId=' + tripId)
            .pipe(tap(trip => this.setTripState(trip)));
    }
    // END: TRIPS


    // START: GUESTS
    private guestsState: GuestsState = null;

    setGuestsState(guestsState: GuestsState): void {
        this.guestsState = {...guestsState};
    }

    getGuestsState(): GuestsState {
        return {...this.guestsState};
    }
    // END: GUESTS


    // START: HOTEL
    private hotelState: string = null;

    setHotelState(newName: string): void {
        this.hotelState = newName;
    }

    getHotelState(): string {
        return this.hotelState;
    }
    // END: HOTEL


    // START: ROOMS
    private roomsState = new Map<TripRoom, number>;

    resetRoomsState() {
        this.roomsState.clear();
    }

    getRoomsState() {
        return this.roomsState;
    }

    increaseRoomQuantity(room: TripRoom): void {
        if (!this.roomsState.has(room)) {
            this.roomsState.set(room, 1);
            return;
        }
        this.roomsState.set(room, this.roomsState.get(room) + 1);
    }

    decreaseRoomQuantity(room: TripRoom): void {
        if (this.roomsState.get(room) === 1) {
            this.roomsState.delete(room);
            return;
        }
        this.roomsState.set(room, this.roomsState.get(room) - 1);
    }
    // END: ROOMS

    createTripReservation(tripReservation: TripReservation) {
        return this.http.post<{success: boolean, reason: string}>('/bestinform/createTripReservation?tripId=' + this.tripState.id, tripReservation);
    }
}
