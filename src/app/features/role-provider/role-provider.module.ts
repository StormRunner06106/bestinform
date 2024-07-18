import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProviderDashboardComponent } from './provider-dashboard/provider-dashboard.component';
import {RouterModule, Routes} from "@angular/router";
import {AdminDasboardComponent} from "../role-admin/admin-dasboard/admin-dasboard.component";
import {TranslateModule} from "@ngx-translate/core";
import {EditAccountComponent} from "../../standalone-components/edit-account/edit-account.component";
import {ChangePassComponent} from "../../standalone-components/change-pass/change-pass.component";
import {ProviderInboxComponent} from "./provider-inbox/provider-inbox.component";
import {UserRolesGuard} from "../../shared/_services/user-roles.guard";
import {
  ProviderConversationItemCardComponent
} from "./provider-conversation-item-card/provider-conversation-item-card.component";
import {ViewProviderMessagesComponent} from "./view-provider-messages/view-provider-messages.component";
import {DashboardHeaderComponent} from "../../standalone-components/dashboard-header/dashboard-header.component";
import {ConversationComponent} from "../../standalone-components/conversation/conversation.component";
import { AllNotificationsComponent } from 'src/app/standalone-components/all-notifications/all-notifications.component';
import {UserStatusGuard} from "../../shared/_services/user-status.guard";
import { MatPaginatorModule } from '@angular/material/paginator';
import { ProviderSettingsComponent } from './provider-settings/provider-settings.component';
import {UserSettingsComponent} from "../../standalone-components/user-settings/user-settings.component";

export const routes: Routes = [
  { path: 'dashboard', component: ProviderDashboardComponent},
  { path: 'all-notifications', component: AllNotificationsComponent},
  { path: 'resources', loadChildren: () => import('../resources/resources.module').then(m => m.ResourcesModule),
    canActivate: [UserStatusGuard],
    data: {
      allowedStatuses: ['active']
    }},
  { path: 'profile',  loadChildren: () => import('../providers-management/providers-management.module').then(m => m.ProvidersManagementModule)},
  { path: 'reservations', loadChildren: () => import('../reservations/reservations.module').then(m => m.ReservationsModule),
    canActivate: [UserStatusGuard],
    data: {
      allowedStatuses: ['active']
    }},
  { path: 'events', loadChildren: () => import('../events/events.module').then(m => m.EventsModule),
    canActivate: [UserStatusGuard],
    data: {
      allowedStatuses: ['active']
    }},
  { path: 'reports',  loadChildren: () => import('../reports/reports.module').then(m => m.ReportsModule)},

  { path: 'account', component: EditAccountComponent},
  { path: 'settings', component: ProviderSettingsComponent},
  { path: 'change-password', component: ChangePassComponent},
  {
    path: 'inbox',
    component: ProviderInboxComponent,
  },
  {
    path: 'forum',
    loadChildren: () => import('../forums/forums.module').then(m => m.ForumsModule)
  },
  {
    path: 'inbox/:idConversation',
    component: ViewProviderMessagesComponent,
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full'},

];

@NgModule({
  declarations: [
    ProviderDashboardComponent,
    ProviderInboxComponent,
    ProviderConversationItemCardComponent,
    ViewProviderMessagesComponent,
    ProviderSettingsComponent,

  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TranslateModule,
    DashboardHeaderComponent,
      ConversationComponent,
      AllNotificationsComponent,
      MatPaginatorModule,
      UserSettingsComponent
  ]
})
export class RoleProviderModule { }
