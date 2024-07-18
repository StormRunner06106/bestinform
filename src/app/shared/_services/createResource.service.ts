import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject} from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class CreateResourceService {
    // refreshTicketList$ = new BehaviorSubject(false)
    providerData$ = new BehaviorSubject(undefined);

    constructor(private http: HttpClient) {
    }

    /** Listeners */



    // refreshTicketListData() {
    //     return this.refreshTicketList$.asObservable();
    // }


    providerData() {
        return this.providerData$.asObservable()
    }

    /** Custom Functions */
    // addTicketToList(ticket) {
    //     this.ticketsList$.next(this.ticketsList$.getValue().concat(ticket))
    // }


}
