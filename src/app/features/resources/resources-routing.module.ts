import {NgModule} from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {ResourcesComponent} from "./resources.component";
import {AddResourceComponent} from "./pages/add-resource/add-resource.component";
import {ResourcesListComponent} from "./pages/resources-list/resources-list.component";
import {CanDeactivateGuard} from "../../shared/_services/can-deactivate-guard.service";


const resourceRoutes: Routes = [
    {
        path: '',
        component: ResourcesComponent,
        children: [
            {
                path: 'add',
                component: AddResourceComponent,
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'edit/:id',
                component: AddResourceComponent,
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'list',
                component: ResourcesListComponent
            },
            {
                path: 'list?providerid=:providerid',
                component: ResourcesListComponent
            },
            {
                path: 'my-list',
                component: ResourcesListComponent
            },
            {path: '', redirectTo: 'list', pathMatch: 'full'},
        ],

    },
];

@NgModule({
    imports: [RouterModule.forChild(resourceRoutes)],
    exports: [RouterModule],
    providers: [CanDeactivateGuard]
})
export class ResourcesRoutingModule {
}
