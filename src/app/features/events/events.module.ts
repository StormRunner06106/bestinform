import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from "@angular/router";
import {EventsListComponent} from './events-list/events-list.component';
import {MatLegacyFormFieldModule as MatFormFieldModule} from "@angular/material/legacy-form-field";
import {MatLegacyInputModule as MatInputModule} from "@angular/material/legacy-input";
import {MatLegacyTableModule as MatTableModule} from "@angular/material/legacy-table";
import {MatLegacyPaginatorModule as MatPaginatorModule} from "@angular/material/legacy-paginator";
import {MatSortModule} from "@angular/material/sort";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AddEditEventComponent} from './add-edit-event/add-edit-event.component';
import {TranslateModule} from "@ngx-translate/core";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatIconModule} from "@angular/material/icon";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatLegacyButtonModule as MatButtonModule} from "@angular/material/legacy-button";
import {MatLegacySelectModule as MatSelectModule} from "@angular/material/legacy-select";
import {MatLegacyChipsModule as MatChipsModule} from "@angular/material/legacy-chips";
import {MatLegacyAutocompleteModule as MatAutocompleteModule} from "@angular/material/legacy-autocomplete";
import {MatLegacyCheckboxModule as MatCheckboxModule} from "@angular/material/legacy-checkbox";
import {
    NGX_MAT_DATE_FORMATS,
    NgxMatDateFormats,
    NgxMatDatetimePickerModule
} from "@angular-material-components/datetime-picker";
import {NgxMatMomentModule} from "@angular-material-components/moment-adapter";
import {RoutesWithGuard} from "../../shared/_models/route.model";
import {ViewEventComponent} from "./view-event/view-event.component";
import {MatTooltipModule} from "@angular/material/tooltip";
import {SharedModule} from "../../shared/shared.module";
import { DynamicAttributesComponent } from './components/dynamic-attributes/dynamic-attributes.component';
import {DashboardHeaderComponent} from "../../standalone-components/dashboard-header/dashboard-header.component";
import { AddEditEventTicketComponent } from './components/add-edit-event-ticket/add-edit-event-ticket.component';
import {
    EventTicketPreviewComponent
} from "../../standalone-components/event-ticket-preview/event-ticket-preview.component";
import { DeleteEventTicketComponent } from './components/delete-event-ticket/delete-event-ticket.component';
import {ResourceCardComponent} from "../../standalone-components/resource-card/resource-card.component";


export const routes: RoutesWithGuard = [
    {
    path: 'list',
    component: EventsListComponent
    },
    {
        path: 'add',
        component: AddEditEventComponent
    },
    {
        path: 'edit/:id',
        component: AddEditEventComponent
    },
    {
        path: 'view/:id',
        component: ViewEventComponent
    },
    {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
    },
    /*{
        path: '**',
        redirectTo: 'list',
        pathMatch: 'full'
    },*/

];

// If using Moment
const CUSTOM_MOMENT_FORMATS: NgxMatDateFormats = {
    parse: {
        dateInput: 'DD MM YYYY hh:mm a',
    },
    display: {
        dateInput: 'LLLL',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY'
    },
};

@NgModule({
  declarations: [
    EventsListComponent,
    AddEditEventComponent,
     ViewEventComponent,
     DynamicAttributesComponent,
     AddEditEventTicketComponent,
     DeleteEventTicketComponent
  ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        FormsModule,
        TranslateModule,
        MatExpansionModule,
        MatIconModule,
        MatDatepickerModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatSelectModule,
        MatChipsModule,
        MatAutocompleteModule,
        MatCheckboxModule,
        NgxMatMomentModule,
        NgxMatDatetimePickerModule,
        SharedModule,
        DashboardHeaderComponent,
        EventTicketPreviewComponent,
        ResourceCardComponent
    ],
    providers: [
        {provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_MOMENT_FORMATS}
    ]
})
export class EventsModule { }
