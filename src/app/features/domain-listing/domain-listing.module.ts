import { NgModule } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { StripePaymentComponent } from "src/app/standalone-components/stripe-payment/stripe-payment.component";
import { DomainListingComponent } from "./domain-listing.component";
import { BannerClientComponent } from "./_components/banner-client/banner-client.component";
import { ToggleSectionsComponent } from "./_components/toggle-sections/toggle-sections.component";
import { PopularLocationsComponent } from "./_components/popular-locations/popular-locations.component";
import { ActivitiesComponent } from "./_components/activities/activities.component";
import { EditorialsSectionComponent } from "./_components/editorials-section/editorials-section.component";
import { SaleComponent } from "./_components/sale/sale.component";
import { ExperiencesComponent } from "./_components/experiences/experiences.component";
import { JobTradingsComponent } from "./_components/job-tradings/job-tradings.component";
import { EventsCarouselComponent } from "./_components/events-carousel/events-carousel.component";
import { EditorialsCarouselComponent } from "./_components/editorials-carousel/editorials-carousel.component";
import { DomainsSelectorComponent } from "../../standalone-components/domains-selector/domains-selector.component";
import { CategoryCardComponent } from "../../standalone-components/category-card/category-card.component";
import { CarouselModule } from "ngx-owl-carousel-o";
import { ResourceCardComponent } from "../../standalone-components/resource-card/resource-card.component";
import { EditorialCardComponent } from "../../standalone-components/editorial-card/editorial-card.component";
import { RouterModule, Routes } from "@angular/router";
import { SharedModule } from "../../shared/shared.module";
import { StaticCategoryListingComponent } from "../../standalone-components/static-category-listing/static-category-listing.component";
import { CategoryListingComponent } from "./category-listing/category-listing.component";
import { ResourceListingComponent } from "./resource-listing/resource-listing.component";
import { ResourceFilterBarComponent } from "./_components/resource-filter-bar/resource-filter-bar.component";
import {
  NgbAccordion,
  NgbNav,
  NgbNavContent,
  NgbNavItem,
  NgbNavLink,
  NgbNavOutlet,
  NgbPanel,
  NgbPanelContent,
  NgbPanelHeader,
  NgbPopoverModule,
} from "@ng-bootstrap/ng-bootstrap";
import { SidebarFiltersComponent } from "./_components/sidebar-filters/sidebar-filters.component";
import { ResourcesListComponent } from "./_components/resources-list/resources-list.component";
import {
  NGX_MAT_DATE_FORMATS,
  NgxMatDateFormats,
  NgxMatDatetimePickerModule,
} from "@angular-material-components/datetime-picker";
import { NgxMatMomentModule } from "@angular-material-components/moment-adapter";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";
import {
  MatMomentDateModule,
  MomentDateAdapter,
} from "@angular/material-moment-adapter";
import { ResourcesCarouselComponent } from "./_components/resources-carousel/resources-carousel.component";
import { ResourceCardWithTemplateComponent } from "../../standalone-components/resource-card-with-template/resource-card-with-template.component";
import { ViewSimpleResourceComponent } from "./view-simple-resource/view-simple-resource.component";
import { ResourceTabsComponent } from "./_components/resource-tabs/resource-tabs.component";
import { ResourceInformationComponent } from "./_components/resource-information/resource-information.component";
import { RoomCardComponent } from "../../standalone-components/room-card/room-card.component";
import { PlaneTicketsComponent } from "./transportation/plane-tickets/plane-tickets.component";
import { RoomsListComponent } from "./view-simple-resource/booking-type-tab-items/rooms-list/rooms-list.component";
import { TicketsListComponent } from "./view-simple-resource/booking-type-tab-items/tickets-list/tickets-list.component";
import { AvailablePlaneTicketsListComponent } from "./transportation/available-plane-tickets-list/available-plane-tickets-list.component";
import { TicketsFilterSidebarComponent } from "../../standalone-components/tickets-filter-sidebar/tickets-filter-sidebar.component";
import { TicketFilterPlusSidebarComponent } from "src/app/standalone-components/ticket-filter-plus-sidebar/ticket-filter-plus-sidebar.component";
import { AvailableTicketCardComponent } from "./transportation/components/available-ticket-card/available-ticket-card.component";
import { LocationCardComponent } from "./transportation/components/location-card/location-card.component";
import { CheckoutComponent } from "../../standalone-components/checkout/checkout.component";
import { BookingConfirmationComponent } from "../../standalone-components/booking-confirmation/booking-confirmation.component";
import { TrainTicketsComponent } from "./transportation/train-tickets/train-tickets.component";
import { AvailableTrainTicketsListComponent } from "./transportation/available-train-tickets-list/available-train-tickets-list.component";
import { MenuComponent } from "./view-simple-resource/booking-type-tab-items/menu/menu.component";
import { TimeSlotsListComponent } from "./view-simple-resource/booking-type-tab-items/time-slots-list/time-slots-list.component";
import { FormsModule } from "@angular/forms";
import { ProductsListComponent } from "./view-simple-resource/booking-type-tab-items/products-list/products-list.component";
import { ImagesGalleryComponent } from "../../standalone-components/images-gallery/images-gallery.component";
import { PickerItemsComponent } from "./view-simple-resource/booking-type-tab-items/picker-items/picker-items.component";
import { ResourceListMapComponent } from "./_components/resource-list-map/resource-list-map.component";
import { SharedExpMapComponent } from "./_components/shared-exp-map/shared-exp-map.component";
import { SeatSelectionComponent } from "./view-simple-resource/booking-type-tab-items/seat-selection/seat-selection.component";
import { SeatsViewerComponent } from "../../standalone-components/seats-viewer/seats-viewer.component";
import { CarRentalsComponent } from "./transportation/car-rentals/car-rentals.component";
import { AvailableCarRentalsListComponent } from "./transportation/available-car-rentals-list/available-car-rentals-list.component";
import { PlaneFiltersComponent } from "./transportation/components/plane-filters/plane-filters.component";
import { WithLoadingPipe } from "../../shared/_pipes/with-loading.pipe";
import { SelectedPlaneTicketComponent } from "./transportation/selected-plane-ticket/selected-plane-ticket.component";
import { FlightCheckoutComponent } from "./transportation/flight-checkout/flight-checkout.component";
import { NgxIntlTelInputModule } from "ngx-intl-tel-input";
import { MatSelectCountryModule } from "@angular-material-extensions/select-country";
import { HttpClientModule } from "@angular/common/http";
import { SegmentNameByIdPipe } from "./transportation/_pipes/segment-name-by-id.pipe";
import { TravelerTypeNamePipe } from "./transportation/_pipes/traveler-type-name.pipe";
import { IncludesPipe } from "../../shared/_pipes/includes.pipe";
import { PlaneTicketCardComponent } from "./transportation/components/plane-ticket-card/plane-ticket-card.component";
import { SegmentsWithNamePipe } from "./transportation/_pipes/segments-with-name.pipe";
import { HomepageComponent } from "src/app/components/homepage/homepage.component";
import { NavBarComponent } from "src/app/components/nav-bar/nav-bar.component";
import { SearchSectionComponent } from "src/app/components/search-section/search-section.component";
import { ImageGridComponent } from "src/app/components/image-grid/image-grid.component";
import { RestaurantMenuComponent } from "src/app/components/restaurant-menu/restaurant-menu.component";
import { ModalComponent } from "src/app/components/modal/modal.component";
import { RestaurantMenuItemComponent } from "src/app/components/restaurant-menu-item/restaurant-menu-item.component";
import { ResourceReservationComponent } from "src/app/components/resource-reservation/resource-reservation.component";
import { ImageCardComponent } from "src/app/components/image-card/image-card.component";
import { ResourcePresentationComponent } from "src/app/components/resource-presentation/resource-presentation.component";
import { InformationCardComponent } from "src/app/components/information-card/information-card.component";
import { AdditionalInformationComponent } from "src/app/components/additional-information/additional-information.component";
import { InfoCategoryComponent } from "src/app/components/info-category/info-category.component";
import { MapsBlurredComponent } from "src/app/components/maps-blurred/maps-blurred.component";
import { CardSliderComponent } from "src/app/components/card-slider/card-slider.component";
import { MainSearchComponent } from "src/app/components/main-search/main-search.component";
import { TwoColumnContainerComponent } from "src/app/components/two-column-container/two-column-container.component";
import { FooterNewComponent } from "src/app/components/footer/footer.component";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { AutoCompleteModule } from "primeng/autocomplete";
import { CalendarModule } from "primeng/calendar";
import { DropdownModule } from "primeng/dropdown";
import { InputNumberModule } from "primeng/inputnumber";
import { GoogleMapsModule } from "@angular/google-maps";
import { SelectButtonModule } from "primeng/selectbutton";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { MenubarModule } from "primeng/menubar";
import { ScrollerModule } from "primeng/scroller";
import { CarouselModule as PCarouselModule } from "primeng/carousel";
import { ListingComponent } from "src/app/components/listing/listing.component";
import { ListingFilterComponent } from "src/app/components/listing-filter/listing-filter.component";
import { AccordionModule } from "primeng/accordion";
import { CheckboxModule } from "primeng/checkbox";
import { SkeletonModule } from "primeng/skeleton";
import { PaginatorModule } from "primeng/paginator";
import { GalleriaModule } from "primeng/galleria";
import { CardModule } from "primeng/card";
import { ProgressBarModule } from "primeng/progressbar";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { ChipModule } from "primeng/chip";
import { TooltipModule } from "primeng/tooltip";
import { SliderModule } from "primeng/slider";
import { InputSwitchModule } from "primeng/inputswitch";
import { DialogModule } from "primeng/dialog";
import { RadioButtonModule } from "primeng/radiobutton";
import { ChipsModule } from "primeng/chips";
import { HotelsDashboardComponent } from "../hotels-dashboard/hotels-dashboard.component";
import { ApartmentsDetailsComponent } from "../../components/apartments-details/apartments-details.component";
import { HotelReservationFormComponent } from "../../components/hotel-reservation-form/hotel-reservation-form.component";
import { HotelSidebarFilterComponent } from "../hotels-dashboard/hotel-sidebar-filter/hotel-sidebar-filter.component";
import { HotelsOverviewComponent } from "../hotels-dashboard/hotels-overview/hotels-overview.component";
import { HotelCardComponent } from "../hotels-dashboard/hotel-card/hotel-card.component";
import { MapsModalComponent } from "./maps-modal/maps-modal.component";
import { HotelsCarouselComponent } from "src/app/components/hotels-carousel/hotels-carousel.component";
import { PrebookConfirmationComponent } from "../../components/hotel-reservation-form/dialog/prebook-confirmation.component";
import { PlaceCardComponent } from "src/app/components/place-card/place-card.component";
import { PlacesRowComponent } from "src/app/components/places-row/places-row.component";
import { EventCardListComponent } from "src/app/components/event-card-list/event-card-list.component";
import { EventCardComponent } from "src/app/components/event-card/event-card.component";
import { AiCardComponent } from "src/app/components/ai-card/ai-card.component";
import { MatSliderModule } from "@angular/material/slider";
import { DividerModule } from "primeng/divider";
import { EventCardMobileComponent } from "src/app/components/event-card-mobile/event-card-mobile.component";
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { HolidayCardComponent } from "src/app/components/holiday-card/holiday-card.component";

