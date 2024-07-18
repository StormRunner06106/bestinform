import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Baggage, BaggageWithInfo, FlightOfferWithBags, SelectedFlightStore} from "../_services/selected-flight.store";
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Observable, shareReplay, Subscription, tap} from "rxjs";
import {Flight} from "../_services/plane-flights.store";
import {CountryISO, PhoneNumberFormat, SearchCountryField} from 'ngx-intl-tel-input';
import {ToastService} from "../../../../shared/_services/toast.service";
import {TranslateService} from "@ngx-translate/core";
import {Contact, Traveler} from "../_services/flight-checkout.store";
import moment from "moment/moment";
import {MatLegacyListOption, MatLegacySelectionListChange} from "@angular/material/legacy-list";
import {PlaneService} from "../../../../shared/_services/plane.service";
import {AppConstants} from "../../../resources/_models/AppConstants";
import _ from "lodash";
import {AirCompaniesLibrary} from "../../../../utils/libraries/AirCompaniesLibrary";
import {AircraftCodesLibrary} from "../../../../utils/libraries/AircraftCodesLibrary";
import {AirCompaniesLuggageLibrary} from "../../../../utils/libraries/AirCompaniesLuggageLibrary";


@Component({
    selector: 'app-selected-plane-ticket',
    templateUrl: './selected-plane-ticket.component.html',
    styleUrls: ['./selected-plane-ticket.component.scss'],
    providers: [SelectedFlightStore]
})
export class SelectedPlaneTicketComponent implements OnInit, OnDestroy {

    passengerOptions;
    iataCodes = [];
    iataCodesMap = {};
    responsiveOptions: any[];
    data: any;
    visibilityOptions;
    selectedPackage;
    offerTitles = [
        "Start-Up", "Eco-Plus", "Smart-Choice", "Comfort-Line", "Advantage",
        "Platinum-Privilege", "Elite-Experience", "Supreme", "Signature-Series", "Imperial-Elite"
    ];
    public baggagePrice: any = 0;
    public selectedAssistance = 0;
    public travelerMap;

    @ViewChild("baggageListOption")
    public baggageListOption: any;

    @ViewChild("offersListOption")
    public offersListOption: MatLegacyListOption;

    @ViewChild("offersListOption1")
    public offersListOption1: MatLegacyListOption;

    @ViewChild("offersListOption2")
    public offersListOption2: MatLegacyListOption;

    price1: number = 0;
    price2: number = 0;

    public airCompaniesLibrary = AirCompaniesLibrary;
    public aircraftsLibrary = AircraftCodesLibrary;
    public airCompaniesLuggageLibrary = AirCompaniesLuggageLibrary;
    public selectedBaggage;
    public selectedBaggageByTraveler = {};
    public baggageWithInfo;

    constructor(private selectedFlightStore: SelectedFlightStore,
                private planeService: PlaneService,
                private fb: FormBuilder,
                private toastService: ToastService,
                private cdr: ChangeDetectorRef,
                private translate: TranslateService) {


    }

