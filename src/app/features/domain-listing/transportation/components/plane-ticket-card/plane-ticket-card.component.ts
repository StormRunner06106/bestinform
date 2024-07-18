import {Component, EventEmitter, Input, LOCALE_ID, OnInit, Output} from '@angular/core';
import {Flight} from "../../_services/plane-flights.store";
import localeRo from '@angular/common/locales/ro';
import {registerLocaleData} from '@angular/common';
import {PlaneService} from "../../../../../shared/_services/plane.service";
import {AppConstants} from "../../../../resources/_models/AppConstants";
import _ from "lodash";
import {AirCompaniesLibrary} from "../../../../../utils/libraries/AirCompaniesLibrary";

registerLocaleData(localeRo);

@Component({
    selector: 'app-plane-ticket-card',
    templateUrl: './plane-ticket-card.component.html',
    styleUrls: ['./plane-ticket-card.component.scss'],
    providers: [
        {provide: LOCALE_ID, useValue: 'ro-RO'}
    ]
})
export class PlaneTicketCardComponent implements OnInit {
    @Input() flight: Flight;
    @Input() hideFooter: boolean;
    @Output() bookNowClicked = new EventEmitter<void>();
    iataCodes = [];
    iataCodesMap = {};

    public airCompaniesLibrary = AirCompaniesLibrary;

    constructor(public planeService: PlaneService) {
    }

    ngOnInit() {
        this.flight = _.cloneDeep(this.flight);
        this.flight.itineraries?.forEach(itinerary => {
            itinerary.segments?.forEach(segment => {
                if (!this.iataCodes.some(iataCode => iataCode == segment.arrival?.iataCode)) {
                    this.iataCodes.push(segment.arrival?.iataCode);
                }
                if (!this.iataCodes.some(iataCode => iataCode == segment.departure?.iataCode)) {
                    this.iataCodes.push(segment.departure?.iataCode);
                }
            })
        });
        const roData = require('../../../../../../assets/i18n/ro.json');
        this.iataCodes.forEach(iataCode => {
            this.iataCodesMap[iataCode] = roData.airports.find(airport => airport.airport_code == iataCode)
        });
        this.flight.totalPriceWithMarkup = Number((Number(this.flight.totalPrice) * AppConstants.ADAOS).toFixed(2));
    }

    calculateDuration(start: string, end: string): string {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const duration = endDate.getTime() - startDate.getTime();

        const hours = Math.floor(duration / (1000 * 60 * 60));
        const minutes = Math.floor((duration / (1000 * 60)) % 60);

        return `${hours}h ${minutes}min`;
    }

    calculateDurationFromMinutes(duration: number) {
        const hours = Math.floor(duration / 60);
        const minutes = Math.floor(duration % 60);

        return `${hours}h ${minutes}min`;
    }

    calculateDurationFromItinerary(itinerary: any) {
        return this.planeService.calculateDurationFromItinerary(itinerary);
    }

    getAirportName(iataCode: string): string {
        const airport = this.iataCodesMap[iataCode];
        return airport ? airport.airport_name : '';
    }

    getAirportShortName(iataCode: string): string {
        const airport = this.iataCodesMap[iataCode];
        return airport ? airport.airport_short_name : '';
    }

    getCity(iataCode: string): string {
        const airport = this.iataCodesMap[iataCode];
        return airport ? airport.city : '';
    }

    getCityCode(iataCode: string): string {
        const airport = this.iataCodesMap[iataCode];
        return airport ? airport.city_code : '';
    }

    getCountry(iataCode: string): string {
        const airport = this.iataCodesMap[iataCode];
        return airport ? airport.country : '';
    }
}

