import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FlightCheckoutStore, FlightOrder, Traveler} from "../_services/flight-checkout.store";
import {BehaviorSubject, Observable, Subscription, take, tap} from "rxjs";
import {ToastService} from "../../../../shared/_services/toast.service";
import {TranslateService} from "@ngx-translate/core";
import {Baggage} from "../_services/selected-flight.store";
import {UserDataService} from "../../../../shared/_services/userData.service";
import {Flight, TravelerPricing} from "../_services/plane-flights.store";
import {ActivatedRoute, Router} from "@angular/router";
import {PlaneService} from "../../../../shared/_services/plane.service";
import {AppConstants} from "../../../resources/_models/AppConstants";
import {AirCompaniesLibrary} from "../../../../utils/libraries/AirCompaniesLibrary";
import {AircraftCodesLibrary} from "../../../../utils/libraries/AircraftCodesLibrary";

@Component({
    selector: 'app-flight-checkout',
    templateUrl: './flight-checkout.component.html',
    styleUrls: ['./flight-checkout.component.scss'],
    providers: [FlightCheckoutStore]
})
export class FlightCheckoutComponent implements OnInit {
    ticketsPrice: number;
    ticketsCurrency: string;
    baggagePrice = 0;
    currency: string;
    baggageWithOffer: any;
    assistance: any;
    selectedOffer: Flight;
    travelersMap: any;

    contactVerificationForm: FormGroup = this.formBuilder.group({
        contactEmail: [{value: '', disabled: true}, [Validators.required, Validators.email]],
        contactPhone: [{value: '', disabled: true}, [Validators.required]],
    });

    travelers;
    travelersDescription = "";
    travelersNumber;
    flightData = {};
    appConstant = AppConstants;
    totalPrice = 0;

    public airCompaniesLibrary = AirCompaniesLibrary;
    public aircraftsLibrary = AircraftCodesLibrary;

