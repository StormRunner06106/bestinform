import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Itinerary} from "../../../shared/_models/itinerary.model";
import {ResourceType} from "../../../shared/_models/resource-type.model";
import {SystemSetting} from "../../../shared/_models/system-setting.model";
import {forkJoin, Observable, of, switchMap} from "rxjs";
import {map} from "rxjs/operators";
import {Attribute} from "../../../shared/_models/attribute.model";
import {GenericPagination} from "../../../shared/_models/generic-pagination.model";

@Injectable({
    providedIn: 'root'
})
export class ItinerariesService {

    private itineraryState: Itinerary = null;

    setItineraryState(itinerary: Itinerary): void {
        this.itineraryState = itinerary;
    }

    getItineraryById(itineraryId: string): Observable<Itinerary> {
        if (this.itineraryState?.id === itineraryId) {
            return of(this.itineraryState);
        }
        return this.http.get<Itinerary>('/bestinform/getItineraryById?itineraryId=' + itineraryId);
    }

    constructor(private http: HttpClient) {
    }

    createItinerary(itinerary: Itinerary) {
        return this.http.post<{ success: boolean, reason: string }>('/bestinform/createItinerary', itinerary);
    }

    updateItinerary(itineraryId: string, itineraryData: Itinerary) {
        return this.http.put<{ success: boolean, reason: string }>('/bestinform/updateItinerary?itineraryId=' + itineraryId, itineraryData);
    }

    /**
     * returns in this order:
     * journeyTheme
     * typeOfDestination
     * typeOfJourney
     */
    getCategoryAttributes(): Observable<Array<Attribute[]>> {
        return this.http.get<SystemSetting>('/bestinform/getSystemSetting')
            .pipe(
                switchMap(systemSettings => {
                    const attributesByCategoryId$ = [];

                    if (systemSettings.journeyThemeCategoryId) {
                        attributesByCategoryId$.push(this.getAttributesByCategoryId(systemSettings.journeyThemeCategoryId));
                    } else {
                        attributesByCategoryId$.push(of(null));
                    }

                    if (systemSettings.typeOfDestinationCategoryId) {
                        attributesByCategoryId$.push(this.getAttributesByCategoryId(systemSettings.typeOfDestinationCategoryId));
                    } else {
                        attributesByCategoryId$.push(of(null));
                    }

                    if (systemSettings.typeOfJourneyCategoryId) {
                        attributesByCategoryId$.push(this.getAttributesByCategoryId(systemSettings.typeOfJourneyCategoryId));
                    } else {
                        attributesByCategoryId$.push(of(null));
                    }

                    return forkJoin(attributesByCategoryId$);
                })
            );
    }

    private getAttributesByCategoryId(categoryId: string) {
        return this.http.post<GenericPagination<Attribute>>('/bestinform/listAttributesFiltered?page=0&size=-1', {categoryId: categoryId})
            .pipe(map(attributePagination => attributePagination.content));
    }

    getAllResourceTypes() {
        return this.http.get<ResourceType[]>('/bestinform/getAllResourceTypes');
    }

    getRentalBookingResourceTypes() {
        return this.http.get<ResourceType[]>('/bestinform/getRentalBookingResourceTypes');
    }

    getTicketBookingResourceTypes() {
        return this.http.get<ResourceType[]>('/bestinform/getTicketBookingResourceTypes');
    }

    getMenuResourceTypes() {
        return this.http.get<ResourceType[]>('/bestinform/getMenuResourceTypes');
    }

    listItinerariesFiltered(page: number, size: number, sort?: string | null, dir?: string | null, filterParams?: object) {
        return this.http.post<GenericPagination<Itinerary>>('/bestinform/listItineraryFiltered?page=' + page + '&size=' + size + '&sort=' + sort + '&dir=' + dir, filterParams);
    }

    deleteItineraryById(itineraryId: string) {
        return this.http.delete('/bestinform/deleteItineraryById?itineraryId=' + itineraryId);
    }
}
