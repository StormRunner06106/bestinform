import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RoutesWithGuard} from "../../shared/_models/route.model";
import {DeleteProviderComponent} from "./delete-provider/delete-provider.component";
import {AddEditProviderComponent} from "./add-edit-provider/add-edit-provider.component";
import {ViewProviderComponent} from "./view-provider/view-provider.component";
import {BalanceProviderComponent} from "./balance-provider/balance-provider.component";
import {RouterModule} from "@angular/router";
import {SharedModule} from "../../shared/shared.module";
import {ChangeStatusProviderComponent} from "./change-status-provider/change-status-provider.component";
import {ProviderRequestComponent} from "./provider-request/provider-request.component";
import {NgApexchartsModule} from "ng-apexcharts";
import {OwlCarouselOConfig} from "ngx-owl-carousel-o/lib/carousel/owl-carousel-o-config";
import {CarouselModule} from "ngx-owl-carousel-o";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {StatusProviderComponent} from "./status-provider/status-provider.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {PaymentRequestComponent} from './payment-request/payment-request.component';
import {ViewPaymentRequestComponent} from './view-payment-request/view-payment-request.component';
import {DashboardHeaderComponent} from "../../standalone-components/dashboard-header/dashboard-header.component";
import {ListProvidersComponent} from "./list-providers/list-providers.component";
import {UserRolesGuard} from "../../shared/_services/user-roles.guard";
import { AvailableBalanceCardComponent } from 'src/app/standalone-components/available-balance-card/available-balance-card.component';
import { RecentlyReservationCardComponent } from 'src/app/standalone-components/recently-reservation-card/recently-reservation-card.component';
import { HistoryReservationCardComponent } from 'src/app/standalone-components/history-reservation-card/history-reservation-card.component';
import { TranslateModule } from '@ngx-translate/core';
import {ReservationsModule} from "../reservations/reservations.module";
import { ProviderInboxComponent } from '../role-provider/provider-inbox/provider-inbox.component';
import { ProviderConversationItemCardComponent } from '../role-provider/provider-conversation-item-card/provider-conversation-item-card.component';
import { ViewProviderMessagesComponent } from '../role-provider/view-provider-messages/view-provider-messages.component';
import { ConversationComponent } from 'src/app/standalone-components/conversation/conversation.component';
import { MatTooltipModule } from '@angular/material/tooltip';

export const routes: RoutesWithGuard = [
    {
        path: 'active',
        component: ListProvidersComponent
    },
    {
        path: 'pending',
        component: ListProvidersComponent
    },
  {
    path: 'delete/:id',
    component: DeleteProviderComponent,
    canActivate: [UserRolesGuard],
    data: {
        allowedRoles: ['ROLE_STAFF']
    },
  },
  {
    path: 'edit/:id',
    component: AddEditProviderComponent,
    canActivate: [UserRolesGuard],
    data: {
        allowedRoles: ['ROLE_STAFF', 'ROLE_SUPER_ADMIN']
    },
  },
  {
    path: 'edit',
    component: AddEditProviderComponent,
    canActivate: [UserRolesGuard],
    data: {
        allowedRoles: ['ROLE_PROVIDER']
    },
  },
  {
    path: 'view/:id',
    canActivate: [UserRolesGuard],
    data: {
        allowedRoles: ['ROLE_STAFF','ROLE_SUPER_ADMIN']
    },
    component: ViewProviderComponent
  },
  {
    path: 'view',
    canActivate: [UserRolesGuard],
    data: {
        allowedRoles: ['ROLE_PROVIDER']
    },
    component: ViewProviderComponent
  },
  {
    path: 'add',
    component: AddEditProviderComponent,
    canActivate: [UserRolesGuard],
  },
  {
    path: 'balance/:id',
    component: BalanceProviderComponent,
    canActivate: [UserRolesGuard],
    data: {
        allowedRoles: ['ROLE_STAFF','ROLE_SUPER_ADMIN']
    },
  },
  {
    path: 'balance',
    component: BalanceProviderComponent,
    canActivate: [UserRolesGuard],
    data: {
        allowedRoles: ['ROLE_PROVIDER']
    },
  },

  {
    path: 'provider-view-messages/:idConversation',
    component: ViewProviderMessagesComponent,
    canActivate: [UserRolesGuard],
    data: {
        allowedRoles: ['ROLE_PROVIDER']
    },
  },
  {
    path: '',
    redirectTo: 'list',
    pathMatch: "full"
  }

]

@NgModule({
  declarations: [ListProvidersComponent,
    DeleteProviderComponent,
      ChangeStatusProviderComponent,
      DeleteProviderComponent,
    AddEditProviderComponent,
    ViewProviderComponent,
    BalanceProviderComponent,
      ProviderRequestComponent,
      StatusProviderComponent,
      PaymentRequestComponent,
      ViewPaymentRequestComponent

    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        SharedModule,
        NgApexchartsModule,
        CarouselModule,
        MatDatepickerModule,
        ReactiveFormsModule,
        FormsModule,
        TranslateModule,
        DashboardHeaderComponent,
        AvailableBalanceCardComponent,
        RecentlyReservationCardComponent,
        HistoryReservationCardComponent,
        ConversationComponent
    ]
})
export class ProvidersManagementModule {
}
