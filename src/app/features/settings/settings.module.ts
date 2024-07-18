import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemSettingsComponent } from './system-settings/system-settings.component';
import { UserRolesGuard } from 'src/app/shared/_services/user-roles.guard';
import { RouterModule, Routes } from '@angular/router';
import { DashboardHeaderComponent } from "../../standalone-components/dashboard-header/dashboard-header.component";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatLegacyFormField } from '@angular/material/legacy-form-field';
import { ModalMediaService } from 'src/app/shared/_services/modalmedia.service';
import { MatRadioGroup, MatRadioModule } from '@angular/material/radio';

export const routes: Routes=[
  {
    path: 'system-settings',
    component: SystemSettingsComponent,
    canActivate: [UserRolesGuard],
    data: {
        allowedRoles: ['ROLE_STAFF','ROLE_SUPER_ADMIN']
    }
}
]

@NgModule({
    declarations: [
        SystemSettingsComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        DashboardHeaderComponent,
        ReactiveFormsModule,
        SharedModule,
   
    ]
})
export class SettingsModule { }
