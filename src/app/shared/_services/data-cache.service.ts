import {Injectable} from "@angular/core";
import {Flight, FlightOffers} from "../../features/domain-listing/transportation/_services/plane-flights.store";
import {BehaviorSubject} from "rxjs";
import {HotelPageResponse} from "../_models/hotelsModels.model";

@Injectable({
  providedIn: "root",
})
export class DataCacheService {

  private hotelsFilter;
  private planesFilter;
  private cachedFlights: FlightOffers;
  private cachedHotels: HotelPageResponse;

  public checkSamePlanesFilter(planesFilter) {
    if (!this.planesFilter) return false;
    return this.areObjectsEqual(this.planesFilter, planesFilter,
        ["departureObject", "arrivalObject", "allDepartures", "allArrivals"]);
  }

  public checkSameHotelsFilter(hotelsFilter) {
    if (!this.hotelsFilter) return false;
    return this.areObjectsEqual(this.hotelsFilter, hotelsFilter, ["map"]);
  }

  public savePlanesFilter(planesFilter) {
    this.planesFilter = planesFilter;
  }

  public saveFlights(flightOffers: FlightOffers) {
    this.cachedFlights = flightOffers;
  }

  public getFlights() {
    return this.cachedFlights;
  }

  public saveHotelsFilter(hotelsFilter) {
    this.hotelsFilter = hotelsFilter;
  }

  public saveHotels(hotels: HotelPageResponse) {
    this.cachedHotels = hotels;
  }

  public getHotels() {
    return this.cachedHotels;
  }

  private areObjectsEqual(obj1: any, obj2: any, excludeFields: string[] = []): boolean {
    const keys1 = Object.keys(obj1).filter(key => !excludeFields.includes(key));
    const keys2 = Object.keys(obj2).filter(key => !excludeFields.includes(key));

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      const val1 = obj1[key];
      const val2 = obj2[key];

      const areObjects = this.isObject(val1) && this.isObject(val2);
      if (
          (areObjects && !this.areObjectsEqual(val1, val2, excludeFields)) ||
          (!areObjects && val1 !== val2)
      ) {
        return false;
      }
    }

    return true;
  }

  private isObject(obj: any): boolean {
    return obj != null && typeof obj === 'object';
  }

}
