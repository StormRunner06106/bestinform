import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { EditorialsListComponent } from './editorials-list/editorials-list.component';
import { DeleteEditorialComponent } from './delete-editorial/delete-editorial.component';
import { ChangeEditorialStatusComponent } from './change-editorial-status/change-editorial-status.component';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import {AddEditEditorialComponent} from "./add-edit-editorial/add-edit-editorial.component";
import { FormsModule } from '@angular/forms';
import { AngularEditorModule } from '@kolkov/angular-editor';
import {SharedModule} from "../../shared/shared.module";
import {EditorialViewComponent} from "./editorial-view/editorial-view.component";
import {ShareButtonsModule} from "ngx-sharebuttons/buttons";
import {ShareIconsModule} from "ngx-sharebuttons/icons";
import {DashboardHeaderComponent} from "../../standalone-components/dashboard-header/dashboard-header.component";
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';



export const routes: Routes = [
    { path: 'list', component: EditorialsListComponent  },
    {
      path: 'add',
      component: AddEditEditorialComponent,
      pathMatch: 'full'
    },
    {
        path: 'edit/:slug',
        component: AddEditEditorialComponent,
        pathMatch: 'full'
    },
    {
        path: 'view/:slug',
        component: EditorialViewComponent,
        pathMatch: 'full'
    },
    {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
    }

];

@NgModule({
  declarations: [EditorialsListComponent,
    DeleteEditorialComponent,
    ChangeEditorialStatusComponent,
    AddEditEditorialComponent,
    EditorialViewComponent
],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    MatTableModule,
    FormsModule,
    AngularEditorModule,
    ShareButtonsModule,
      ShareIconsModule,
    // MatFormFieldModule,
    // MatInputModule,
      DashboardHeaderComponent,
      NgbModalModule,
      

  ],
})
export class EditorialsModule { }

