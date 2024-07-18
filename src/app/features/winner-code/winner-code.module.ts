import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from "@angular/forms";
import { CarouselModule } from "ngx-owl-carousel-o";

import { WinnerCodeComponent } from './winner-code.component';
import { NotFoundComponent } from "../not-found/not-found.component";

export const routes: Routes = [
    { path: '', component: WinnerCodeComponent, pathMatch: 'full' }, // redirect to English giveaway by default
    { path: '**', component: NotFoundComponent },  // Wildcard route for a 404 page
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes), // Use forChild here because it's a feature module
        SharedModule,
        CarouselModule,
        FormsModule
        // Add any other modules that your giveaway components require
    ]
})
export class WinnerCodeModule { }
