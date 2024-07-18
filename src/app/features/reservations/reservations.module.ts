import {NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {ExtraOptions, RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from 'src/app/shared/shared.module';
import { BookingConfirmedComponent } from 'src/app/standalone-components/booking-confirmed/booking-confirmed.component';
import {DashboardHeaderComponent} from 'src/app/standalone-components/dashboard-header/dashboard-header.component';
import {RoutesWithGuard} from 'src/app/shared/_models/route.model';
import {ReservationsComponent} from './reservations.component';
import {ReservationsListComponent} from './reservations-list/reservations-list.component';
import {TranslateModule} from '@ngx-translate/core';
import {UserRolesGuard} from 'src/app/shared/_services/user-roles.guard';
import {ViewReservationComponent} from './view-reservation/view-reservation.component';
import {
    ServiceBookingTimeSlotsComponent
} from './components/service-booking-time-slots/service-booking-time-slots.component';
import {RentalBookingComponent} from './components/rental-booking/rental-booking.component';
import {ProductsListComponent} from './components/products-list/products-list.component';
import {CarBookingComponent} from './components/car-booking/car-booking.component';
import {CulturalBookingComponent} from './components/cultural-booking/cultural-booking.component';
import {TicketBookingComponent} from './components/ticket-booking/ticket-booking.component';
import {CancelledReservationComponent} from './cancelled-reservation/cancelled-reservation.component';
import {CancelReservationModalComponent} from './cancel-reservation-modal/cancel-reservation-modal.component';
import {
    ViewReservationContentComponent
} from './components/view-reservation-content/view-reservation-content.component';
import {NgxQRCodeModule} from '@techiediaries/ngx-qrcode';
import {ConversationComponent} from 'src/app/standalone-components/conversation/conversation.component';
import {NgxQrcodeStylingModule} from 'ngx-qrcode-styling';
import {MenuComponent} from './components/menu/menu.component';
import {ViewTripReservationComponent} from './view-trip-reservation/view-trip-reservation.component';
import {
    ViewTripReservationContentComponent
} from './components/view-trip-reservation-content/view-trip-reservation-content.component';
import {FlightReservationsListComponent} from "./flight-reservations-list/flight-reservations-list.component";


export const routes: RoutesWithGuard = [
    // {
    //   path: 'home',
    //   component: ReservationsComponent
    // },
    {
        //all reservation
        path: 'list',
        component: ReservationsListComponent,
        canActivate: [UserRolesGuard],
        data: {
            allowedRoles: ['ROLE_STAFF', 'ROLE_SUPER_ADMIN', 'ROLE_PROVIDER']
        }
    },
    {
        //all reservation
        path: 'flight-list',
        component: FlightReservationsListComponent,
        canActivate: [UserRolesGuard],
        data: {
            allowedRoles: ['ROLE_STAFF', 'ROLE_SUPER_ADMIN']
        }
    },
    {
        //reservation list of current provider
        path: 'my-list',
        component: ReservationsListComponent,
        canActivate: [UserRolesGuard],
        data: {
            allowedRoles: ['ROLE_PROVIDER']
        }
    },
    {
        //reservation list by provider id
        path: 'list?providerid=:providerid',
        component: ReservationsListComponent,
        canActivate: [UserRolesGuard],
        data: {
            allowedRoles: ['ROLE_STAFF', 'ROLE_SUPER_ADMIN']
        }
    },
    {
        //reservation list by resource
        path: 'list?resourceid=:resourceid',
        component: ReservationsListComponent
    },
    {
        //reservation list by event
        path: 'list?eventid=:eventid',
        component: ReservationsListComponent
    },
    {
        //reservation list by trip
        path: 'list?tripid=:tripid',
        component: ReservationsListComponent
    },
    {
        //reservation view
        path: 'view/:id',
        component: ViewReservationComponent,
        // canActivate: [UserRolesGuard],
        // data: {
        //     allowedRoles: ['ROLE_STAFF','ROLE_SUPER_ADMIN','ROLE_PROVIDER', 'ROLE_CLIENT']
        // }
    },
    {
        //reservation view
        path: 'booking-confirmation/:id',
        component: BookingConfirmedComponent,
        // canActivate: [UserRolesGuard],
        // data: {
        //     allowedRoles: ['ROLE_STAFF','ROLE_SUPER_ADMIN','ROLE_PROVIDER', 'ROLE_CLIENT']
        // }
    },
    {
        //flight view
        path: 'view-flight/:id',
        component: ViewReservationComponent,
        // canActivate: [UserRolesGuard],
        // data: {
        //     allowedRoles: ['ROLE_STAFF','ROLE_SUPER_ADMIN','ROLE_PROVIDER', 'ROLE_CLIENT']
        // }
    },
    {
        //cancel reservation
        path: 'cancel-reservation',
        component: CancelReservationModalComponent,
        canActivate: [UserRolesGuard],
        data: {
            allowedRoles: ['ROLE_STAFF', 'ROLE_SUPER_ADMIN', 'ROLE_PROVIDER']
        }
    },
    {
        //reservation successfully cancelled
        path: 'cancelled-reservation/:resourceId',
        component: CancelledReservationComponent,
        canActivate: [UserRolesGuard],
        data: {
            allowedRoles: ['ROLE_STAFF', 'ROLE_SUPER_ADMIN', 'ROLE_PROVIDER']
        }
    },
    {
        path: 'view-trip-reservation/:tripReservationId',
        component: ViewTripReservationComponent,
        // canActivate: [UserRolesGuard],
        // data: {
        //     allowedRoles: ['ROLE_STAFF','ROLE_SUPER_ADMIN','ROLE_CLIENT']
        //     // allowedRoles: ['ROLE_CLIENT']

        // }
    },
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '/'
    }
]

const routerOptions: ExtraOptions = {
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
    scrollOffset: [0, 64],
};

@NgModule({
    declarations: [
        ReservationsComponent,
        ReservationsListComponent,
        ViewReservationComponent,
        ServiceBookingTimeSlotsComponent,
        RentalBookingComponent,
        ProductsListComponent,
        CarBookingComponent,
        CulturalBookingComponent,
        TicketBookingComponent,
        CancelledReservationComponent,
        CancelReservationModalComponent,
        ViewReservationContentComponent,
        MenuComponent,
        ViewTripReservationComponent,
        ViewTripReservationContentComponent,
        FlightReservationsListComponent

    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        SharedModule,
        ReactiveFormsModule,
        FormsModule,
        DashboardHeaderComponent,
        TranslateModule,
        NgxQRCodeModule,
        NgxQrcodeStylingModule,
        ConversationComponent
    ],
    exports: [
        ReservationsListComponent,
        TicketBookingComponent,
        ServiceBookingTimeSlotsComponent,
        ProductsListComponent,
        CarBookingComponent,
        CulturalBookingComponent
    ],
    providers: [
        DatePipe
    ]
})
export class ReservationsModule {
}
