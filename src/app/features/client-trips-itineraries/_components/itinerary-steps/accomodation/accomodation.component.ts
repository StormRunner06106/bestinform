import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {MatLegacyDialog as MatDialog} from '@angular/material/legacy-dialog';
import {
    AccommodationItem,
    AccommodationResourceRecommended,
    Itinerary
} from "../../../../../shared/_models/itinerary.model";
import {AccommodationResourcesGroup, ItinerariesStore, ItineraryExtraInfo} from "../../../_services/itineraries.store";
import {Subject} from "rxjs";
import {map, takeUntil} from "rxjs/operators";
import {
    ViewSimpleResourceComponent
} from "../../../../domain-listing/view-simple-resource/view-simple-resource.component";
import {ResourceFilterService} from "../../../../../shared/_services/resource-filter.service";
import {Resource} from "../../../../../shared/_models/resource.model";

@Component({
    selector: 'app-accomodation',
    templateUrl: './accomodation.component.html',
    styleUrls: ['./accomodation.component.scss']
})
export class AccomodationComponent implements OnInit, OnDestroy {
    // common data for steps
    @Output() itineraryChanged = new EventEmitter<Itinerary>();
    newItinerary: Itinerary = null;
    temporaryModalItinerary: Itinerary = null;
    itineraryExtraInfo: ItineraryExtraInfo = null;
    destinationIndex: number;

    // accommodation specific data
    accommodationResources: Array<AccommodationResourcesGroup[]> = [];
    destinationIndexesArray: number[];
    activeAccId: string;


    private ngUnsubscribe = new Subject<void>();

    constructor(private modalService: MatDialog,
                private itinerariesStore: ItinerariesStore,
                private resourceFilterService: ResourceFilterService) {
    }

    ngOnInit(): void {
        this.getItineraryData();
    }

    getItineraryData() {
        this.newItinerary = this.itinerariesStore.getRecommendedItinerary();
        this.temporaryModalItinerary = structuredClone(this.newItinerary);
        this.itineraryExtraInfo = this.itinerariesStore.getItineraryExtraInfo();

        if (this.newItinerary?.resources?.length > 1) {
            this.destinationIndexesArray = Array(this.newItinerary.resources.length).fill(null).map((x, i) => i);
        }

        this.itinerariesStore.destinationIndex$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(newIndex => this.destinationIndex = newIndex);
    }

    getResourcesForModal() {
        console.log(this.accommodationResources);
        if (this.accommodationResources?.[this.destinationIndex]?.length > 0) return;

        if (this.itineraryExtraInfo.itineraryType !== 'manual') {
            this.getResourcesForAiItinerary();
        } else {
            this.itinerariesStore.getResourcesForManualItinerary("itineraryAccommodationResourceTypes")
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe({
                    next: (res: AccommodationResourcesGroup[]) => {
                        this.accommodationResources[this.destinationIndex] = res.slice();
                        if (!this.activeAccId) this.activeAccId = this.accommodationResources[this.destinationIndex][0].resourceTypeName;
                    }
                });
        }
    }

    getResourcesForAiItinerary() {
        this.newItinerary.resources[this.destinationIndex].accommodationResource.forEach( group => {
            if (group?.resources?.length > 0) {
                this.itinerariesStore.getResourcesByIds(group.resources)
                    .pipe(
                        map( resources => {
                            const modifiedObj: AccommodationResourcesGroup = {
                                resourceTypeId: group.resourceTypeId,
                                resourceTypeName: group.resourceTypeName,
                                resources: resources
                            }
                            return modifiedObj;
                        }),
                        takeUntil(this.ngUnsubscribe)
                    )
                    .subscribe({
                        next: (res: AccommodationResourcesGroup) => {
                            if (!this.accommodationResources[this.destinationIndex]) this.accommodationResources[this.destinationIndex] = [];
                            this.accommodationResources[this.destinationIndex].push(res);
                            if (!this.activeAccId) this.activeAccId = this.accommodationResources[this.destinationIndex][0].resourceTypeName;
                            console.log(this.accommodationResources);
                        }
                    })
            }
        });
    }

    setDestinationIndex(newDestinationIndex: number) {
        this.itinerariesStore.setDestinationIndex(newDestinationIndex);
        this.itinerariesStore.setDayState(this.newItinerary.resources[newDestinationIndex].startDate);
    }

