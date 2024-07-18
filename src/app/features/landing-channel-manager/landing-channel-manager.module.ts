import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingChannelManagerComponent } from './landing-channel-manager.component';
import {RouterModule, Routes} from "@angular/router";
import {NotFoundComponent} from "../not-found/not-found.component";
import {FormsModule} from "@angular/forms";

export const routes: Routes = [
  { path: 'en', component: LandingChannelManagerComponent, pathMatch: 'full' },
  { path: 'ro', component: LandingChannelManagerComponent, pathMatch: 'full' },
  { path: '',   redirectTo: 'en', pathMatch: 'full' }, // redirect to `first-component`
  { path: '**', component: NotFoundComponent },  // Wildcard route for a 404 page
];

@NgModule({
  declarations: [
    LandingChannelManagerComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
  ]
})
export class LandingChannelManagerModule { }
