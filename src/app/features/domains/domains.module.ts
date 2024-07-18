import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {DomainsListComponent} from "./domains-list/domains-list.component";
import {TranslateModule} from "@ngx-translate/core";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatLegacyFormFieldModule as MatFormFieldModule} from "@angular/material/legacy-form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatLegacyPaginatorModule as MatPaginatorModule} from "@angular/material/legacy-paginator";
import {MatLegacyChipsModule as MatChipsModule} from "@angular/material/legacy-chips";
import {MatLegacyInputModule as MatInputModule} from "@angular/material/legacy-input";
import {ReactiveFormsModule, FormsModule} from "@angular/forms";
import {RoutesWithGuard} from "../../shared/_models/route.model";
import {EditDomainComponent} from "./edit-domain/edit-domain.component";
import {CmsModule} from "../cms/cms.module";
import {DashboardHeaderComponent} from "../../standalone-components/dashboard-header/dashboard-header.component";
import {SharedModule} from "../../shared/shared.module";
import { Tooltip } from '@vime/angular';
import { MatTooltipModule, TooltipComponent } from '@angular/material/tooltip';
import { OverlayModule } from '@angular/cdk/overlay';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';


export const routes: Routes = [
    {
        path: 'list',
        component: DomainsListComponent
    },
    {
        path: ':id',
        component: EditDomainComponent
    },
    {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
    }
];

@NgModule({
    declarations: [
        DomainsListComponent,
        EditDomainComponent,
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TranslateModule,
        ReactiveFormsModule,
        FormsModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatIconModule,
        MatDatepickerModule,
        MatPaginatorModule,
        MatChipsModule,
        MatInputModule,
        ReactiveFormsModule,
        DashboardHeaderComponent,
        SharedModule,
        MatTooltipModule,
        OverlayModule,
        NgbTooltipModule
    ]
})
export class DomainsModule { }
