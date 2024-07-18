import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {filter, firstValueFrom, Subject, takeUntil} from 'rxjs';
import {ResourcesService} from 'src/app/features/resources/_services/resources.service';
import {CategoryItems, MenuItems, MenuType} from 'src/app/shared/_models/menu-type.model';
import {Resource} from 'src/app/shared/_models/resource.model';
import {BookingTypeItemsService} from '../booking-type-items.service';
import {ResourceFilterService} from "../../../../../shared/_services/resource-filter.service";
import {ItinerariesStore} from "../../../../client-trips-itineraries/_services/itineraries.store";

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {

    resourceId: string;
    resource: Resource;

    //get menu
    menu: MenuType;
    menuItems: Array<MenuItems> = [];
    categoryItems = [];
    nameCategory: Array<string>;
    menuSingle: Array<any> = [];
    currency: string;

    isItineraryModal = false;
    resourceFromItinerary: Resource = null;

    private ngUnsubscribe = new Subject<void>();


    constructor(private activeRoute: ActivatedRoute,
                private resourceFilterService: ResourceFilterService,
                private itinerariesStore: ItinerariesStore,
                private resourcesService: ResourcesService,
                private bookingTypeItemsService: BookingTypeItemsService
    ) {
    }

    ngOnInit(): void {
        this.checkIfItineraryModal();
        this.setResourceId();
    }

    checkIfItineraryModal() {
        this.isItineraryModal = this.resourceFilterService.checkIfItineraryModal();

        if (this.isItineraryModal) {
            this.resourceFromItinerary = this.resourceFilterService.getResourceFromItinerary();
        }
    }

    getResourceById(id) {
        this.resourcesService.getResourceById(id)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(res => {
                console.log('RESURSA MEA', res);
                this.resource = res;
                this.currency = this.resource.currency === null ? 'EUR' : this.resource.currency;
            });

    }

    //get id from path than set it for _services
    setResourceId() {
        this.activeRoute.params.subscribe(params => {
            this.resourceId = this.isItineraryModal ? this.resourceFromItinerary.id : params['resourceId'];


            this.bookingTypeItemsService.setResourceId(this.resourceId);
            //get the menu
            if (this.resourceId) {
                //get resource for id
                this.getResourceById(this.resourceId);
                this.getMenuByResourceId();
            }
        });
    }

    getMenuByResourceId() {
        this.bookingTypeItemsService.getResourceMenu()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(res => {
                console.log('res', res)
                if (!res) return;
                console.log('menu', res);
                this.menu = res;
                this.menuItems = this.menu.items;
                this.menuItems.forEach((category) => {
                    console.log('categ',category)
                    this.categoryItems.push(category.subCategories);
                });

            });

    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

}