export const routes: Routes = [
  {
    path: "",
    component: DomainListingComponent,
    pathMatch: "full",
  },
  {
    path: ":domainId",
    component: HomepageComponent,
    pathMatch: "full",
  },
  {
    path: ":domainId/shared-experiences",
    loadChildren: () =>
      import("../shared-experiences/shared-experiences.module").then(
        (m) => m.SharedExperiencesModule
      ),
  },
  {
    path: ":domainId/trips",
    loadChildren: () =>
      import(
        "../client-trips-itineraries/client-trips-itineraries.module"
      ).then((m) => m.ClientTripsItinerariesModule),
  },
  {
    path: ":domainId/jobs",
    loadChildren: () => import("../jobs/jobs.module").then((m) => m.JobsModule),
  },
  {
    path: ":domainId/forum",
    loadChildren: () =>
      import("../forums/forums.module").then((m) => m.ForumsModule),
  },
  {
    path: ":domainId/:staticCategories",
    component: StaticCategoryListingComponent,
  },
  {
    path: ":domainId/category/:categoryId",
    component: CategoryListingComponent,
    pathMatch: "full",
  },
  {
    path: ":domainId/category/:categoryId/plane-tickets",
    component: PlaneTicketsComponent,
    pathMatch: "full",
  },
  {
    path: ":domainId/category/:categoryId/available-plane-tickets",
    component: AvailablePlaneTicketsListComponent,
    pathMatch: "full",
  },
  {
    path: ":domainId/category/:categoryId/available-plane-tickets/plane-ticket",
    component: SelectedPlaneTicketComponent,
    pathMatch: "full",
  },
  {
    path: ":domainId/category/:categoryId/available-plane-tickets/plane-ticket/checkout",
    component: FlightCheckoutComponent,
    pathMatch: "full",
  },
  {
    path: ":domainId/category/:categoryId/train-tickets",
    component: TrainTicketsComponent,
    pathMatch: "full",
  },
  {
    path: ":domainId/category/:categoryId/available-train-tickets",
    component: AvailableTrainTicketsListComponent,
    pathMatch: "full",
  },
  {
    path: ":domainId/category/:categoryId/available-train-tickets/checkout/:trainId",
    component: CheckoutComponent,
    pathMatch: "full",
  },
  {
    path: ":domainId/category/:categoryId/car-rentals",
    component: CarRentalsComponent,
    pathMatch: "full",
  },
  {
    path: ":domainId/category/:categoryId/available-car-rentals",
    component: AvailableCarRentalsListComponent,
    pathMatch: "full",
  },
  {
    path: ":domainId/category/:categoryId/available-car-rentals/checkout/:carId",
    component: CheckoutComponent,
    pathMatch: "full",
  },
  {
    path: ":domainId/category/:categoryId/resource-type/:resourceTypeId",
    component: ResourceListingComponent,
    pathMatch: "full",
  },
  {
    path: ":domainId/category/:categoryId/resource-type/:resourceTypeId/resources-map",
    component: ResourceListMapComponent,
    pathMatch: "full",
  },
  {
    path: ":domainId/category/:categoryId/resource-type/:resourceTypeId/view/:resourceId",
    component: ViewSimpleResourceComponent,
    pathMatch: "full",
  },
  {
    path: ":domainId/category/:categoryId/resource-type/:resourceTypeId/view/:resourceId/checkout",
    component: CheckoutComponent,
    pathMatch: "full",
  },
  {
    path: ":domainId/category/:categoryId/forum",
    loadChildren: () =>
      import("../forums/forums.module").then((m) => m.ForumsModule),
  },
];

