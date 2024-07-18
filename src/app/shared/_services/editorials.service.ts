import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { EventInstance } from 'src/app/shared/_models/event-instance.model';



@Injectable({
    providedIn: 'root'
})
export class EditorialsService {

    // events = new BehaviorSubject<EventInstance[]>([]);
    public editorialsCategories: any;
    editorials: any;
    public selectedEditorial = new BehaviorSubject({});
    constructor(private http: HttpClient) {}

    // getEventsData(): void {
    //     this.http.get('/bestinform/events/instances?cityId=101533').subscribe((data: any) => {
    //         console.log('events data', data);
    //         this.events.next(data?.data || []);
    //     });
    // }
    //
    // getEventTickets(id: string): void {
    //     this.http.get(`/bestinform/tickets/best?id=${id}`).subscribe((data: any) => {
    //         console.log('events data', data);
    //         // this.events.next(data?.data || []);
    //     });
    // }

    // getCategories(): void {
    //     this.http.get('/bestinform/events/categories').subscribe((data: any) => {
    //         console.log('categories data', data);
    //     });
    // }

    getEditorialBySlug(slug: string): void {
        this.http.get(`/bestinform/getEditorialBySlug?slug=${slug}`).subscribe((data: any) => {
            console.log('editorial data', data);
            this.selectedEditorial.next(data);
            // this.events.next(data?.data || []);
        });
    }

    getEditorialCategories(): any {
        return this.http.get('/bestinform/getEditorialCategories').pipe(tap(data => {
            this.editorialsCategories = data;
        }));
    }
}
