import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject} from "rxjs";
import {ResourcesService} from "../../resources/_services/resources.service";
import {Ticket} from "../../../shared/_models/ticket.model";

@Injectable({
    providedIn: 'root'
})

export class EventTicketService {
    eventId$ = new BehaviorSubject(undefined);
    refreshTicketList$ = new BehaviorSubject(false);
    ticketsList$ = new BehaviorSubject([]);

    deleteArray$ = new BehaviorSubject([]);

    constructor(private http: HttpClient) {
    }

    /** Listeners */



    refreshTicketListData() {
        return this.refreshTicketList$.asObservable();
    }

    ticketListData() {
        return this.ticketsList$.asObservable()
    }

    addTicketToList(ticket) {
        this.ticketsList$.next(this.ticketsList$.getValue().concat(ticket))
    }

    addTicketToDeleteArray(ticket) {
        this.deleteArray$.next(this.deleteArray$.getValue().concat(ticket));
    }

    //------------------REQUESTS------------------
    createTicket(resourceId: string, ticket: Ticket) {
        return this.http.post('/bestinform/createTicket?resourceId=' + resourceId, ticket);
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
