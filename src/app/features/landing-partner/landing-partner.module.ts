import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LandingPartnerComponent} from './landing-partner.component';
import {RouterModule, Routes} from "@angular/router";
import {LandingChannelManagerComponent} from "../landing-channel-manager/landing-channel-manager.component";
import {NotFoundComponent} from "../not-found/not-found.component";
import {FormsModule} from "@angular/forms";
import {LandingFormComponent} from "../../standalone-components/landing-form/landing-form.component";
import {ParallaxDirective} from "../../shared/_directives/parallax.directive";
import {NgbAccordion, NgbPanel, NgbPanelContent, NgbPanelHeader, NgbPanelToggle} from "@ng-bootstrap/ng-bootstrap";
import {FeedbackPageComponent} from "../../standalone-components/feedback-page/feedback-page.component";

export const routes: Routes = [
    {path: 'en', component: LandingPartnerComponent, pathMatch: 'full'},
    {path: 'ro', component: LandingPartnerComponent, pathMatch: 'full'},
    {path: 'formular/en', component: LandingFormComponent, pathMatch: 'full'},
    {path: 'formular/ro', component: LandingFormComponent, pathMatch: 'full'},
    {path: 'formular/success/ro', component: FeedbackPageComponent, pathMatch: 'full'},
    {path: 'formular/success/en', component: FeedbackPageComponent, pathMatch: 'full'},
    {path: '', redirectTo: 'ro', pathMatch: 'full'}, // redirect to `first-component`
    {path: '**', component: NotFoundComponent},  // Wildcard route for a 404 page
];

@NgModule({
    declarations: [
        LandingPartnerComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        LandingFormComponent,
        ParallaxDirective,
        NgbAccordion,
        NgbPanel,
        NgbPanelHeader,
        NgbPanelContent,
        NgbPanelToggle,
    ]
})
export class LandingPartnerModule {
}
