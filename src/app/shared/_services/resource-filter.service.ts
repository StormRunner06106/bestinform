import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, Observable, switchMap, tap} from "rxjs";
import {ResourceType} from "../_models/resource-type.model";
import {Resource} from "../_models/resource.model";
import {PaginationResponse} from "../_models/pagination-response.model";
import {ResourceFilters} from "../_models/resource-filters.model";
import {TemplatePagination} from "../_models/template-pagination.model";
import {ResourceTemplate} from "../_models/resource-template.model";
import * as moment from "moment";
import {Attribute} from "../_models/attribute.model";
import {CityRecommendation} from "../_models/city-recommendation.model";

export type SavedFilters = {
  location?: string;
  geographicalCoordinates?: {
    longitude: number;
    latitude: number;
  };
  dateAsDay: moment.Moment;
  dateAsHour: moment.Moment;
  startDate: moment.Moment;
  endDate: moment.Moment;
  startHour: moment.Moment;
  endHour: moment.Moment;
  adultsNumber: number;
  childrenNumber: number;
  roomsNumber: number;
};

@Injectable({
  providedIn: "root",
})
export class ResourceFilterService {
  public totalPeopleCounter: BehaviorSubject<any> = new BehaviorSubject(0);
  public reservationDate: BehaviorSubject<any> = new BehaviorSubject('');
  // resource type state
  private resourceTypeState = new BehaviorSubject<ResourceType>(null);
  public resourceTypeObs$ = this.resourceTypeState.asObservable();

  // resources pagination and filters state
  private resourceListState = new BehaviorSubject<PaginationResponse>(null);
  public resourceListObs$ = this.resourceListState.asObservable();

  // resource template state
  private resourceTemplateState = new BehaviorSubject<ResourceTemplate>(null);
  public resourceTemplateObs$ = this.resourceTemplateState.asObservable();

  // selected resource state
  private resourceState = new BehaviorSubject<Resource>(null);
  public resourceObs$ = this.resourceState.asObservable();

  // cached filterForm observable
  private filterFormSubject = new BehaviorSubject<any>({});
  public filterForm$: Observable<any> = this.filterFormSubject.asObservable();

  // resources pagination and filters state
  private restaurantListState = new BehaviorSubject<any>(null);
  public restaurantListObj$ = this.restaurantListState.asObservable();

  private favRestaurantsState = new BehaviorSubject<any>([]);
  public favRestaurants$ = this.favRestaurantsState.asObservable();

  private totalRestaurantsState = new BehaviorSubject<number>(0);
  public totalRestaurants$ = this.totalRestaurantsState.asObservable();

  private coordinatesListSubject = new BehaviorSubject<
    { name: string; location: { x: number; y: number; type: string } }[]
  >([]);
  public coordinatesList$ = this.coordinatesListSubject.asObservable();

  private adultCountSubject = new BehaviorSubject<number>(0);
  public adultCount$ = this.adultCountSubject.asObservable();

  private childrenCountSubject = new BehaviorSubject<number>(0);
  public childrenCount$ = this.childrenCountSubject.asObservable();

  private selectedRestaurantSubject = new BehaviorSubject<any>(null);
  public selectedRestaurant$ = this.selectedRestaurantSubject.asObservable();

  public selectedSearchStateSubject = new BehaviorSubject<any>(null);

  public locationSubject = new BehaviorSubject<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  public location$ = this.locationSubject.asObservable();

  private peopleNumberSubject = new BehaviorSubject<number>(0);
  public peopleNumber$ = this.peopleNumberSubject.asObservable();

  private restaurantReservationDateSubject = new BehaviorSubject<any>(null);
  public restaurantReservationDate$ =
    this.restaurantReservationDateSubject.asObservable();

  private searchRangeSubject = new BehaviorSubject<number>(10);
  public searchRange$ = this.searchRangeSubject.asObservable();

  public totalResultsSubject = new BehaviorSubject<number>(0);
  public totalResults$ = this.totalResultsSubject.asObservable();
  // filters
  private filtersObj: ResourceFilters = null;

  // data we save from filter-bar component, but don't use to filter resources
  private savedFilters: any = null;

  // pagination
  pageNr = 0;
  pageSize = 10;
  sortBy: string;
  sortDirection: string;
  cachedFilters;

