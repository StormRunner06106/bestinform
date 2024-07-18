import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {Flight, FlightsFilters} from "./plane-flights.store";
import {SharedFlightsDataService} from "./shared-flights-data.service";
import {BehaviorSubject, combineLatest, concat, Observable, of, shareReplay, startWith, switchMap, take} from "rxjs";
import {map} from "rxjs/operators";
import {User} from "../../../../shared/_models/user.model";
import {Contact, Traveler} from "./flight-checkout.store";

export type Baggage = {
    quantity?: number;
    weight?: number;
    weightUnit?: string;
    name?: string;
    price?: {
        amount: string;
        currencyCode?: string;
    };
    bookableByItinerary?: boolean;
    segmentIds?: string[];
    travelerIds?: string[];
};

export class BaggageWithInfo {
    quantity?: number;
    weight?: number;
    weightUnit?: string;
    name?: string;
    price?: {
        amount: string;
        currencyCode?: string;
    };
    bookableByItinerary?: boolean;
    segmentIds?: string[];
    travelerIds?: string[];
    length?: number;
    width?: number;
    height?: number;
    upTo?: boolean;
    upToValue?: number;
    icon?: string;
    iconAlt?: string;
    dimensionsAlt?: string;
}

export type FlightOfferWithBags = {
    flightOffer?: Flight;
    baggageAllowance?: Baggage[];
};

type DataForForm = {
    flightOffers: Flight[];
    currentUser: User;
}

@Injectable({
    providedIn: 'root'
})
export class SelectedFlightStore {
    private readonly flightsFilters: FlightsFilters;

    private selectedFlight$ = this.sharedFlightsData.getSelectedFlight().pipe(
        take(1),
        switchMap( value => {
            if (!value) {
                void this.router.navigate(['../'], {relativeTo: this.route, queryParamsHandling: 'preserve'});
                return;
            }
            this.setCurrentOfferWithAmenities(value);
            return of(value);
        }),
        shareReplay(1)
    );

    private flightsWithAmenities$ = this.selectedFlight$.pipe(
        switchMap( flight => {
            return this.getFlightsWithAmenitiesOption(flight)
        }),
        startWith([] as Flight[])
    );

    // TODO: prima oferta de la amenities pare similara cu oferta initiala, cel putin la pret. sa afisez doar arrayul de amenities?
    private flightsOffers$ = combineLatest([this.selectedFlight$, this.flightsWithAmenities$]).pipe(
        map(([selectedFlight, flightsWithAmenities]) => {
            return [selectedFlight, ...flightsWithAmenities];
        })
    );

    private currentFlightOfferWithAmenities$ = new BehaviorSubject<Flight>(null);

    flightOffersWithBags$: Observable<FlightOfferWithBags & {loading: boolean}> = this.currentFlightOfferWithAmenities$.pipe(
        switchMap( flight => {
            if(!flight) {
                return of(null);
            }

            return concat(
                of({loading: true}),
                this.confirmPriceAndBagOptions(flight).pipe(
                    map( flightOffersWithBags => {
                        // sort ascending by quantity
                        flightOffersWithBags.baggageAllowance.sort((a, b) => a.quantity - b.quantity);
                        return {
                            loading: false,
                            ...flightOffersWithBags
                        }
                    })
                )
            );
        })
    );

    private currentUser$ = this.getCurrentUser().pipe(shareReplay(1));

    dataStream$: Observable<DataForForm> = combineLatest([this.flightsOffers$, this.currentUser$]).pipe(
        map(([flightOffers, currentUser]) => {
            return {
                flightOffers,
                currentUser
            };
        })
    );

    constructor(private http: HttpClient,
                private route: ActivatedRoute,
                private router: Router,
                private sharedFlightsData: SharedFlightsDataService) {
        const params = this.route.snapshot.queryParams;
        const lowerCaseFlightObject: Record<string, string> = {};

        if (Object.keys(params).length) {
            Object.keys(params).forEach(key => {
                lowerCaseFlightObject[key.toLowerCase()] = params[key];
            });

            this.flightsFilters = {
                originLocationCode: lowerCaseFlightObject.originlocationcode.toUpperCase(),
                destinationLocationCode: lowerCaseFlightObject.destinationlocationcode.toUpperCase(),
                departureDate: lowerCaseFlightObject.departuredate,
                returnDate: lowerCaseFlightObject.returndate ? lowerCaseFlightObject.returndate : null,
                adults: (+lowerCaseFlightObject.adults),
                young: (+lowerCaseFlightObject.young),
                children: (+lowerCaseFlightObject.children),
                heldInfants: (+lowerCaseFlightObject.heldinfants),
                travelClass: lowerCaseFlightObject.travelclass.toUpperCase(),
                maxResultsNumber: (+lowerCaseFlightObject.maxresultsnumber)
            };
        }
    }

    getFlightsFilters(): FlightsFilters {
        return {...this.flightsFilters};
    }

    setCurrentOfferWithAmenities(flight: Flight) {
        this.currentFlightOfferWithAmenities$.next(flight);
    }

    confirmFlightOfferAndTravelers(flightOffer: FlightOfferWithBags, travelers: Traveler[], contact: Contact, flightExtras) {
        this.sharedFlightsData.setFlightWithAdditionalServicesBody(flightOffer);
        this.sharedFlightsData.setTravelers(travelers);
        this.sharedFlightsData.setContact(contact);
        this.sharedFlightsData.setFlightExtras(flightExtras);
        void this.router.navigate(['checkout'], {relativeTo: this.route});
    }

    getFlightsWithAmenitiesOption(flight: Flight) {
        return this.http.post<Flight[]>('/bestinform/getFlightsWithAmenitiesOption', flight);
    }

    confirmPriceAndBagOptions(flight: Flight) {
        return this.http.post<FlightOfferWithBags>('/bestinform/confirmPriceAndBagOptions', flight);
    }

    getCurrentUser(){
        return this.http.get<User>("/bestinform/getCurrentUser");
    }

    getCountries(){
        return this.http.get('https://restcountries.com/v3.1/all');
    }
}
