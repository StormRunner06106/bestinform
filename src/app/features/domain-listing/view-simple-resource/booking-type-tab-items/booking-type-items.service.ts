import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Room} from "../../../../shared/_models/room.model";
import {BehaviorSubject, Observable, of, tap} from "rxjs";
import * as moment from "moment";
import {Ticket} from "../../../../shared/_models/ticket.model";
import {AvailableTimeSlot, TimeSlot} from "../../../../shared/_models/time-slot.model";
import {Product} from "../../../../shared/_models/product.model";
import {GuestsState} from "../../../client-trips-itineraries/_services/trips.store";
import {CulturalRoom} from "../../../../shared/_models/cultural-room.model";

export type FilterFormValues = {
  dateAsDay?: moment.Moment;
  dateAsHour?: moment.Moment;
  startDate?: moment.Moment;
  endDate?: moment.Moment;
  startHour?: moment.Moment;
  endHour?: moment.Moment;
  // guests filter options
  adultsNumber?: number;
  childrenNumber?: number;
  roomsNumber?: number;
};

export type TicketBooking = {
  tickets?: Array<{
    itemId?: string;
    quantity?: number;
  }>,
  date?: string;
  loyaltyPoints?: boolean;
  specialRequest?: string;
};

export type RentalBooking = {
  start?: string;
  end?: string;
  adults?: number;
  children?: number;
  items?: Array<{
    itemId?: string;
    quantity?: number;
  }>;
  loyaltyPoints?: boolean;
  specialRequest?: string;
};

export type TimeSlotBooking = {
  itemsNumber?: number;
  date?: string;
  hour?: string;
  loyaltyPoints?: boolean;
  bookingTimeSlotId?: string;
  specialRequest?: string;
};

export type ProductBooking = {
  products?: string[];
  loyaltyPoints?: boolean;
  specialRequest?: string;
};

export type TimePickerReservation = {
  adults?: number;
  children?: number;
  specialRequest?: string;
  time?: string;
  loyaltyPoints: boolean;
};

export type SelectedSeat = {
  rowLabel?: string;
  seatColumnLabel?: number;
  price?: number;
};

