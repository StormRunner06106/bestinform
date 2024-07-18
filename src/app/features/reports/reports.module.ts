import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {SharedModule} from "../../shared/shared.module";
import {FormsModule} from "@angular/forms";
import { ClientsComponent } from './clients/clients.component';
import { ProvidersComponent } from './providers/providers.component';
import { ResourcesComponent } from './resources/resources.component';
import { EventsComponent } from './events/events.component';
import { EditorialsComponent } from './editorials/editorials.component';
import { JobsComponent } from './jobs/jobs.component';
import {DashboardHeaderComponent} from "../../standalone-components/dashboard-header/dashboard-header.component";
import { SalesPerProviderComponent } from './resources/components/sales-per-provider/sales-per-provider.component';
import {UserRolesGuard} from "../../shared/_services/user-roles.guard";
import { ResourcesReportsComponent } from './resources/components/resources-reports/resources-reports.component';
import { ProvidersReportsComponent } from './providers/components/providers-reports/providers-reports.component';
import { ClientsReportsComponent } from './clients/components/clients-reports/clients-reports.component';

export const routes: Routes = [
    {
        path: 'clients',
        component: ClientsComponent
    },
    {
        path: 'providers',
        component: ProvidersComponent
    },
    {
        path: 'resources',
        component: ResourcesComponent,
    },
    {
        path: 'resources/:providerId',
        component: ResourcesComponent,
        canActivate: [UserRolesGuard],
        data: {
            allowedRoles: ['ROLE_STAFF']
        }
    },
    {
        path: 'events',
        component: EventsComponent
    },
    {
        path: 'editorials',
        component: EditorialsComponent
    },
    {
        path: 'jobs',
        component: JobsComponent
    },
];


@NgModule({
    declarations: [
    ClientsComponent,
    ProvidersComponent,
    ResourcesComponent,
    EventsComponent,
    EditorialsComponent,
    JobsComponent,
    SalesPerProviderComponent,
    ResourcesReportsComponent,
    ProvidersReportsComponent,
    ClientsReportsComponent
  ],
    imports: [
        CommonModule,
        RouterModule,
        RouterModule.forChild(routes),
        SharedModule,
        FormsModule,
        DashboardHeaderComponent
    ]
})
export class ReportsModule {
}
