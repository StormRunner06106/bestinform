import {Component, OnDestroy, OnInit, Optional} from '@angular/core';
import {BookingTypeItemsService, FilterFormValues} from "../booking-type-items.service";
import {firstValueFrom, Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {Room} from "../../../../../shared/_models/room.model";
import {DatePipe} from "@angular/common";
import {RoomEvent} from "../../../../../standalone-components/room-card/room-card.component";
import {ActivatedRoute, Router} from "@angular/router";
import {ResourceFilterService} from "../../../../../shared/_services/resource-filter.service";
import {ItinerariesStore} from "../../../../client-trips-itineraries/_services/itineraries.store";
import {AccommodationResourceRecommended, Itinerary} from "../../../../../shared/_models/itinerary.model";
import {Resource} from "../../../../../shared/_models/resource.model";
import {MatDialogRef} from "@angular/material/dialog";
import {ViewSimpleResourceComponent} from "../../view-simple-resource.component";

@Component({
    selector: 'app-rooms-list',
    templateUrl: './rooms-list.component.html',
    styleUrls: ['./rooms-list.component.scss'],
    providers: [DatePipe]
})
export class RoomsListComponent implements OnInit, OnDestroy {

    formValues: FilterFormValues = null;

    recommendedRooms: Room[] = null;
    recommendedRoomsPrice = 0;
    availableRooms: Room[] = null;
    availableRoomsTotalPrice = 0;
    totalNights: number = null;

    recommendedRoomsNr = 0;
    nrOfPeopleForRecommendedRooms = 0;

    selectedRoomsNr = 0;
    nrOfPeopleForSelectedRooms = 0;

    isItineraryModal = false;
    accommodationData: AccommodationResourceRecommended = null;
    roomSelection: AccommodationResourceRecommended["items"] = [];
    resourceFromItinerary: Resource = null;
    roomDictionary: {[key: string]: number} = null;

    private ngUnsubscribe = new Subject<void>();

    constructor(private bookingItemsService: BookingTypeItemsService,
                private resourceFilterService: ResourceFilterService,
                private datePipe: DatePipe,
                private router: Router,
                private route: ActivatedRoute,
                private itinerariesStore: ItinerariesStore) {
    }

    ngOnInit(): void {
        this.checkIfItineraryModal();
        this.listenToFormValues();
    }

    checkIfItineraryModal() {
        this.isItineraryModal = this.resourceFilterService.checkIfItineraryModal();

        if (this.isItineraryModal) {
            firstValueFrom(this.itinerariesStore.destinationIndex$).then(index => {
                this.accommodationData = this.itinerariesStore.getTemporaryData().resources[index]?.accommodationResourceRecommended;
                this.resourceFromItinerary = this.resourceFilterService.getResourceFromItinerary();
            });
        }
    }

    checkIfRoomsSelected() {
        if (this.accommodationData && this.resourceFromItinerary) {
            if (this.accommodationData.resourceId !== this.resourceFromItinerary.id) {
                return;
            } else {
                this.accommodationData.items.forEach(room => {
                    /*this.availableRoomsTotalPrice += room.pricePerItem * room.quantity;
                    this.selectedRoomsNr += room.quantity;*/
                    this.availableRooms.forEach( availableRoom => {
                        if (availableRoom.id === room.itemId) {
                            // this.nrOfPeopleForSelectedRooms += availableRoom.maximumAdultPeople;
                            this.handleNewRoomNr({
                                room: availableRoom,
                                number: availableRoom.totalPrice
                            });
                        }
                    })

                    this.roomDictionary = {
                        ...this.roomDictionary,
                        [room.itemId]: room.quantity
                    }
                });

                this.roomSelection = [];
                if (this.availableRooms?.length > 0 && this.roomDictionary) {
                    this.availableRooms.forEach( room => {
                        if (this.roomDictionary?.[room.id]) {
                            this.roomSelection.push({
                                bedType: room.bedType,
                                changePolicies: room.changePolicies,
                                bookingPolicies: room.bookingPolicies,
                                itemId: room.id,
                                itemName: room.name,
                                pricePerItem: room.totalPrice,
                                quantity: this.roomDictionary[room.id]
                            });
                        }
                    });
                }
                console.log(this.roomDictionary);
            }
        }
    }

    listenToFormValues() {

        this.bookingItemsService.getFormValues()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    if (!res) {
                        return;
                    }

                    this.formValues = res;

                    console.log('test form');
                    console.log(res);
                    this.optionsTodayPayment = 0;
                    this.recTodayPayment = 0;

                    if (this.formValues?.startDate && this.formValues?.endDate) {
                        if (this.formValues?.adultsNumber >= 1 && this.formValues?.roomsNumber >= 1 && !this.isItineraryModal) {
                            this.getOurRecommendationRooms();
                        }
                        this.getAvailableRooms();
                        // for recommended rooms
                        this.recommendedRoomsPrice = 0;
                        this.recommendedRoomsNr = 0;
                        this.nrOfPeopleForRecommendedRooms = 0;

                        // for all available rooms
                        this.availableRoomsTotalPrice = 0;
                        this.selectedRoomsNr = 0;
                        this.nrOfPeopleForSelectedRooms = 0;

                    } else {
                        this.getAllRooms();
                    }
                }
            });
    }

    recTodayPayment = 0;

    getOurRecommendationRooms() {

        this.recTodayPayment = 0;

        if (!this.formValues.startDate || !this.formValues.endDate) {
            return;
        }

        if (this.formValues.adultsNumber === 0 || this.formValues.roomsNumber === 0) {
            return;
        }

        this.bookingItemsService.getOurRecommendationRooms(
            {
                roomNumber: this.formValues.roomsNumber,
                adults: this.formValues.adultsNumber,
                children: this.formValues.childrenNumber,
                startTime: this.datePipe.transform(this.formValues.startDate.toDate(), 'YYYY-MM-dd'),
                endTime: this.datePipe.transform(this.formValues.endDate.toDate(), 'YYYY-MM-dd'),
            })
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe( res => {
                this.recommendedRooms = res?.items.slice();
                console.log('REC ROOMS', this.recommendedRooms);
                this.recommendedRoomsPrice = res?.totalPrice;

                if (this.recommendedRooms?.length > 0) {
                    this.recommendedRooms.forEach( room => {
                        this.recommendedRoomsNr += room?.itemsForBooking?.length;
                        this.nrOfPeopleForRecommendedRooms += room?.maximumAdultPeople * room?.itemsForBooking?.length;
                        if (room.bookingPolicies) {
                            if(room.bookingPolicies?.advanceFullPayment) {
                                const price = room.itemsForBooking.length * room.totalPrice;
                                this.recTodayPayment+=this.recTodayPayment + price;
                            } else if (room.bookingPolicies?.advancePartialPaymentPercentage !== 0) {
                                const price = room.itemsForBooking.length * (room.totalPrice * room.bookingPolicies?.advancePartialPaymentPercentage / 100);
                                this.recTodayPayment = this.recTodayPayment + price;
                            } else if (room.bookingPolicies?.depositRequiredAmount !== 0) {
                                const price = room.itemsForBooking.length * (room.bookingPolicies?.depositRequiredAmount);
                                this.recTodayPayment = this.recTodayPayment + price;
                            } else if (room.bookingPolicies?.depositRequiredPercentage !== 0) {
                                const price = room.itemsForBooking.length * (room.totalPrice * room.bookingPolicies?.depositRequiredPercentage / 100);
                                this.recTodayPayment = this.recTodayPayment + price;
                            }
                        }

                    });
                }
            });
    }

    getAvailableRooms() {
        if (!this.formValues.startDate || !this.formValues.endDate) {
            return;
        }

        this.bookingItemsService.getAvailableRooms(
            this.datePipe.transform(this.formValues.startDate.toDate(), 'YYYY-MM-dd'),
            this.datePipe.transform(this.formValues.endDate.toDate(), 'YYYY-MM-dd'))
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(res => {
                this.availableRooms = res?.items.slice();
                this.totalNights = res?.totalNights;
                if (this.availableRooms?.length > 0) {
                    this.checkIfRoomsSelected();
                }
            });
    }

     getAllRooms() {
        this.bookingItemsService.getRoomListByResourceId()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe( res =>
            {
                this.availableRooms = [...res]
            });
    }

    optionsTodayPayment = 0;

    handleNewRoomNr(event: RoomEvent) {
        console.log('new room', event);
        this.availableRoomsTotalPrice += event.number;
        if (event.number > 0) {

            if (event.room.bookingPolicies) {
                if(event.room.bookingPolicies?.advanceFullPayment) {
                    const price = event.room.totalPrice;
                    this.optionsTodayPayment =this.optionsTodayPayment + price;
                } else if (event.room.bookingPolicies?.advancePartialPaymentPercentage !== 0) {
                    const price = (event.room.totalPrice * event.room.bookingPolicies?.advancePartialPaymentPercentage / 100);
                    this.optionsTodayPayment = this.optionsTodayPayment + price;
                } else if (event.room.bookingPolicies?.depositRequiredAmount !== 0) {
                    const price = (event.room.bookingPolicies?.depositRequiredAmount);
                    this.optionsTodayPayment = this.optionsTodayPayment + price;
                    console.log('am intrat la depoz');
                } else if (event.room.bookingPolicies?.depositRequiredPercentage !== 0) {
                    const price = (event.room.totalPrice * event.room.bookingPolicies?.depositRequiredPercentage / 100);
                    this.optionsTodayPayment = this.optionsTodayPayment + price;
                }
            }

            this.selectedRoomsNr++;
            this.nrOfPeopleForSelectedRooms += event.room?.maximumAdultPeople;
            this.bookingItemsService.increaseRoomQuantity(event.room);
            if (this.isItineraryModal) {
                if (this.roomSelection.length === 0) {
                    this.roomSelection.push({
                        bedType: event.room.bedType,
                        changePolicies: event.room.changePolicies,
                        bookingPolicies: event.room.bookingPolicies,
                        itemId: event.room.id,
                        itemName: event.room.name,
                        pricePerItem: event.room.totalPrice,
                        quantity: 1
                    });
                } else {
                    for (let i = 0; i < this.roomSelection.length; i++) {
                        if (this.roomSelection[i].itemId === event.room.id) {
                            this.roomSelection[i] = {
                                ...this.roomSelection[i],
                                quantity: this.roomSelection[i].quantity + 1
                            };
                            return;
                        }
                    }
                    this.roomSelection.push({
                        bedType: event.room.bedType,
                        changePolicies: event.room.changePolicies,
                        bookingPolicies: event.room.bookingPolicies,
                        itemId: event.room.id,
                        itemName: event.room.name,
                        pricePerItem: event.room.totalPrice,
                        quantity: 1
                    });
                }
            }
        }
        if (event.number < 0) {
            this.selectedRoomsNr--;
            this.nrOfPeopleForSelectedRooms -= event.room?.maximumAdultPeople;


            if (event.room.bookingPolicies) {
                if(event.room.bookingPolicies?.advanceFullPayment) {
                    const price = event.room.totalPrice;
                    this.optionsTodayPayment = this.optionsTodayPayment - price;
                } else if (event.room.bookingPolicies?.advancePartialPaymentPercentage !== 0) {
                    const price = (event.room.totalPrice * event.room.bookingPolicies?.advancePartialPaymentPercentage / 100);
                    this.optionsTodayPayment = this.optionsTodayPayment - price;
                } else if (event.room.bookingPolicies?.depositRequiredAmount !== 0) {
                    const price = (event.room.bookingPolicies?.depositRequiredAmount);
                    this.optionsTodayPayment = this.optionsTodayPayment - price;
                } else if (event.room.bookingPolicies?.depositRequiredPercentage !== 0) {
                    const price = (event.room.totalPrice * event.room.bookingPolicies?.depositRequiredPercentage / 100);
                    this.optionsTodayPayment = this.optionsTodayPayment - price;
                }
            }



            this.bookingItemsService.decreaseRoomQuantity(event.room);
            if (this.isItineraryModal) {
                if (this.roomSelection?.length > 0) {
                    for (let i = 0; i < this.roomSelection.length; i++) {
                        if (this.roomSelection[i].itemId === event.room.id) {
                            if (this.roomSelection[i].quantity === 1) {
                                this.roomSelection.splice(i, 1);
                            } else {
                                this.roomSelection[i] = {
                                  ...this.roomSelection[i],
                                  quantity: this.roomSelection[i].quantity - 1
                                };
                            }
                        }
                    }
                }
            }
        }
    }

    reserveRecommendedRooms(): void {
        if (this.recommendedRooms) {
            this.bookingItemsService.resetRoomState();
            this.recommendedRooms.forEach(room => {
                const nrOfRooms = room?.itemsForBooking?.length;
                if (nrOfRooms > 0) {
                    this.bookingItemsService.setRoomQuantity(room, nrOfRooms);
                }
            });
            void this.router.navigate(['checkout'], {relativeTo: this.route});
        }
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
