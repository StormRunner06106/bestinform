import {Component, OnInit, ViewChild} from '@angular/core';
import {Flight, FlightOffers, PlaneFlightsStore} from "../_services/plane-flights.store";
import {BehaviorSubject, Observable} from "rxjs";
import {MatTabChangeEvent, MatTabGroup} from "@angular/material/tabs";
import _ from "lodash";
import {LoadingService} from "../../../../utils/spinner/loading.service";
import {ToastService} from "../../../../shared/_services/toast.service";
import {AppConstants} from "../../../resources/_models/AppConstants";
import {DataCacheService} from "../../../../shared/_services/data-cache.service";

export interface IPlaneTicket {
    arrivalDate?: string;
    companyName?: string;
    currency?: string;
    departureDate?: string;
    from?: string;
    iconPath?: string;
    price?: 0;
    to?: string;
    transportDuration?: number;
    transportNumber?: string;
    travelClass?: string;
    stops?: number;
    image?: {
        filePath: string;
        fileName: string;
    };
    name?: string;
    description?: string;
    transmission?: string;
    consumption?: string;
    seats?: number;
    doors?: number;
    id?: number;

}

@Component({
    selector: 'app-available-plane-tickets-list',
    templateUrl: './available-plane-tickets-list.component.html',
    styleUrls: ['./available-plane-tickets-list.component.scss'],
    providers: [PlaneFlightsStore]
})
export class AvailablePlaneTicketsListComponent implements OnInit {

    ticketList: Array<IPlaneTicket> = [];
    flights$: Observable<FlightOffers>;
    flights;
    recommendedFlights;
    cheapestFlights;
    shortestFlights;
    isLoading;
    showError = false;
    airlines;
    tabOffers = {
        shortest: {
            price: "",
            duration: ""
        },
        cheapest: {
            price: "",
            duration: ""
        },
        recommended: {
            price: "",
            duration: ""
        }
    }

    flightsLoaded$: BehaviorSubject<any> = new BehaviorSubject<any>({});

    @ViewChild("tabGroup")
    private tabGroup: MatTabGroup;

    constructor(private planeFlightsStore: PlaneFlightsStore,
                private toastService: ToastService,
                private dataCacheService: DataCacheService,
                private loadingService: LoadingService) {
    }

    ngOnInit(): void {
        // this.getPlaneOffers();
        if (this.planeFlightsStore.latestFlights$) {
            this.loadingService.showLoading();
            this.planeFlightsStore.latestFlights$.subscribe(flights => {
                if (!flights.loading) {
                    this.planeFlightsStore.flightsLoaded$.next({});
                    this.flights = flights.list;
                    if (!this.airlines || this.airlines.length === 0) {
                        this.airlines = flights.airlines;
                    }
                    this.updateFlightData(flights);
                    this.loadingService.hideLoading();
                }
            },
                (error) => {
                this.loadingService.hideLoading();
            });
        }
    }

    changeTabStatus(event: MatTabChangeEvent) {
        this.flights = [];
        this.shortestFlights = [];
        this.recommendedFlights = [];
        this.cheapestFlights = [];
        const status: ['recommended', 'cheapest', 'shortest'] = ['recommended', 'cheapest', 'shortest'];
        this.planeFlightsStore.changeTabStatus(status[event.index]);
    }

    selectFlight(flight: Flight) {
        this.planeFlightsStore.selectFlight(flight);
    }

