import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {SystemSetting} from "../../../shared/_models/system-setting.model";
import {GenericPagination} from "../../../shared/_models/generic-pagination.model";
import {Attribute} from "../../../shared/_models/attribute.model";
import {map, switchMap} from "rxjs/operators";
import {Itinerary, ItineraryResource} from "../../../shared/_models/itinerary.model";
import moment from "moment/moment";
import {BehaviorSubject, firstValueFrom, Observable, of, shareReplay, tap} from "rxjs";
import {Resource} from "../../../shared/_models/resource.model";

export type ItineraryFilters = {
    name?: string;
    resources?: Array<{
        day?: string;
        dayMoments?: Array<{
            dayMoment?: string;
            resources?: string[];
        }>;
    }>;
    startDate?: string;
    endDate?: string;
    userId?: string;
    status?: string;
    country?: string;
    city?: string;
    journeyThemeId?: string;
    typeOfDestinationId?: string;
    typeOfJourneyId?: string;
};

type Destination = {
    startDate?: moment.Moment;
    endDate?: moment.Moment;
    location?: {
        country?: string;
        city?: string;
        geographicalCoordinates?: {
            longitude?: number;
            latitude?: number;
        }
    }
};

export type  ItineraryExtraInfo = {
    startDate?: moment.Moment;
    endDate?: moment.Moment;
    adultsNumber?: number;
    childrenNumber?: number;
    roomsNumber?: number;
    breakfastHour?: string;
    lunchHour?: string;
    dinnerHour?: string;
    destinations?: Destination[];
    itineraryType?: 'manual' | 'road-trip' | 'ai'
};

export type ItineraryResourceTypesGroup = 'itineraryTransportResourceTypes' | 'itineraryAccommodationResourceTypes' | 'itineraryEatAndDrinksResourceTypes' | 'itineraryDayActivityResourceTypes' | 'itineraryEveningActivityResourceTypes';

export type ItineraryResourceTypesWithNames = {
    itineraryTransportResourceTypes?: Array<{
        resourceTypeId: string;
        resourceTypeName: string;
    }>;
    itineraryAccommodationResourceTypes?: Array<{
        resourceTypeId: string;
        resourceTypeName: string;
    }>,
    itineraryEatAndDrinksResourceTypes?: Array<{
        resourceTypeId: string;
        resourceTypeName: string;
    }>;
    itineraryDayActivityResourceTypes?: Array<{
        resourceTypeId: string;
        resourceTypeName: string;
    }>;
    itineraryEveningActivityResourceTypes?: Array<{
        resourceTypeId: string;
        resourceTypeName: string;
    }>;
};

export type AccommodationResourcesGroup = {
    resourceTypeId: string;
    resourceTypeName: string;
    resources: Resource[];
}

export type DayMoment = {
    dayMoment?: 'Breakfast' | 'Lunch' | 'Dinner';
    resources?: Resource[];
}

export type EatAndDrinksResourcesGroup = {
    day?: string;
    dayMoments?: DayMoment[];
}

export type ResourceTypeDictionary = {
    [resourceTypeId: string]: string
};

export type ResourceTypesByStep = {
    [resourceTypeGroup in keyof ItineraryResourceTypesGroup]: string[]
};

export type ResourceWithTypeName = Resource & {resourceTypeName: string};

@Injectable({
    providedIn: 'root'
})
export class ItinerariesStore {

    private itineraryFilters: ItineraryFilters = null;
    private itineraryExtraInfo: ItineraryExtraInfo = null;
    private itinerary: Itinerary = null;
    private recommendedItinerary: Itinerary = null;
    private themeAttributes: Attribute[] = null;
    private typeDictionary: ResourceTypeDictionary = null;
    private itineraryResourceTypes: ItineraryResourceTypesWithNames = null;
    private resourceTypesByStep: ResourceTypesByStep = null;
    private newItinerary: Itinerary & {itineraryId: string} = null;
    private temporaryData: Itinerary = null;

    private activitiesTypes: 'day' | 'evening' = null;

    constructor(private http: HttpClient) {
        void firstValueFrom(this.getResourceTypeDictionary());
    }

    resetStoreStates() {
        this.itineraryFilters = null;
        this.itineraryExtraInfo = null;
        this.itinerary = null;
        this.recommendedItinerary = null;
        this.themeAttributes = null;
        this.itineraryResourceTypes = null;
        this.resourceTypesByStep = null;
        this.newItinerary = null;
        this.temporaryData = null;
        this.activitiesTypes = null;
    }

