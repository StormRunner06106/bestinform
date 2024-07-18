import { Injectable } from '@angular/core';
import { Trip } from '../_models/trip.model';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TripsService {

  constructor(private http: HttpClient) { }

    // Functions For Changes Detection
    private listChanged = new BehaviorSubject(false);
    listChangedObs = this.listChanged.asObservable();
  
    // Trigger list changes
    triggerListChanges(message: boolean) {
      // Change the subject value
      this.listChanged.next(message);
    }

    listTripReservationsFiltered(page: number, size: number, sort?: string, dir?: string, filters?: object) {
      return this.http.post('/bestinform/listTripReservationsFiltered?page=' + page + '&size=' + size + '&sort=' + sort + '&dir=' + dir, filters);
  }

  //Reservations

  getTripReservationById(tripReservationId:string) {
    return this.http.get('/bestinform/getTripReservationById?tripReservationId=' + tripReservationId);
}
}
