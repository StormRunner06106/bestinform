import {DatePipe} from '@angular/common';
import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {NgbAccordion} from '@ng-bootstrap/ng-bootstrap';
import {Subject} from 'rxjs';
import {CityCode, CityWithAirports, PlaneFlightsStore} from "../_services/plane-flights.store";
import {takeUntil} from "rxjs/operators";
import {TranslateService} from "@ngx-translate/core";


@Component({
    selector: 'app-plane-tickets',
    templateUrl: './plane-tickets.component.html',
    styleUrls: ['./plane-tickets.component.scss'],
    providers: [DatePipe]
})
export class PlaneTicketsComponent implements OnInit, OnDestroy {

    @ViewChild('acc') accordionRef: NgbAccordion;

    airplaneTicketForm: FormGroup;

    roundTrip = false;

    minDate = new Date();

    cityToSearch: string = null;
    recommendedDepartureAirport: CityWithAirports[] = null;
    recommendedArrivalAirport: CityWithAirports[] = null;

    // filter names
    filterSelection = {
        departure: true,
        return: false,
    }
    accIsOpen = false;
    activeFilter = '';

    //check travelCLass buttons
    invalidFields: string[] = [];
    travelClass: boolean;
    showDepartureList: boolean;

    initialDeparture: string;
    initialArrival: string;

    currentLanguage: string;

    private ngUnsubscribe = new Subject<void>();

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private planeFlightsStore: PlaneFlightsStore,
        private datePipe: DatePipe,
        private translate: TranslateService
    ) {
    }

    ngOnInit(): void {
        this.initFormGroup();
        this.checkLanguage();
    }

    initFormGroup() {
        this.airplaneTicketForm = this.formBuilder.group({
            departureAirport: ['', Validators.required],
            arrivalAirport: ['', [Validators.required, Validators.min]],
            departureDate: ['', Validators.required],
            returnDate: [null],
            travelClass: ['', Validators.required],
            passengersAdults: [0, Validators.min(0)],
            passengersYoung: [0, Validators.min(0)],
            passengersChildren: [0, Validators.min(0)],
            passengersHeldInfants: [0, Validators.min(0)]
        })
    }

    checkLanguage() {
        this.currentLanguage = this.translate.currentLang;
        this.translate.onLangChange
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    this.currentLanguage = res.lang;
                }
            });
    }

    //when you change the toggle for round or one way trips
    changeTab(event: 'oneWay' | 'roundTrips') {
        if (event) {
            this.airplaneTicketForm.reset();
            this.airplaneTicketForm.markAsUntouched();
        }
        this.roundTrip = event === 'roundTrips';

        if (this.roundTrip === true) {
            this.airplaneTicketForm.get('returnDate').addValidators(Validators.required);
        } else {
            this.airplaneTicketForm.get('returnDate').clearValidators();
        }
    }

    //set the number of person
    incrementNumberOfPeople(formControlName: string) {
        const formControl = this.airplaneTicketForm.get(formControlName);
        formControl.patchValue(formControl.value + 1);
    }

    //set the number of person
    decrementNumberOfPeople(formControlName: string) {
        const formControl = this.airplaneTicketForm.get(formControlName);
        if (formControl.value === 0) {
            return;
        }
        formControl.patchValue(formControl.value - 1);
    }

    findInvalidControls() {
        this.invalidFields = [];
        const controls = this.airplaneTicketForm.controls;
        for (const name in controls) {
            if (controls[name].invalid) {
                this.invalidFields.push(name);
            }
        }
        this.travelClass = this.invalidFields.includes('travelClass')
        // console.log('INVALIDE', this.invalidFields);
    }


    updateFormValue(formControlName: string, value: unknown) {
        this.initialDeparture = this.airplaneTicketForm.value.departureAirport;
        this.initialArrival = this.airplaneTicketForm.value.arrivalAirport;
        this.airplaneTicketForm.get(formControlName).patchValue(value);
        this.recommendedDepartureAirport = null;
        this.recommendedArrivalAirport = null;

    }

    getCityCodeDeparture() {

        if (!this.airplaneTicketForm.value.departureAirport || this.airplaneTicketForm.value.departureAirport.length < 3) {
            this.recommendedDepartureAirport = null;
            return;
        } else if (this.airplaneTicketForm.value.departureAirport !== this.initialDeparture) {
            this.planeFlightsStore.getAirports(this.airplaneTicketForm.value.departureAirport)
                .subscribe(cityCode => {

                    this.recommendedDepartureAirport = cityCode;
                })
        }

    }

    getCityCodeArrival() {

        if (!this.airplaneTicketForm.value.arrivalAirport || this.airplaneTicketForm.value.arrivalAirport.length < 3) {
            this.recommendedArrivalAirport = null;
            return;
        } else if (this.airplaneTicketForm.value.arrivalAirport !== this.initialArrival) {
            this.planeFlightsStore.getAirports(this.airplaneTicketForm.value.arrivalAirport)
                .subscribe(cityCode => {

                    this.recommendedArrivalAirport = cityCode;
                })
        }

    }

    //submit form
    checkAvilability() {
        const objToSend = {
            originLocationCode: this.airplaneTicketForm.get('departureAirport').value,
            destinationLocationCode: this.airplaneTicketForm.get('arrivalAirport').value,
            departureDate: this.datePipe.transform(this.airplaneTicketForm.get('departureDate').value, 'yyyy-MM-dd'),
            returnDate: this.datePipe.transform(this.airplaneTicketForm.get('returnDate').value, 'yyyy-MM-dd'),
            adults: this.airplaneTicketForm.get('passengersAdults').value,
            young: this.airplaneTicketForm.get('passengersYoung').value,
            children: this.airplaneTicketForm.get('passengersChildren').value,
            heldInfants: this.airplaneTicketForm.get('passengersHeldInfants').value,
            travelClass: this.airplaneTicketForm.get('travelClass').value,
            maxResultsNumber: 50

        }
        console.log(objToSend);
        this.airplaneTicketForm.markAllAsTouched();
        //is form valid
        if (this.airplaneTicketForm.valid) {
            if ((this.airplaneTicketForm.get('passengersChildren').value !== 0) || (this.airplaneTicketForm.get('passengersAdults').value !== 0)) {
                void this.router.navigate([`/client/domain/63bfcca765dc3f3863af755c/category/63dbb1a4df393f7372161842/available-plane-tickets`],
                    {
                        queryParams: objToSend
                    });
            }

        } else {
            this.findInvalidControls();
            // Mark all inputs as touched
        }
        // console.log("formular trimis");

        // console.log(objToSend);
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();

    }

}