    getSystemSetting() {
        return this.http.get<SystemSetting>('/bestinform/getSystemSetting');
    }

    getAttributesByCategoryId(categoryId: string, sort?: string, dir?: string) {
        return this.http.post<GenericPagination<Attribute>>('/bestinform/listAttributesFiltered?page=0&size=-1&sort=' + sort + '&dir=' + dir, {categoryId: categoryId})
            .pipe(
                map(pagination => pagination.content)
            );
    }

    listItineraryFiltered(page: number, size: number, sort: string, dir: string) {
        return this.http.post<GenericPagination<Itinerary>>('/bestinform/listItineraryFiltered?page=' + page + '&size=' + size + '&sort=' + sort + '&dir=' + dir, {...this.itineraryFilters, status: 'active'})
            .pipe(
                map(pagination => pagination.content)
            );
    }

    setThemeAttributes(attributes: Attribute[]) {
        this.themeAttributes = [];
        this.themeAttributes = [...attributes];
    }

    setItineraryFilters(itineraryFilters: ItineraryFilters) {
        this.itineraryFilters = {...this.itineraryFilters, ...itineraryFilters};
    }

    setItineraryExtraInfo(itineraryExtraInfo: ItineraryExtraInfo) {
        this.itineraryExtraInfo = {...this.itineraryExtraInfo, ...itineraryExtraInfo};
    }

    getItineraryExtraInfo() {
        return this.itineraryExtraInfo ? {...this.itineraryExtraInfo} : null;
    }

    private getItineraryResourceTypeWithName() {
        return this.http.get<ItineraryResourceTypesWithNames>('/bestinform/getItineraryResourceTypeWithName').pipe(
            tap(itineraryResourceTypes => this.itineraryResourceTypes = itineraryResourceTypes),
            shareReplay(1)
        );
    }

    getResourceTypeDictionary(): Observable<[ResourceTypeDictionary, ResourceTypesByStep]> {
        if (this.typeDictionary && this.resourceTypesByStep) {
            return of([this.typeDictionary, this.resourceTypesByStep]);
        } else {
            // this.typeDictionary = [];
            return this.getItineraryResourceTypeWithName().pipe(
                map( resourceTypesGroups => {
                Object.entries(resourceTypesGroups).forEach( typeGroup => {
                    if (typeGroup[1]?.length > 0) {
                        this.resourceTypesByStep = {
                            ...this.resourceTypesByStep,
                            [typeGroup[0]]: []
                        };

                        typeGroup[1].forEach( typeNamePair => {
                            this.typeDictionary = {
                                ...this.typeDictionary,
                                [typeNamePair.resourceTypeId]: typeNamePair.resourceTypeName
                            };

                            this.resourceTypesByStep[typeGroup[0]].push(typeNamePair.resourceTypeId);
                        });
                    }
                });
                return [this.typeDictionary, this.resourceTypesByStep];
            }));
        }

    }

    private getResourcesByResourceTypes(resourceTypeIds: string[]) {
        return this.http.post<GenericPagination<Resource>>('/bestinform/listResourceFiltered?page=0&size=3', {
            resourceTypeIds: resourceTypeIds,
            geographicalCoordinates: this.itineraryExtraInfo.destinations[0].location.geographicalCoordinates,
            status: 'active',
            forItinerary: true,
            attributes: this.themeAttributes.map( attribute => {
                return {
                    attributeName: attribute.name,
                    attributeValue: 'true'
                }
            })
        }).pipe(map(pagination => pagination.content));
    }

    getResourcesForManualItinerary(typeGroup: ItineraryResourceTypesGroup): Observable<unknown> {
        return this.getResourceTypeDictionary().pipe(switchMap( firstRes => {
            const [typeDictionary, resourceTypesByStep] = firstRes;

            if (typeDictionary && resourceTypesByStep) {
                return this.getResourcesByResourceTypes(resourceTypesByStep[typeGroup]).pipe(
                    map( resources => {
                        switch (typeGroup) {

                            case 'itineraryAccommodationResourceTypes': {
                                const res = resources.reduce((group: {[key: string]: AccommodationResourcesGroup}, resource) => {
                                    if (!group[resource.resourceTypeId]) {
                                        group[resource.resourceTypeId] = {
                                            resourceTypeId: resource.resourceTypeId,
                                            resourceTypeName: typeDictionary[resource.resourceTypeId],
                                            resources: []
                                        }
                                    }
                                    group[resource.resourceTypeId].resources.push(resource);
                                    return group;
                                }, {});

                                const resAsArray: AccommodationResourcesGroup[] = Object.values(res);
                                return resAsArray;
                            }

                            default: {
                                return resources.map( resource => {
                                    return {
                                        ...resource,
                                        resourceTypeName: typeDictionary[resource.resourceTypeId]
                                    }
                                }) as ResourceWithTypeName[]
                            }
                        }
                }));
            }
        }))
    }

