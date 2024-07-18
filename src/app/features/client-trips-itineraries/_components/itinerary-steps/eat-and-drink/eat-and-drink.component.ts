import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {MatLegacyDialog as MatDialog} from '@angular/material/legacy-dialog';
import {NgbNavModule} from "@ng-bootstrap/ng-bootstrap";
import {Itinerary} from "../../../../../shared/_models/itinerary.model";
import {
    DayMoment,
    EatAndDrinksResourcesGroup,
    ItinerariesStore,
    ItineraryExtraInfo,
    ResourceTypeDictionary
} from "../../../_services/itineraries.store";
import {Subject} from "rxjs";
import {map, takeUntil} from "rxjs/operators";
import {ResourceFilterService} from "../../../../../shared/_services/resource-filter.service";
import moment from "moment/moment";
import {Resource} from "../../../../../shared/_models/resource.model";
import {
    ViewSimpleResourceComponent
} from "../../../../domain-listing/view-simple-resource/view-simple-resource.component";

@Component({
    selector: 'app-eat-and-drink',
    templateUrl: './eat-and-drink.component.html',
    styleUrls: ['./eat-and-drink.component.scss'],
})
export class EatAndDrinkComponent implements OnInit, OnDestroy {
    // common data for steps
    @Output() itineraryChanged = new EventEmitter<Itinerary>();
    newItinerary: Itinerary = null;
    temporaryModalItinerary: Itinerary = null;
    itineraryExtraInfo: ItineraryExtraInfo = null;
    destinationIndex: number;

    // eat and drinks specific data
    activeaMealId = 'Breakfast';
    eatAndDrinksResources: Array<EatAndDrinksResourcesGroup[]> = [];
    dayState: string;

    // indexul acestui array reprezinta locatia, iar obiectul reprezinta perioada in care sta cazat in locatia respectiva
    dateLimitsByDestination: Array<{
        startDate: string;
        endDate: string;
    }> = [];
    // array de date-uri
    days: string[] = [];
    daysDictionary: {[key: string]: number} = {};

    selectedResources: Array<
        {
            // data
            [key: string]: {
                // momentul zilei (breakfast, lunch, dinner): id resursa
                [key: string]: string;
            }
        }
    > = [];
    temporarySelectedResources: Array<
        {
            // data
            [key: string]: {
                // momentul zilei (breakfast, lunch, dinner): id resursa
                [key: string]: string;
            }
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
        this.getItineraryData();
        this.getResourceTypeDictionary();
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

        this.itinerariesStore.destinationIndex$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(newIndex => this.destinationIndex = newIndex);

        this.itinerariesStore.dayState$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(newDay => this.dayState = newDay);
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
        // active tabs
        const resourcesModal = this.modalService.open(templateRef, {panelClass: 'custom-modal'});
        resourcesModal.afterClosed()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(newItineraryData => {
                if (newItineraryData) {
                    this.itineraryChanged.emit(newItineraryData);
                    this.newItinerary = structuredClone(this.temporaryModalItinerary);
                    this.selectedResources = structuredClone(this.temporarySelectedResources);
                }
            });
    }

    createSelectedResources() {
        this.newItinerary.resources.forEach( (location, locationIndex) => {
            // create the selected resources array
            if (location.eatAndDrinkResourcesRecommended?.length > 0) {
                location.eatAndDrinkResourcesRecommended.forEach( group => {
                    if (group?.dates?.length > 0) {
                        group.dates.forEach( date => {
                            if (date.hour === this.itineraryExtraInfo.breakfastHour) {
                                this.selectedResources[locationIndex] = {
                                    ...this.selectedResources[locationIndex],
                                    [date.date]: {
                                        ...this.selectedResources[locationIndex]?.[date.date],
                                        ['Breakfast']: group.resourceId
                                    }
                                };
                            } else if (date.hour === this.itineraryExtraInfo.lunchHour) {
                                this.selectedResources[locationIndex] = {
                                    ...this.selectedResources[locationIndex],
                                    [date.date]: {
                                        ...this.selectedResources[locationIndex]?.[date.date],
                                        ['Lunch']: group.resourceId
                                    }
                                };
                            } else if (date.hour === this.itineraryExtraInfo.dinnerHour) {
                                this.selectedResources[locationIndex] = {
                                    ...this.selectedResources[locationIndex],
                                    [date.date]: {
                                        ...this.selectedResources[locationIndex]?.[date.date],
                                        ['Dinner']: group.resourceId
                                    }
                                };
                            }
                        });
                    }
                });
            }
        });
        this.temporarySelectedResources = structuredClone(this.selectedResources);
        console.log('RESOURCES BY MOMENT', this.selectedResources);
    }

