import {NgModule} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import { CountriesComponent } from './countries/countries.component';
import {DashboardHeaderComponent} from "../../standalone-components/dashboard-header/dashboard-header.component";
import { AddEditCountryComponent } from './add-edit-country/add-edit-country.component';
import {TranslateModule} from "@ngx-translate/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatIconModule} from "@angular/material/icon";
import {MatLegacyFormFieldModule} from "@angular/material/legacy-form-field";
import {MatLegacyInputModule} from "@angular/material/legacy-input";
import {SharedModule} from "../../shared/shared.module";
import {TextFieldModule} from "@angular/cdk/text-field";
import {NgbAccordion, NgbPanel, NgbPanelContent, NgbPanelHeader, NgbPanelToggle} from "@ng-bootstrap/ng-bootstrap";
import { AddEditTripComponent } from './add-edit-trip/add-edit-trip.component';
import {
    NGX_MAT_DATE_FORMATS,
    NgxMatDateFormats,
    NgxMatDatetimePickerModule
} from "@angular-material-components/datetime-picker";
import { TripListComponent } from './trip-list/trip-list.component';
import { ArchiveTripComponent } from './archive-trip/archive-trip.component';
import {HotelsComponent} from "./hotels/hotels.component";
import {HotelMarkupDialogComponent} from "./hotels/dialog/hotel-markup-dialog.component";

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'countries',
        pathMatch: 'full'
    },
    {
        path: 'countries',
        component: CountriesComponent
    },
    {
        path: 'countries/add',
        component: AddEditCountryComponent
    },
    {
        path: 'countries/edit/:countryId',
        component: AddEditCountryComponent
    },
    {
        path: 'add',
        component: AddEditTripComponent
    },
    {
        path: 'edit/:tripId',
        component: AddEditTripComponent
    },
    {
        path: 'list',
        component: TripListComponent
    },
    {
        path: 'hotels',
        component: HotelsComponent
    }
];

@NgModule({
    declarations: [
        CountriesComponent,
        AddEditCountryComponent,
        AddEditTripComponent,
        TripListComponent,
        ArchiveTripComponent,
        HotelsComponent,
        HotelMarkupDialogComponent
  ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        DashboardHeaderComponent,
        TranslateModule,
        NgOptimizedImage,
        ReactiveFormsModule,
        MatIconModule,
        MatLegacyFormFieldModule,
        MatLegacyInputModule,
        SharedModule,
        TextFieldModule,
        NgbAccordion,
        NgbPanel,
        NgbPanelHeader,
        NgbPanelContent,
        NgbPanelToggle,
        FormsModule,
        NgxMatDatetimePickerModule,

    ]
})
export class TripsModule {
}