    finalFlightOffer$: Observable<FlightOrder & { baggageAllowance: Baggage[] }> = this.flightCheckoutStore.finalFlightOffer$
        .pipe(tap(value => {
            console.log(value);
            if (value) {
                const roData = require('../../../../../assets/i18n/ro.json');

                const awaySegmentsLength = value.confirmedFlightOffer.itineraries[0].segments.length - 1;
                const itineraryLength = value.confirmedFlightOffer.itineraries.length - 1;
                const returnSegmentsLength = value.confirmedFlightOffer.itineraries[itineraryLength].segments.length - 1;
                this.contactVerificationForm.controls.contactEmail.setValue(value.contact.email);
                this.contactVerificationForm.controls.contactPhone.setValue(value.contact.telephone);
                this.contactVerificationForm.controls.contactEmail.disable();
                this.contactVerificationForm.controls.contactPhone.disable();
                this.selectedOffer = value.confirmedFlightOffer;
                this.travelers = value.travelers;


                const flightExtras = JSON.parse(sessionStorage.getItem("flightExtras"));
                if (flightExtras) {
                    this.baggageWithOffer = flightExtras.baggage;
                    this.assistance = flightExtras.assistance;
                    this.travelersMap = flightExtras.travelersMap;
                    this.selectedOffer.extraOffer = this.assistance;
                }

                Object.keys(this.travelersMap).forEach(key => {
                    this.totalPrice += Number(this.travelersMap[key][0].travelerPrice.total);
                    this.currency = this.travelersMap[key][0].travelerPrice.currency;
                    this.totalPrice += (Number(this.baggageWithOffer[key].price.amount) * (this.selectedOffer.oneWay ? 1 : 2));
                });
                this.totalPrice += Number(this.assistance.price) * this.travelers.length;
                this.totalPrice += Number(this.selectedOffer.travelersServiceTax);


                this.flightData = {
                    away: {
                        itinerary: value.confirmedFlightOffer.itineraries[0],
                        segments: value.confirmedFlightOffer.itineraries[0].segments,
                        departure: roData.airports.find(airport => airport.airport_code == value.confirmedFlightOffer.itineraries[0].segments[0].departure.iataCode),
                        arrival: roData.airports.find(airport => airport.airport_code == value.confirmedFlightOffer.itineraries[0].segments[awaySegmentsLength].arrival.iataCode),
                        number: value.confirmedFlightOffer.itineraries[0].segments[0].number,
                        departureTime: value.confirmedFlightOffer.itineraries[0].segments[0].departure.at,
                        arrivalTime: value.confirmedFlightOffer.itineraries[0].segments[awaySegmentsLength].arrival.at,
                        companies: value.confirmedFlightOffer.itineraries[0].segments.map(s => s.company).join(", "),
                        carrierCode: value.confirmedFlightOffer.itineraries[0].segments[0].operating.carrierCode,
                        aircraft: value.confirmedFlightOffer.itineraries[0].segments[0].aircraft.code,
                        layover: value.confirmedFlightOffer.itineraries[0].segments.length > 1,
                        duration: this.calculateDuration(value.confirmedFlightOffer.itineraries[0].segments[0].duration)
                    }
                }
                if (this.flightData["away"]["layover"]) {
                    this.flightData["away"]['layoverDetails'] = {
                        city: value.confirmedFlightOffer.itineraries[0].segments[0].arrival.city,
                        airport: roData.airports.find(airport => airport.airport_code == value.confirmedFlightOffer.itineraries[0].segments[0].arrival.iataCode),
                        arrivalTime: value.confirmedFlightOffer.itineraries[0].segments[0].arrival.at,
                        departureTime: value.confirmedFlightOffer.itineraries[0].segments[awaySegmentsLength].departure.at,
                        carrierCode: value.confirmedFlightOffer.itineraries[0].segments[awaySegmentsLength].operating.carrierCode,
                        aircraft: value.confirmedFlightOffer.itineraries[0].segments[awaySegmentsLength].aircraft.code,
                        number: value.confirmedFlightOffer.itineraries[0].segments[awaySegmentsLength].number,
                        duration: this.calculateDuration(value.confirmedFlightOffer.itineraries[0].segments[awaySegmentsLength].duration)
                    }
                }
                if (!value.confirmedFlightOffer.oneWay) {
                    this.flightData["returnFlight"] = {
                        itinerary: value.confirmedFlightOffer.itineraries[itineraryLength],
                        segments: value.confirmedFlightOffer.itineraries[itineraryLength].segments,
                        departure: roData.airports.find(airport => airport.airport_code == value.confirmedFlightOffer.itineraries[itineraryLength].segments[0].departure.iataCode),
                        arrival: roData.airports.find(airport => airport.airport_code == value.confirmedFlightOffer.itineraries[itineraryLength].segments[returnSegmentsLength].arrival.iataCode),
                        number: value.confirmedFlightOffer.itineraries[itineraryLength].segments[0].number,
                        departureTime: value.confirmedFlightOffer.itineraries[itineraryLength].segments[0].departure.at,
                        arrivalTime: value.confirmedFlightOffer.itineraries[itineraryLength].segments[returnSegmentsLength].arrival.at,
                        companies: value.confirmedFlightOffer.itineraries[itineraryLength].segments.map(s => s.company).join(", "),
                        carrierCode: value.confirmedFlightOffer.itineraries[itineraryLength].segments[0].operating.carrierCode,
                        aircraft: value.confirmedFlightOffer.itineraries[itineraryLength].segments[0].aircraft.code,
                        layover: value.confirmedFlightOffer.itineraries[itineraryLength].segments.length > 0,
                        duration: this.calculateDuration(value.confirmedFlightOffer.itineraries[itineraryLength].segments[0].duration)
                    }
                    if (this.flightData["returnFlight"]["layover"]) {
                        this.flightData["returnFlight"]['layoverDetails'] = {
                            city: value.confirmedFlightOffer.itineraries[itineraryLength].segments[0].arrival.city,
                            airport: roData.airports.find(airport => airport.airport_code == value.confirmedFlightOffer.itineraries[itineraryLength].segments[0].arrival.iataCode),
                            duration: this.calculateDuration(value.confirmedFlightOffer.itineraries[itineraryLength].segments[returnSegmentsLength].duration),
                            arrivalTime: value.confirmedFlightOffer.itineraries[itineraryLength].segments[0].arrival.at,
                            departureTime: value.confirmedFlightOffer.itineraries[itineraryLength].segments[returnSegmentsLength].departure.at,
                            carrierCode: value.confirmedFlightOffer.itineraries[itineraryLength].segments[returnSegmentsLength].operating.carrierCode,
                            aircraft: value.confirmedFlightOffer.itineraries[itineraryLength].segments[returnSegmentsLength].aircraft.code,
                            number: value.confirmedFlightOffer.itineraries[itineraryLength].segments[returnSegmentsLength].number,
                        }
                    }
                }

                // this.priceOfTickets(value.confirmedFlightOffer.travelerPricings);
                // @ts-ignore
                // this.priceOfBaggageByItineraries(value.confirmedFlightOffers[0].itineraries, value.baggageAllowance);
                // @ts-ignore
                this.priceOfBaggages(value.confirmedFlightOffer.itineraries, value.baggageAllowance);


                const filter = JSON.parse(localStorage.getItem("filters"));
                let text = "(";
                if (filter.adults) {
                    text += filter.adults + " Adult";
                }
                if (filter.young) {
                    text += ", " + filter.young + " Tanar";
                }
                if (filter.children) {
                    text += ", " + filter.children + " Copii";
                }
                if (filter.heldInfants) {
                    text += ", " + filter.heldInfants + " Infant";
                }
                text += ")";
                this.travelersDescription = this.travelers.length + " Pasageri " + text;

                value.confirmedFlightOffer.totalPrice = Number(value.confirmedFlightOffer.totalPrice);
            }

        }));

    isSubmitLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    isSubmitLoading: boolean;
    private unsubscribe: Subscription[] = [];

    constructor(private formBuilder: FormBuilder,
                private flightCheckoutStore: FlightCheckoutStore,
                private toastService: ToastService,
                private translate: TranslateService,
                private userService: UserDataService,
                private route: ActivatedRoute,
                private planeService: PlaneService,
                private router: Router) {
        const loadingSubscr = this.isSubmitLoading$
            .asObservable()
            .subscribe((res) => (this.isSubmitLoading = res));
        this.unsubscribe.push(loadingSubscr);
    }

    ngOnInit(): void {
        this.initFormGroup();
    }

    initFormGroup() {
        this.contactVerificationForm = this.formBuilder.group({
            contactEmail: ['', [Validators.required, Validators.email]],
            contactPhone: ['', [Validators.required]],
        })
        this.getCurrentUser();
    }

    getCurrentUser() {
        this.userService.getCurrentUser()
            .subscribe({
                next: currentUser => {
                    if (currentUser !== undefined) {
                        this.contactVerificationForm.get('contactEmail').patchValue(currentUser.email);
                        this.contactVerificationForm.get('contactPhone').patchValue(currentUser.telephone);
                    }
                }
            })
    }

    // priceOfTickets(travalers: Array<TravelerPricing>) {
    //     let price: number = 0;
    //     if (travalers.length > 0) {
    //         travalers.forEach((traveler: any, index: number) => {
    //             price += Number((Number(traveler.price) * AppConstants.ADAOS).toFixed(2));
    //             if (index === 0) this.ticketsCurrency = traveler.currency;
    //         })
    //     }
    //     this.travelersNumber = travalers.filter(t => t.travelerType !== "HELD_INFANT").length;
    //     this.ticketsPrice = price + AppConstants.TAXA_SERVICIU * this.travelersNumber;
    // }

    priceOfBaggages(itineraries: any, baggagesArray: any) {
        if(baggagesArray.length > 0){
            baggagesArray.forEach((baggage: any) => {
                // console.log(this.priceOfBaggageByItineraries(itineraries, baggage))
                this.baggagePrice += Number(baggage.price.amount) * baggage.travelerIds.length * Number(this.priceOfBaggageByItineraries(itineraries, baggage));
                this.currency = baggage.price.currencyCode;
            })
        }
    }

