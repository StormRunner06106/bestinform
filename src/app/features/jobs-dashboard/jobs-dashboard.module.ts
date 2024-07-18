import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobsDashboardListComponent } from './jobs-dashboard-list/jobs-dashboard-list.component';
import { RouterModule, Routes } from '@angular/router';
import { DashboardHeaderComponent } from 'src/app/standalone-components/dashboard-header/dashboard-header.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule } from '@angular/material/legacy-input';
import { TranslateModule } from '@ngx-translate/core';
import { MatLegacySelectModule } from '@angular/material/legacy-select';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatDialog } from '@angular/material/dialog';
import { ViewJobComponent } from '../jobs/_components/view-job/view-job.component';
import { CandidatesListComponent } from './candidates-list/candidates-list.component';

export const routes: Routes = [
  // {
  //     path: '',
  //     redirectTo: 'jobs-dashboard-list',
  //     pathMatch: "full"
  //
  // },
  {
      path: 'list',
      component: JobsDashboardListComponent,
      pathMatch: "full"
  },
  {
    path: 'candidates',
    component: CandidatesListComponent,
    pathMatch: "full"
  },
  {
    path: 'view/:id',
    component: ViewJobComponent,
    pathMatch: "full"
}

];


@NgModule({
  declarations: [
    JobsDashboardListComponent,
    CandidatesListComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    DashboardHeaderComponent,
    ReactiveFormsModule,
    FormsModule,
    MatLegacyFormFieldModule,
    MatIconModule,
    MatLegacyInputModule,
    TranslateModule,
    MatLegacySelectModule,
    SharedModule,

  ]
})
export class JobsDashboardModule { }