export type CulturalBooking = {
  seats?: SelectedSeat[];
  date?: string;
  loyaltyPoints?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BookingTypeItemsService {

  private formValuesState = new BehaviorSubject<FilterFormValues>(null);
  private formValuesObs$ = this.formValuesState.asObservable();

  private resourceId: string = null;
  private bookingTimePickerId: string = null;
  private culturalBookingId: string = null;

  constructor(private http: HttpClient) { }

  updateFormValues(formValues: FilterFormValues): void {
    this.formValuesState.next(formValues);
  }

  getFormValues(): Observable<FilterFormValues> {
    return this.formValuesObs$;
  }

  setResourceId(resourceId: string) {
    this.resourceId = resourceId;
  }

  setBookingTimePickerId(bookingTimePickerId: string) {
    this.bookingTimePickerId = bookingTimePickerId;
  }

  // START: ROOMS
  private roomState = new Map<Room, number>();

  resetRoomState() {
    this.roomState.clear();
  }

  setRoomQuantity(room: Room, quantity: number): void {
    this.roomState.set(room, quantity);
  }

  increaseRoomQuantity(room: Room): void {
    if (!this.roomState.has(room)) {
      this.roomState.set(room, 1);
      return;
    }
    this.roomState.set(room, this.roomState.get(room) + 1);
  }

  decreaseRoomQuantity(room: Room): void {
    if (this.roomState.get(room) === 1) {
      this.roomState.delete(room);
      return;
    }
    this.roomState.set(room, this.roomState.get(room) - 1);
  }

  getRoomState() {
    return this.roomState;
  }

  getOurRecommendationRooms(reqBody: {roomNumber?: number;
                              adults?: number;
                              children?: number;
                              startTime?: string;
                              endTime?: string;}) {
    this.resetRoomState();
    return this.http.post<{items?: Room[], totalNights?: number, totalPrice?: number}>('/bestinform/getOurRecommendationRooms?resourceId=' + this.resourceId, reqBody);
  }

  getAvailableRooms(startTime: string, endTime: string) {
    this.resetRoomState();
    return this.http.post<{items?: Room[], totalNights?: number, totalPrice?: number}>('/bestinform/getAvailableRooms?resourceId=' + this.resourceId + '&startTime=' + startTime + '&endTime=' + endTime,
        {});
  }

  getRoomListByResourceId() {
    this.resetRoomState();
    return this.http.get<Room[]>('/bestinform/getRoomListByResourceId?resourceId=' + this.resourceId);
  }

  createReservationRentalBooking(rentalBooking: RentalBooking) {
    return this.http.post<{success: boolean, reason: string}>('/bestinform/createReservationRentalBooking?resourceId=' + this.resourceId, rentalBooking);
  }
  // END: ROOMS


  // START: TICKETS
  private ticketState = new Map<Ticket, number>();

  resetTicketState() {
    this.ticketState.clear();
  }

  increaseTicketQuantity(ticket: Ticket): void {
    if (!this.ticketState.has(ticket)) {
      this.ticketState.set(ticket, 1);
      return;
    }
    this.ticketState.set(ticket, this.ticketState.get(ticket) + 1);
  }

  decreaseTicketQuantity(ticket: Ticket): void {
    if (this.ticketState.get(ticket) === 1) {
      this.ticketState.delete(ticket);
      return;
    }
    this.ticketState.set(ticket, this.ticketState.get(ticket) - 1);
  }

  getTicketState() {
    return this.ticketState;
  }

  getTicketListByResourceId() {
    this.resetTicketState();
    return this.http.get('/bestinform/getTicketListByResourceId?resourceId=' + this.resourceId);
  }

  getAvailableResourceTickets(date: string) {
    this.resetTicketState();
    return this.http.post<Ticket[]>('/bestinform/getAvailableResourceTickets?resourceId=' + this.resourceId + '&date=' + date, {});
  }

  createReservationTicketBooking(ticketBooking: TicketBooking) {
    return this.http.post<{success: boolean, reason: string}>('/bestinform/createReservationTicketBooking?resourceId=' + this.resourceId, ticketBooking);
  }
  // END: TICKETS


  // START: CULTURAL ROOM
  private selectedSeats: SelectedSeat[] = [];
  private selectedCulturalRoom: CulturalRoom = null;

  getSelectedCulturalRoom(): CulturalRoom {
    return {...this.selectedCulturalRoom};
  }

  setSelectedCulturalRoom(newCulturalRoom: CulturalRoom) {
    this.selectedCulturalRoom = newCulturalRoom;
  }

  getSelectedSeats() {
    return this.selectedSeats.slice();
  }

  setSelectedSeats(newSelectedSeats: SelectedSeat[]) {
    this.selectedSeats = [...newSelectedSeats];
  }

  resetCulturalRoomState() {
    this.selectedSeats = [];
    this.selectedCulturalRoom = null
  }

  setCulturalBookingId(newId: string) {
    this.culturalBookingId = newId;
  }

  getResourceCulturalRooms() {
    this.resetCulturalRoomState();

    return this.http.get<CulturalRoom[]>('/bestinform/getResourceCulturalRooms?resourceId=' + this.resourceId)
        .pipe(tap(culturalRooms => this.setSelectedCulturalRoom(culturalRooms[0])));
  }

  getCulturalRoomById() {
    this.resetCulturalRoomState();

    return this.http.get<CulturalRoom>('/bestinform/getCulturalRoomById?culturalRoomId=' + this.culturalBookingId);
  }

  createReservationCulturalBooking(culturalBooking: CulturalBooking) {
    return this.http.post<{success: boolean, reason: string}>('/bestinform/createReservationCulturalBooking?culturalRoomId=' + this.culturalBookingId, culturalBooking)
  }
  // END: CULTURAL ROOM


  // START: TIME SLOTS
  private timeSlotState = new Map<TimeSlot, AvailableTimeSlot>;

  setTimeSlotState(timeSlot: TimeSlot, availableTimeSlot: AvailableTimeSlot) {
    this.timeSlotState.set(timeSlot, availableTimeSlot);
  }

  resetTimeSlotState() {
    this.timeSlotState.clear();
  }

  getTimeSlotState() {
    return this.timeSlotState;
  }

  getBookingTimeSlotListByResourceId() {
    this.resetTimeSlotState();
    return this.http.get<TimeSlot[]>('/bestinform/getBookingTimeSlotListByResourceId?resourceId=' + this.resourceId);
  }

  getAvailableSlotsByDate(timeSlotId: string, date: string) {
    return this.http.get<AvailableTimeSlot[]>('/bestinform/getAvailableSlotsByDate?bookingTimeSlotId=' + timeSlotId + '&date=' + date);
  }

  createReservationTimeSlot(timeSlotBooking: TimeSlotBooking) {
    return this.http.post<{success: boolean, reason: string}>('/bestinform/createReservationTimeSlot', timeSlotBooking);
  }
  // END: TIME SLOTS


  // START: PICKER ITEMS
  private guestsState: GuestsState = null;

  setGuestsState(guestsState: GuestsState): void {
    this.guestsState = {...guestsState};
  }

  getGuestsState(): GuestsState {
    return {...this.guestsState};
  }


  resetGuestsState(): void {
    this.guestsState = null;
  }

  guestsPrice = 0;

  setGuestsPrice(price: number): void {
    this.guestsPrice = price;
  }

  getGuestsPrice(): number {
    return this.guestsPrice;
  }


  resetGuestsPrice(): void {
    this.guestsPrice = 0;
  }

  getTimepickerByResourceId(){
    return this.http.get('/bestinform/getBookingTimePickerByResourceId?resourceId=' + this.resourceId);
  }

  getAvailablePickerItems(date: string, hour: string) {
    this.resetGuestsState();
    return this.http.get<{success: boolean, reason: string}>('/bestinform/getAvailablePickerItems?bookingTimePickerId=' + this.bookingTimePickerId + '&date=' + date + '&hour=' + hour);
  }

  createReservationTimePicker(timePickerReservation: TimePickerReservation) {
    return this.http.post<{success: boolean, reason: string}>('/bestinform/createReservationTimePicker?resourceId=' + this.resourceId, timePickerReservation);
  }
  // END: PICKER ITEMS


  // START: PRODUCTS
  private productState = new Map<Product, number>;

  setProductState(product: Product) {
    this.productState.set(product, 1);
  }

  getProductState() {
    return this.productState;
  }

  resetProductState() {
    this.productState.clear();
  }

  getProductListByResourceId() {
    this.resetProductState();
    return this.http.get<Product[]>('/bestinform/getProductListByResourceId?resourceId=' + this.resourceId);
  }

  createReservationProduct(productBooking: ProductBooking) {
    return this.http.post<{success: boolean, reason: string}>('/bestinform/createReservationProduct?resourceId=' + this.resourceId, productBooking);
  }
  // END: PRODUCTS

  //START: MENU
  getResourceMenu() {
    return this.http.get('/bestinform/getResourceMenu?resourceId=' + this.resourceId);
  }
  //END: MENU


  //STRIPE
  executeStripeOneTimePayment(reservationId: string) {
    return this.http.post<{success: boolean, reason: string}>('/bestinform/executeOneTimePaymentReservation?reservationId=' + reservationId, {});
  }

  executeOneTimePaymentTripReservation(reservationId: string) {
    return this.http.post<{success: boolean, reason: string}>('/bestinform/executeOneTimePaymentTripReservation?tripReservationId=' + reservationId, {});
  }

  executeOneTimePaymentItinerary(itineraryId: string) {
    return this.http.post<{success: boolean, reason: string}>('/bestinform/executeOneTimePaymentItinerary?itineraryId=' + itineraryId, {});
  }
}
