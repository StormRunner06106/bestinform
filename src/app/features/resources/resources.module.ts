import {NgModule} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {ResourcesRoutingModule} from './resources-routing.module';
import {AddResourceComponent} from './pages/add-resource/add-resource.component';
import {ResourcesComponent} from './resources.component';
import {RouterModule} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ResourceRadioOptionComponent} from './components/resource-radio-option/resource-radio-option.component';
import {StepperTitleListComponent} from './components/stepper-title-list/stepper-title-list.component';
import {OrderByPipe} from "./_pipes/orderBy.pipe";

import {SharedModule} from "../../shared/shared.module";
import {ResourcesListComponent} from './pages/resources-list/resources-list.component';
import {
    RentalBookingComponent
} from './components/stepper-content/configurate-edit/setup/rental-booking/rental-booking.component';
import {
    AddEditRoomModalComponent
} from './components/stepper-content/configurate-edit/setup/rental-booking/add-edit-room-modal/add-edit-room-modal.component';
import {DashboardHeaderComponent} from "../../standalone-components/dashboard-header/dashboard-header.component";
import {
    AddNewTemplateComponent
} from './components/stepper-content/add-mode/add-new-template/add-new-template.component';
import {
    GeneralInformationsComponent
} from './components/stepper-content/configurate-edit/general-informations/general-informations.component';
import {FacilitiesComponent} from './components/stepper-content/configurate-edit/facilities/facilities.component';
import {PolicyComponent} from './components/stepper-content/configurate-edit/policy/policy.component';
import {PaymentComponent} from './components/stepper-content/configurate-edit/payment/payment.component';
import {GalleryComponent} from './components/stepper-content/configurate-edit/gallery/gallery.component';
import { DeleteRoomModalComponent } from './components/stepper-content/configurate-edit/setup/rental-booking/delete-room-modal/delete-room-modal.component';
import {NoBookingComponent} from "./components/stepper-content/configurate-edit/setup/no-booking/no-booking.component";
import { TicketBookingComponent } from './components/stepper-content/configurate-edit/setup/ticket-booking/ticket-booking.component';
import { ServiceBookingTimeSlotsComponent } from './components/stepper-content/configurate-edit/setup/service-booking-time-slots/service-booking-time-slots.component';
import { ProductsListComponent } from './components/stepper-content/configurate-edit/setup/products-list/products-list.component';
import { ExternalUrlComponent } from './components/stepper-content/configurate-edit/setup/external-url/external-url.component';
import { ApplyJobComponent } from './components/stepper-content/configurate-edit/setup/apply-job/apply-job.component';
import { CulturalBookingComponent } from './components/stepper-content/configurate-edit/setup/cultural-booking/cultural-booking.component';
import { CarBookingComponent } from './components/stepper-content/configurate-edit/setup/car-booking/car-booking.component';
import { MenuComponent } from './components/stepper-content/configurate-edit/setup/menu/menu.component';
import { AddEditTicketComponent } from './components/stepper-content/configurate-edit/setup/ticket-booking/add-edit-ticket/add-edit-ticket.component';
import {TicketCardComponent} from "../../standalone-components/ticket-card/ticket-card.component";
import { DeleteTicketComponent } from './components/stepper-content/configurate-edit/setup/ticket-booking/delete-ticket/delete-ticket.component';
import { PolicyRentalBookingComponent } from './components/stepper-content/configurate-edit/policy/policy-rental-booking/policy-rental-booking.component';
import { AddEditProductComponent } from './components/stepper-content/configurate-edit/setup/products-list/add-edit-product/add-edit-product.component';
import {ProductPreviewComponent} from "../../standalone-components/product-preview/product-preview.component";
import { DeleteProductModalComponent } from './components/stepper-content/configurate-edit/setup/products-list/delete-product-modal/delete-product-modal.component';
import { AddEditServiceComponent } from './components/stepper-content/configurate-edit/setup/service-booking-time-slots/add-edit-service/add-edit-service.component';
import { DeleteModalServiceComponent } from './components/stepper-content/configurate-edit/setup/service-booking-time-slots/delete-modal-service/delete-modal-service.component';
import {
    ServiceTimeslotPreviewComponent
} from "../../standalone-components/service-timeslot-preview/service-timeslot-preview.component";
import { NoPolicyComponent } from './components/stepper-content/configurate-edit/policy/no-policy/no-policy.component';
import { RestaurantPolicyComponent } from './components/stepper-content/configurate-edit/policy/restaurant-policy/restaurant-policy.component';
import { AddEditCategoryComponent } from './components/stepper-content/configurate-edit/setup/menu/add-edit-category/add-edit-category.component';
import { DeleteMenuCategoryComponent } from './components/stepper-content/configurate-edit/setup/menu/delete-menu-category/delete-menu-category.component';
import {NgxMatDatetimePickerModule, NgxMatTimepickerModule} from "@angular-material-components/datetime-picker";
import {SeatsViewerComponent} from "../../standalone-components/seats-viewer/seats-viewer.component";
import { PolicyCulturalBookingComponent } from './components/stepper-content/configurate-edit/policy/policy-cultural-booking/policy-cultural-booking.component';
import { CulturalRelatedResComponent } from './components/stepper-content/configurate-edit/related-resource/cultural-related-res/cultural-related-res.component';
import { SharedExperiencesListComponent } from './components/shared-experiences-list/shared-experiences-list.component';
import {MatLegacyTableModule} from "@angular/material/legacy-table";
import { ProviderCreateSharedExperienceComponent } from './components/provider-create-shared-experience/provider-create-shared-experience.component';
import { ProviderLobbyComponent } from './components/provider-lobby/provider-lobby.component';
import {DisplayUserComponent} from "../../standalone-components/display-user/display-user.component";
import {
    SharedExperiencesInfoComponent
} from "../../standalone-components/shared-experiences-info/shared-experiences-info.component";
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { KeyFilterModule } from 'primeng/keyfilter';
import {GoogleMap, MapMarker} from "@angular/google-maps";
import {NgxIntlTelInputModule} from "ngx-intl-tel-input";





