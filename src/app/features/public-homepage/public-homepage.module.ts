import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HomepageComponent} from "./components/homepage/homepage.component";
import {PublicHomepageComponent} from "./public-homepage.component";
import {RouterModule, Routes} from "@angular/router";
import {PublicHeaderComponent} from './components/public-header/public-header.component';
import {PublicFooterComponent} from './components/public-footer/public-footer.component';
import {SharedModule} from "../../shared/shared.module";
import {HeroSectionComponent} from './components/hero-section/hero-section.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AuthModule} from "../auth/auth.module";
import {TranslateModule} from "@ngx-translate/core";
import {LazyLoadImageModule} from 'ng-lazyload-image';
import {ActivateUsersComponent} from "./activate-users/activate-users.component";
import {HomepageGiveawayComponent} from "./components/giveaway/homepage-giveaway.component";
import {_MatCheckboxRequiredValidatorModule} from "@angular/material/checkbox";
import {ChipModule} from "primeng/chip";
import {ButtonModule} from "primeng/button";
import {DialogModule} from "primeng/dialog";
import {DomainListingModule} from "../domain-listing/domain-listing.module";
import {SliderModule} from "primeng/slider";
import {CarouselModule} from "primeng/carousel";
import {DropdownModule} from "primeng/dropdown";

export const routes: Routes = [
    { path: '', component: PublicHomepageComponent},
    { path: 'activate-user', component: ActivateUsersComponent},

];

@NgModule({
    declarations: [
        HomepageComponent,
        PublicHomepageComponent,
        PublicHeaderComponent,
        PublicFooterComponent,
        HeroSectionComponent,
        ActivateUsersComponent,
        HomepageGiveawayComponent
    ],
    exports: [
        PublicFooterComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        AuthModule,
        TranslateModule,
        LazyLoadImageModule,
        SharedModule,
        _MatCheckboxRequiredValidatorModule,
        ChipModule,
        ButtonModule,
        DialogModule,
        CarouselModule,
        DropdownModule
    ]
})
export class PublicHomepageModule { }
