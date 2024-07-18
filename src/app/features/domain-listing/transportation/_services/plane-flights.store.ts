import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {
    BehaviorSubject,
    combineLatest,
    concat, delay,
    Observable,
    of,
    shareReplay,
    startWith,
    Subject,
    switchMap,
    tap
} from "rxjs";
import {map, take} from "rxjs/operators";
import {SharedFlightsDataService} from "./shared-flights-data.service";
import {LoadingService} from "../../../../utils/spinner/loading.service";
import {ResourceFilterService} from "../../../../shared/_services/resource-filter.service";
import {DataCacheService} from "../../../../shared/_services/data-cache.service";

export type CityCode = {
    type?: string;
    name?: string;
    iataCode?: string;
    cityName?: string;
    countryName?: string;
};

export type Airport = {
    id?: string;
    country?: string;
    cityNameRo?: string;
    cityNameEn?: string;
    airportNameEn?: string;
    airportNameRo?: string;
    cityCode?: string;
    airportCode?: string;
};

export type CityWithAirports = {
    cityNameRo?: string;
    cityNameEn?: string;
    cityCode?: string;
    airports?: Airport[];
}

export type FlightsFilters = {
    originLocationCode?: string;
    destinationLocationCode?: string;
    travelClass?: string;
    departureDate?: string;
    returnDate?: string;
    adults?: number;
    young?: number;
    children?: number;
    // seatedInfants?: number;
    heldInfants?: number;
    maxResultsNumber?: number;
};

export type FlightSegment = {
    id?: string;
    departure?: {
        iataCode?: string;
        terminal?: string;
        dateTime?: string;
        carrierCode?: string;
        at?: string;
    },
    arrival?: {
        iataCode?: string;
        terminal?: string;
        dateTime?: string;
        carrierCode?: string;
        at?: string;
    },
    carrierCode?: string;
    number?: string;
    company?: string;
    aircraft?: {
        code?: string;
    };
    operating?: {
        carrierCode?: string;
    };
    duration?: string;
    numberOfStops?: number;
    blacklistedInEU?: boolean;
    originLocation?: CityWithAirports;
    destinationLocation?: CityWithAirports;
    aircraftCode?: string;
};

export type Flight = {
    type?: string;
    oneWay?: boolean;
    lastTicketingDate?: string;
    lastTicketingDateTime?: string;
    numberOfBookableSeats?: number;
    itineraries?: ItineraryFlight[];
    pricingOptions?: PricingOptions;
    validatingAirlineCodes?: string[];
    travelerPricings?: TravelerPricing[];
    price?: FlightPrice;

    extraOffer?: Assistance;
    totalPrice?: any;
    serviceTax?: number;
    travelersServiceTax?: number;
    totalPriceWithMarkup?: number;
    totalDuration?: number;
    currency?: string;
    index?: number;

    amadeusFlightOffer?: string;
    priceConfirmed?: boolean;
};

export type Assistance = {
    price?: number;
    type?: string;
    class?: string;
}

export type PricingOptions = {
    includedCheckedBagsOnly?: boolean;
    fareType?: string[];
    corporateCodes?: string[];
    refundableFare?: boolean;
    noRestrictionFare?: boolean;
    noPenaltyFare?: boolean;
}

export type ItineraryFlight = {
    duration?: string;
    segments?: FlightSegment[];
    direct?: boolean;
}

export type FlightOffers = {
    list?: Flight[];
    airlines?: string[];
    aircraft?: string[];
};

