import { NgModule } from "@angular/core";
import {CommonModule, NgOptimizedImage} from "@angular/common";
import { PrivateComponent } from "./private.component";
import { HeaderComponent } from "../../standalone-components/header/header.component";
import { MenuComponent } from "../../standalone-components/menu/menu.component";
import { RouterModule, Routes } from "@angular/router";
import { UserRolesGuard } from "../../shared/_services/user-roles.guard";
import { MatSidenavModule } from "@angular/material/sidenav";
import { SharedModule } from "../../shared/shared.module";
import { FormsModule } from "@angular/forms";
import { DomainsSelectorComponent } from "../../standalone-components/domains-selector/domains-selector.component";
import { EditAccountComponent } from "../../standalone-components/edit-account/edit-account.component";
import { FooterComponent } from "../../standalone-components/footer/footer.component";
import { NavBarComponent } from "src/app/components/nav-bar/nav-bar.component";
import { FooterNewComponent } from "src/app/components/footer/footer.component";

export const routes: Routes = [
  {
    path: "",
    component: PrivateComponent,
    children: [
      {
        path: "admin",
        loadChildren: () =>
          import("../role-admin/role-admin.module").then(
            (m) => m.RoleAdminModule
          ),
        canActivate: [UserRolesGuard],
        data: {
          allowedRoles: ["ROLE_SUPER_ADMIN"],
        },
      },
      {
        path: "staff",
        loadChildren: () =>
          import("../role-staff/role-staff.module").then(
            (m) => m.RoleStaffModule
          ),
        canActivate: [UserRolesGuard],
        data: {
          allowedRoles: ["ROLE_STAFF"],
        },
      },
      {
        path: "provider",
        loadChildren: () =>
          import("../role-provider/role-provider.module").then(
            (m) => m.RoleProviderModule
          ),
        canActivate: [UserRolesGuard],
        data: {
          allowedRoles: ["ROLE_PROVIDER", "ROLE_SUPER_ADMIN"],
        },
      },
      { path: "", redirectTo: "/", pathMatch: "full" },
    ],
  },
];

@NgModule({
  declarations: [PrivateComponent],
    imports: [
        CommonModule,
        RouterModule,
        RouterModule.forChild(routes),
        SharedModule,
        FormsModule,
        DomainsSelectorComponent,
        HeaderComponent,
        MenuComponent,
        FooterNewComponent,
        NgOptimizedImage,
        NavBarComponent
    ],
})
export class PrivateModule {}
