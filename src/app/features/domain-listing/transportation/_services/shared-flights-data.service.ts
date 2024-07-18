import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {Flight} from "./plane-flights.store";
import {BaggageWithInfo, FlightOfferWithBags} from "./selected-flight.store";
import {Contact, Traveler} from "./flight-checkout.store";

@Injectable({
  providedIn: 'root'
})
export class SharedFlightsDataService {

  private selectedFlight$ = new BehaviorSubject<Flight>(null);

  setSelectedFlight(flight: Flight) {
    this.selectedFlight$.next(flight);
  }

  getSelectedFlight() {
    return this.selectedFlight$.asObservable();
  }



  private flightWithAdditionalServicesBody$ = new BehaviorSubject<FlightOfferWithBags>(null);

  // putem face switch intre stocare prin session storage si cea prin serviciu; dezavantaj la serviciu e ca se pierd datele la refresh
  setFlightWithAdditionalServicesBody(flightOffer: FlightOfferWithBags) {
    // stocare direct in serviciu
    // this.flightWithAdditionalServicesBody$.next(flightOffer);

    // stocare in session storage
    sessionStorage.setItem('flightWithAdditionalServicesBody', JSON.stringify(flightOffer));
  }

  getFlightWithAdditionalServicesBody() {
    // acces direct din serviciu
    // return this.flightWithAdditionalServicesBody$.asObservable();

    // acces din session storage
    const flightWithAdditionalServicesBody: FlightOfferWithBags = JSON.parse(sessionStorage.getItem('flightWithAdditionalServicesBody'));
    this.flightWithAdditionalServicesBody$.next(flightWithAdditionalServicesBody);
    return this.flightWithAdditionalServicesBody$.asObservable();
  }



  private travelers$ = new BehaviorSubject<Traveler[]>(null);
  private contact$ = new BehaviorSubject<Contact>(null);

  // putem face switch intre stocare prin session storage si cea prin serviciu; dezavantaj la serviciu e ca se pierd datele la refresh
  setTravelers(travelers: Traveler[]) {
    // stocare direct in serviciu
    // this.travelers$.next(travelers);

    // stocare in session storage
    sessionStorage.setItem('travelers', JSON.stringify(travelers));
  }

  getTravelers() {
    // acces direct din serviciu
    // return this.travelers$.asObservable();

    // acces din session storage
    const travelers: Traveler[] = JSON.parse(sessionStorage.getItem('travelers'));
    this.travelers$.next(travelers);
    return this.travelers$.asObservable();
  }

  setContact(contact: Contact) {
    sessionStorage.setItem("contact", JSON.stringify(contact));
  }

  setFlightExtras(flightExtras: any) {
    sessionStorage.setItem("flightExtras", JSON.stringify(flightExtras));
  }

  getContact() {
    const contact: Contact = JSON.parse(sessionStorage.getItem('contact'));
    this.contact$.next(contact);
    return this.contact$.asObservable();
  }


  clearStoredStates() {
    sessionStorage.removeItem('flightWithAdditionalServicesBody');
    sessionStorage.removeItem('travelers');
    sessionStorage.removeItem('contact');
    this.selectedFlight$.next(null);
    this.flightWithAdditionalServicesBody$.next(null);
    this.contact$.next(null);
    this.travelers$.next(null);
  }


}
