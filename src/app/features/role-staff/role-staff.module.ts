import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StaffDashboardComponent} from './staff-dashboard/staff-dashboard.component';
import {RouterModule, Routes} from "@angular/router";
import {SharedModule} from "../../shared/shared.module";
import {ChangePassComponent} from "../../standalone-components/change-pass/change-pass.component";
import {DashboardHeaderComponent} from "../../standalone-components/dashboard-header/dashboard-header.component";
import {EditAccountComponent} from "../../standalone-components/edit-account/edit-account.component";
import {StaffInboxComponent} from './staff-inbox/staff-inbox.component';
import {
    StaffConversationItemCardComponent
} from './staff-conversation-item-card/staff-conversation-item-card.component';
import {ViewMessagesStaffComponent} from './view-messages-staff/view-messages-staff.component';
import {ConversationComponent} from 'src/app/standalone-components/conversation/conversation.component';
import {UserRolesGuard} from 'src/app/shared/_services/user-roles.guard';
import {
    NotificationsComponent
} from 'src/app/standalone-components/notifications-component/notifications-component.component';
import {AllNotificationsComponent} from 'src/app/standalone-components/all-notifications/all-notifications.component';
import {ClientsListComponent} from "../../standalone-components/clients-list/clients-list.component";

export const routes: Routes = [
    {path: 'dashboard', component: StaffDashboardComponent},
    {
        path: 'staff-inbox',
        component: StaffInboxComponent,
        canActivate: [UserRolesGuard],
        data: {
            allowedRoles: ['ROLE_STAFF', 'ROLE_SUPER_ADMIN']
        }
    },
    {
        path: 'staff-messages/:idConversation',
        component: ViewMessagesStaffComponent,
        canActivate: [UserRolesGuard],
        data: {
            allowedRoles: ['ROLE_STAFF', 'ROLE_SUPER_ADMIN']
        }
    },
    {path: 'account', component: EditAccountComponent},
    {path: 'notifications', component: NotificationsComponent},
    {path: 'all-notifications', component: AllNotificationsComponent},
    {path: 'change-password', component: ChangePassComponent},
    {path: 'inbox', component: StaffInboxComponent},
    {path: 'inbox/:idConversation', component: ViewMessagesStaffComponent},
    {path: 'settings', loadChildren: () => import('../settings/settings.module').then(m => m.SettingsModule)},
    {
        path: 'editorials', loadChildren: () => import('../editorials/editorials.module').then(m => m.EditorialsModule),
        canActivate: [UserRolesGuard],
        data: {
            allowedRoles: ['ROLE_EDITORIALS_EDIT']
        }
    },
    {
        path: 'events', loadChildren: () => import('../events/events.module').then(m => m.EventsModule),
        canActivate: [UserRolesGuard],
        data: {
            allowedRoles: ['ROLE_EVENTS_EDIT']
        }
    },
    {
        path: 'templates',
        loadChildren: () => import('../resource-templates/templates.module').then(m => m.ResourceTemplatesModule)

    },
    {path: 'domains', loadChildren: () => import('../domains/domains.module').then(m => m.DomainsModule)},
    {path: 'cms', loadChildren: () => import('../cms/cms.module').then(m => m.CmsModule)},
    {
        path: 'resources', loadChildren: () => import('../resources/resources.module').then(m => m.ResourcesModule),
        canActivate: [UserRolesGuard],
        data: {
            allowedRoles: ['ROLE_PROVIDERS_EDIT']
        }
    },
    {
        path: 'reservations',
        loadChildren: () => import('../reservations/reservations.module').then(m => m.ReservationsModule)
    },
    {
        path: 'manage-providers',
        loadChildren: () => import('../providers-management/providers-management.module').then(m => m.ProvidersManagementModule),
        canActivate: [UserRolesGuard],
        data: {
            allowedRoles: ['ROLE_PROVIDERS_EDIT']
        }
    },
    {path: 'reports', loadChildren: () => import('../reports/reports.module').then(m => m.ReportsModule)},
    {path: 'forum', loadChildren: () => import('../forums/forums.module').then(m => m.ForumsModule)},
    {path: 'trips', loadChildren: () => import('../trips/trips.module').then(m => m.TripsModule)},
    {
        path: 'itineraries',
        loadChildren: () => import('../itineraries/itineraries.module').then(m => m.ItinerariesModule)
    },
    {
        path: 'jobs',
        loadChildren: () => import('../jobs-dashboard/jobs-dashboard.module').then(m => m.JobsDashboardModule)
    },
    {
        path: 'client-jobs',
        loadChildren: () => import('../jobs/jobs.module').then(m => m.JobsModule)
    },
    {path: 'clients', component: ClientsListComponent},
    
    {path: '', redirectTo: 'dashboard', pathMatch: 'full'},

];

@NgModule({
    declarations: [
        StaffDashboardComponent,
        StaffInboxComponent,
        StaffConversationItemCardComponent,
        ViewMessagesStaffComponent

    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        SharedModule,
        DashboardHeaderComponent,
        ChangePassComponent,
        EditAccountComponent,
        ConversationComponent,
        NotificationsComponent,
        AllNotificationsComponent

    ]
})
export class RoleStaffModule {
}
