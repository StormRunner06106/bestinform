import {NgModule} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {TemplatesListComponent} from './templates-list/templates-list.component';
import {RouterModule} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";
import {MatLegacyFormFieldModule as MatFormFieldModule} from "@angular/material/legacy-form-field";
import {MatLegacyInputModule as MatInputModule} from "@angular/material/legacy-input";
import {MatLegacyTableModule as MatTableModule} from "@angular/material/legacy-table";
import {MatLegacyPaginatorModule as MatPaginatorModule} from "@angular/material/legacy-paginator";
import {MatSortModule} from "@angular/material/sort";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AddEditTemplateComponent} from './add-edit-template/add-edit-template.component';
import {MatIconModule} from "@angular/material/icon";
import {MatLegacySelectModule as MatSelectModule} from "@angular/material/legacy-select";
import {MatLegacyAutocompleteModule as MatAutocompleteModule} from "@angular/material/legacy-autocomplete";
import {MatLegacySlideToggleModule as MatSlideToggleModule} from "@angular/material/legacy-slide-toggle";
import { TemplatesComponent } from './templates.component';
import { PropCategoriesComponent } from './prop-categories/prop-categories.component';
import { PropertiesComponent } from './properties/properties.component';
import {MatTooltipModule} from "@angular/material/tooltip";
import {RoutesWithGuard} from "../../shared/_models/route.model";
import {SharedModule} from "../../shared/shared.module";
import { MatLegacyChipsModule} from "@angular/material/legacy-chips";
import {MatChipsModule} from "@angular/material/chips";
import {DashboardHeaderComponent} from "../../standalone-components/dashboard-header/dashboard-header.component";
import {MatTableResponsiveModule} from "../../shared/mat-table-responsive/mat-table-responsive.module";





export const routes: RoutesWithGuard = [
    {
        path: 'list',
        component: TemplatesListComponent
    },
    {
        path: 'add',
        component: AddEditTemplateComponent
    },
    {
        path: 'categories',
        component: PropCategoriesComponent
    },
    {
        path: 'properties',
        component: PropertiesComponent
    },
    {
        path: 'edit/:id',
        component: AddEditTemplateComponent
    },
    {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
    }
];

@NgModule({
    declarations: [
        TemplatesListComponent,
        AddEditTemplateComponent,
        TemplatesComponent,
        PropCategoriesComponent,
        PropertiesComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TranslateModule,
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        ReactiveFormsModule,
        MatIconModule,
        MatSelectModule,
        MatAutocompleteModule,
        MatSlideToggleModule,
        SharedModule,
        MatChipsModule,
        MatLegacyChipsModule,
        FormsModule,
        DashboardHeaderComponent,
        MatTableResponsiveModule,
        NgOptimizedImage,

    ]
})
export class ResourceTemplatesModule {
}