  // used for the modal in the itineraries
  private resourceFromItinerary: Resource = null;

  constructor(private http: HttpClient) {
    this.selectedSearchStateSubject.subscribe(item => {
      console.log(item)
    })
  }

  checkIfItineraryModal() {
    return !!this.resourceFromItinerary;
  }

  setResourceFromItinerary(resource: Resource) {
    this.resourceFromItinerary = resource;
  }

  getResourceFromItinerary() {
    return structuredClone(this.resourceFromItinerary);
  }

  initServiceStates() {
    this.resourceTypeState.next(null);
    this.resourceListState.next(null);
    this.resourceTemplateState.next(null);
    this.resourceState.next(null);
    this.filtersObj = null;
    this.savedFilters = null;
    this.cachedFilters = null;
    this.resourceFromItinerary = null;
  }

  getResourceTypeById(resourceTypeId: string) {
    this.filtersObj = {
      resourceTypeId: resourceTypeId,
      status: "active",
    };
    this.savedFilters = null;

    return this.http
      .get<ResourceType>(
        "/bestinform/getResourceTypeById?resourceTypeId=" + resourceTypeId,
      )
      .pipe(
        switchMap((res) => {
          if (res) {
            this.resourceTypeState.next(res);
            return this.resourceTypeObs$;
          }
        }),
      );
  }

  setResourceType(resourceType: ResourceType) {
    this.resourceTypeState.next(resourceType);
  }

  getAllCitiesRecommended(city: string) {
    return this.http.get<CityRecommendation[]>(
      "/bestinform/getAllCitiesRecommended?city=" + city,
    );
  }

  listResourceFiltered(
    page: number,
    size: number,
    sort?: string,
    dir?: string,
  ) {
    this.pageNr = page;
    this.pageSize = size;
    this.sortBy = sort;
    this.sortDirection = dir;

    return this.http
      .post<PaginationResponse>(
        "/bestinform/listResourceFiltered?page=" +
          page +
          "&size=" +
          size +
          "&sort=" +
          sort +
          "&dir=" +
          dir,
        this.filtersObj,
      )
      .pipe(
        switchMap((res) => {
          if (res) {
            this.resourceListState.next(res);
            return this.resourceListObs$;
          }
        }),
      );
  }

  updateFilters(newFilters: ResourceFilters) {
    this.filtersObj = { ...this.filtersObj, ...newFilters };

    return this.http
      .post<PaginationResponse>(
        "/bestinform/listResourceFiltered?page=" +
          this.pageNr +
          "&size=" +
          this.pageSize +
          "&sort=" +
          this.sortBy +
          "&dir=" +
          this.sortDirection,
        this.filtersObj,
      )
      .pipe(
        switchMap((res) => {
          if (res) {
            this.resourceListState.next(res);
            return this.resourceListObs$;
          }
        }),
      );
  }

  updateFilters2(newFilters: ResourceFilters, pageNo?: number) {
    this.filtersObj = { ...this.filtersObj, ...newFilters };

    const currentPageNo = pageNo !== undefined ? pageNo : this.pageNr;

    return this.http
      .post<PaginationResponse>(
        "/bestinform/listResourceFiltered?page=" +
          this.pageNr +
          "&size=" +
          this.pageSize +
          "&sort=" +
          this.sortBy +
          "&dir=" +
          this.sortDirection,
        this.filtersObj,
      )
      .pipe(
        switchMap((res) => {
          if (res) {
            this.resourceListState.next(res);
            return this.resourceListObs$;
          }
        }),
      );
  }

  getFavoriteRestaurants(userId: string) {
    return this.http
      .get<any>("/bestinform/restaurants/favorites?userId=" + userId)
      .pipe(
        tap((res) => {
          this.favRestaurantsState.next(res);
          return this.favRestaurants$;
        }),
      );
  }

