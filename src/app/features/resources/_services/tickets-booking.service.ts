import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, tap} from "rxjs";
import {Ticket} from "../../../shared/_models/ticket.model";
import {ResourcesService} from "./resources.service";

@Injectable({
    providedIn: 'root'
})

export class TicketsBookingService {
    refreshTicketList$ = new BehaviorSubject(false)
    ticketsList$ = new BehaviorSubject([])

    createArray$ = new BehaviorSubject([]);
    refreshCreateArray$ = new BehaviorSubject(false);

    initList$ = new BehaviorSubject([]);

    deleteArray$ = new BehaviorSubject([]);
    refreshDeleteArray$ = new BehaviorSubject(false);

    updateArray$ = new BehaviorSubject([]);
    refreshUpdateArray$ = new BehaviorSubject(false);

    constructor(private http: HttpClient,
                private resourceService: ResourcesService) {
    }

    /** Listeners */



    refreshTicketListData() {
        return this.refreshTicketList$.asObservable();
    }


    refreshTicketCreateData() {
        return this.refreshCreateArray$.asObservable();
    }

    refreshTicketDeleteData() {
        return this.refreshDeleteArray$.asObservable();
    }

    refreshTicketUpdateData() {
        return this.refreshUpdateArray$.asObservable();
    }


    ticketListData() {
        return this.ticketsList$.asObservable()
    }

    createArrayData() {
        return this.createArray$.asObservable();
    }

    updateArrayData() {
        return this.updateArray$.asObservable();
    }


    /** Custom Functions */
    addTicketToList(ticket) {
        this.ticketsList$.next(this.ticketsList$.getValue().concat(ticket))
    }

    addTicketToCreateArrayEdit(ticket) {
        this.createArray$.next(this.createArray$.getValue().concat(ticket));
    }

    addTicketToDeleteArray(ticket) {
        this.deleteArray$.next(this.deleteArray$.getValue().concat(ticket));
    }

    addTicketToUpdateArray(ticket) {
        this.updateArray$.next(this.updateArray$.getValue().concat(ticket));
    }


    //------------------REQUESTS------------------
    createTicket(resourceId: string, ticket: Ticket) {
        return this.http.post('/bestinform/createTicket?resourceId=' + resourceId, ticket);
    }

    createTickets(resourceId: string, tickets: Array<Ticket>) {
        return this.http.post('/bestinform/createTickets?resourceId=' + resourceId, tickets);
    }

    updateTicket(ticketId: string, ticket: Ticket) {
        return this.http.put('/bestinform/updateTicket?ticketId=' + ticketId, ticket);
    }

    deleteTicket(ticketId: string) {
        return this.http.delete('/bestinform/deleteTicket?ticketId=' + ticketId);
    }

    getTicketList(resourceId: string) {
        return this.http.get('/bestinform/getTicketListByResourceId?resourceId=' + resourceId)
        // .pipe(tap((res:any) => this.initList$.next(res)))
    }

}
