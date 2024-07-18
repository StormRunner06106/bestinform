import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import {BehaviorSubject, delay, Observable, of} from "rxjs";

import {
  HotelPageModel,
  HotelSearchRequest, HotelPageResponse,
  PrebookModel, HotelShowMap, ShortHotelModel, HotelModel,
} from "../_models/hotelsModels.model";
import {data} from "../../components/resource-presentation/mockHotels";
import {HotelMarkup} from "../../features/trips/hotels/hotels.component";
import {DataCacheService} from "./data-cache.service";

@Injectable({
  providedIn: "root",
})
export class HotelsService {
  private hotelSearchRequestSubject = new BehaviorSubject<any>(null);
  public hotelSearchRequest$ = this.hotelSearchRequestSubject.asObservable();

  constructor(private http: HttpClient,
              private dataCacheService: DataCacheService) {}

  public updateHotelSearchRequest(request: any): void {
    this.hotelSearchRequestSubject.next(request);
  }

  public getHotelListByGeo(
    body: HotelSearchRequest,
    page: number = 0,
    size: number = 20,
    sort: string = "priceAsc",
    searchName: string,
    params: HttpParams,
    init: boolean = false
  ): Observable<HotelPageResponse> {
    if (page === 0 && init && !searchName && sort === "priceAsc" && this.dataCacheService.checkSameHotelsFilter(body)) {
      return of(this.dataCacheService.getHotels()).pipe(delay(1000));
    } else {
      return this.http.post<HotelPageResponse>(
          `/bestinform/hotel/search/geo?size=${size}&page=${page}&sortBy=${sort}` + (searchName && searchName !== '' ? `&name=${searchName}` : ``),
          body,
          {
            params,
          },
      );
    }
  }

  public getHotelListFiltered(
      body: any,
      page: number = 0,
      size: number = 20,
      sort: string = "priceAsc",
      searchName: string,
      params: HttpParams,
  ): Observable<HotelPageResponse> {
    return this.http.post<HotelPageResponse>(
        `/bestinform/hotel/search/geo/filtered?size=${size}&page=${page}&sortBy=${sort}` + (searchName && searchName !== '' ? `&name=${searchName}` : ``),
        body,
        {
          params,
        },
    );
  }

  public getInitialHotelListByGeo(
      body: HotelSearchRequest): Observable<ShortHotelModel[]> {
    return this.http.post<ShortHotelModel[]>("/bestinform/hotel/search/geo/initial", body);
  }

  public getAllHotelsLocations(
      body: HotelSearchRequest,
      sort: string = "priceAsc",
      searchName: string,
      params: HttpParams,
  ): Observable<HotelShowMap[]> {
    return this.http.post<ShortHotelModel[]>(
        `/bestinform/hotel/search/geo/allLocations?sortBy=${sort}` + (searchName && searchName !== '' ? `&name=${searchName}` : ``),
        body,
        {
          params,
        },
    );
  }

  public getHotelById(body): Observable<HotelPageModel[]> {
    //A. Tache
    // body.id = "test_hotel_do_not_book";
    return this.http.post<HotelPageModel[]>(`/bestinform/hotel/page`, body);
    // return of(data);
  }

  public prebook(body) {

    return this.http.post<PrebookModel>("bestinform/hotel/prebook", body);
  }

  findHotelWithMarkup(hotelId: string) {
    return this.http.get<HotelModel>("/bestinform/hotel/findWithMarkup/" + hotelId).toPromise();
  }

  listHotelsPageMarkup(pageRequest: any) {
    return this.http.post<any>("/bestinform/hotel/listHotelsWithMarkup", pageRequest).toPromise();
  }

  applyHotelMarkup(hotelMarkup: HotelMarkup) {
    return this.http.post<any>("/bestinform/hotel/applyHotelMarkup", hotelMarkup).toPromise();

  }
}