  getRestaurantsInSearch(pageNo?: number, filters?: any) {
    this.adultCountSubject.next(filters?.adultsNumber || 0);
    this.childrenCountSubject.next(filters?.childrenNumber || 0);
    let url = "restaurants/searchAll";

    const currentPageNo = pageNo !== undefined ? pageNo : this.pageNr;
    url = url + "?page=" + currentPageNo;

    if (this.totalPeopleCounter.getValue() > 0) {
      url += "&peopleNumber=" + this.totalPeopleCounter.getValue();
    }

    const location = this.locationSubject.getValue();
    if (location && location.y != 0 && location.x != 0) {
      url += "&latitude=" + location.y;
      url += "&longitude=" + location.x;
      url += "&rangeInKm=" + 50;
      // url += '&rangeInKm=' + this.searchRangeSubject.getValue();
    }

    console.log(this.reservationDate.getValue())
    // this.formatDateAndTime(this.reservationDate.getValue()[0], this.reservationDate.getValue()[1]);
    if (this.reservationDate.getValue()) {
      url += "&dateTime=" + this.reservationDate.getValue();
    }

    console.log("url", url);

    let paramsSent = false;
    // Dynamically construct the query parameters based on filters
    const queryParams = new URLSearchParams();
    for (const key in filters) {
      if (filters[key] !== undefined) {
        // if the type is array then loop through the items and add them one by one
        if (Array.isArray(filters[key])) {
          for (const item of filters[key]) {
            queryParams.append(key, item);
          }
        } else {
          queryParams.set(key, filters[key]);
        }
      }
      paramsSent = true;
    }

    if (paramsSent) {
      url = url + "&" + queryParams.toString();
    } else {
      url = url + queryParams.toString();
    }

    return this.http
        .get<any>(`/bestinform/${url}`, { observe: "response" })
  }

  getRestaurants(pageNo?: number, filters?: any) {
    this.adultCountSubject.next(filters?.adultsNumber || 0);
    this.childrenCountSubject.next(filters?.childrenNumber || 0);
    const urlAll = "restaurants/searchAll"
    const urlPage = "restaurants/search";
    let url = "";

    const currentPageNo = pageNo !== undefined ? pageNo : this.pageNr;
    url = url + "?page=" + currentPageNo;

    if (this.totalPeopleCounter.getValue() > 0) {
      url += "&peopleNumber=" + this.totalPeopleCounter.getValue();
    }

    const location = this.locationSubject.getValue();
    if (filters && filters.geographicalCoordinates) {
      url += "&latitude=" + filters.geographicalCoordinates.latitude;
      url += "&longitude=" + filters.geographicalCoordinates.longitude;
      url += "&rangeInKm=" + 50;
      // url += '&rangeInKm=' + this.searchRangeSubject.getValue();
    } else {
      url += "&latitude=" + location.x;
      url += "&longitude=" + location.y;
      url += "&rangeInKm=" + 50;
    }

    // this.formatDateAndTime(this.reservationDate.getValue()[0], this.reservationDate.getValue()[1]);
    if (this.reservationDate.getValue()) {
      url += "&dateTime=" + this.reservationDate.getValue();
    }

    let paramsSent = false;
    // Dynamically construct the query parameters based on filters
    const queryParams = new URLSearchParams();
    for (const key in filters) {
      if (filters[key] !== undefined) {
        // if the type is array then loop through the items and add them one by one
        if (Array.isArray(filters[key])) {
          for (const item of filters[key]) {
            queryParams.append(key, item);
          }
        } else {
          queryParams.set(key, filters[key]);
        }
      }
      paramsSent = true;
    }

    if (paramsSent) {
      url = url + "&" + queryParams.toString();
    } else {
      url = url + queryParams.toString();
    }

    return this.http
      .get<any>("/bestinform/" + urlPage + url, { observe: "response" })
      .pipe(
        tap((response) => {
          const totalPages = response.headers.get("X-Total-Pages");
          const totalResults = response.headers.get("X-Total-Results");
          this.totalResultsSubject.next(Number(totalResults));
          if (totalPages) {
            this.totalRestaurantsState.next(+totalResults);
          }
          this.http.get<any>("/bestinform/" + urlAll + url, { observe: "response" })
              .subscribe(res => {
                const coordinates =
                    res.body?.map((resource) => ({
                      name: resource.name,
                      location: resource.location,
                      ...resource,
                    })) || [];
                this.coordinatesListSubject.next(coordinates);
              })

        }),
        switchMap((res) => {
          if (res) {
            this.restaurantListState.next(res.body);
            return this.restaurantListObj$;
          }
        }),
      );
  }

  getLocationSubject() {
    return this.locationSubject;
  }