export type TravelerPricing = {
    id?: string;
    travelerId?: string;
    fareOptions?: string;
    travelerType?: 'ADULT' | 'CHILD' | 'HELD_INFANT' | 'SENIOR' | 'YOUNG' | 'SEATED_INFANT' | 'STUDENT';
    currency?: string;
    price?: FlightPrice;
    ticketPrice?: number;
    fareDetailsBySegment?: Array<{
        segmentId?: string;
        cabin?: string;
        fareBasis?: string;
        brandedFare?: string;
        brandedFareLabel?: string;
        fareClass?: string;
        includedCheckedBags?: {
            quantity?: number;
            weight?: number;
            weightUnit?: string;
        };
        amenities?: Array<{
            description?: string;
            amenityType?: string;
            isChargeable?: boolean;
            amenityProvider?: {
                name?: string;
            }
        }>;
    }>;
}

export type FlightPrice = {
    currency?: string;
    total?: string;
    base?: string;
    fees?: FlightFee[];
    grandTotal?: string;
}

export type FlightFee = {
    amount?: string;
    type?: string;
}

export type FlightsFilteredBody = {
    dto?: {
        allDepartures?: boolean;
        allArrivals?: boolean;
        allDeparturesAirportCodes?: string[];
        allArrivalsAirportCodes?: string[];
        layover?: 'none' | 'one' | 'more';
        airlines?: string[];
        maxDuration?: number; // in minutes
        turDepartureHour?: 'beforeMidDay' | 'afterMidDay';
        turArrivalHour?: 'beforeMidDay' | 'afterMidDay';
        returnDepartureHour?: 'beforeMidDay' | 'afterMidDay';
        returnArrivalHour?: 'beforeMidDay' | 'afterMidDay';
        oneWay?: boolean;
        turIataCode?: string;
        returnIataCode?: string;
    };
    list: Flight[];
    cheapest?: boolean;
    shortest?: boolean;
};

@Injectable({
    providedIn: 'root'
})
export class PlaneFlightsStore {
    private readonly flightsFilters: FlightsFilters;

    private flightsFilteredBody: FlightsFilteredBody;

    // actions
    private changeFilters$ = new BehaviorSubject<FlightsFilteredBody>(null);

    public flightsLoaded$ = new BehaviorSubject<any>(null);

    latestFlights$: Observable<FlightOffers & { loading: boolean }>;

    departureAirports$: Observable<CityWithAirports[]>;
    arrivalAirports$: Observable<CityWithAirports[]>;

    private allDepartures: boolean;
    public allDeparturesAirportCodes: string[];
    private allArrivals: boolean;
    public allArrivalsAirportCodes: string[];

    constructor(private http: HttpClient,
                private route: ActivatedRoute,
                private router: Router,
                private loadingService: LoadingService,
                private resourceFilterService: ResourceFilterService,
                private dataCacheService: DataCacheService,
                private sharedFlightsData: SharedFlightsDataService) {
        const params = this.route.snapshot.queryParams;
        const lowerCaseFlightObject: Record<string, string> = {};
        
            this.flightsFilters = JSON.parse(sessionStorage.getItem('filters'));
            const filterType = sessionStorage.getItem('filterType');

            if (!this.flightsFilters) {
                this.router.navigate(["/client/domain/63bfcca765dc3f3863af755c"]);
            } else if (filterType === "planes"){

                this.departureAirports$ = this.getAirports(this.flightsFilters.originLocationCode, true)
                    .pipe(switchMap(cityWithAirports => {
                        if (cityWithAirports[0].airports.length <= 1) {
                            return of(cityWithAirports);
                        }
                        return this.getAirports(cityWithAirports[0].cityNameEn)
                    }));

                this.arrivalAirports$ = this.getAirports(this.flightsFilters.destinationLocationCode, true)
                    .pipe(switchMap(cityWithAirports => {
                        if (cityWithAirports[0].airports.length <= 1) {
                            return of(cityWithAirports);
                        }
                        return this.getAirports(cityWithAirports[0].cityNameEn)
                    }));

                this.resourceFilterService.updateSavedFilters(this.flightsFilters);
                const flightOffers$ = this.getFlightOffer(this.flightsFilters).pipe(
                    tap(flightOffers => {
                        this.dataCacheService.savePlanesFilter(this.flightsFilters);
                        this.dataCacheService.saveFlights(flightOffers);
                        this.flightsFilteredBody = {
                            list: flightOffers.list,
                            dto: {
                                oneWay: !this.flightsFilters?.returnDate
                            }
                        };
                    }),
                    shareReplay(1)
                );

                this.latestFlights$ = this.changeFilters$.pipe(
                    tap(filters => {
                        console.log("New filters received:", filters);
                        if (filters) {
                            // this.loadingService.showLoading();
                        }
                    }),
                    switchMap(newFilters => {
                        return flightOffers$.pipe(
                            switchMap(flightOffers => {
                                if (!newFilters) {
                                    return concat(
                                        of({loading: true}),
                                        of({loading: false, ...flightOffers})
                                    );
                                }


                                return concat(
                                    of({loading: true}),
                                    this.getFlightsFilter(newFilters).pipe(map(value => {
                                        return ({loading: false, ...value});
                                    }))
                                );
                            })
                        )
                    })
                );
                this.latestFlights$.subscribe(data => {
                    console.log("Direct subscription test:", data);
                    // this.loadingService.hideLoading();
                });
            }

    }