    ngOnInit() {
        this.contactUser = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            telephone: ['', Validators.required]
        });
        this.subscription = this.selectedFlightStore.dataStream$.subscribe(
            data => {
                if (data.currentUser) {
                    this.contactUser.patchValue(data.currentUser);
                }

                if (this.selectedOffer) {
                    return;
                }
                if (data.flightOffers?.length > 0) {
                    // const index = 0;
                    // data.flightOffers.forEach(offer => {
                    //     offer.index = index + 1
                    // })
                    // data.flightOffers.forEach(offer => {
                    //     offer.travelerPricings.forEach(traveler => {
                    //         traveler.fareDetailsBySegment.forEach(segment => {
                    //             segment.amenities = this.sortAmenities(segment.amenities);
                    //         })
                    //     })
                    // })
                    this.data = _.cloneDeep(data);
                    this.selectedOffer = _.cloneDeep(data.flightOffers[0]);
                    this.selectedOffer.totalPrice = Number(Number(this.selectedOffer.totalPrice).toFixed(2));
                    this.travelers = this.selectedOffer?.travelerPricings.filter(f => f.travelerType !== "HELD_INFANT").length
                    this.price1 = Number((Number(this.selectedOffer.price.total) + Number(this.selectedOffer.travelersServiceTax)).toFixed(2));
                    this.price2 = Number((Number(this.selectedOffer.price.total) + Number(this.selectedOffer.travelersServiceTax)).toFixed(2));

                    this.selectedOffer.extraOffer = {
                        type: "Silver",
                        class: "bst-grey",
                        price: 0
                    };

                    // if (data.flightOffers?.length > 1) {
                    //     this.selectedPackage = this.selectedOffer;
                    //     this.selectedPackage?.travelerPricings.forEach(tp => tp.price = Number(Number(tp.price).toFixed(2)));
                    // }

                    this.selectedOffer.itineraries?.forEach(itinerary => {
                        itinerary.segments?.forEach(segment => {
                            if (!this.iataCodes.some(iataCode => iataCode == segment.arrival?.iataCode)) {
                                this.iataCodes.push(segment.arrival?.iataCode);
                            }
                            if (!this.iataCodes.some(iataCode => iataCode == segment.departure?.iataCode)) {
                                this.iataCodes.push(segment.departure?.iataCode);
                            }
                        })
                    });
                    const roData = require('../../../../../assets/i18n/ro.json');
                    this.iataCodes.forEach(iataCode => {
                        this.iataCodesMap[iataCode] = roData.airports.find(airport => airport.airport_code == iataCode)
                    });
                    this.recommendations = [
                        {
                            imageUrl: '../../../../assets/images/others/recommendationHotel.png',
                            cardText: {
                                title: 'Ai nevoie de cazare in ' + this.getCity(this.selectedOffer.itineraries[0].segments[this.selectedOffer.itineraries[0].segments.length - 1].arrival.iataCode)
                                    + '?',
                                description: 'Exploreaza hoteluri in ' + this.getCity(this.selectedOffer.itineraries[0].segments[this.selectedOffer.itineraries[0].segments.length - 1].arrival.iataCode) ,
                                priceCategory: 'Hoteluri de la',
                                price: '125 RON per noapte'
                            }
                        },
                        {
                            imageUrl: '../../../../assets/images/others/recommendationRestaurant.png',
                            cardText: {
                                title: 'Cauti un restaurant in ' + this.getCity(this.selectedOffer.itineraries[0].segments[this.selectedOffer.itineraries[0].segments.length - 1].arrival.iataCode)
                                    + '?',
                                description: 'Exploreaza restaurante, cafenele si baruri in ' + this.getCity(this.selectedOffer.itineraries[0].segments[this.selectedOffer.itineraries[0].segments.length - 1].arrival.iataCode) ,
                            }
                        }
                    ]
                    this.createPassengersForm();
                    this.getCountriesFormExternalApi();
                }
            }
        );
        // this.subscription = this.selectedFlightStore.dataStream$.subscribe(data => {
        //     if (data.currentUser) {
        //         this.contactUser.patchValue(data.currentUser);
        //     }
        //
        //     if (data.flightOffers?.length > 0) {
        //         // const index = 0;
        //         // data.flightOffers.forEach(offer => {
        //         //     offer.index = index + 1
        //         // })
        //         // data.flightOffers.forEach(offer => {
        //         //     offer.travelerPricings.forEach(traveler => {
        //         //         traveler.fareDetailsBySegment.forEach(segment => {
        //         //             segment.amenities = this.sortAmenities(segment.amenities);
        //         //         })
        //         //     })
        //         // })
        //         this.selectedOffer = _.cloneDeep(data.flightOffers[0]);
        //         this.selectedOffer.totalPrice = Number(this.selectedOffer.totalPrice);
        //         this.travelers = this.selectedOffer.travelerPricings.filter(f => f.travelerType !== "HELD_INFANT").length
        //         this.selectedOffer.totalPrice = Number((Number(this.selectedOffer.totalPrice) * AppConstants.ADAOS).toFixed(2)) + AppConstants.TAXA_SERVICIU * this.travelers;
        //         this.selectedOffer.travelerPricings.forEach(tp => {
        //             tp.priceWithMarkup = Number((Number(tp.price) * AppConstants.ADAOS).toFixed(2));
        //         });
        //
        //         if (data.flightOffers?.length > 1) {
        //             this.selectedPackage = this.selectedOffer;
        //         }
        //         this.selectedOffer.itineraries?.forEach(itinerary => {
        //             itinerary.segments?.forEach(segment => {
        //                 if (!this.iataCodes.some(iataCode => iataCode == segment.arrival?.iataCode)) {
        //                     this.iataCodes.push(segment.arrival?.iataCode);
        //                 }
        //                 if (!this.iataCodes.some(iataCode => iataCode == segment.departure?.iataCode)) {
        //                     this.iataCodes.push(segment.departure?.iataCode);
        //                 }
        //             })
        //         });
        //         const roData = require('../../../../../assets/i18n/ro.json');
        //         this.iataCodes.forEach(iataCode => {
        //             this.iataCodesMap[iataCode] = roData.airports.find(airport => airport.airport_code == iataCode)
        //         });
        //         this.recommendations = [
        //             {
        //                 imageUrl: '../../../../assets/images/others/recommendationHotel.png',
        //                 cardText: {
        //                     title: 'Ai nevoie de cazare in ' + this.getCity(this.selectedOffer.itineraries[0].segments[this.selectedOffer.itineraries[0].segments.length - 1].arrival.iataCode)
        //                         + '?',
        //                     description: 'Exploreaza hoteluri in ' + this.getCity(this.selectedOffer.itineraries[0].segments[this.selectedOffer.itineraries[0].segments.length - 1].arrival.iataCode),
        //                     priceCategory: 'Hoteluri de la',
        //                     price: '125 RON per noapte'
        //                 }
        //             },
        //             {
        //                 imageUrl: '../../../../assets/images/others/recommendationRestaurant.png',
        //                 cardText: {
        //                     title: 'Cauti un restaurant in ' + this.getCity(this.selectedOffer.itineraries[0].segments[this.selectedOffer.itineraries[0].segments.length - 1].arrival.iataCode)
        //                         + '?',
        //                     description: 'Exploreaza restaurante, cafenele si baruri in ' + this.getCity(this.selectedOffer.itineraries[0].segments[this.selectedOffer.itineraries[0].segments.length - 1].arrival.iataCode),
        //                 }
        //             }
        //         ]
        //         this.createPassengersForm();
        //         this.getCountriesFormExternalApi();
        //     }
        // });

        this.responsiveOptions = [
            {
                breakpoint: "550px",
                numVisible: 1,
                numScroll: 2,
              },
              {
                breakpoint: "700px",
                numVisible: 1,
                numScroll: 2,
              },
              {
                breakpoint: "1000px",
                numVisible: 2,
                numScroll: 2,
              },
              {
                breakpoint: "1630px",
                numVisible: 2,
                numScroll: 2,
              },
        ];
        this.visibilityOptions = {
            numVisible: 3,
            numScroll: 2,
          };
        this.passengerOptions = [
            { name: 'Adult', code: 'ADL' },
            { name: 'Adolescent', code: 'ADO' },
            { name: 'Copil', code: 'COP' },
            { name: 'Infant', code: 'INF' },
        ];
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    contactUser;

    selectedOffer: Flight;

    flightOffersWithBags$: Observable<FlightOfferWithBags> = this.selectedFlightStore.flightOffersWithBags$.pipe(
        tap(flightOfferWithBags => {
            this.currentFlightOfferWithBags = {...flightOfferWithBags};
            if (flightOfferWithBags.flightOffer) {
                // this.price1 = Number((Number(flightOfferWithBags.flightOffer.totalPrice) + Number(this.baggagePrice) + Number(flightOfferWithBags.flightOffer.travelersServiceTax)).toFixed(2));
                // this.price2 = Number((Number(flightOfferWithBags.flightOffer.totalPrice) + Number(this.baggagePrice) + Number(flightOfferWithBags.flightOffer.travelersServiceTax)).toFixed(2));
            }
            this.getAllSegments(flightOfferWithBags);
            this.mapOfBaggageAllowanceWithEmptyTravelerIds(flightOfferWithBags);
            this.mapBaggageWithLibrary(flightOfferWithBags);
        }),
        shareReplay(1)
    );

    currentFlightOfferWithBags: FlightOfferWithBags;

    /**
     * Grupam bagajele dupa segmentIds:
     * Map exterior: key - segmentIds, value - un Map de bagaje
     * Map interior: key - nume + quantity, value - bagaj
     * */
    mapOfBaggageAllowance = new Map<string, Map<string, Baggage>>();
    allSegments: string[];

    travelersForm: FormArray<FormGroup> = new FormArray([]);

    currentDay = moment();
    recommendations;

    // for ngx-intl-tel-input
    CountryISO = CountryISO;
    SearchCountryField = SearchCountryField;
    PhoneNumberFormat = PhoneNumberFormat;

    countries: Array<Object> = [];
    subscription: Subscription;
    travelers: number;
    appConstants = AppConstants;



    createPassengersForm() {
        if (!this.selectedOffer.travelerPricings.length) return;

        this.travelersForm = new FormArray([]);
        this.selectedOffer?.travelerPricings.forEach( traveler => {
            const travelerFormGroup = this.fb.group({
                travelerId: [traveler.travelerId],
                travelerType: [traveler.travelerType],
                gender: [null],
                firstName: ['', Validators.required],
                lastName: ['', Validators.required],
                dateOfBirth: [undefined, Validators.required],
                // phone: [undefined, Validators.required],
                // deviceTypeEnum: ['MOBILE', Validators.required],
                // email: [null, Validators.compose([Validators.required, Validators.email])],
                // address: [null],
                postalCode: [null],
                cityName: [null],
                nationality: ['Romania', Validators.required],
                countryCode: [undefined],
                documents: this.fb.array([
                    this.fb.group({
                        documentTypeEnum: ['PASSPORT', Validators.required],
                        documentNumber: [undefined, Validators.required],
                        documentExpiryDate: [undefined, Validators.required],
                        documentIssuanceCountry: ['Romania', Validators.required],
                        documentHolder: [true]
                    })
                ]),
                offer: [0]
            });

            this.travelersForm.push(travelerFormGroup);
        });
    }

    getCountriesFormExternalApi(){
        this.selectedFlightStore.getCountries().subscribe({
            next: (res: Array<Object>) => {
                this.countries = res.map((country: any) => country?.name?.official).sort((a, b) => (a > b ? 1 : -1));
            }
        })
    }

    selectedCountry(index: number, country: any, field: string){
        this.travelersForm.at(index).get(field).patchValue(country?.name.common);
    }

    handleOfferChange(offer) {
        if (this.selectedPackage != offer) this.selectedPackage = offer;
        else this.selectedPackage = null;
        this.selectedFlightStore.setCurrentOfferWithAmenities(offer);
    }

    ifSelectedPreventEvent(selected: boolean, event: MouseEvent) {
        if (selected) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    handleBaggageChange(event: MatLegacySelectionListChange, travelerId: string) {
        const selectionList = event.source;
        const noBaggageOption = event.source.options.get(0);
        const allBaggageOptions = event.source.options.filter((option, index) => index > 0);
        const { selected, value } = event.options[0];

        if (!value) {
            allBaggageOptions.forEach( option => option.selected = false);

            for (const baggageMap of this.mapOfBaggageAllowance.values()) {
                for (const baggage of baggageMap.values()) {
                    if (baggage.travelerIds.includes(travelerId)) {
                        const indexOfTravelerId = baggage.travelerIds.indexOf(travelerId);
                        baggage.travelerIds.splice(indexOfTravelerId, 1);
                    }
                }
            }

        } else {
            const baggagesWithSameSegmentsOptions = allBaggageOptions.filter(option => {
                if (value) {
                    return option.value.segmentIds.toString() === value.segmentIds.toString();
                }
            });
            const baggageWithAllSegmentsSelected = value?.segmentIds.length === this.allSegments.length;

            const keyOfSegmentsMap = value?.segmentIds.toString();
            const keyOfBaggageMap = value?.name + value?.quantity.toString();
            const selectedSegmentsMap = this.mapOfBaggageAllowance.get(keyOfSegmentsMap);
            const selectedBaggage = selectedSegmentsMap.get(keyOfBaggageMap);

            if (selected) {
                noBaggageOption.selected = false;

                // remove travelerId from other baggages from same segments
                for (const baggage of selectedSegmentsMap.values()) {
                    if (baggage.travelerIds.includes(travelerId)) {
                        const indexOfTravelerId = baggage.travelerIds.indexOf(travelerId);
                        baggage.travelerIds.splice(indexOfTravelerId, 1);
                    }
                }

                selectedBaggage.travelerIds.push(travelerId);
                selectedBaggage.travelerIds.sort();

                // toggle other options with same segments
                baggagesWithSameSegmentsOptions.forEach( option => {
                    if (option !== event.options[0]) {
                        option.selected = false;
                    }
                });

                if (baggageWithAllSegmentsSelected) {
                    allBaggageOptions.forEach(option => {
                        if (option.value.segmentIds.toString() !== value.segmentIds.toString()) {
                            option.selected = false;
                        }
                    });

                    // remove travelerId from ALL other baggages
                    for (const baggageMap of this.mapOfBaggageAllowance.values()) {
                        for (const baggage of baggageMap.values()) {
                            if (baggage.travelerIds.includes(travelerId) && baggage.segmentIds.toString() !== this.allSegments.toString()) {
                                const indexOfTravelerId = baggage.travelerIds.indexOf(travelerId);
                                baggage.travelerIds.splice(indexOfTravelerId, 1);
                            }
                        }
                    }
                } else {
                    if (this.mapOfBaggageAllowance.has(this.allSegments.toString())) {
                        for (const baggage of this.mapOfBaggageAllowance.get(this.allSegments.toString()).values()) {
                            if (baggage.travelerIds.includes(travelerId)) {
                                const indexOfTravelerId = baggage.travelerIds.indexOf(travelerId);
                                baggage.travelerIds.splice(indexOfTravelerId, 1);
                            }
                        }

                        allBaggageOptions.forEach(option => {
                            if (option.value.segmentIds.toString() === this.allSegments.toString()) {
                                option.selected = false;
                            }
                        });
                    }
                }


            } else {
                if (!selectionList.selectedOptions.selected.length) {
                    noBaggageOption.selected = true;
                }
                if (selectedBaggage.travelerIds.includes(travelerId)) {
                    const indexOfTravelerId = selectedBaggage.travelerIds.indexOf(travelerId);
                    selectedBaggage.travelerIds.splice(indexOfTravelerId, 1);
                }
            }
        }
    }

    getAllSegments(flightOfferWithBags: FlightOfferWithBags) {
        if (!flightOfferWithBags.flightOffer) return;

        this.allSegments = [];

        for (const itinerary of flightOfferWithBags.flightOffer.itineraries) {
            for (const segment of itinerary.segments) {
                this.allSegments.push(segment.id);
            }
        }
    }

    mapOfBaggageAllowanceWithEmptyTravelerIds(flightOfferWithBags: FlightOfferWithBags) {
        if (!flightOfferWithBags.baggageAllowance) return;

        this.mapOfBaggageAllowance = new Map<string, Map<string, Baggage>>();

        if (flightOfferWithBags.baggageAllowance.length) {
            flightOfferWithBags.baggageAllowance.forEach(baggage => {
                if (this.mapOfBaggageAllowance.has(baggage.segmentIds.toString())) {
                    const internalMap = this.mapOfBaggageAllowance.get(baggage.segmentIds.toString());
                    internalMap.set(
                        baggage.name + baggage.quantity.toString(),
                        {
                            ...baggage,
                            travelerIds: []
                        }

                    );
                } else {
                    this.mapOfBaggageAllowance.set(
                        baggage.segmentIds.toString(),
                        new Map().set(
                            baggage.name + baggage.quantity.toString(),
                            {
                                ...baggage,
                                travelerIds: []
                            }

                        )
                    );
                }
            });
        }
    }

    confirmSelection() {
        if (this.contactUser.valid && this.travelersForm.valid) {
            if (!this.selectedPackage) this.selectedPackage = this.selectedOffer
            const flightOfferToSave: FlightOfferWithBags = {
                flightOffer: {
                    ...this.selectedOffer
                },
                baggageAllowance: this.selectedBaggage ? [this.selectedBaggage] : []
            };


            const contactToSave: Contact = {
                email: this.contactUser.controls.email.value,
                telephone: this.contactUser.controls.telephone.value
            }

            const travelersToSave: Traveler[] = this.travelersForm.value.map(traveler => {
                const travelerToSave: Traveler = {
                    id: traveler.travelerId,
                    dateOfBirth: moment(traveler.dateOfBirth).format('YYYY-MM-DD'),
                    gender: traveler.gender,
                    firstName: traveler.firstName,
                    lastName: traveler.lastName,
                    email: traveler.email,
                    address: traveler.address,
                    postalCode: traveler.postalCode,
                    cityName: traveler.cityName,
                    countryName: traveler.countryName,
                    countryCode: traveler.countryCode,
                    offer: traveler.offer,
                    // phones: [{
                    //     countryCallingCode: (traveler.phone.dialCode as string).substring(1),
                    //     phoneNumber: (traveler.phone.nationalNumber as string).replace(/\s+/g, ''),
                    //     deviceTypeEnum: traveler.deviceTypeEnum
                    // }],
                    nationality: traveler.nationality,
                    phones: [],
                    documents: traveler.documents.map( document => {
                        return {
                            documentTypeEnum: document.documentTypeEnum,
                            documentNumber: document.documentNumber,
                            documentExpiryDate: moment(document.documentExpiryDate).format('YYYY-MM-DD'),
                            documentIssuanceCountry: document.documentIssuanceCountry,
                            documentHolder: true
                        };
                    })
                };

                return travelerToSave;
            });

            this.selectedFlightStore.confirmFlightOfferAndTravelers(flightOfferToSave, travelersToSave, contactToSave,
                {
                    baggage: this.baggageWithInfo,
                    assistance: this.selectedOffer.extraOffer,
                    travelersMap: this.travelerMap
            });

        } else {
            this.contactUser.markAllAsTouched();
            this.travelersForm.markAllAsTouched();

            this.toastService.showToast(
                this.translate.instant("TOAST.ERROR"),
                this.translate.instant("ERROR.REQUIRED-ALL"),
                "error");
                
        }
    }

    getIncludedCheckedBagsQuantity(segmentId: string, travelerPricing): number {
        const segment = travelerPricing.fareDetailsBySegment.find(seg => seg.segmentId === segmentId);
        return segment ? segment.includedCheckedBags.quantity : 0; 
      }

    calculateInterval(start: string, end: string): string {
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

    calculateNightsBetween(start: Date, end: Date): number {
        const startDate = new Date(start);
        const endDate = new Date(end);

        const startMs = startDate.getTime();
        const endMs = endDate.getTime();

        const timeDifferenceMs = endMs - startMs;

        const nights = Math.ceil(timeDifferenceMs / (1000 * 60 * 60 * 24));

        return nights;
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

    getAmenityIcon(amenityType: string) {
        switch (amenityType) {
            case 'BAGGAGE':
                return '../../../../../assets/images/others/planes/luggage.svg'
            case 'MEAL':
                return '../../../../../assets/images/others/planes/fork-and-knife.svg'
            default:
                return '../../../../../assets/images/others/planes/check.svg'
        }
    }

    sortAmenities(amenities) {
        const priority = (type) => {
          if (type == 'BAGGAGE') return 1;
          if (type == 'MEAL') return 2;
          return 3; 
        };
        return amenities.sort((a, b) => priority(a.amenityType) - priority(b.amenityType));
      }

      getOfferTitle(index: number): string {
        if (index < this.offerTitles.length) {
            return this.offerTitles[index];
        } else {
            // Calculăm câte titluri "Imperial-Elite" avem nevoie, adăugând un număr după.
            const imperialEliteCount = Math.floor(index / this.offerTitles.length);
            return `Imperial-Elite ${imperialEliteCount}`;
        }
    }

    calculateDurationFromItinerary(itinerary: any) {
        return this.planeService.calculateDurationFromItinerary(itinerary);
    }

    updateTotalPrice(baggage: Baggage, baggageWithInfo: any, travelerId: string) {
        if (baggage) {
            if (this.selectedBaggageByTraveler[travelerId]) {
                this.price1 -= (Number(this.selectedBaggageByTraveler[travelerId].price.amount) * (this.selectedOffer.oneWay ? 1 : 2));
                this.price2 -= (Number(this.selectedBaggageByTraveler[travelerId].price.amount) * (this.selectedOffer.oneWay ? 1 : 2));
            }

            this.price1 += (Number(baggage.price.amount) * (this.selectedOffer.oneWay ? 1 : 2));
            this.price2 += (Number(baggage.price.amount) * (this.selectedOffer.oneWay ? 1 : 2));
        } else {
            this.price1 -= (Number(this.selectedBaggageByTraveler[travelerId].price.amount) * (this.selectedOffer.oneWay ? 1 : 2));
            this.price2 -= (Number(this.selectedBaggageByTraveler[travelerId].price.amount) * (this.selectedOffer.oneWay ? 1 : 2));
        }
        this.baggageWithInfo[travelerId] = baggageWithInfo;
        this.selectedBaggageByTraveler[travelerId] = baggage;
        this.selectedBaggage = baggage;

    }

    selectOption(number: number, travelerIndex: any) {

        const previousPrice = this.selectedOffer.extraOffer.price;
        if (number == 0) {
            this.offersListOption.selected = true;
            this.offersListOption1.selected = false;
            this.offersListOption2.selected = false;
            this.selectedOffer.extraOffer = {
                type: "Silver",
                class: "bst-grey",
                price: 0
            };
        }
        if (number == 1) {
            this.offersListOption.selected = false;
            this.offersListOption1.selected = true;
            this.offersListOption2.selected = false;
            this.selectedOffer.extraOffer = {
                type: "Gold",
                class: "bst-gold",
                price: 30
            };
        }
        if (number == 2) {
            this.offersListOption.selected = false;
            this.offersListOption1.selected = false;
            this.offersListOption2.selected = true;
            this.selectedOffer.extraOffer = {
                type: "Platinum",
                class: "bst-blue",
                price: 100
            };
        }
        this.price1 = this.price1 - Number(previousPrice * this.travelers) + Number(this.selectedOffer.extraOffer.price * this.travelers);
        this.price2 = this.price2 - Number(previousPrice * this.travelers) + Number(this.selectedOffer.extraOffer.price * this.travelers);
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

    getFlightTime(duration: string) {
        const minutes = +duration?.split('H').pop()?.split('M')[0] || 0;
        const hours = +duration?.split('PT').pop()?.split('H')[0] || 0;

        return `${hours}h ${minutes}min`;
    }

    protected readonly AppConstants = AppConstants;

    private mapBaggageWithLibrary(data: FlightOfferWithBags & { loading: boolean }) {
        if (data.loading) {
            return;
        }
        const travelerMap: {[travelerId: string]: any[] } = {};
        const segmentMap: {[segmentId: string]: BaggageWithInfo[] } = {};

        const carrierMap = {};
        this.baggageWithInfo = {};

        data.flightOffer.itineraries.forEach(itinerary => {
            itinerary.segments.forEach(segment => {

                if (segment.carrierCode) {
                    if (!carrierMap[segment.id]) {
                        carrierMap[segment.id] = [];
                    }
                    carrierMap[segment.id].push(segment.carrierCode);
                }
            });
        });

            data.baggageAllowance[0].travelerIds.forEach(travelerId => {
                if (!travelerMap[travelerId]) {
                    travelerMap[travelerId] = [];
                }
                const baggageLibrary = this.airCompaniesLuggageLibrary[carrierMap[data.baggageAllowance[0].segmentIds[0]]];
                const personalBaggage = new BaggageWithInfo();
                const carryOn = new BaggageWithInfo();

                personalBaggage.weight = 2;
                personalBaggage.length = 30;
                personalBaggage.width = 15;
                personalBaggage.height = 3;
                personalBaggage.name = "bagaj personal";
                personalBaggage.weightUnit = "kg";
                personalBaggage.icon = 'assets/icons/backpack.svg';
                personalBaggage.iconAlt = 'assets/icons/backpack_white.svg';
                personalBaggage.quantity = 1;

                if (baggageLibrary) {
                    carryOn.weight = baggageLibrary.cabin.economy.weight;
                    carryOn.length = baggageLibrary.cabin.economy.length;
                    carryOn.width = baggageLibrary.cabin.economy.width;
                    carryOn.height = baggageLibrary.cabin.economy.height;
                    carryOn.name = "bagaj cabina";
                    carryOn.weightUnit = baggageLibrary.cabin.economy.weightUnit;
                    carryOn.icon = 'assets/icons/travel_bag.svg';
                    carryOn.iconAlt = 'assets/icons/travel_bag_white.svg';
                    carryOn.quantity = 1;
                    travelerMap[travelerId].push({
                        personal: personalBaggage,
                        carryOn: carryOn,
                        price: 0,
                        altName: "Inclus in pret"
                    })
                } else {
                    travelerMap[travelerId].push({
                        personal: personalBaggage,
                        price: 0,
                        altName: "Inclus in pret"
                    });
                }

                data.baggageAllowance.forEach(ba => {
                    const checkIn = new BaggageWithInfo();
                    checkIn.weight = baggageLibrary.checked.economy.weight;
                    if (baggageLibrary.checked.economy.upTo) {
                        checkIn.dimensionsAlt = "Pana la " + baggageLibrary.checked.economy.upToValue + " cm";
                    } else {
                        checkIn.length = baggageLibrary.checked.economy.length;
                        checkIn.width = baggageLibrary.checked.economy.width;
                        checkIn.height = baggageLibrary.checked.economy.height;
                    }

                    checkIn.name = "bagaj check-in";
                    checkIn.weightUnit = baggageLibrary.checked.economy.weightUnit;
                    checkIn.quantity = data.baggageAllowance.indexOf(ba) + 1;
                    checkIn.icon = 'assets/icons/luggage.svg';
                    checkIn.iconAlt = 'assets/icons/luggage_white.svg';

                    travelerMap[travelerId].push({
                        personal: personalBaggage,
                        carryOn: carryOn,
                        checkIn: checkIn,
                        price: ba.price
                    });
                });
                this.baggageWithInfo[travelerId] = {
                    personal: personalBaggage,
                    carryOn: carryOn
                };
            });
        Object.keys(travelerMap).forEach(key => {
            const travelerPricing = this.selectedOffer.travelerPricings.find(tp => tp.travelerId === key);
            travelerMap[key][0].travelerPrice = travelerPricing.price;
        });
        this.travelerMap = travelerMap;
    }

    getDescription(index: number, travelerId: string, type: string) {
        const baggage = this.travelerMap[travelerId][index][type];
        return baggage.quantity + " " + baggage.name + " (" + baggage.weight + " " + baggage.weightUnit + ")";
    }
    getDimensions(index: number, travelerId: string, type: string) {
        const baggage = this.travelerMap[travelerId][index][type];
        return baggage.dimensionsAlt ? baggage.dimensionsAlt : baggage.length + " x " + baggage.width + " x " + baggage.height + " cm";
    }
    getImage(selected: boolean, index: number, travelerId: string, type: string) {
        const baggage = this.travelerMap[travelerId][index][type];
        return selected ? baggage.iconAlt : baggage.icon;
    }

    getBaggageDescription(travelerId: string, type: string) {
        const baggage = this.baggageWithInfo[travelerId][type];
        const index = type === 'personal' ? 0 : type === 'carryOn' ? 1 : 2;
        return baggage.quantity + "x " + baggage.name + "(" + baggage.weight + baggage.weightUnit + ") " +
            (type === "checkIn" ? this.travelerMap[travelerId][index].price.amount + " " + this.travelerMap[travelerId][index].price.currencyCode : "inclus")
    }

    calculateDuration(duration: string): string {
        const time = duration.split("PT")[1];

        const hours = time.split("H")[0];
        const minutesWithM = time.split("H")[1];
        const minutes = minutesWithM ? minutesWithM.split("M")[0] : "00";

        return `${hours}h ${minutes}min`;
    }
}
