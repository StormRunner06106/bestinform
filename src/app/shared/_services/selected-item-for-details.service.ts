import {EventEmitter, Injectable} from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

import {HotelModel, HotelSearchRequest} from "../_models/hotelsModels.model";

@Injectable({
  providedIn: "root",
})
export class SelectedItemForDetailsService {
  private savedHotel: HotelModel;

  private selectedItem: BehaviorSubject<HotelModel> =
    new BehaviorSubject<HotelModel>(new HotelModel());
  private searchChange: EventEmitter<google.maps.LatLngLiteral> = new EventEmitter<google.maps.LatLngLiteral>();

  public clearTitle$: BehaviorSubject<any> = new BehaviorSubject<any>({});

  public getUpdatedSelectedItem(): Observable<HotelModel | any> {
    return this.selectedItem.asObservable();
  }

  public setSelectedItem(value: HotelModel | any): void {
    const currentValue = this.selectedItem.getValue();
    const updatedValue = { ...currentValue, ...value };
    this.savedHotel = value;
    this.selectedItem.next(updatedValue);
  }

  public getSavedHotel() {
    return this.savedHotel;
  }

  public calculatePrice(hotelsSearchRequest: HotelSearchRequest) {
    const diff = new Date(hotelsSearchRequest.checkout).valueOf() - new Date(hotelsSearchRequest.checkin).valueOf();
    return Number((diff / (1000 * 3600 * 24)).toFixed(2));
  }

}
