import {Component, OnDestroy, OnInit} from '@angular/core';
import {BookingTypeItemsService, FilterFormValues} from "../booking-type-items.service";
import {firstValueFrom, Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {Ticket} from "../../../../../shared/_models/ticket.model";
import {DatePipe} from "@angular/common";
import {Resource} from "../../../../../shared/_models/resource.model";
import {ResourceFilterService} from "../../../../../shared/_services/resource-filter.service";
import {ItinerariesStore} from "../../../../client-trips-itineraries/_services/itineraries.store";
import {
    ActivityResourcesRecommendedGroup,
    ActivityResourcesTicket
} from "../../../../../shared/_models/itinerary.model";

@Component({
    selector: 'app-tickets-list',
    templateUrl: './tickets-list.component.html',
    styleUrls: ['./tickets-list.component.scss'],
    providers: [DatePipe]
})
export class TicketsListComponent implements OnInit, OnDestroy {

    availableTickets: Ticket[] = null;
    selectedTickets = new Map<Ticket, number>();
    selectedTicketsPrice = 0;
    selectedTicketsLength = 0;

    formValues: FilterFormValues = null;

    isItineraryModal = false;
    activitiesType: 'dayActivityResourcesRecommended' | 'eveningActivityResourcesRecommended' = null;
    activitiesData: ActivityResourcesRecommendedGroup = null;
    ticketSelection: ActivityResourcesTicket[] = [];
    resourceFromItinerary: Resource = null;
    ticketDictionary: {[key: string]: number} = null;
    selectedDay: string = null

    private ngUnsubscribe = new Subject<void>();

    constructor(private bookingItemsService: BookingTypeItemsService,
                private resourceFilterService: ResourceFilterService,
                private itinerariesStore: ItinerariesStore,
                private datePipe: DatePipe) {
    }

    ngOnInit(): void {
        this.checkIfItineraryModal();
        this.listenToFormValues();
    }

    checkIfItineraryModal() {
        this.isItineraryModal = this.resourceFilterService.checkIfItineraryModal();
        this.activitiesType = this.itinerariesStore.getActivitiesType() === 'day' ? 'dayActivityResourcesRecommended' : 'eveningActivityResourcesRecommended';

        if (this.isItineraryModal) {
            firstValueFrom(this.itinerariesStore.destinationIndex$).then(index => {
                firstValueFrom(this.itinerariesStore.dayState$).then(date => {
                    this.selectedDay = date;
                    this.resourceFromItinerary = this.resourceFilterService.getResourceFromItinerary();

                    if (this.itinerariesStore.getTemporaryData().resources[index]?.[this.activitiesType]) {
                        this.activitiesData = this.itinerariesStore.getTemporaryData().resources[index]?.[this.activitiesType].find( resource => resource.resourceId === this.resourceFromItinerary.id);
                    }
                });
            });
        }
    }

    checkIfTicketsSelected() {
        if (this.activitiesData && this.resourceFromItinerary) {
            if (this.activitiesData?.items?.length > 0) {
                const ticketsForSelectedDay = this.activitiesData.items.find( item => item.date === this.selectedDay);

                if (!ticketsForSelectedDay?.items || ticketsForSelectedDay?.items?.length === 0) return;

                ticketsForSelectedDay.items.forEach( ticket => {
                    /*this.selectedTicketsPrice += ticket.price * ticket.quantity;
                    this.selectedTicketsLength += ticket.quantity;*/

                    this.ticketDictionary = {
                        ...this.ticketDictionary,
                        [ticket.itemId]: ticket.quantity
                    }
                });

                console.log('TICKET DICTIONARY', this.ticketDictionary);

                this.ticketSelection = [];
                if (this.availableTickets?.length > 0 && this.ticketDictionary) {
                    this.availableTickets.forEach( ticket => {
                        if (this.ticketDictionary?.[ticket.id]) {
                            /*this.ticketSelection.push({
                                itemId: ticket.id,
                                itemName: ticket.name,
                                changePolicies: ticket.changePolicies,
                                // TODO: ce trebuie luat din ticket si pus aici?
                                seatNumber: '',
                                price: ticket.price,
                                quantity: this.ticketDictionary[ticket.id]
                            });*/

                            for (let i = 0; i < this.ticketDictionary[ticket.id]; i++) {
                                this.increaseNrTickets(ticket);
                            }
                        }
                    });
                }
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

                    if (this.formValues?.dateAsDay) {
                        this.getAvailableTickets(this.datePipe.transform(this.formValues.dateAsDay.toDate(), 'YYYY-MM-dd'));
                    } else {
                        this.getAvailableTickets(this.datePipe.transform(new Date(), 'YYYY-MM-dd'));
                    }


                }
            });
    }

    getAvailableTickets(date: string) {
        this.optionsTodayPayment = 0;
        this.selectedTicketsPrice = 0;
        this.bookingItemsService.getAvailableResourceTickets(date)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    this.availableTickets = [...res];
                    console.log('bilete disponibile: ', this.availableTickets);
                    if (this.availableTickets?.length > 0) {
                        this.availableTickets.forEach(ticket => {
                            this.selectedTickets.set(ticket, 0);
                        });
                        this.checkIfTicketsSelected();
                    }
                }
            });
    }

    decreaseNrTickets(ticket: Ticket): void {
        const ticketQuantity = this.selectedTickets.get(ticket);
        if (ticketQuantity === 0) {
            return;
        }
        this.selectedTickets.set(ticket, ticketQuantity - 1);
        this.selectedTicketsLength--;
        this.selectedTicketsPrice -= ticket.price;

        if (ticket.bookingPolicies) {
            if(ticket.bookingPolicies?.advanceFullPayment) {
                const price = ticket.price;
                this.optionsTodayPayment =this.optionsTodayPayment - price;
            } else if (ticket.bookingPolicies?.advancePartialPaymentPercentage !== 0) {
                const price = (ticket.price * ticket.bookingPolicies?.advancePartialPaymentPercentage / 100);
                this.optionsTodayPayment = this.optionsTodayPayment - price;
            } else if (ticket.bookingPolicies?.depositRequiredAmount !== 0) {
                const price = (ticket.bookingPolicies?.depositRequiredAmount);
                this.optionsTodayPayment = this.optionsTodayPayment - price;
            } else if (ticket.bookingPolicies?.depositRequiredPercentage !== 0) {
                const price = (ticket.price * ticket.bookingPolicies?.depositRequiredPercentage / 100);
                this.optionsTodayPayment = this.optionsTodayPayment - price;
            }
        }

        this.bookingItemsService.decreaseTicketQuantity(ticket);

        if (this.isItineraryModal) {
            if (this.ticketSelection?.length > 0) {
                for (let i = 0; i < this.ticketSelection.length; i++) {
                    if (this.ticketSelection[i].itemId === ticket.id) {
                        if (this.ticketSelection[i].quantity === 1) {
                            this.ticketSelection.splice(i, 1);
                        } else {
                            this.ticketSelection[i] = {
                                ...this.ticketSelection[i],
                                quantity: this.ticketSelection[i].quantity - 1
                            }
                        }
                    }
                }
            }
        }
        console.log(this.ticketSelection);
    }

    optionsTodayPayment = 0;

    increaseNrTickets(ticket: Ticket): void {

        console.log('bilet',ticket);

        const ticketQuantity = this.selectedTickets.get(ticket);
        if (ticket.limit && ticketQuantity === ticket.ticketsLimit) {
            return;
        }
        this.selectedTickets.set(ticket, ticketQuantity + 1);
        this.selectedTicketsLength++;
        this.selectedTicketsPrice += ticket.price;

        if (ticket.bookingPolicies) {
            if(ticket.bookingPolicies?.advanceFullPayment) {
                const price = ticket.price;
                this.optionsTodayPayment =this.optionsTodayPayment + price;
            } else if (ticket.bookingPolicies?.advancePartialPaymentPercentage !== 0) {
                const price = (ticket.price * ticket.bookingPolicies?.advancePartialPaymentPercentage / 100);
                this.optionsTodayPayment = this.optionsTodayPayment + price;
            } else if (ticket.bookingPolicies?.depositRequiredAmount !== 0) {
                const price = (ticket.bookingPolicies?.depositRequiredAmount);
                this.optionsTodayPayment = this.optionsTodayPayment + price;
            } else if (ticket.bookingPolicies?.depositRequiredPercentage !== 0) {
                const price = (ticket.price * ticket.bookingPolicies?.depositRequiredPercentage / 100);
                this.optionsTodayPayment = this.optionsTodayPayment + price;
            }
        }

        this.bookingItemsService.increaseTicketQuantity(ticket);

        if (this.isItineraryModal) {
            if (this.ticketSelection.length === 0) {
                this.ticketSelection.push({
                    itemId: ticket.id,
                    itemName: ticket.name,
                    changePolicies: ticket.changePolicies,
                    bookingPolicies: ticket.bookingPolicies,
                    seatNumber: '',
                    price: ticket.price,
                    quantity: 1
                });
            } else {
                for (let i = 0; i < this.ticketSelection.length; i++) {
                    if (this.ticketSelection[i].itemId === ticket.id) {
                        this.ticketSelection[i] = {
                            ...this.ticketSelection[i],
                            quantity: this.ticketSelection[i].quantity + 1
                        }
                        console.log(this.ticketSelection);
                        return;
                    }
                }

                this.ticketSelection.push({
                    itemId: ticket.id,
                    itemName: ticket.name,
                    changePolicies: ticket.changePolicies,
                    bookingPolicies: ticket.bookingPolicies,
                    seatNumber: '',
                    price: ticket.price,
                    quantity: 1
                });
            }
        }
        console.log(this.ticketSelection);
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
