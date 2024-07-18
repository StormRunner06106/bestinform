import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {SharedModule} from "../../shared/shared.module";
import {FormsModule} from "@angular/forms";
import {DashboardHeaderComponent} from "../../standalone-components/dashboard-header/dashboard-header.component";
import { LogsListComponent } from './logs-list/logs-list.component';
import {PrivacyPolicyComponent} from "../secondary-pages/privacy-policy/privacy-policy.component";

export const routes: Routes = [
    {
        path: 'list',
        component: LogsListComponent
    },
];


@NgModule({
    declarations: [
        LogsListComponent
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
export class SystemLogsModule {
}
