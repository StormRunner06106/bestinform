import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from "@angular/forms";
import { CarouselModule } from "ngx-owl-carousel-o";

import { GiveawayComponent } from './giveaway.component';
import { GiveawayHeaderComponent } from './_components/giveaway-header/giveaway-header.component'

import { GiveawayFormComponent } from './_components/giveaway-form/giveaway-form.component';
import { GiveawayFooterComponent } from './_components/giveaway-footer/giveaway-footer.component';
import { NotFoundComponent } from "../not-found/not-found.component";

export const routes: Routes = [
    { path: 'en', component: GiveawayComponent, pathMatch: 'full' },
    { path: 'ro', component: GiveawayComponent, pathMatch: 'full' },
    { path: '',   redirectTo: 'en', pathMatch: 'full' }, // redirect to English giveaway by default
    { path: '**', component: NotFoundComponent },  // Wildcard route for a 404 page
];

@NgModule({
    declarations: [
        GiveawayComponent,
        GiveawayHeaderComponent,
        GiveawayFormComponent,
        GiveawayFooterComponent
        // Add any other components related to the giveaway feature here
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes), // Use forChild here because it's a feature module
        SharedModule,
        CarouselModule,
        FormsModule
        // Add any other modules that your giveaway components require
    ]
})
export class GiveawayModule { }
