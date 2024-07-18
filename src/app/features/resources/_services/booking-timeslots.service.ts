import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject} from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class BookingTimeslotsService {
    refreshServiceList$ = new BehaviorSubject(false);
    serviceList$ = new BehaviorSubject([]);

    deleteServiceList$ = new BehaviorSubject([]);

    constructor(private http: HttpClient) {
    }

    /** Listeners */



    refreshServiceListData() {
        return this.refreshServiceList$.asObservable();
    }

    serviceListData() {
        return this.serviceList$.asObservable()
    }

    /** Custom Functions */
    addServiceToList(service) {
        this.serviceList$.next(this.serviceList$.getValue().concat(service))
    }

    addServiceToDeleteList(service) {
        this.deleteServiceList$.next(this.deleteServiceList$.getValue().concat(service))
    }


    //------------------REQUESTS------------------

    getServicesByResourceId(resourceId: string){
        return this.http.get('/bestinform/getBookingTimeSlotListByResourceId?resourceId='+resourceId);
    }

    createService(resourceId: string, service){
        return this.http.post('/bestinform/createBookingTimeSlot?resourceId=' + resourceId, service);
    }

    updateServiceByServiceId(serviceId: string, service){
        return this.http.put('/bestinform/updateBookingTimeSlot?bookingTimeSlotId=' + serviceId, service);
    }

    deleteService(serviceId:string){
        return this.http.delete('/bestinform/deleteBookingTimeSlotById?bookingTimeSlotId=' + serviceId);
    }
}
