import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {AddEditHomepageComponent} from './add-edit-homepage/add-edit-homepage.component';
import {TranslateModule} from "@ngx-translate/core";
import {ReactiveFormsModule} from "@angular/forms";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatLegacyFormFieldModule as MatFormFieldModule} from "@angular/material/legacy-form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatLegacyInputModule as MatInputModule} from "@angular/material/legacy-input";
import {MatLegacyButtonModule as MatButtonModule} from "@angular/material/legacy-button";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {NgxMatDatetimePickerModule} from "@angular-material-components/datetime-picker";
import {MatLegacyCheckboxModule as MatCheckboxModule} from "@angular/material/legacy-checkbox";
import {MatLegacySelectModule as MatSelectModule} from "@angular/material/legacy-select";
import {RoutesWithGuard} from "../../shared/_models/route.model";
import { MediaLibraryComponent } from 'src/app/standalone-components/media-library/media-library.component';
import {DashboardHeaderComponent} from "../../standalone-components/dashboard-header/dashboard-header.component";
import {SharedModule} from "../../shared/shared.module";
import { EditSecondaryPageComponent } from './edit-secondary-page/edit-secondary-page.component';
import {AngularEditorModule} from "@kolkov/angular-editor";


export const routes: Routes = [
  {
    path: 'home',
    component: AddEditHomepageComponent
  },
    {
        path: 'edit/:page',
        component: EditSecondaryPageComponent
    },
  // {
  //   path: 'home/:id',
  //   component: AddEditHomepageComponent
  // },
  {
    path: 'media-library',
    component: MediaLibraryComponent
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  }

];


@NgModule({
  declarations: [
    AddEditHomepageComponent,
    EditSecondaryPageComponent,
  ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TranslateModule,
        ReactiveFormsModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatDatepickerModule,
        NgxMatDatetimePickerModule,
        MatCheckboxModule,
        MatSelectModule,
        DashboardHeaderComponent,
        SharedModule,
        AngularEditorModule
    ]
})
export class CmsModule { }
