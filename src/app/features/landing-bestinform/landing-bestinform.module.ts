import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingBestinformComponent } from './landing-bestinform.component';
import {RouterModule, Routes} from "@angular/router";
import {NotFoundComponent} from "../not-found/not-found.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatButtonModule} from "@angular/material/button";
import {MatInputModule} from "@angular/material/input";
import {CarouselModule} from "ngx-owl-carousel-o";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {
    RECAPTCHA_SETTINGS, RECAPTCHA_V3_SITE_KEY,
    RecaptchaFormsModule,
    RecaptchaModule,
    RecaptchaSettings,
    RecaptchaV3Module
} from "ng-recaptcha";
import {environment} from "../../../environments/environment";


export const routes: Routes = [
  { path: 'en', component: LandingBestinformComponent, pathMatch: 'full' },
  { path: 'ro', component: LandingBestinformComponent, pathMatch: 'full' },
  { path: '',   redirectTo: 'en', pathMatch: 'full' }, // redirect to `first-component`
  { path: '**', component: NotFoundComponent },  // Wildcard route for a 404 page
];


@NgModule({
  declarations: [
    LandingBestinformComponent
  ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        CarouselModule,
        MatCheckboxModule,
        RecaptchaModule,
        RecaptchaFormsModule,
    ],
    providers: [
        {
            provide: RECAPTCHA_SETTINGS,
            useValue: {
                siteKey: '6Ldn1F0oAAAAAGsXgMLrKkl6i-16owTvR8TQ4vXR',
            } as RecaptchaSettings,
        },
    ],
})
export class LandingBestinformModule { }