    getFlightsFilters() {
        return of(this.flightsFilters);
    }

    changeFilters(newFilters: FlightsFilteredBody['dto']) {
        this.flightsFilteredBody = {
            ...this.flightsFilteredBody,
            dto: {
                allDepartures: this.allDepartures,
                allArrivals: this.allArrivals,
                allDeparturesAirportCodes: this.allDeparturesAirportCodes,
                allArrivalsAirportCodes: this.allArrivalsAirportCodes,
                ...this.flightsFilteredBody?.dto,
                ...newFilters
            }
        }
        this.loadingService.showLoading();
        this.changeFilters$.next(this.flightsFilteredBody);
    }

    setAllDepartures(value, cityCodes) {
        this.allDepartures = value;
        this.allDeparturesAirportCodes = cityCodes;
    }

    setAllArrivals(value, cityCodes) {
        this.allArrivals = value;
        this.allArrivalsAirportCodes = cityCodes;
    }


    changeTabStatus(newStatus: 'cheapest' | 'shortest' | 'recommended') {
        switch (newStatus) {
            case "cheapest":
                this.flightsFilteredBody = {
                    ...this.flightsFilteredBody,
                    cheapest: undefined,
                    shortest: undefined
                };
                break;

            case "shortest":
                this.flightsFilteredBody = {
                    ...this.flightsFilteredBody,
                    cheapest: undefined,
                    shortest: undefined
                };
                break;

            case "recommended":
                this.flightsFilteredBody = {
                    ...this.flightsFilteredBody,
                    cheapest: undefined,
                    shortest: undefined
                };
                break;
        }

        this.changeFilters$.next(this.flightsFilteredBody);
    }

    selectFlight(flight: Flight) {
        this.sharedFlightsData.setSelectedFlight(flight);
        void this.router.navigate(['plane-ticket'],
            {
                relativeTo: this.route,
                queryParamsHandling: 'preserve'
            });
    }

    getFlightOffer(flightObj: FlightsFilters) {
        if (this.dataCacheService.checkSamePlanesFilter(flightObj)) {
            return of(this.dataCacheService.getFlights())
                .pipe(delay(1000));
        }
        return this.http.post<FlightOffers>('/bestinform/getFlights', flightObj);
    }

    // getReservationBySlug
    getCityCode(city: string) {
        return this.http.get<CityCode[]>('/bestinform/getCityCode?city=' + city);
    }

    getFlightsFilter(flightsFilters: FlightsFilteredBody) {
        return this.http.post<FlightOffers>('/bestinform/getFlightsFilter', flightsFilters);
    }

    getAirports(name: string, searchIataCode = false) {
        return this.http.get<CityWithAirports[]>('/bestinform/getAirports?name=' + name + '&searchIataCode=' + searchIataCode);
    }
}