    getResourcesForModal() {
        if (this.eatAndDrinksResources?.[this.destinationIndex]?.length > 0) return;

        this.newItinerary.resources[this.destinationIndex].eatAndDrinksResource.forEach( (group, groupIndex) => {
            group.dayMoments.forEach( dayMoment => {
                if (dayMoment.resources?.length > 0) {
                    this.itinerariesStore.getResourcesByIds(dayMoment.resources)
                        .pipe(
                            map( resources => {
                                const modifiedObj: DayMoment = {
                                    dayMoment: dayMoment.dayMoment,
                                    resources: resources
                                };
                                return modifiedObj;
                            }),
                            takeUntil(this.ngUnsubscribe)
                        )
                        .subscribe({
                            next: (res: DayMoment) => {
                                console.log(res);
                                if (!this.eatAndDrinksResources[this.destinationIndex]) this.eatAndDrinksResources[this.destinationIndex] = [];
                                if (!this.eatAndDrinksResources[this.destinationIndex][groupIndex]) {
                                    this.eatAndDrinksResources[this.destinationIndex][groupIndex] = {
                                        day: group.day,
                                        dayMoments: [{
                                            dayMoment: 'Breakfast',
                                            resources: []
                                        }, {
                                            dayMoment: 'Lunch',
                                            resources: []
                                        }, {
                                            dayMoment: 'Dinner',
                                            resources: []
                                        }]
                                    };
                                }

                                if (res.dayMoment === 'Breakfast') {
                                    this.eatAndDrinksResources[this.destinationIndex][groupIndex].dayMoments[0].resources = res.resources;
                                } else if (res.dayMoment === 'Lunch') {
                                    this.eatAndDrinksResources[this.destinationIndex][groupIndex].dayMoments[1].resources = res.resources;
                                } else if (res.dayMoment === 'Dinner') {
                                    this.eatAndDrinksResources[this.destinationIndex][groupIndex].dayMoments[2].resources = res.resources;
                                }
                                console.log(this.eatAndDrinksResources);
                            }
                        });
                }
            });
        });
    }

