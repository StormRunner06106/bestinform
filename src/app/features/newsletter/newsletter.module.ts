import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import {NewsletterComponent} from "./newsletter.component";
import {NewsletterHeaderComponent} from "./_components/newsletter-header/newsletter-header.component";
import { NewsletterBodyComponent } from './_components/newsletter-body/newsletter-body.component';
import { NewsletterFooterComponent } from './_components/newsletter-footer/newsletter-footer.component';
import { BenefitBoxComponent } from './_components/benefit-box/benefit-box.component';
import { NewsletterBenefitsComponent } from './_components/newsletter-benefits/newsletter-benefits.component';
import {CarouselModule} from "ngx-owl-carousel-o";
import {NotFoundComponent} from "../not-found/not-found.component";
import {FormsModule} from "@angular/forms";

export const routes: Routes = [
    { path: 'en', component: NewsletterComponent, pathMatch: 'full' },
    { path: 'ro', component: NewsletterComponent, pathMatch: 'full' },
    { path: '',   redirectTo: 'en', pathMatch: 'full' }, // redirect to `first-component`
    { path: '**', component: NotFoundComponent },  // Wildcard route for a 404 page
];

@NgModule({
    declarations: [
        NewsletterComponent,
        NewsletterHeaderComponent,
        NewsletterBodyComponent,
        NewsletterFooterComponent,
        BenefitBoxComponent,
        NewsletterBenefitsComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        SharedModule,
        CarouselModule,
        FormsModule
    ]
})
export class NewsletterModule { }