@NgModule({
    imports: [
        CommonModule,
        ResourcesRoutingModule,
        RouterModule,
        ReactiveFormsModule,
        SharedModule,
        FormsModule,
        DashboardHeaderComponent,
        TicketCardComponent,
        ProductPreviewComponent,
        ServiceTimeslotPreviewComponent,
        NgxMatTimepickerModule,
        NgxMatDatetimePickerModule,
        SeatsViewerComponent,
        MatLegacyTableModule,
        DisplayUserComponent,
        SharedExperiencesInfoComponent,
        ButtonModule,
        InputTextModule,
        InputTextareaModule,
        KeyFilterModule,
        NgOptimizedImage,
        GoogleMap,
        MapMarker,
        NgxIntlTelInputModule,
        GoogleMap,
        MapMarker
    ],
    exports: [
        ServiceBookingTimeSlotsComponent,
        OrderByPipe
    ],
    declarations: [
        AddResourceComponent,
        ResourcesComponent,
        ResourceRadioOptionComponent,
        StepperTitleListComponent,
        OrderByPipe,
        ResourcesListComponent,
        RentalBookingComponent,
        AddEditRoomModalComponent,
        AddNewTemplateComponent,
        GeneralInformationsComponent,
        FacilitiesComponent,
        PolicyComponent,
        PaymentComponent,
        GalleryComponent,
        DeleteRoomModalComponent,
        NoBookingComponent,
        TicketBookingComponent,
        ServiceBookingTimeSlotsComponent,
        ProductsListComponent,
        ExternalUrlComponent,
        ApplyJobComponent,
        CulturalBookingComponent,
        CarBookingComponent,
        MenuComponent,
        AddEditTicketComponent,
        DeleteTicketComponent,
        PolicyRentalBookingComponent,
        AddEditProductComponent,
        DeleteProductModalComponent,
        AddEditServiceComponent,
        DeleteModalServiceComponent,
        NoPolicyComponent,
        RestaurantPolicyComponent,
        AddEditCategoryComponent,
        DeleteMenuCategoryComponent,
        PolicyCulturalBookingComponent,
        CulturalRelatedResComponent,
        SharedExperiencesListComponent,
        ProviderCreateSharedExperienceComponent,
        ProviderLobbyComponent
    ]
})
export class ResourcesModule {
}
