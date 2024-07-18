import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { SharedModule } from "../../shared/shared.module";
import { FormsModule } from "@angular/forms";
import { DashboardHeaderComponent } from "../../standalone-components/dashboard-header/dashboard-header.component";
import { PrivacyPolicyComponent } from "./privacy-policy/privacy-policy.component";
import { SecondaryPagesComponent } from "./secondary-pages.component";

import { PublicHomepageModule } from "../public-homepage/public-homepage.module";
import { TermsAndConditionsComponent } from "./terms-and-conditions/terms-and-conditions.component";

import { GiveawayRulesComponent } from "./giveaway-rules/giveaway-rules.component";

export const routes: Routes = [
  {
    path: "",
    component: SecondaryPagesComponent,
    children: [
      {
        path: "privacy-policy",
        component: PrivacyPolicyComponent,
      },
      {
        path: "terms-and-conditions",
        component: TermsAndConditionsComponent,
      },
      {
        path: "giveaway-rules",
        component: GiveawayRulesComponent,
      }
    ],
  },
];

@NgModule({
  declarations: [
    SecondaryPagesComponent,
    PrivacyPolicyComponent,
    TermsAndConditionsComponent,
    GiveawayRulesComponent

  ],
  imports: [
    CommonModule,
    RouterModule,
    RouterModule.forChild(routes),
    SharedModule,
    FormsModule,
    DashboardHeaderComponent,
    PublicHomepageModule,
  ],
})
export class SecondaryPagesModule {}