// If using Moment
const CUSTOM_MOMENT_FORMATS: NgxMatDateFormats = {
  parse: {
    dateInput: "DD MM YYYY HH:mm",
  },
  display: {
    dateInput: "DD MM YYYY HH:mm",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY",
  },
};

export const MY_FORMATS = {
  parse: {
    dateInput: "DD-MM-YYYY",
  },
  display: {
    dateInput: "DD-MM-YYYY",
    monthYearLabel: "YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "YYYY",
  },
};

@NgModule({
  declarations: [
    DomainListingComponent,
    BannerClientComponent,
    ToggleSectionsComponent,
    PopularLocationsComponent,
    ActivitiesComponent,
    EditorialsSectionComponent,
    SaleComponent,
    ExperiencesComponent,
    JobTradingsComponent,
    EventsCarouselComponent,
    EditorialsCarouselComponent,
    CategoryListingComponent,
    ResourceListingComponent,
    ResourceFilterBarComponent,
    SidebarFiltersComponent,
    ResourcesListComponent,
    ResourcesCarouselComponent,
    ViewSimpleResourceComponent,
    ResourceTabsComponent,
    ResourceInformationComponent,
    PlaneTicketsComponent,
    AvailablePlaneTicketsListComponent,
    AvailableTicketCardComponent,
    LocationCardComponent,
    RoomsListComponent,
    TicketsListComponent,
    TrainTicketsComponent,
    AvailableTrainTicketsListComponent,
    MenuComponent,
    TimeSlotsListComponent,
    ProductsListComponent,
    PickerItemsComponent,
    ResourceListMapComponent,
    SharedExpMapComponent,
    CarRentalsComponent,
    AvailableCarRentalsListComponent,
    SeatSelectionComponent,
    SelectedPlaneTicketComponent,
    FlightCheckoutComponent,
    SegmentNameByIdPipe,
    TravelerTypeNamePipe,
    PlaneTicketCardComponent,
    SegmentsWithNamePipe,
    SearchSectionComponent,
    ImageCardComponent,
    MainSearchComponent,
    HomepageComponent,
    TwoColumnContainerComponent,
    CardSliderComponent,
    ListingComponent,
    ListingFilterComponent,
    ImageGridComponent,
    AdditionalInformationComponent,
    MapsBlurredComponent,
    InformationCardComponent,
    InfoCategoryComponent,
    ResourcePresentationComponent,
    RestaurantMenuComponent,
    RestaurantMenuItemComponent,
    ResourceReservationComponent,
    HotelsDashboardComponent,
    HotelSidebarFilterComponent,
    HotelsOverviewComponent,
    HotelCardComponent,
    ModalComponent,
    MapsModalComponent,
    ApartmentsDetailsComponent,
    PrebookConfirmationComponent,
    HotelReservationFormComponent,
    HotelsCarouselComponent,
    PlaceCardComponent,
    PlacesRowComponent,
    EventCardComponent,
    EventCardListComponent,
    AiCardComponent,
    HolidayCardComponent,
    EventCardMobileComponent,
    // NavBarComponent,
  ],
  imports: [
    CommonModule,
    DomainsSelectorComponent,
    CategoryCardComponent,
    ResourceCardComponent,
    EditorialCardComponent,
    RouterModule.forChild(routes),
    SharedModule,
    CarouselModule,
    NgbAccordion,
    NgbPanel,
    NgbPanelContent,
    NgbPanelHeader,
    NgxMatMomentModule,
    NgxMatDatetimePickerModule,
    MatMomentDateModule,
    ResourceCardWithTemplateComponent,
    NgbNav,
    NgbNavItem,
    NgbNavLink,
    NgbNavContent,
    NgbNavOutlet,
    TicketsFilterSidebarComponent,
    TicketFilterPlusSidebarComponent,
    NgbNavOutlet,
    RoomCardComponent,
    FormsModule,
    ImagesGalleryComponent,
    CheckoutComponent,
    BookingConfirmationComponent,
    NgbPopoverModule,
    SeatsViewerComponent,
    PlaneFiltersComponent,
    WithLoadingPipe,
    NgxIntlTelInputModule,
    MatSelectCountryModule,
    HttpClientModule,
    IncludesPipe,
    ButtonModule,
    InputTextModule,
    AutoCompleteModule,
    CalendarModule,
    DropdownModule,
    InputNumberModule,
    GoogleMapsModule,
    SelectButtonModule,
    OverlayPanelModule,
    MenubarModule,
    FooterNewComponent,
    ScrollerModule,
    PCarouselModule,
    AccordionModule,
    CheckboxModule,
    SkeletonModule,
    PaginatorModule,
    GalleriaModule,
    CardModule,
    ProgressBarModule,
    TooltipModule,
    ProgressSpinnerModule,
    ChipModule,
    InputSwitchModule,
    DialogModule,
    RadioButtonModule,
    ChipsModule,
    NgOptimizedImage,
    SliderModule,
    DividerModule,
    NgbTooltipModule,
    StripePaymentComponent,
  ],
  exports: [
    ActivitiesComponent,
    ListingFilterComponent,
    CardSliderComponent,
    MainSearchComponent,
    ImageGridComponent,
    PlaceCardComponent,
    PlacesRowComponent,
    EventCardComponent,
    EventCardListComponent,
    AiCardComponent,
    EventCardMobileComponent,
    HolidayCardComponent,
  ],
  providers: [
    { provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_MOMENT_FORMATS },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class DomainListingModule {}
