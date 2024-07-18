import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Country} from "../../../shared/_models/country.model";
import {Observable, of} from "rxjs";
import {Location} from "../../../shared/_models/location.model";

@Injectable({
  providedIn: 'root'
})
export class LocationsService {

  constructor(private http: HttpClient) { }

  // START: COUNTRIES
  private countryState: Country = null;

  setCountryState(country: Country): void {
    this.countryState = country;
  }

  getCountryById(countryId: string): Observable<Country> {
    if (this.countryState?.id === countryId) {
      return of(this.countryState);
    }
    return this.http.get('/bestinform/getCountryById?countryId=' + countryId);
  }

  getCountryList() {
    return this.http.get<Country[]>('/bestinform/getCountryList');
  }

  addCountry(country: Country) {
    return this.http.post<{success: boolean, reason: string}>('/bestinform/addCountry', country);
  }

  updateCountry(countryId: string, country: Country) {
    return this.http.put<{success: boolean, reason: string}>('/bestinform/updateCountry?countryId=' + countryId, country);
  }

  deleteCountry(countryId: string) {
    return this.http.delete<{success: boolean, reason: string}>('/bestinform/deleteCountry?countryId=' + countryId);
  }
  // END: COUNTRIES


  // START: LOCATIONS
  getLocationListByCountryId(countryId: string) {
    return this.http.get<Location[]>('/bestinform/getLocationListByCountryId?countryId=' + countryId);
  }

  getLocationById(locationId: string){
    return this.http.get('/bestinform/getLocationById?locationId=' + locationId);
  }

  addLocation(countryId: string, location: Location) {
    return this.http.post<{success: boolean, reason: string}>('/bestinform/addLocation?countryId=' + countryId, location);
  }

  updateLocation(locationId: string, location: Location) {
    return this.http.put<{success: boolean, reason: string}>('/bestinform/updateLocation?locationId=' + locationId, location);
  }

  deleteLocation(locationId: string) {
    return this.http.delete<{success: boolean, reason: string}>('/bestinform/deleteLocation?locationId=' + locationId);
  }
  // END: LOCATIONS

  //START:TRIPS

  addTrip(trip:object) {
    return this.http.post<{success: boolean, reason: string}>('/bestinform/addTrip', trip);
  }

  // updateTrip(tripId:string, trip:object) {
  //   return this.http.put<{success: boolean, reason: string}>('/bestinform/updateTrip?tripId='+tripId, trip);
  // }

  updateTrip(tripId: string, trip: object){
    return this.http.put("/bestinform/updateTrip?tripId=" + tripId, trip);
}

  getTripById(tripId: string){
    return this.http.get('/bestinform/getTripById?tripId=' + tripId);
  }

  //change status
  changeTripStatus(tripId :string, status :string){
    return this.http.put("/bestinform/changeTripStatus?tripId="+ tripId + '&status=' + status, {});
  }

  //trips list
  listTripsFiltered(page: number, size: number, sort?: string, dir?: string, filters?: object) {
    return this.http.post('/bestinform/listTripsFiltered?page=' + page + '&size=' + size + '&sort=' + sort + '&dir=' + dir, filters ? filters : {});
  }

  //END:TRIPS

}
