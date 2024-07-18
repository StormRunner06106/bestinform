import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { EventInstance } from 'src/app/shared/_models/event-instance.model';



@Injectable({
    providedIn: 'root'
})
export class EventsNewService {

    events = new BehaviorSubject<EventInstance[]>([]);
    constructor(private http: HttpClient) {}

    getEventsData(): void {
        this.http.get('/bestinform/events/instances?cityId=101533').subscribe((data: any) => {
            this.events.next(data?.data || []);
        });
    }

    getEventTickets(id: string): void {
        this.http.get(`/bestinform/tickets/best?id=${id}`).subscribe((data: any) => {
            // this.events.next(data?.data || []);
        });
    }

    // getCategories(): void {
    //     this.http.get('/bestinform/events/categories').subscribe((data: any) => {
    //         console.log('categories data', data);
    //     });
    // }

}