    openModal(templateRef) {
        // this.newItinerary = this.itinerariesStore.getRecommendedItinerary();
        this.temporaryModalItinerary = structuredClone(this.newItinerary);
        this.getResourcesForModal();
        this.activeAccId = this.newItinerary.resources?.[this.destinationIndex]?.accommodationResourceRecommended?.resourceTypeName || null;
        const resourcesModal = this.modalService.open(templateRef, {panelClass: 'custom-modal'});
        resourcesModal.afterClosed()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(newItineraryData => {
                if (newItineraryData) {
                    this.itineraryChanged.emit(newItineraryData);
                    this.newItinerary = structuredClone(this.temporaryModalItinerary);
                }
            });
    }

    openResourceModal(resource: Resource, resourceIndex: number) {
        console.log('resursa la trimitere', resource);
        // TODO: nu sunt sigur daca trebuie sa resetam state-ul serviciului
        this.resourceFilterService.initServiceStates();
        this.itinerariesStore.setTemporaryData(this.temporaryModalItinerary);
        this.resourceFilterService.setResourceFromItinerary(resource);
        this.resourceFilterService.updateSavedFilters({
            dateAsDay: null,
            dateAsHour: null,
            startDate: this.itineraryExtraInfo.itineraryType !== 'ai' ? this.itineraryExtraInfo.destinations[this.destinationIndex].startDate : this.itineraryExtraInfo.startDate,
            endDate: this.itineraryExtraInfo.itineraryType !== 'ai' ? this.itineraryExtraInfo.destinations[this.destinationIndex].endDate : this.itineraryExtraInfo.endDate,
            startHour: null,
            endHour: null,
            adultsNumber: this.itineraryExtraInfo.adultsNumber,
            childrenNumber: this.itineraryExtraInfo.childrenNumber,
            roomsNumber: null
        });
        const resourceModal = this.modalService.open(ViewSimpleResourceComponent, {width: '90%', autoFocus: false, maxHeight: '90vh'});
        resourceModal.afterClosed()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe( ( roomSelection: AccommodationResourceRecommended["items"]) => {
                console.log('ROOM SELECTION', roomSelection);

                if (roomSelection?.length > 0) {
                    console.log(this.accommodationResources, resourceIndex);
                    this.temporaryModalItinerary.resources[this.destinationIndex].accommodationResourceRecommended = {
                        startDate: this.itineraryExtraInfo.itineraryType !== 'ai' ? this.itineraryExtraInfo.destinations[this.destinationIndex].startDate.format('YYYY-MM-DD') : this.itineraryExtraInfo.startDate.format('YYYY-MM-DD'),
                        endDate: this.itineraryExtraInfo.itineraryType !== 'ai' ? this.itineraryExtraInfo.destinations[this.destinationIndex].endDate.format('YYYY-MM-DD') : this.itineraryExtraInfo.endDate.format('YYYY-MM-DD'),
                        items: roomSelection,
                        resourceId: resource.id,
                        resourceName: resource.title,
                        resourceTypeName: this.accommodationResources[this.destinationIndex][resourceIndex].resourceTypeName
                    };

                    this.temporaryModalItinerary.accommodationPrice = 0;
                    this.temporaryModalItinerary.accommodationPaidAmount = 0;
                    this.temporaryModalItinerary.resources.forEach(location => {
                        /*this.temporaryModalItinerary.accommodationPrice += location.accommodationResourceRecommended.items.reduce((newPrice, room) =>
                                newPrice + room.pricePerItem * room.quantity
                            , 0);*/
                        if (location.accommodationResourceRecommended.items?.length > 0) {
                            location.accommodationResourceRecommended.items.forEach( room => {
                                // pret total
                                this.temporaryModalItinerary.accommodationPrice += room.pricePerItem * room.quantity;

                                // pret in functie de booking policies
                                this.temporaryModalItinerary.accommodationPaidAmount += this.getRoomDepositPrice(room);
                            });
                        }
                    });

                    console.log(this.temporaryModalItinerary);
                }
            });
    }

    getRoomDepositPrice(room: AccommodationItem): number {
        if (!room.bookingPolicies) return 0;

        if(room.bookingPolicies?.advanceFullPayment) {
            return room.pricePerItem * room.quantity;

        } else if (room.bookingPolicies?.advancePartialPaymentPercentage !== 0) {
            return room.pricePerItem * room.quantity * room.bookingPolicies?.advancePartialPaymentPercentage / 100;

        } else if (room.bookingPolicies?.depositRequiredAmount !== 0) {
            return room.bookingPolicies?.depositRequiredAmount;

        } else if (room.bookingPolicies?.depositRequiredPercentage !== 0) {
            return room.pricePerItem * room.quantity * room.bookingPolicies?.depositRequiredPercentage / 100;

        } else {
            return 0;
        }

    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
