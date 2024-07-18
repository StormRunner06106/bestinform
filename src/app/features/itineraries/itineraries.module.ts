import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AddEditItineraryComponent} from './add-edit-itinerary/add-edit-itinerary.component';
import {RouterModule, Routes} from "@angular/router";
import {DashboardHeaderComponent} from "../../standalone-components/dashboard-header/dashboard-header.component";
import {ReactiveFormsModule} from "@angular/forms";
import {MatLegacyFormFieldModule} from "@angular/material/legacy-form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatLegacyInputModule} from "@angular/material/legacy-input";
import {TranslateModule} from "@ngx-translate/core";
import {MatLegacySelectModule} from "@angular/material/legacy-select";
import {SharedModule} from "../../shared/shared.module";
import {ListItinerariesComponent} from './list-itineraries/list-itineraries.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
    },
    {
        path: 'add',
        component: AddEditItineraryComponent
    },
    {
        path: 'edit',
        redirectTo: 'list',
        pathMatch: "full"
    },
    {
        path: 'edit/:itineraryId',
        component: AddEditItineraryComponent
    },
    {
        path: 'list',
        component: ListItinerariesComponent
    }
];

@NgModule({
    declarations: [
        AddEditItineraryComponent,
        ListItinerariesComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        DashboardHeaderComponent,
        ReactiveFormsModule,
        MatLegacyFormFieldModule,
        MatIconModule,
        MatLegacyInputModule,
        TranslateModule,
        MatLegacySelectModule,
        SharedModule
    ]
})
export class ItinerariesModule {
}
