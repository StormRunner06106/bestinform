import { HolidayBookComponent } from "./../holiday-book/holiday-book.component";
import { HolidayListingComponent } from "./../../components/holiday-listing/holiday-listing.component";
import { NgModule } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { NavBarComponent } from "src/app/components/nav-bar/nav-bar.component";
import { EventDetailsMainComponent } from "src/app/standalone-components/event-details-main/event-details-main.component";
import { EventDetailsComponent } from "src/app/standalone-components/event-details/event-details.component";
import { EventsTicketsComponent } from "src/app/standalone-components/events-tickets/events-tickets.component";
import { PaymentProcessingComponent } from "src/app/standalone-components/payment-processing/payment-processing.component";
import { DeleteClientComponent } from "./delete-client/delete-client.component";
import { RouterModule, Routes } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { ClientPaymentMethodsComponent } from "./client-payment-methods/client-payment-methods.component";
import { ClientComponent } from "./client-view/client.component";
import { ClientBookingsComponent } from "./client-bookings/client-bookings.component";
import { ClientProfileComponent } from "./_components/client-profile/client-profile.component";
import { SharedModule } from "../../shared/shared.module";
import { ClientSiteComponent } from "./client-site/client-site.component";
import { ClientDashboardComponent } from "./client-dashboard/client-dashboard.component";
import { FaqFooterComponent } from "./_components/faq-footer/faq-footer.component";
import { FooterComponent } from "../../standalone-components/footer/footer.component";
import { HeaderComponent } from "../../standalone-components/header/header.component";
import { MenuComponent } from "../../standalone-components/menu/menu.component";
import { DashboardHeaderComponent } from "../../standalone-components/dashboard-header/dashboard-header.component";
import { EditAccountComponent } from "../../standalone-components/edit-account/edit-account.component";
import { ChangePassComponent } from "../../standalone-components/change-pass/change-pass.component";
import { ResourceCardComponent } from "../../standalone-components/resource-card/resource-card.component";
import { CarouselModule } from "ngx-owl-carousel-o";
import { ViewClientReservationComponent } from "./view-client-reservation/view-client-reservation.component";
import { ReservationsComponent } from "../reservations/reservations.component";
import { ReservationsModule } from "../reservations/reservations.module";
import { FavoriteResourceCardComponent } from "../../standalone-components/favorite-resource-card/favorite-resource-card.component";
import { ClientInboxComponent } from "./client-inbox/client-inbox.component";
import { ConversationItemCardComponent } from "./_components/conversation-item-card/conversation-item-card.component";
import { ViewClientMessagesComponent } from "./view-client-messages/view-client-messages.component";
import { ConversationComponent } from "src/app/standalone-components/conversation/conversation.component";
import { AllNotificationsComponent } from "src/app/standalone-components/all-notifications/all-notifications.component";
import { SettingsComponent } from "./settings/settings.component";
import { BookingConfirmationComponent } from "../../standalone-components/booking-confirmation/booking-confirmation.component";
import { EnrollmentComponent } from "./enrollment/enrollment.component";
import { WelcomeScreenComponent } from "./enrollment/enrollment-steps/welcome-screen/welcome-screen.component";
import { ClientPreferencesComponent } from "./enrollment/enrollment-steps/client-preferences/client-preferences.component";
import { UserDataComponent } from "./enrollment/enrollment-steps/user-data/user-data.component";
import { FinishEnrollmentComponent } from "./enrollment/enrollment-steps/finish-enrollment/finish-enrollment.component";
import { ClientTripBookingsComponent } from "./client-bookings/client-trip-bookings/client-trip-booking.component";
import { ItineraryBookingsComponent } from "./itinerary-bookings/itinerary-bookings.component";
import { UserSettingsComponent } from "../../standalone-components/user-settings/user-settings.component";
import { TrialActiveComponent } from "./enrollment/enrollment-steps/trial-active/trial-active.component";
import { CancelReservationModalComponent } from "../reservations/cancel-reservation-modal/cancel-reservation-modal.component";
import { FlightBookingsComponent } from "./client-bookings/flight-bookings/flight-bookings.component";
import { FlightReservationsListComponent } from "../reservations/flight-reservations-list/flight-reservations-list.component";
import { FooterNewComponent } from "src/app/components/footer/footer.component";
import { FeatureEditorialsComponent } from "../../components/feature-editorials/feature-editorials.component";
import * as path from "path";
import { FeatureEditorialsContentComponent } from "../../components/feature-editorials/feature-editorials-content/feature-editorials-content.component";
import { HolidayComponent } from "../holidays/holiday.component";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatButtonModule } from "@angular/material/button";
import { MatMenuModule } from "@angular/material/menu";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/compiler";
import { BookDetailComponent } from "../holiday-book/detail/book-detail.component";

