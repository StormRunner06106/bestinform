import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, tap} from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class TimepickerService {

    constructor(private http: HttpClient){}

    refreshTimetableList$ = new BehaviorSubject(false);
    timetableList$ = new BehaviorSubject([]);

    refreshTimepickerList$ = new BehaviorSubject(false);
    timepickerList$ = new BehaviorSubject([]);

    timepickerId$ = new BehaviorSubject(undefined);

    timePicker$ = new BehaviorSubject(undefined);
    changePolicies$ = new BehaviorSubject(undefined);
    changePoliciesData$ = new BehaviorSubject(undefined);
    bookingPolicies$ = new BehaviorSubject(undefined);
    bookingPoliciesData$ = new BehaviorSubject(undefined);

    availability$ = new BehaviorSubject(undefined);

    private hasFreeEntry = false;

    setFreeEntry(newValue: boolean) {
        this.hasFreeEntry = newValue;
    }

    getFreeEntry() {
        return this.hasFreeEntry;
    }


    refreshTimetableListData() {
        return this.refreshTimetableList$.asObservable();
    }

    refreshTimepickerListData() {
        return this.refreshTimepickerList$.asObservable();
    }

    refreshAvailabilityData() {
        return this.availability$.asObservable();
    }



    // ------------------- REQUESTS ------------------
    createTimepicker(resourceId: string, timepicker){
        return this.http.post('/bestinform/createBookingTimePicker?resourceId='+resourceId, timepicker);
    }

    getTimepickerByResourceId(resourceId: string){
        return this.http.get('/bestinform/getBookingTimePickerByResourceId?resourceId=' + resourceId);
    }

    updateTimepicker(timepickerId: string, timepicker){
        return this.http.put('/bestinform/updateBookingTimePicker?bookingTimePickerId=' + timepickerId, timepicker);
    }


}