    getResourcesByIds(resourcesIds: string[]) {
        return this.http.post<Resource[]>('/bestinform/getResourcesByIds', resourcesIds);
    }

    // START: ITINERARY STATE
    private destinationIndex = new BehaviorSubject<number>(0)
    destinationIndex$ = this.destinationIndex.asObservable();

    private dayState: BehaviorSubject<string>;
    dayState$: Observable<string>;

    setItinerary(itinerary: Itinerary) {
        this.itinerary = itinerary;
    }

    setRecommendedItinerary(itinerary: Itinerary) {
        this.recommendedItinerary = itinerary;

        // side effect - every time we set the itinerary data, we make sure that we use the first destination
        this.destinationIndex.next(0);

        // side effect - every time we set the itinerary data, we make sure that we use the first day in the itinerary
        //             - and we initialize the dayState observable
        this.dayState = new BehaviorSubject(this.recommendedItinerary.resources[0].startDate);
        this.dayState$ = this.dayState.asObservable();
    }

    setDestinationIndex(newDestinationIndex: number) {
        this.destinationIndex.next(newDestinationIndex);
    }

    setDayState(newDayState: string) {
        this.dayState.next(newDayState);
    }

    getRecommendedItinerary() {
        return structuredClone(this.recommendedItinerary);
    }

    setTemporaryData(itineray: Itinerary) {
        this.temporaryData = itineray;
    }

    getTemporaryData() {
        return this.temporaryData;
    }

    setActivitiesType(activitiesType: 'day' | 'evening') {
        this.activitiesTypes = activitiesType;
    }

    getActivitiesType() {
        return this.activitiesTypes;
    }

    setNewItinerary(itinerary: Itinerary & {itineraryId: string}) {
        this.newItinerary = itinerary;
    }

    getNewItinerary() {
        return structuredClone(this.newItinerary);
    }

    // request pt itinerariul manual
    getResourcesForItinerary() {
        const body = {
            rooms: this.itineraryExtraInfo.roomsNumber,
            adults: this.itineraryExtraInfo.adultsNumber,
            children: this.itineraryExtraInfo.childrenNumber,
            breakfastHour: this.itineraryExtraInfo.breakfastHour,
            lunchHour: this.itineraryExtraInfo.lunchHour,
            dinnerHour: this.itineraryExtraInfo.dinnerHour,
            journeyThemeId: this.itineraryFilters.journeyThemeId,
            typeOfDestinationId: this.itineraryFilters.typeOfDestinationId,
            typeOfJourneyId: this.itineraryFilters.typeOfJourneyId,
            locations: this.itineraryExtraInfo.destinations.map( destination => {
                return {
                    startDate: destination.startDate.format('YYYY-MM-DD'),
                    endDate: destination.endDate.format('YYYY-MM-DD'),
                    country: destination.location.country,
                    city: destination.location.city,
                    geographicalCoordinates: destination.location.geographicalCoordinates
                }
            })
        };

        return this.http.post<ItineraryResource[]>('/bestinform/getResourcesForItinerary', body);
    }

    getItineraryWithRecommendations() {
        const body = {
            itineraryId: this.itinerary.id,
            startDate: this.itineraryExtraInfo.startDate.format('YYYY-MM-DD'),
            endDate: this.itineraryExtraInfo.endDate.format('YYYY-MM-DD'),
            rooms: this.itineraryExtraInfo.roomsNumber,
            adults: this.itineraryExtraInfo.adultsNumber,
            children: this.itineraryExtraInfo.childrenNumber,
            breakfastHour: this.itineraryExtraInfo.breakfastHour,
            lunchHour: this.itineraryExtraInfo.lunchHour,
            dinnerHour: this.itineraryExtraInfo.dinnerHour
        };

        return this.http.post<Itinerary>('/bestinform/getItineraryWithRecommendations', body)
            .pipe(tap(itinerary => this.setRecommendedItinerary(itinerary)));
    }