export const routes: Routes = [
  {
    path: "",
    component: ClientSiteComponent,
    children: [
      {
        path: "events",
        loadChildren: () =>
          import("../events/events.module").then((m) => m.EventsModule),
      },
      {
        path: "event",
        loadComponent: () =>
          import(
            "src/app/standalone-components/event-details/event-details.component"
          ).then((m) => m.EventDetailsComponent),
        children: [
          { path: "description", component: EventDetailsMainComponent },
          { path: "tickets", component: EventsTicketsComponent },
          { path: "", redirectTo: "description", pathMatch: "full" },
        ],
      },
      {
        path: "editorials",
        loadChildren: () =>
          import("../editorials/editorials.module").then(
            (m) => m.EditorialsModule
          ),
      },
      {
        path: "payment-processing",
        loadComponent: () =>
          import(
            "src/app/standalone-components/payment-processing/payment-processing.component"
          ).then((m) => m.PaymentProcessingComponent),
      },
      {
        path: "domain",
        loadChildren: () =>
          import("../domain-listing/domain-listing.module").then(
            (m) => m.DomainListingModule
          ),
      },
      {
        path: "booking-confirmation",
        component: BookingConfirmationComponent,
      },
      {
        path: "content",
        loadChildren: () =>
          import("../secondary-pages/secondary-pages.module").then(
            (m) => m.SecondaryPagesModule
          ),
      },
      {
        path: "enroll",
        component: EnrollmentComponent,
      },
      { path: "", redirectTo: "domain", pathMatch: "full" },
    ],
  },
  {
    path: "dashboard",
    component: ClientDashboardComponent,
    children: [
      { path: "profile", component: ClientComponent },
      { path: "my-account", component: EditAccountComponent },
      { path: "payment", component: ClientPaymentMethodsComponent },
      { path: "my-bookings", component: ClientBookingsComponent },
      { path: "editorials", component: FeatureEditorialsComponent },
      { path: "editorials/:id", component: FeatureEditorialsContentComponent },
      { path: "flight-bookings", component: FlightBookingsComponent },
      { path: "trip-bookings", component: ClientTripBookingsComponent },
      { path: "itinerary-bookings/:id", component: ItineraryBookingsComponent },
      { path: "inbox", component: ClientInboxComponent },
      { path: "inbox/:idConversation", component: ViewClientMessagesComponent },
      { path: "all-notifications", component: AllNotificationsComponent },
      {
        path: "holidays",
        component: HolidayComponent,
      },
      {
        path: "holidays/:id",
        component: HolidayBookComponent,
      },
      {
        path: "holidays/:id/:categoryId",
        component: BookDetailComponent,
      },
      {
        path: "my-forum",
        loadChildren: () =>
          import("../forums/forums.module").then((m) => m.ForumsModule),
      },
      {
        path: "my-booking",
        loadChildren: () =>
          import("../reservations/reservations.module").then(
            (m) => m.ReservationsModule
          ),
      },
      { path: "change-password", component: ChangePassComponent },
      { path: "delete-account", component: DeleteClientComponent },
      { path: "settings", component: SettingsComponent },
      { path: "", redirectTo: "profile", pathMatch: "full" },
    ],
  },
];

@NgModule({
  declarations: [
    DeleteClientComponent,
    ClientPaymentMethodsComponent,
    ClientComponent,
    ClientBookingsComponent,
    ClientProfileComponent,
    ClientSiteComponent,
    ClientDashboardComponent,
    FaqFooterComponent,
    ViewClientReservationComponent,
    ClientInboxComponent,
    ConversationItemCardComponent,
    ViewClientMessagesComponent,
    SettingsComponent,
    EnrollmentComponent,
    WelcomeScreenComponent,
    ClientPreferencesComponent,
    UserDataComponent,
    FinishEnrollmentComponent,
    ClientTripBookingsComponent,
    ItineraryBookingsComponent,
    TrialActiveComponent,
    FlightBookingsComponent,
  ],
  exports: [UserDataComponent],
  imports: [
    CommonModule,
    NgOptimizedImage,
    RouterModule.forChild(routes),
    TranslateModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatDatepickerModule,
    SharedModule,
    FooterComponent,
    HeaderComponent,
    MenuComponent,
    DashboardHeaderComponent,
    ResourceCardComponent,
    CarouselModule,
    FavoriteResourceCardComponent,
    ConversationComponent,
    AllNotificationsComponent,
    UserSettingsComponent,
    FooterNewComponent,
    NavBarComponent,
    MatMenuModule,
    MatButtonModule,
    // ReservationsModule,
    // ReservationsModule
  ],
  providers: [],
  bootstrap: [],
})
export class RoleClientModule {}
