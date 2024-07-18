import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from "@angular/router";
import {StaffListComponent} from "./staff-list/staff-list.component";
import {NgbPaginationModule} from "@ng-bootstrap/ng-bootstrap";
import {MatLegacyFormFieldModule as MatFormFieldModule} from "@angular/material/legacy-form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatLegacySelectModule as MatSelectModule} from "@angular/material/legacy-select";
import {MatLegacyInputModule as MatInputModule} from "@angular/material/legacy-input";
import {AddEditStaffComponent} from "./add-edit-staff/add-edit-staff.component";
import {TranslateModule} from "@ngx-translate/core";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatLegacyButtonModule as MatButtonModule} from "@angular/material/legacy-button";
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import {RoutesWithGuard} from "../../shared/_models/route.model";
import {StaffCardComponent} from "./_components/staff-card/staff-card.component";
import {DashboardHeaderComponent} from "../../standalone-components/dashboard-header/dashboard-header.component";
import { StaffInboxComponent } from '../role-staff/staff-inbox/staff-inbox.component';
import { StaffConversationItemCardComponent } from '../role-staff/staff-conversation-item-card/staff-conversation-item-card.component';
import { ConversationComponent } from 'src/app/standalone-components/conversation/conversation.component';
import { ViewMessagesStaffComponent } from '../role-staff/view-messages-staff/view-messages-staff.component';

export const routes: RoutesWithGuard = [
  {
    path: 'list',
    component: StaffListComponent
  },
  {
    path: 'add',
    component: AddEditStaffComponent
  },
  {
    path: 'edit/:id',
    component: AddEditStaffComponent
  },
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  }

];

@NgModule({
  declarations: [
    StaffListComponent,
    StaffCardComponent,
    AddEditStaffComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    NgbPaginationModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
      MatInputModule,
      TranslateModule,
      MatDatepickerModule,
  MatButtonModule,
  MatPaginatorModule,
      DashboardHeaderComponent,
],
})
export class StaffManagementModule { }