    getPlaneOffers() {
        const storedFilters = JSON.parse(localStorage.getItem('filters'));
        this.isLoading = true;
        this.loadingService.showLoading();

        const updatedFilters = {
            adults: storedFilters.adults,
            children: storedFilters.children,
            departureDate: storedFilters.departureDate,
            destinationLocationCode: storedFilters.destinationLocationCode,
            heldInfants: storedFilters.heldInfants,
            maxResultsNumber: storedFilters.maxResultsNumber,
            originLocationCode: storedFilters.originLocationCode,
            returnDate: storedFilters.returnDate,
            travelClass: storedFilters.travelClass,
            young: storedFilters.young,
            allDeparturesAirportCodes: storedFilters.allDeparturesAirportCodes,
            allArrivalsAirportCodes: storedFilters.allArrivalsAirportCodes
        }

        this.planeFlightsStore.getFlightOffer(updatedFilters).subscribe(offers => {
            this.airlines = offers.airlines ? offers.airlines : [];
            this.flights = offers.list ? offers.list : [];
            this.updateFlightData(offers);
            this.dataCacheService.savePlanesFilter(updatedFilters);
            this.dataCacheService.saveFlights(offers);
            this.isLoading = false;
            this.loadingService.hideLoading();
        }, (error) => {
            this.loadingService.hideLoading();
            this.toastService.showToast("Eroare", "La afisarea zborurilor disponibile pentru aceste selectii. Va rugam reincercati.", "error");
        });


    }

    updateTabs(flights: any[]) {
        this.recommendedFlights = [];
        this.cheapestFlights = [];
        this.shortestFlights = [];
        this.recommendedFlights = _.cloneDeep(flights);

        this.tabOffers.recommended = {
            price: Number(this.recommendedFlights[0].price.total) + " " + this.recommendedFlights[0].price.currency,
            duration: this.calculateDuration(this.recommendedFlights[0].totalDuration)
        }

        this.cheapestFlights = _.cloneDeep(flights);
        this.cheapestFlights = this.cheapestFlights.sort((a, b) => Number(a.totalPrice) < Number(b.totalPrice) ? -1 : 1);
        this.tabOffers.cheapest = {
            price: Number(this.cheapestFlights[0].price.total) + " " + this.cheapestFlights[0].price.currency,
            duration: this.calculateDuration(this.cheapestFlights[0].totalDuration)
        }

        this.shortestFlights = _.cloneDeep(flights);
        this.shortestFlights = this.shortestFlights.sort((a, b) => a.totalDuration < b.totalDuration ? -1 : 1);
        this.tabOffers.shortest = {
            price: Number(this.shortestFlights[0].price.total) + " " + this.shortestFlights[0].price.currency,
            duration: this.calculateDuration(this.shortestFlights[0].totalDuration)
        }
    }

    calculateDuration(duration: number): string {

        const hours = Math.floor(duration / 60);
        const minutes = Math.floor(duration % 60);

        return `${hours}h ${minutes}min`;
    }

    calculateDurationNumber(duration: number, min: boolean): number {
        return min ? Number(Math.floor(duration / 60)) : Number(Math.ceil(duration / 60));
    }

    updatePlaneOffers(event) {
        this.getPlaneOffers();
    }

    private updateFlightData(flights) {
        if (flights && flights.list && flights.list.length) {
            this.updateTabs(flights.list);
            const flightsCopy = _.cloneDeep(flights.list);

            this.flightsLoaded$.next({
                price: Number(this.flights[0].totalPrice),
                duration: this.calculateDurationNumber(this.flights[0].totalDuration, false),
                minPrice: Number(flightsCopy.sort((a, b) => a.totalPrice > b.totalPrice ? 1 : -1)[0].totalPrice),
                maxPrice: Number(flightsCopy.sort((a, b) => a.totalPrice < b.totalPrice ? 1 : -1)[0].totalPrice),
                currency: this.flights[this.flights.length - 1].currency,
                minDuration: this.calculateDurationNumber(flightsCopy.sort((a, b) => a.totalDuration > b.totalDuration ? 1 : -1)[0].totalDuration, false),
                maxDuration: this.calculateDurationNumber(flightsCopy.sort((a, b) => a.totalDuration < b.totalDuration ? 1 : -1)[0].totalDuration, false)
            });
        }
        if (flights.list && !flights.list.length) {
            this.flights = [];
            this.recommendedFlights = [];
            this.cheapestFlights = [];
            this.shortestFlights = [];
            this.tabOffers.recommended = {
                price: "",
                duration: ""
            }
            this.tabOffers.cheapest = {
                price: "",
                duration: ""
            }
            this.tabOffers.shortest = {
                price: "",
                duration: ""
            }
        }
    }
}
