import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Assistance, Flight} from "./plane-flights.store";
import {Baggage, FlightOfferWithBags} from "./selected-flight.store";
import {SharedFlightsDataService} from "./shared-flights-data.service";
import {combineLatest, Observable, of, shareReplay, Subject, switchMap, take} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {map} from "rxjs/operators";
import {mockResponse} from "../flight-checkout/mockResponse";

export type Contact = {
    email: string;
    telephone: string;
}
export type Traveler = {
    id: string;
    dateOfBirth: string;
    gender: string;
    firstName: string;
    lastName: string;
    email?: string;
    address?: string;
    postalCode?: string;
    cityName?: string;
    countryName?: string;
    countryCode?: string;
    offer: number;
    nationality?: string;
    phones: {
            countryCallingCode: string;
            phoneNumber: string;
            deviceTypeEnum: string;
        }[];
    documents: {
            documentTypeEnum: string;
            documentNumber: string;
            documentExpiryDate: string;
            documentIssuanceCountry: string;
            nationality: string;
            documentHolder: boolean; // cred ca trebuie sa fie mereu true
        }[];
};

export type FormOfPayment = {
    b2bWallet?: {
        cardId?: string;
        cardUsageName?: string;
        cardFriendlyName?: string;
        reportingData?: {
            name?: string;
            value?: string;
        };
        virtualCreditCardDetails?: {
            brand?: string;
            holder?: string;
            number?: string;
            expiryDate?: string;
            price?: {
                amount?: string;
                currencyCode?: string;
            }
        },
        flightOfferIds?: string[];
    },
    creditCard?: {
        brand?: string;
        holder?: string;
        number?: string;
        expiryDate?: string;
        securityCode?: string;
        flightOfferIds?: string[];
    };
    other?: 'ACCOUNT' | 'CASH' | 'CHECK' | 'NONREFUNDABLE' | 'PYTON';
};

export type FlightOrder = {
    confirmedFlightOffer: Flight;
    travelers: Traveler[];
    contact: Contact;
    formOfPayments: FormOfPayment[];
    assistance: Assistance;
};

@Injectable({
    providedIn: 'root'
})
export class FlightCheckoutStore {
    private travelers$ = this.sharedFlightsData.getTravelers().pipe(
        take(1),
        switchMap( travelers => {
            if (!travelers || !travelers.length) {
                void this.router.navigate(['../../../plane-tickets'], {relativeTo: this.route});
                return;
            }
            return of(travelers);
        }),
    );

    private flightWithAdditionalServicesBody$ = this.sharedFlightsData.getFlightWithAdditionalServicesBody()
        .pipe(
            take(1),
            switchMap( flightWithAdditionalServicesBody => {
                if (!flightWithAdditionalServicesBody) {
                    void this.router.navigate(['../../../plane-tickets'], {relativeTo: this.route});
                    return;
                }
                return of(flightWithAdditionalServicesBody);
            }),
            shareReplay(1)
        );

    private contact$ = this.sharedFlightsData.getContact()
        .pipe(
            take(1),
            switchMap( contact => {
                if (!contact) {
                    void this.router.navigate(['../../../plane-tickets'], {relativeTo: this.route});
                    return;
                }
                return of(contact);
            }),
            shareReplay(1)
        );

    private baggageAllowance$: Observable<Baggage[]> = this.flightWithAdditionalServicesBody$
        .pipe(
            map(flightWithAdditionalServicesBody => flightWithAdditionalServicesBody.baggageAllowance)
        );

    private flightAdditionalServicesResponse$ = this.flightWithAdditionalServicesBody$
        .pipe(
            switchMap(flightWithAdditionalServicesBody => {
                return this.setFlightAdditionalServices(flightWithAdditionalServicesBody)
                    .pipe(
                        switchMap( flights => {
                            if (!flights || !flights.length) {
                                void this.router.navigate(['../../../plane-tickets'], {relativeTo: this.route});
                                return;
                            }
                            return of(flights[0]);
                        })
                    )
            }),
            shareReplay(1)
        );

    // TODO: formOfPayments ramane hardcodat momentan, nu avem metoda prin care sa schimbam valoarea
    finalFlightOffer$: Observable<any> = combineLatest([this.flightAdditionalServicesResponse$, this.travelers$, this.baggageAllowance$, this.contact$])
        .pipe(
            map(([flightAdditionalServicesResponse, travelers, baggageAllowance, contact]) => {
                console.log('FLIGHT DIN STORE', flightAdditionalServicesResponse);
                return {
                    confirmedFlightOffer: flightAdditionalServicesResponse,
                    travelers: travelers,
                    contact: contact,
                    formOfPayments: [{
                        other: 'CASH'
                    }],
                    baggageAllowance
                }
            })
        );

    constructor(private http: HttpClient,
                private sharedFlightsData: SharedFlightsDataService,
                private router: Router,
                private route: ActivatedRoute) {
    }

    setFlightAdditionalServices(flightOfferWithBags: FlightOfferWithBags) {
        return this.http.post<Flight[]>('/bestinform/setFlightAdditionalServices', flightOfferWithBags);
    }

    createFlightOrder(flightOrder: FlightOrder) {
        return this.http.post<string>('/bestinform/createFlightOrder', flightOrder);
    }

    executeOneTimePaymentFlightOrder(flightOrderId: string){
        return this.http.post('/bestinform/executeOneTimePaymentFlightOrder', flightOrderId)
    }

    handleFlightOrderSuccess() {

        // TODO: sa vedem unde dam redirect
        this.router.navigate(['']).then(() => {
            this.sharedFlightsData.clearStoredStates();
        });
    }
}