    openResourceModal(resource: Resource, date: string, momentOfDay: "Breakfast" | "Lunch" | "Dinner") {
        console.log('resursa la trimitere', resource);
        console.log("DATE SI MOMENT OF DAY", date, momentOfDay);
        let hour: string;
        switch (momentOfDay) {
            case "Breakfast":
                hour = this.itineraryExtraInfo.breakfastHour;
                break;

            case "Lunch":
                hour = this.itineraryExtraInfo.lunchHour;
                break;

            case "Dinner":
                hour = this.itineraryExtraInfo.dinnerHour;
                break;
        }

        console.log('DATA SI ORA TRIMISA', moment(date + ' ' + hour));

        this.resourceFilterService.initServiceStates();
        this.itinerariesStore.setTemporaryData(this.temporaryModalItinerary);
        this.resourceFilterService.setResourceFromItinerary(resource);
        this.resourceFilterService.updateSavedFilters({
            dateAsDay: null,
            dateAsHour: moment(date + ' ' + hour),
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
            .subscribe( (deposit: number) => {
                if (!deposit) return;

                let previousResourceId: string = null;
                const newResourceId = resource.id;
                // modificam selected resources
                if (this.temporarySelectedResources[this.destinationIndex]?.[date]?.[momentOfDay]) {
                    previousResourceId = this.temporarySelectedResources[this.destinationIndex]?.[date]?.[momentOfDay];
                    this.temporarySelectedResources[this.destinationIndex][date][momentOfDay] = resource.id;
                } else {
                    this.temporarySelectedResources[this.destinationIndex] = {
                        ...this.temporarySelectedResources[this.destinationIndex],
                        [date]: {
                            ...this.temporarySelectedResources[this.destinationIndex]?.[date],
                            [momentOfDay]: resource.id
                        }
                    }
                }

                console.log(this.temporarySelectedResources);

                // modificam temporary itinerary
                if (previousResourceId) {
                    if (previousResourceId !== newResourceId) {
                    const groups = this.temporaryModalItinerary.resources[this.destinationIndex].eatAndDrinkResourcesRecommended;

                    if (groups.length === 0) return;

                    let newResourceFound = false;

                    // iteram de la final spre inceput, ca sa nu ne afecteze splice-ul
                    for (let i = groups.length - 1; i >= 0; i--) {

                        // adaugam data/ora pt resursa nou selectata
                        if (groups[i].resourceId === newResourceId) {
                            newResourceFound = true;
                            const newResource = groups[i];

                            newResource.dates.push({
                                date: date,
                                hour: hour
                            });
                        }

                        // stergem resursa veche sau doar data/ora dupa caz
                        if (groups[i].resourceId === previousResourceId) {
                            const previousResource = groups[i];
                            // stergem resursa
                            if (previousResource.dates?.length === 1) {
                                groups.splice(i, 1);
                            }
                            // stergem data/ora
                            else if (previousResource.dates?.length > 1) {
                                for (let dateIndex = 0; dateIndex < previousResource.dates.length; dateIndex++) {
                                    const dateObject = previousResource.dates[dateIndex];
                                    if (dateObject.date === date && dateObject.hour === hour) {
                                        previousResource.dates.splice(dateIndex, 1);
                                    }
                                }
                            }
                        }
                    }

                    // daca resursa nu exista inainte in arrayul de recomandate
                    if (!newResourceFound) {
                        groups.push({
                            dates: [{
                                date: date,
                                hour: hour
                            }],
                            depositAmount: deposit,
                            resourceId: resource.id,
                            resourceName: resource.title,
                            resourceTypeName: this.resourceTypeDictionary[resource.resourceTypeId]
                        })
                    }

                    console.log("GROUPS", groups);
                    console.log("ITINERARY", this.temporaryModalItinerary);
                    console.log("SELECTED RESOURCES", this.selectedResources);
                    }
                } else {
                    let groups = this.temporaryModalItinerary.resources[this.destinationIndex].eatAndDrinkResourcesRecommended;

                    if (!groups || groups?.length === 0) {
                        groups = [];
                    }

                    this.temporaryModalItinerary.resources[this.destinationIndex].eatAndDrinkResourcesRecommended = [
                        ...groups,
                        {
                            dates: [{
                                date: date,
                                hour: hour
                            }],
                            depositAmount: deposit,
                            resourceId: resource.id,
                            resourceName: resource.title,
                            resourceTypeName: this.resourceTypeDictionary[resource.resourceTypeId]
                        }
                    ];

                    console.log('temporary itinerary', structuredClone(this.temporaryModalItinerary));
                    console.log(groups);
                }

                // aici trebuie sa recalculam totalul pt eat and drinks price
                this.temporaryModalItinerary.eatAndDrinkPrice = 0;
                this.temporaryModalItinerary.eatAndDrinkPaidAmount = 0;
                this.temporaryModalItinerary.resources.forEach(location => {
                    /*this.temporaryModalItinerary.accommodationPrice += location.accommodationResourceRecommended.items.reduce((newPrice, room) =>
                            newPrice + room.pricePerItem * room.quantity
                        , 0);*/
                    if (location.eatAndDrinkResourcesRecommended?.length > 0) {
                        location.eatAndDrinkResourcesRecommended.forEach( item => {
                            // pret total
                            this.temporaryModalItinerary.eatAndDrinkPrice += item.depositAmount * item.dates?.length;

                            // pret in functie de booking policies
                            this.temporaryModalItinerary.eatAndDrinkPaidAmount += item.depositAmount * item.dates?.length;
                        });
                    }
                });
            });
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
