import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedExperiencesListComponent} from './shared-experiences-list/shared-experiences-list.component';
import {RouterModule, Routes} from "@angular/router";
import {ButtonCreateComponent} from './_components/button-create/button-create.component';
import {
    SharedExperiencesCardComponent
} from "../../standalone-components/shared-experiences-card/shared-experiences-card.component";
import {MatLegacyPaginatorModule} from "@angular/material/legacy-paginator";
import {CreateSharedExperienceComponent} from './create-shared-experience/create-shared-experience.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatLegacyInputModule as MatInputModule} from "@angular/material/legacy-input";
import {MatLegacyFormFieldModule as MatFormFieldModule} from "@angular/material/legacy-form-field";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {NgxMatDatetimePickerModule, NgxMatTimepickerModule} from "@angular-material-components/datetime-picker";
import {TranslateModule} from "@ngx-translate/core";
import {ActivityPlaceComponent} from "./_components/activity-place/activity-place.component";
import {
    CardActivityPlaceComponent
} from "../../standalone-components/card-activity-place/card-activity-place.component";
import { AfterCreateDeleteComponent } from './_components/after-create-delete/after-create-delete.component';
import { ViewSharedExperienceComponent } from './view-shared-experience/view-shared-experience.component';
import {
    SharedExperiencesInfoComponent
} from "../../standalone-components/shared-experiences-info/shared-experiences-info.component";
import {DisplayUserComponent} from "../../standalone-components/display-user/display-user.component";
import { LobbySharedExperienceComponent } from './lobby-shared-experience/lobby-shared-experience.component';
import {MatIconModule} from "@angular/material/icon";
import { SelectTimeComponent } from './_components/select-time/select-time.component';
import {MatRadioModule} from "@angular/material/radio";
// import {MatFormFieldModule} from "@angular/material/form-field";


export const routes: Routes = [
    {
        path: 'list',
        component: SharedExperiencesListComponent
    },
    {
        path: 'add',
        component: CreateSharedExperienceComponent
    },
    {
        path: 'edit/:slug',
        component: CreateSharedExperienceComponent
    },
    {
        path: 'view/:slug',
        component: ViewSharedExperienceComponent
    },
    {
        path: 'lobby/:slug',
        component: LobbySharedExperienceComponent
    },
    {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
    }
];

@NgModule({
    declarations: [
        SharedExperiencesListComponent,
        ButtonCreateComponent,
        CreateSharedExperienceComponent,
        ActivityPlaceComponent,
        // AfterCreateDeleteComponent,
        ViewSharedExperienceComponent,
        LobbySharedExperienceComponent,
        SelectTimeComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        SharedExperiencesCardComponent,
        ReactiveFormsModule,
        FormsModule,
        MatInputModule,
        MatLegacyPaginatorModule,
        MatFormFieldModule,
        MatDatepickerModule,
        NgxMatTimepickerModule,
        TranslateModule,
        CardActivityPlaceComponent,
        SharedExperiencesInfoComponent,
        DisplayUserComponent,
        AfterCreateDeleteComponent,
        MatIconModule,
        NgxMatDatetimePickerModule,
        MatRadioModule
    ]
})
export class SharedExperiencesModule {
}