    priceOfBaggageByItineraries(itineraries: any, baggage: any): number {
        // baggages.forEach((baggage: any) => {
            let currentBaggageItinerary = 0;
            if(baggage.bookableByItinerary){
                itineraries.forEach((itinerary: any) => {
                    console.log(itinerary.segments)
                    const itineraryHasBaggage = itinerary.segments.every(segment => {
                        return baggage.segmentIds.includes(segment.id);
                    })
                    if(itineraryHasBaggage){
                        currentBaggageItinerary++;
                    }
                    // itinerary.segments.forEach((segment: any) => {
                    //     segmentsOfItinerary.push(segment.id);
                    //     if(segmentsOfItinerary.length === itinerary.segments.length){
                    //         if(segmentsOfItinerary.join() === baggage.segmentIds.join()){
                    //             currentBaggageItinerary++;
                    //         }
                    //     }
                    // })
                })
            }else{
                currentBaggageItinerary = 1;
            }

        return currentBaggageItinerary === 0 ? 1 : currentBaggageItinerary;
        // })
    }

    getPriceById(travelersArray: any, travelerId: any) {
        const traveler = travelersArray.find(t => t.travelerId === travelerId);
        return (traveler.price + ' ' + traveler.currency);
    }

    createFlightOrder(finalFlightOffer: FlightOrder & { baggageAllowance: Baggage[] }) {
        this.isSubmitLoading = true;

        const offerToSend: FlightOrder = {
            confirmedFlightOffer: finalFlightOffer.confirmedFlightOffer,
            travelers: finalFlightOffer.travelers,
            contact: finalFlightOffer.contact,
            formOfPayments: finalFlightOffer.formOfPayments,
            assistance: this.assistance
        };

        console.log('Obiect oferta zbor');
        console.log(offerToSend);
        return;

        this.flightCheckoutStore.createFlightOrder(offerToSend)
            .pipe(take(1))
            .subscribe({
                next: (res: any) => {
                    this.toastService.showToast(this.translate.instant("TOAST.SUCCESS"), "Biletul a fost confirmat!", "success");
                    // this.flightCheckoutStore.handleFlightOrderSuccess();
                    console.log('executa plata');
                    this.flightCheckoutStore.executeOneTimePaymentFlightOrder(res.reason)
                        .subscribe({
                            next: (respPayment: any) =>{
                                window.location.href = respPayment.reason;
                            },
                            error: () => {
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    "Plata nu poate fi efectuata in acest moment!",
                                    "error"
                                );
                                this.router.navigate(['/client/dashboard/flight-bookings'])
                            }
                        })
                },

                error: () => {
                    this.toastService.showToast(
                        this.translate.instant("TOAST.ERROR"),
                        this.translate.instant("TOAST.SERVER-ERROR"),
                        "error");
                }
            });
    }

    calculateDurationFromMinutes(duration: number) {
        const hours = Math.floor(duration / 60);
        const minutes = Math.floor(duration % 60);

        return `${hours}h ${minutes}min`;
    }

    calculateDurationFromItinerary(itinerary: any) {
        return this.planeService.calculateDurationFromItinerary(itinerary);
    }

    goBack() {
        this.router.navigate(["../"], {relativeTo: this.route});
    }

    calculateDuration(duration: string): string {
        const time = duration.split("PT")[1];

        const hours = time.split("H")[0];
        const minutesWithM = time.split("H")[1];
        const minutes = minutesWithM ? minutesWithM.split("M")[0] : "00";

        return `${hours}h ${minutes}min`;
    }

    calculateInterval(start: string, end: string): string {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const duration = endDate.getTime() - startDate.getTime();

        const hours = Math.floor(duration / (1000 * 60 * 60));
        const minutes = Math.floor((duration / (1000 * 60)) % 60);

        return `${hours}h ${minutes}min`;
    }

    getTravelerType(travelerType: string) {
        switch (travelerType) {
            case "ADULT":
                return " (Adult)";
            case "CHILD":
                return " (Copil)";
            case "HELD_INFANT":
                return " (Bebelus)";
            default:
                return "";
        }
    }

    getBaggageDescription(travelerId: string, type: string) {
        const baggage = this.baggageWithOffer[travelerId][type];
        const index = type === 'personal' ? 0 : type === 'carryOn' ? 1 : 2;
        return baggage.quantity + "x " + baggage.name + "(" + baggage.weight + baggage.weightUnit + ") " +
            (type === "checkIn" ? this.travelersMap[travelerId][index].price.amount + " " + this.travelersMap[travelerId][index].price.currencyCode : "inclus")
    }
}
