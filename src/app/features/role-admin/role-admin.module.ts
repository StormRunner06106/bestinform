import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDasboardComponent } from './admin-dasboard/admin-dasboard.component';
import {RouterModule, Routes} from "@angular/router";
import {SharedModule} from "../../shared/shared.module";
import { StaffInboxComponent } from '../role-staff/staff-inbox/staff-inbox.component';
import { UserRolesGuard } from 'src/app/shared/_services/user-roles.guard';
import { ViewMessagesStaffComponent } from '../role-staff/view-messages-staff/view-messages-staff.component';
import { StaffManagementModule } from '../staff-management/staff-management.module';
import { ConversationComponent } from 'src/app/standalone-components/conversation/conversation.component';
import {
  AdminConversationItemCardComponent
} from "./admin-conversation-item-card/admin-conversation-item-card.component";
import {AdminInboxComponent} from "./admin-inbox/admin-inbox.component";
import {ViewMessagesAdminComponent} from "./view-messages-admin/view-messages-admin.component";
import {DashboardHeaderComponent} from "../../standalone-components/dashboard-header/dashboard-header.component";
import { AllNotificationsComponent } from 'src/app/standalone-components/all-notifications/all-notifications.component';
import {ClientsListComponent} from "../../standalone-components/clients-list/clients-list.component";

export const routes: Routes = [
  { path: 'dashboard', component: AdminDasboardComponent},
  {
    path: 'inbox',
    component: AdminInboxComponent,
  },
  {
  path: 'inbox/:idConversation',
  component: ViewMessagesAdminComponent
},
  { path: 'all-notifications', component: AllNotificationsComponent},
  {path: 'settings', loadChildren: () => import('../settings/settings.module').then(m => m.SettingsModule)},
  { path: 'manage-staff',  loadChildren: () => import('../staff-management/staff-management.module').then(m => m.StaffManagementModule)},
  { path: 'manage-providers',  loadChildren: () => import('../providers-management/providers-management.module').then(m => m.ProvidersManagementModule)},
  { path: 'editorials',  loadChildren: () => import('../editorials/editorials.module').then(m => m.EditorialsModule)},
  { path: 'events',  loadChildren: () => import('../events/events.module').then(m => m.EventsModule)},
  { path: 'resources',  loadChildren: () => import('../resources/resources.module').then(m => m.ResourcesModule)},
  { path: 'reservations',  loadChildren: () => import('../reservations/reservations.module').then(m => m.ReservationsModule)},
  { path: 'templates',  loadChildren: () => import('../resource-templates/templates.module').then(m => m.ResourceTemplatesModule)},
  { path: 'domains',  loadChildren: () => import('../domains/domains.module').then(m => m.DomainsModule)},
  { path: 'cms',  loadChildren: () => import('../cms/cms.module').then(m => m.CmsModule)},
  { path: 'reports',  loadChildren: () => import('../reports/reports.module').then(m => m.ReportsModule)},
  { path: 'forum',  loadChildren: () => import('../forums/forums.module').then(m => m.ForumsModule)},
  { path: 'logs',  loadChildren: () => import('../system-logs/system-logs.module').then(m => m.SystemLogsModule)},
  {path: 'itineraries', loadChildren: () => import('../itineraries/itineraries.module').then(m => m.ItinerariesModule)},
  {path: 'trips', loadChildren: () => import('../trips/trips.module').then(m => m.TripsModule)},
  {path: 'jobs', loadChildren: () => import('../jobs-dashboard/jobs-dashboard.module').then(m => m.JobsDashboardModule)},
  {
    path: 'client-jobs',
    loadChildren: () => import('../jobs/jobs.module').then(m => m.JobsModule)
  },
  {path: 'clients', component: ClientsListComponent},
  { path: '', redirectTo: 'dashboard', pathMatch: 'full'},
];

@NgModule({
  declarations: [
    AdminDasboardComponent,
    AdminConversationItemCardComponent,
    AdminInboxComponent,
    ViewMessagesAdminComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    StaffManagementModule,
    ConversationComponent,
      DashboardHeaderComponent,
      AllNotificationsComponent

  ]
})
export class RoleAdminModule { }
