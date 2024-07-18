import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {MatLegacyDialog as MatDialog} from '@angular/material/legacy-dialog';
import {
    AccommodationItem,
    AccommodationResourceRecommended,
    ActivityResource,
    ActivityResourceGroup, ActivityResourcesTicket,
    Itinerary
} from "../../../../../shared/_models/itinerary.model";
import {
    DayMoment,
    ItinerariesStore,
    ItineraryExtraInfo,
    ResourceTypeDictionary
} from "../../../_services/itineraries.store";
import {Subject} from "rxjs";
import {ResourceFilterService} from "../../../../../shared/_services/resource-filter.service";
import {Resource} from "../../../../../shared/_models/resource.model";
import moment from "moment";
import {map, takeUntil} from "rxjs/operators";
import {
    ViewSimpleResourceComponent
} from "../../../../domain-listing/view-simple-resource/view-simple-resource.component";

@Component({
    selector: 'app-activities',
    templateUrl: './activities.component.html',
    styleUrls: ['./activities.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ActivitiesComponent implements OnInit, OnDestroy {
    @Input() dayActivities: boolean; // if true, we use day activities, else evening activities

    // common data for steps
    @Output() itineraryChanged = new EventEmitter<Itinerary>();
    newItinerary: Itinerary = null;
    temporaryModalItinerary: Itinerary = null;
    itineraryExtraInfo: ItineraryExtraInfo = null;
    destinationIndex: number;

    // eat and drinks specific data
    activeaMealId = 'Breakfast';
    activitiesResources: Array<ActivityResource<Resource>> = [];
    dayState: string;
    activityType: 'dayActivityResource' | 'eveningActivityResource';
    activityTypeRecommended: 'dayActivityResourcesRecommended' | 'eveningActivityResourcesRecommended';

    // indexul acestui array reprezinta locatia, iar obiectul reprezinta perioada in care sta cazat in locatia respectiva
    dateLimitsByDestination: Array<{
        startDate: string;
        endDate: string;
    }> = [];
    // array de date-uri
    days: string[] = [];
    daysDictionary: {[key: string]: number} = {};

    // key - reprezinta data; value: daca exista resurse in ziua respectiva pt modal
    resourcesExistByDay: {[key: string]: boolean} = {};

    selectedResources: Array<
        {
            // data - id resursa
            [key: string]: string;
        }
    > = [];
    temporarySelectedResources: Array<
        {
            // data - id resursa
            [key: string]: string;
        }
    > = [];

    // key - resource type id; value - resource type name
    resourceTypeDictionary: ResourceTypeDictionary = null;

    private ngUnsubscribe = new Subject<void>();

    constructor(private modalService: MatDialog,
                private itinerariesStore: ItinerariesStore,
                private resourceFilterService: ResourceFilterService) {
    }

    ngOnInit(): void {
        if (this.dayActivities) {
            this.activityType = "dayActivityResource";
            this.activityTypeRecommended = "dayActivityResourcesRecommended";
        } else {
            this.activityType = "eveningActivityResource";
            this.activityTypeRecommended = "eveningActivityResourcesRecommended";
        }

        this.getItineraryData();
        this.getResourceTypeDictionary();
    }

    getItineraryData() {
        this.newItinerary = this.itinerariesStore.getRecommendedItinerary();
        this.temporaryModalItinerary = structuredClone(this.newItinerary);
        this.itineraryExtraInfo = this.itinerariesStore.getItineraryExtraInfo();
        this.createSelectedResources();

        this.newItinerary.resources.forEach( location => {
            this.dateLimitsByDestination.push({
                startDate: location.startDate,
                endDate: location.endDate
            });

            const resourcesByDateGroups = location?.[this.activityType];
            if (resourcesByDateGroups?.length > 0) {
                resourcesByDateGroups.forEach( resourcesByDate => {

                    this.resourcesExistByDay = {
                        ...this.resourcesExistByDay,
                        [resourcesByDate.date]: false
                    };

                    const resourcesGroups = resourcesByDate.resources;

                    if (resourcesGroups.length > 0) {
                        for (const group of resourcesGroups) {
                            if (group?.resources?.length > 0) {
                                this.resourcesExistByDay = {
                                    ...this.resourcesExistByDay,
                                    [resourcesByDate.date]: true
                                };
                                break;
                            }
                        }
                    }

                });
            }
        });

        this.dateLimitsByDestination.forEach( dateLimit => {
            const startDate = moment(dateLimit.startDate);
            const endDate = moment(dateLimit.endDate);
            const diffInDays = endDate.diff(startDate, 'days');

            if (diffInDays === 1) {
                this.days.push(startDate.format('YYYY-MM-DD'));
            } else if (diffInDays > 1) {
                for (let i = 0; i < diffInDays; i++) {
                    const newDay = startDate.clone().add(i, 'days').format('YYYY-MM-DD');
                    this.days.push(newDay);
                }
            }
        });

        this.days.forEach( (day, index) => {
            this.daysDictionary = {
                ...this.daysDictionary,
                [day]: index
            }
        })

        console.log('date limits by destination', this.dateLimitsByDestination);
        console.log('days', this.days);
        console.log('days dictionary', this.daysDictionary);
        console.log('resources exist by day', this.resourcesExistByDay);

        this.itinerariesStore.destinationIndex$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(newIndex => this.destinationIndex = newIndex);

        this.itinerariesStore.dayState$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(newDay => this.dayState = newDay);
    }

    getResourceTypeDictionary() {
        this.itinerariesStore.getResourceTypeDictionary()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    this.resourceTypeDictionary = res[0];
                }
            });
    }

    createSelectedResources() {
        this.newItinerary.resources.forEach( (location, locationIndex) => {
            // create the selected resources array
            if (location?.[this.activityTypeRecommended]?.length > 0) {
                location[this.activityTypeRecommended].forEach( group => {
                    if (group?.items?.length > 0) {
                        group.items.forEach( dateGroup => {
                            this.selectedResources[locationIndex] = {
                                ...this.selectedResources[locationIndex],
                                [dateGroup.date] : group.resourceId

                            }
                        });
                    }
                });
            }
        });

        this.temporarySelectedResources = structuredClone(this.selectedResources);
        console.log('RESOURCES BY DATE', this.selectedResources);
    }

    setDayState(day: string) {
        if (this.dateLimitsByDestination.length === 1) {
            this.itinerariesStore.setDayState(day);
            return;
        }

        for (let i = 0; i < this.dateLimitsByDestination.length; i++) {
            const startDate = moment(this.dateLimitsByDestination[i].startDate);
            const endDate = moment(this.dateLimitsByDestination[i].endDate);
            const currentDay = moment(day);

            if (currentDay.isBetween(startDate, endDate, undefined, '[)')) {
                this.itinerariesStore.setDestinationIndex(i);
                this.itinerariesStore.setDayState(currentDay.format('YYYY-MM-DD'));
                break;
            }
        }
    }

    openModal(templateRef) {
        this.temporaryModalItinerary = structuredClone(this.newItinerary);
        this.createSelectedResources();
        this.getResourcesForModal();

        const resourcesModal = this.modalService.open(templateRef, {panelClass: 'custom-modal'});
        resourcesModal.afterClosed()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(newItineraryData => {
                if (newItineraryData) {
                    this.itineraryChanged.emit(newItineraryData);
                    this.newItinerary = structuredClone(this.temporaryModalItinerary);
                    this.selectedResources = structuredClone(this.temporarySelectedResources);
                    console.log(this.newItinerary);
                    console.log(this.selectedResources);
                }
            });
    }

    getResourcesForModal() {
        if (this.activitiesResources?.[this.destinationIndex]?.length > 0) return;

        this.newItinerary.resources[this.destinationIndex]?.[this.activityType].forEach( (group, groupIndex) => {
            if (group.resources?.length > 0) {
                group.resources.forEach( (resourceGroup, resourceGroupIndex) => {
                    if (resourceGroup.resources?.length > 0) {
                        this.itinerariesStore.getResourcesByIds(resourceGroup.resources)
                            .pipe(
                                map( resources => {
                                    const modifiedObj: ActivityResourceGroup<Resource> = {
                                        resourceTypeId: resourceGroup.resourceTypeId,
                                        resourceTypeName: resourceGroup.resourceTypeName,
                                        resources: resources
                                    }
                                    return modifiedObj;
                                }),
                                takeUntil(this.ngUnsubscribe)
                            )
                            .subscribe({
                                next: (res: ActivityResourceGroup<Resource>) => {
                                    console.log(res);
                                    if (!this.activitiesResources[this.destinationIndex]) this.activitiesResources[this.destinationIndex] = [];

                                    if (!this.activitiesResources[this.destinationIndex][groupIndex]) {
                                        this.activitiesResources[this.destinationIndex][groupIndex] = {
                                            date: group.date,
                                            resources: []
                                        }
                                    }

                                    this.activitiesResources[this.destinationIndex][groupIndex].resources = [
                                        ...this.activitiesResources[this.destinationIndex][groupIndex].resources,
                                        res
                                    ]

                                    console.log(this.activitiesResources);
                                }
                            });
                    }
                });
            }
        });
    }

    openResourceModal(resource: Resource, date: string) {
        console.log('resursa la trimitere', resource);
        this.resourceFilterService.initServiceStates();
        this.itinerariesStore.setActivitiesType(this.dayActivities ? 'day' : 'evening');
        this.itinerariesStore.setTemporaryData(this.temporaryModalItinerary);
        this.resourceFilterService.setResourceFromItinerary(resource);
        this.resourceFilterService.updateSavedFilters({
            dateAsDay: moment(date),
            dateAsHour: null,
            startDate: this.itineraryExtraInfo.itineraryType === 'road-trip' ? this.itineraryExtraInfo.destinations[this.destinationIndex].startDate : this.itineraryExtraInfo.startDate,
            endDate: this.itineraryExtraInfo.itineraryType === 'road-trip' ? this.itineraryExtraInfo.destinations[this.destinationIndex].endDate : this.itineraryExtraInfo.endDate,
            startHour: null,
            endHour: null,
            adultsNumber: this.itineraryExtraInfo.adultsNumber,
            childrenNumber: this.itineraryExtraInfo.childrenNumber,
            roomsNumber: null
        });
        const resourceModal = this.modalService.open(ViewSimpleResourceComponent, {width: '90%', autoFocus: false, maxHeight: '90vh'});
        resourceModal.afterClosed()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe( (ticketSelection: ActivityResourcesTicket[]) => {
                console.log('TICKET SELECTION', ticketSelection);
                console.log('before', structuredClone(this.temporaryModalItinerary));
                console.log('before', structuredClone(this.selectedResources));

                if (!ticketSelection) return;

                let previousResourceId: string = null;
                const newResourceId = resource.id;

                // modificam selected resources
                if (this.temporarySelectedResources[this.destinationIndex]?.[date]) {
                    previousResourceId = this.temporarySelectedResources[this.destinationIndex]?.[date];
                    this.temporarySelectedResources[this.destinationIndex][date] = resource.id;
                } else {
                    this.temporarySelectedResources[this.destinationIndex] = {
                        ...this.temporarySelectedResources[this.destinationIndex],
                        [date]: resource.id
                    }
                }

                // modificam temporary itinerary
                if (previousResourceId) {
                    if (previousResourceId !== newResourceId) {
                    const groups = this.temporaryModalItinerary.resources[this.destinationIndex]?.[this.activityTypeRecommended];

                    if (groups.length === 0) return;

                    let newResourceFound = false;

                    // iteram de la final spre inceput, ca sa nu ne afecteze splice-ul
                    for (let i = groups.length - 1; i >= 0; i--) {

                        // adaugam ticket selection pt data potrivita
                        if (groups[i].resourceId === newResourceId) {
                            newResourceFound = true;

                            const newResourceDates = groups[i].items;

                            let dateFound = false;
                            for (const dateGroup of newResourceDates) {
                                if (dateGroup.date === date) {
                                    dateGroup.items = ticketSelection;
                                    dateFound = true;
                                }
                            }
                            if (!dateFound) {
                                newResourceDates.push({
                                    date: date,
                                    items: ticketSelection
                                });
                            }
                        }

                        // stergem resursa veche sau doar data, dupa caz
                        if (groups[i].resourceId === previousResourceId) {
                            const previousResourceDates = groups[i].items;

                            // stergem resursa
                            if (previousResourceDates?.length === 1) {
                                groups.splice(i, 1);
                            }

                            // stergem data
                            else if (previousResourceDates?.length > 1) {
                                for (const dateGroup of previousResourceDates) {
                                    if (dateGroup.date === date) {
                                        previousResourceDates.splice(previousResourceDates.indexOf(dateGroup), 1);
                                    }
                                }
                            }
                        }
                    }

                    // daca resursa nu exista inainte in arrayul de recomandate
                    if (!newResourceFound) {
                        groups.push({
                            resourceId: resource.id,
                            resourceName: resource.title,
                            resourceTypeName: this.resourceTypeDictionary[resource.resourceTypeId],
                            items: [{
                                date: date,
                                items: ticketSelection
                            }]
                        });
                    }

                    } else {
                        const groups = this.temporaryModalItinerary.resources[this.destinationIndex]?.[this.activityTypeRecommended];

                        if (groups.length === 0) return;

                        for (let i = 0; i <= groups.length - 1; i++) {

                            // modificam ticket selection pt data potrivita
                            if (groups[i].resourceId === newResourceId) {

                                const newResourceDates = groups[i].items;

                                for (const dateGroup of newResourceDates) {
                                    if (dateGroup.date === date) {
                                        dateGroup.items = ticketSelection;
                                    }
                                }
                            }
                        }
                    }

                } else {
                    let groups = this.temporaryModalItinerary.resources[this.destinationIndex]?.[this.activityTypeRecommended];

                    if (!groups || groups?.length === 0) {
                        groups = [];
                    }

                    this.temporaryModalItinerary.resources[this.destinationIndex][this.activityTypeRecommended] = [
                        ...groups,
                        {
                            resourceId: resource.id,
                            resourceName: resource.title,
                            resourceTypeName: this.resourceTypeDictionary[resource.resourceTypeId],
                            items: [{
                                date: date,
                                items: ticketSelection
                            }]
                        }
                    ];
                }

                console.log('PAID AMOUNT BEFORE', this.temporaryModalItinerary.dayActivityPaidAmount);
                // recalculam total price-urile
                if (this.dayActivities) {
                    this.temporaryModalItinerary.dayActivityPrice = 0;
                    this.temporaryModalItinerary.dayActivityPaidAmount = 0;
                } else {
                    this.temporaryModalItinerary.eveningActivityPrice = 0;
                    this.temporaryModalItinerary.eveningActivityPaidAmount = 0;
                }
                this.temporaryModalItinerary.resources.forEach(location => {
                    if (location[this.activityTypeRecommended]?.length > 0) {
                        location[this.activityTypeRecommended].forEach(resource => {
                            if (resource.items?.length > 0) {
                                resource.items.forEach(item => {
                                    if (item.items?.length > 0) {
                                        item.items.forEach(ticket => {
                                            if (this.dayActivities) {
                                                // total day price
                                                this.temporaryModalItinerary.dayActivityPrice += ticket.price * ticket.quantity;

                                                // total day paid amount
                                                this.temporaryModalItinerary.dayActivityPaidAmount += this.getTicketDepositPrice(ticket);

                                            } else {
                                                // total evening price
                                                this.temporaryModalItinerary.eveningActivityPrice += ticket.price * ticket.quantity;

                                                // total evening paid amount
                                                this.temporaryModalItinerary.eveningActivityPaidAmount += this.getTicketDepositPrice(ticket);

                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
                console.log('PAID AMOUNT AFTER', this.temporaryModalItinerary.dayActivityPaidAmount);

                console.log('after', structuredClone(this.temporaryModalItinerary));
                console.log('after', structuredClone(this.temporarySelectedResources));
            });
    }

    getTicketDepositPrice(ticket: ActivityResourcesTicket): number {
        if (!ticket.bookingPolicies) return 0;

        if(ticket.bookingPolicies?.advanceFullPayment) {
            return ticket.price * ticket.quantity;

        } else if (ticket.bookingPolicies?.advancePartialPaymentPercentage !== 0) {
            return ticket.price * ticket.quantity * ticket.bookingPolicies?.advancePartialPaymentPercentage / 100;

        } else if (ticket.bookingPolicies?.depositRequiredAmount !== 0) {
            return ticket.bookingPolicies?.depositRequiredAmount;

        } else if (ticket.bookingPolicies?.depositRequiredPercentage !== 0) {
            return ticket.price * ticket.quantity * ticket.bookingPolicies?.depositRequiredPercentage / 100;

        } else {
            return 0;
        }

    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
