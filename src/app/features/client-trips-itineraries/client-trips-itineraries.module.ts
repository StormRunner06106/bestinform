import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CountrySelectComponent} from './country-select/country-select.component';
import {RouterModule, Routes} from "@angular/router";
import {CategoryCardComponent} from "../../standalone-components/category-card/category-card.component";
import {CitySelectComponent} from './city-select/city-select.component';
import {MatRadioModule} from "@angular/material/radio";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {
    NgbAccordion,
    NgbModule, NgbNavModule,
    NgbPanel,
    NgbPanelContent,
    NgbPanelHeader,
    NgbPanelToggle
} from "@ng-bootstrap/ng-bootstrap";
import {TranslateModule} from "@ngx-translate/core";
import {TripViewComponent} from "./trip-view/trip-view.component";
import {ImagesGalleryComponent} from "../../standalone-components/images-gallery/images-gallery.component";
import {TripRoomCardComponent} from "../../standalone-components/trip-room-card/trip-room-card.component";
import {CheapestRoomPipe} from "../../shared/_pipes/cheapest-room.pipe";
import {CheckoutComponent} from "../../standalone-components/checkout/checkout.component";
import {
    BookingConfirmationComponent
} from "../../standalone-components/booking-confirmation/booking-confirmation.component";
import {
    StaticCategoryListingComponent
} from "../../standalone-components/static-category-listing/static-category-listing.component";
import {ItinerariesThemeComponent} from "./itineraries-theme/itineraries-theme.component";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatLegacyFormFieldModule} from "@angular/material/legacy-form-field";
import {MatLegacyInputModule} from "@angular/material/legacy-input";
import {MatMomentDateModule} from "@angular/material-moment-adapter";
import {MAT_DATE_FORMATS} from "@angular/material/core";
import {NgxMatTimepickerModule} from "@angular-material-components/datetime-picker";
import { RecommendedItinerariesComponent } from './recommended-itineraries/recommended-itineraries.component';
import { EditItineraryComponent } from './edit-itinerary/edit-itinerary.component';
import {MatIconModule} from "@angular/material/icon";
import { EatAndDrinkComponent } from './_components/itinerary-steps/eat-and-drink/eat-and-drink.component';
import { TransportComponent } from './_components/itinerary-steps/transport/transport.component';
import { AccomodationComponent } from './_components/itinerary-steps/accomodation/accomodation.component';
import { ActivitiesComponent } from './_components/itinerary-steps/day-activities/activities.component';
import { EveningActivitiesComponent } from './_components/itinerary-steps/evening-activities/evening-activities.component';
import {MatLegacyDialogModule} from "@angular/material/legacy-dialog";
import {MatLegacyProgressSpinnerModule} from "@angular/material/legacy-progress-spinner";



const MY_FORMATS = {
    parse: {
        dateInput: 'DD-MM-YYYY'
    },
    display: {
        dateInput: 'DD-MM-YYYY',
        monthYearLabel: 'YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'YYYY'
    }
};

export const routes: Routes = [
    {
        path: '',
        data: {module: 'trips'},
        component: StaticCategoryListingComponent,
        pathMatch: "full"
    },
    // START: HOLIDAY OFFERS
    {
        path: 'holiday-offers',
        redirectTo: 'holiday-offers/country',
        pathMatch: "full"
    },
    {
        path: 'holiday-offers/country',
        component: CountrySelectComponent,
        pathMatch: "full"
    },
    {
        path: 'holiday-offers/country/:countryId',
        component: CitySelectComponent,
        pathMatch: "full"
    },
    {
        path: 'holiday-offers/country/:countryId/trip',
        redirectTo: 'country/:countryId',
        pathMatch: "full"
    },
    {
        path: 'holiday-offers/country/:countryId/trip/:tripId',
        component: TripViewComponent,
        pathMatch: "full"
    },
    {
        path: 'holiday-offers/country/:countryId/trip/:tripId/checkout',
        component: CheckoutComponent,
        pathMatch: "full"
    },
    {
        path: 'holiday-offers/country/:countryId/trip/:tripId/booking-confirmation',
        component: BookingConfirmationComponent,
        pathMatch: "full"
    },
    // END: HOLIDAY OFFERS

    // START: ITINERARIES-CONFIG
    {
        path: 'itineraries-config',
        component: ItinerariesThemeComponent,
        pathMatch: 'full',
        data: {
            itineraryType: 'manual'
        }
    },
    {
        path: 'itineraries-config/itinerary',
        component: EditItineraryComponent,
        pathMatch: 'full'
    },
    {
        path: 'itineraries-config/itinerary/checkout',
        component: CheckoutComponent,
        pathMatch: 'full'
    },
    // END: ITINERARIES-CONFIG

    // START: AI-ITINERARIES
    {
        path: 'itineraries-theme',
        component: ItinerariesThemeComponent,
        pathMatch: "full"
    },
    {
        path: 'itineraries-theme/road-trip',
        component: EditItineraryComponent,
        pathMatch: "full"
    },
    {
        path: 'itineraries-theme/road-trip/checkout',
        component: CheckoutComponent,
        pathMatch: 'full'
    },
    {
        path: 'itineraries-theme/recommended',
        component: RecommendedItinerariesComponent,
        pathMatch: "full"
    },
    {
        path: 'itineraries-theme/recommended/itinerary',
        component: EditItineraryComponent,
        pathMatch: "full"
    },
    {
        path: 'itineraries-theme/recommended/itinerary/checkout',
        component: CheckoutComponent,
        pathMatch: 'full'
    },
    {
        path: 'itineraries-theme/recommended/itinerary/transport',
        component: TransportComponent,
        pathMatch: "full"
    },
    {
        path: 'itineraries-theme/recommended/itinerary/accom',
        component: AccomodationComponent,
        pathMatch: "full"
    },
    {
        path: 'itineraries-theme/recommended/itinerary/eat',
        component: EatAndDrinkComponent,
        pathMatch: "full"
    },
    {
        path: 'itineraries-theme/recommended/itinerary/day',
        component: ActivitiesComponent,
        pathMatch: "full"
    },
    {
        path: 'itineraries-theme/recommended/itinerary/evening',
        component: EveningActivitiesComponent,
        pathMatch: "full"
    }
    // END: AI-ITINERARIES
];

@NgModule({
    declarations: [
        CountrySelectComponent,
        CitySelectComponent,
        TripViewComponent,
        ItinerariesThemeComponent,
        RecommendedItinerariesComponent,
        EditItineraryComponent,
        EatAndDrinkComponent,
        TransportComponent,
        AccomodationComponent,
        ActivitiesComponent,
        EveningActivitiesComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        CategoryCardComponent,
        MatRadioModule,
        FormsModule,
        NgbAccordion,
        NgbPanel,
        NgbPanelContent,
        NgbPanelHeader,
        TranslateModule,
        NgbPanelToggle,
        ImagesGalleryComponent,
        TripRoomCardComponent,
        CheapestRoomPipe,
        MatDatepickerModule,
        MatLegacyFormFieldModule,
        MatLegacyInputModule,
        ReactiveFormsModule,
        MatMomentDateModule,
        NgxMatTimepickerModule,
        MatIconModule,
        NgbModule,
        MatLegacyDialogModule,
        MatLegacyProgressSpinnerModule,
        NgbNavModule
    ],
    providers: [
        {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}
    ]
})
export class ClientTripsItinerariesModule {

}