    getRoadTripWithRecommendations() {
        const body = {
            rooms: this.itineraryExtraInfo.roomsNumber,
            adults: this.itineraryExtraInfo.adultsNumber,
            children: this.itineraryExtraInfo.childrenNumber,
            breakfastHour: this.itineraryExtraInfo.breakfastHour,
            lunchHour: this.itineraryExtraInfo.lunchHour,
            dinnerHour: this.itineraryExtraInfo.dinnerHour,
            journeyThemeId: this.itineraryFilters.journeyThemeId,
            typeOfDestinationId: this.itineraryFilters.typeOfDestinationId,
            typeOfJourneyId: this.itineraryFilters.typeOfJourneyId,
            locations: this.itineraryExtraInfo.destinations.map( destination => {
                return {
                    startDate: destination.startDate.format('YYYY-MM-DD'),
                    endDate: destination.endDate.format('YYYY-MM-DD'),
                    country: destination.location.country,
                    city: destination.location.city,
                    geographicalCoordinates: destination.location.geographicalCoordinates
                }
            })
        };

        return this.http.post<Itinerary>('/bestinform/getRoadTripWithRecommendations', body)
            .pipe(tap(itinerary => this.setRecommendedItinerary(itinerary)));
    }

    getEmptyItinerary() {
        const newItinerary: Itinerary = {
            name: null,
            description: null,
            images: null,
            featuredImage: null,
            journeyThemeId: this.itineraryFilters.journeyThemeId,
            typeOfDestinationId: this.itineraryFilters.typeOfDestinationId,
            typeOfJourneyId: this.itineraryFilters.typeOfJourneyId,
            transportResourceTypes: null,
            accommodationResourceTypes: null,
            eatAndDrinksResourceTypes: null,
            dayActivityResourceTypes: null,
            eveningActivityResourceTypes: null,
            startDate: this.itineraryExtraInfo.destinations[0].startDate.format('YYYY-MM-DD'),
            endDate: this.itineraryExtraInfo.destinations[0].endDate.format('YYYY-MM-DD'),
            resources: [
                {
                    location: null,
                    country: this.itineraryExtraInfo.destinations[0].location.country,
                    city: this.itineraryExtraInfo.destinations[0].location.city,
                    geographicalCoordinates: this.itineraryExtraInfo.destinations[0].location.geographicalCoordinates,
                    startDate: this.itineraryExtraInfo.destinations[0].startDate.format('YYYY-MM-DD'),
                    endDate: this.itineraryExtraInfo.destinations[0].endDate.format('YYYY-MM-DD'),
                    transportResources: null,
                    accommodationResource: null,
                    eatAndDrinksResource: null,
                    dayActivityResource: null,
                    eveningActivityResource: null,
                    accommodationResourceRecommended: null,
                    eatAndDrinkResourcesRecommended: [],
                    dayActivityResourcesRecommended: [],
                    eveningActivityResourcesRecommended: []
                }
            ],
            startLocation: null,
            endLocation: null,
            slug: null,
            status: null,
            recommendation: null,
            transportPrice: 0,
            eatAndDrinkPrice: 0,
            accommodationPrice: 0,
            dayActivityPrice: 0,
            eveningActivityPrice: 0,
            transportPaidAmount: 0,
            eatAndDrinkPaidAmount: 0,
            accommodationPaidAmount: 0,
            dayActivityPaidAmount: 0,
            eveningActivityPaidAmount: 0
        };

        return of(newItinerary).pipe(
            switchMap( itinerary => {
                return this.getResourcesForItinerary().pipe(
                    map( resources => {
                        const itineraryWithData: Itinerary = {
                            ...itinerary,
                            resources: resources
                        };
                        return itineraryWithData;
                    }),
                    tap(itinerary => this.setRecommendedItinerary(itinerary))
                )
            })
        );
    }

    createItinerary(itinerary: Itinerary) {
        return this.http.post<{success: boolean, reason: string}>('/bestinform/createItinerary', itinerary);
    }

    createItineraryReservation(itineraryReservation: Itinerary & {itineraryId: string; adults: number; children: number}) {
        return this.http.post<{success: boolean, reason: string}>('/bestinform/createItineraryReservation', itineraryReservation);
    }
    // END: ITINERARY STATE

}