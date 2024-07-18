import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {ActivatedRoute, ActivatedRouteSnapshot, CanDeactivate, Router, RouterStateSnapshot} from "@angular/router";
import {FormGroup} from "@angular/forms";
import {ResourcesService} from "../../features/resources/_services/resources.service";
import {StepperService} from "../../features/resources/_services/stepper.service";
import {RentalBookingService} from "../../features/resources/_services/rental-booking.service";
import {TicketsBookingService} from "../../features/resources/_services/tickets-booking.service";
import {TimepickerService} from "../../features/resources/_services/timepicker.service";
import {ProductListService} from "../../features/resources/_services/product-list.service";
import {BookingTimeslotsService} from "../../features/resources/_services/booking-timeslots.service";
import {CreateResourceService} from "./createResource.service";
import {MenuService} from "../../features/resources/_services/menu.service";

export interface CanComponentDeactivate {
    canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

export const CanDeactivateState = {
    defendAgainstBrowserBackButton: false,
};

@Injectable()
export class CanDeactivateGuard implements CanDeactivate<CanComponentDeactivate> {


    constructor(private resourceService: ResourcesService,
                private route: ActivatedRoute,
                private router: Router,
                private stepperService: StepperService,
                private rentalService: RentalBookingService,
                private ticketService: TicketsBookingService,
                private timepickerService: TimepickerService,
                private productService: ProductListService,
                private timeslotService: BookingTimeslotsService,
                private createResourceService: CreateResourceService,
                private menuService: MenuService) {
    }
    canDeactivate(component: CanComponentDeactivate,
                  route: ActivatedRouteSnapshot,
                  state: RouterStateSnapshot) {

        let url: string = state.url;
        console.log('Url: ' + url);
        const navigation = this.router.getCurrentNavigation();
        console.log('route', navigation.extras)

        if(navigation.extras.state){
            return
        }else{
            if (confirm("Esti sigur ca vrei sa parasesti pagina?")) {
                console.log("DEACTIVATE - yes");
                this.stepperService.step$.next(undefined);
                this.stepperService.stepperStage$.next(undefined);

                this.resourceService.resourceId$.next(undefined);
                this.resourceService.resourceTemplateData$.next(undefined);
                this.resourceService.resourceTemplateType$.next(undefined);
                this.resourceService.attributesFromResourceTemplate$.next(undefined);
                this.resourceService.generalInformationForm$.next(new FormGroup({}));
                this.resourceService.facilitiesForm$.next(new FormGroup({}));
                this.resourceService.filesForm$.next(new FormGroup({}));
                this.resourceService.facilitiesByCategory$.next([]);
                this.resourceService.resourceData.next({
                    featuredImage: undefined,
                    images: [],
                    videos: [],
                    restaurant: undefined
                });
                this.resourceService.accommodationPolicy$.next(undefined);
                this.rentalService.refreshRoomList$.next(false);
                this.rentalService.roomList$.next([]);
                this.rentalService.imagesArray$.next([]);
                this.resourceService.travelId$.next(undefined);
                this.resourceService.relatedResources$.next([]);
                this.resourceService.bookingType$.next(undefined);

                this.ticketService.updateArray$.next([]);
                this.ticketService.refreshUpdateArray$.next(false);
                this.ticketService.createArray$.next([]);
                this.ticketService.refreshCreateArray$.next(false);
                this.ticketService.ticketsList$.next([]);
                this.ticketService.refreshTicketList$.next(false);
                this.ticketService.deleteArray$.next([]);

                this.timepickerService.timepickerList$.next([]);
                this.timepickerService.timetableList$.next([]);
                this.timepickerService.timepickerId$.next(undefined);
                this.timepickerService.timePicker$.next(undefined);
                this.timepickerService.changePolicies$.next(undefined);
                this.timepickerService.bookingPolicies$.next(undefined);

                this.resourceService.externalUrl$.next(undefined);

                this.productService.productsList$.next([]);
                this.productService.refreshProductList$.next(false);
                this.productService.deleteProdList$.next([]);

                this.timeslotService.serviceList$.next([]);
                this.timeslotService.refreshServiceList$.next(false);

                this.createResourceService.providerData$.next(undefined);

                this.resourceService.setupListener$.next(undefined);
                this.resourceService.generalInfoListener$.next(undefined);
                this.resourceService.policyRentalListener$.next(undefined);
                this.resourceService.policyMenuListener$.next(undefined);
                this.resourceService.policyListener$.next(undefined);
                this.resourceService.settingsTripsItineraries$.next([]);
                this.resourceService.tripsItinerariesObject$.next({});

                this.menuService.refreshMenuList$.next(false);
                this.menuService.menuList$.next([]);
                this.menuService.menuId$.next(undefined);
                return true;

            } else {
                console.log("DEACTIVATE - no");
                history.pushState(null, '', '');
                return false;
            }
        }



        // return component.canDeactivate ? component.canDeactivate() : true;
    }

}
