import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {JobOffersComponent} from './job-offers/job-offers.component';
import {RouterModule, Routes} from "@angular/router";
import { JobsListComponent } from './_components/jobs-list/jobs-list.component';
import { JobsSidebarComponent } from './_components/jobs-sidebar/jobs-sidebar.component';
import {MatLegacyFormFieldModule} from "@angular/material/legacy-form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatLegacyInputModule} from "@angular/material/legacy-input";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatLegacyCheckboxModule} from "@angular/material/legacy-checkbox";
import {TranslateModule} from "@ngx-translate/core";
import {MatLegacySelectModule} from "@angular/material/legacy-select";
import {
    ResourceCardWithTemplateComponent
} from "../../standalone-components/resource-card-with-template/resource-card-with-template.component";
import {MatLegacyPaginatorModule} from "@angular/material/legacy-paginator";
import { AddEditJobComponent } from './_components/add-edit-job/add-edit-job.component';
import {DashboardHeaderComponent} from "../../standalone-components/dashboard-header/dashboard-header.component";
import {AngularEditorModule} from "@kolkov/angular-editor";
import {SharedModule} from "../../shared/shared.module";
import { ViewJobComponent } from './_components/view-job/view-job.component';
import {DisplayUserComponent} from "../../standalone-components/display-user/display-user.component";
import { UserCvComponent } from './user-cv/user-cv.component';
import {CvCardComponent} from "../../standalone-components/cv-card/cv-card.component";
import { AddEditCvExperienceComponent } from './_components/add-edit-cv-experience/add-edit-cv-experience.component';
import { AddEditCvEducationComponent } from './_components/add-edit-cv-education/add-edit-cv-education.component';
import { AddEditCvCertificationComponent } from './_components/add-edit-cv-certification/add-edit-cv-certification.component';
import {MatChipsModule} from "@angular/material/chips";
import { ApplyJobComponent } from './_components/apply-job/apply-job.component';
import { DeleteCvDataModalComponent } from './_components/delete-cv-data-modal/delete-cv-data-modal.component';
import { CandidatesListComponent } from './candidates-list/candidates-list.component';
import { ViewCvComponent } from './_components/view-cv/view-cv.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'job-offers',
        pathMatch: "full"
    },
    {
        path: 'job-offers',
        data: {myJobOffers: false},
        component: JobOffersComponent,
        pathMatch: "full"
    },
    {
        path: 'my-job-offers',
        data: {myJobOffers: true},
        component: JobOffersComponent,
        pathMatch: "full"
    },
    {
        path: 'create',
        component: AddEditJobComponent
    },
    {
        path: 'edit/:id',
        component: AddEditJobComponent
    },
    {
        path: 'view/:id',
        component: ViewJobComponent
    },
    {
        path:'my-cv',
        component: UserCvComponent
    },
    {
        path:'candidates',
        component: CandidatesListComponent
    },
    {
        path:'cv/:userId',
        component: ViewCvComponent
    }
];

@NgModule({
    declarations: [
        JobOffersComponent,
        JobsListComponent,
        JobsSidebarComponent,
        AddEditJobComponent,
        ViewJobComponent,
        UserCvComponent,
        AddEditCvExperienceComponent,
        AddEditCvEducationComponent,
        AddEditCvCertificationComponent,
        ApplyJobComponent,
        DeleteCvDataModalComponent,
        CandidatesListComponent,
        ViewCvComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        MatLegacyFormFieldModule,
        MatIconModule,
        MatLegacyInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatExpansionModule,
        MatLegacyCheckboxModule,
        TranslateModule,
        MatLegacySelectModule,
        ResourceCardWithTemplateComponent,
        MatLegacyPaginatorModule,
        DashboardHeaderComponent,
        AngularEditorModule,
        SharedModule,
        DisplayUserComponent,
        CvCardComponent,
        MatChipsModule
    ]
})
export class JobsModule {
}
