import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {SharedModule} from "../../shared/shared.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DashboardHeaderComponent} from "../../standalone-components/dashboard-header/dashboard-header.component";
import { AllThreadsListComponent } from './all-threads-list/all-threads-list.component';
import {PrivacyPolicyComponent} from "../secondary-pages/privacy-policy/privacy-policy.component";
import { ThreadsListComponent } from './threads-list/threads-list.component';
import {UserRolesGuard} from "../../shared/_services/user-roles.guard";
import { AddTopicComponent } from './add-topic/add-topic.component';
import { ViewTopicComponent } from './view-topic/view-topic.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EditThreadComponent } from './edit-thread/edit-thread.component';
import { ThreadCommentsListComponent } from './thread-comments-list/thread-comments-list.component';

export const routes: Routes = [
    {
        path: 'threads',
        component: AllThreadsListComponent,
        canActivate: [UserRolesGuard],
        data: {
            allowedRoles: ['ROLE_SUPER_ADMIN', 'ROLE_STAFF']
        }
    },
    {
        path: 'threads/edit/:id',
        component: EditThreadComponent,
        canActivate: [UserRolesGuard],
        data: {
            allowedRoles: ['ROLE_SUPER_ADMIN', 'ROLE_STAFF']
        }
    },
    {
        path: ':category',
        component: ThreadsListComponent
    },
    {
        path: ':category/add',
        component: AddTopicComponent,
        canActivate: [UserRolesGuard],
        data: {
            allowedRoles: ['ROLE_CLIENT']
        }
    },
    {
        path: ':category/view/:id',
        component: ViewTopicComponent,
        canActivate: [UserRolesGuard],
        data: {
            allowedRoles: ['ROLE_CLIENT', 'ROLE_PROVIDER']
        }
    },

];


@NgModule({
    declarations: [
    AllThreadsListComponent,
    ThreadsListComponent,
    AddTopicComponent,
    ViewTopicComponent,
    EditThreadComponent,
    ThreadCommentsListComponent
  ],
    imports: [
        CommonModule,
        RouterModule,
        RouterModule.forChild(routes),
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        DashboardHeaderComponent,
        AngularEditorModule,
        
    ]
})
export class ForumsModule {
}