  setLocationSubject(location: { x: number; y: number }) {
    this.locationSubject.next(location);
  }

  getPeopleNumberSubject() {
    return this.peopleNumberSubject;
  }

  setPeopleNumberSubject(peopleNumber: number) {
    this.peopleNumberSubject.next(peopleNumber);
  }

  getRestaurantReservationDateSubject() {
    return this.restaurantReservationDateSubject;
  }

  setRestaurantReservationDateSubject(date: any) {
    this.restaurantReservationDateSubject.next(date);
  }

  getSearchRangeSubject() {
    return this.searchRangeSubject;
  }

  setSearchRangeSubject(range: number) {
    this.searchRangeSubject.next(range);
  }

  increaseAdultCount() {
    this.adultCountSubject.next(this.adultCountSubject.getValue() + 1);
  }

  decreaseAdultCount() {
    this.adultCountSubject.next(this.adultCountSubject.getValue() - 1);
  }

  increaseChildrenCount() {
    this.childrenCountSubject.next(this.childrenCountSubject.getValue() + 1);
  }

  decreaseChildrenCount() {
    this.childrenCountSubject.next(this.childrenCountSubject.getValue() - 1);
  }

  submitRestaurantReservation(reservationData: any) {
    console.log(reservationData);
    return this.http.post(
      "/bestinform/restaurant/reservations?resourceId=" + reservationData.restaurantId,
      reservationData,
    );
  }

  setAdultCount(adults: number) {
    this.adultCountSubject.next(adults);
  }

  setChildrenCount(children: number) {
    this.childrenCountSubject.next(children);
  }

  setSelectedRestaurant(restaurant: any) {
    this.selectedRestaurantSubject.next(restaurant);
  }

  getSelectedRestaurant() {
    return this.selectedRestaurantSubject.getValue();
  }

  getRestaurantById(restaurantId: string) {
    return this.http
      .get<Resource>("/bestinform/restaurants/" + restaurantId)
      .pipe(
        switchMap((res) => {
          if (res) {
            console.log(res)
            this.resourceState.next(res);
            return this.resourceObs$;
          }
        }),
      );
  }

  getResourceTemplateByResourceTypeId(resourceTypeId: string) {
    return this.http
      .post<TemplatePagination>(
        "/bestinform/listResourceTemplateFiltered?page=0&size=1",
        { resourceTypeId: resourceTypeId },
      )
      .pipe(
        switchMap((res) => {
          if (res?.content?.length > 0) {
            this.resourceTemplateState.next(res.content[0]);
            return this.resourceTemplateObs$;
          } else {
            this.resourceTemplateState.next(null);
            return this.resourceTemplateObs$;
          }
        }),
      );
  }

  updateSavedFilters(newFilters: any) {
    this.savedFilters = { ...newFilters };
  }

  updateCachedFiltersValue(newFilters) {
    this.savedFilters = { ...newFilters };
    this.cachedFilters = newFilters;
    this.filterFormSubject.next(this.cachedFilters);
  }

  getSavedFilters(): SavedFilters {
    return this.savedFilters;
  }

  private isValidResource(resource: object): resource is Resource {
    return (
      "domain" in resource &&
      "categoryId" in resource &&
      "resourceTypeId" in resource
    );
  }

  getResourceById(resourceId: string, resourceFromHotels: boolean) {
    // const resourceFromHistory = history.state;
    // if (this.isValidResource(resourceFromHistory) && resourceFromHistory.id === resourceId) {
    //     this.resourceState.next(resourceFromHistory);
    //     return this.resourceObs$;
    // }
    if (this.checkIfItineraryModal()) {
      this.resourceState.next(this.resourceFromItinerary);
      return this.resourceObs$;
    }
    if (resourceFromHotels) {
      return this.resourceObs$;
    }

    return this.http
      .get<Resource>("/bestinform/getResourceById?resourceId=" + resourceId)
      .pipe(
        switchMap((res) => {
          if (res) {
            this.resourceState.next(res);
          }
          return this.resourceObs$;
        }),
      );
  }

  getFilterAttributeFromTemplate(templateId: string) {
    return this.http.get<Attribute[]>(
      "/bestinform/getFilterAttributeFromTemplate?templateId=" + templateId,
    );
  }
}
