import { BreakpointObserver } from "@angular/cdk/layout";
import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import {
  Subscription,
  takeUntil,
  Subject,
  debounceTime,
  distinctUntilChanged,
} from "rxjs";
import { User } from "src/app/shared/_models/user.model";
import { AuthService } from "src/app/shared/_services/auth.service";
import { GeolocationService } from "src/app/shared/_services/geolocation.service";
import { LocalStorageService } from "src/app/shared/_services/localStorage.service";
import { ResourceFilterService } from "src/app/shared/_services/resource-filter.service";
import { SessionStorageService } from "src/app/shared/_services/sessionStorage.service";

@Component({
  selector: "app-listing",
  templateUrl: "./listing.component.html",
  styleUrls: ["./listing.component.scss"],
  // providers: [MatDialog ,  { provide: MAT_DIALOG_DATA, useValue: {} }, ]
})
export class ListingComponent implements OnInit, OnDestroy {
  titles;
  listings = [];
  currentUser: User;
  subs: Subscription[] = [];
  options;
  overlays: any[];
  totalRecords: number;
  rows: number;
  private ngUnsubscribe = new Subject<void>();
  resourceLoaded = false;
  private resourceSubscription: Subscription;
  private restaurantSubscription: Subscription;
  cityName: string;
  restaurantSearch: FormControl = new FormControl("");
  @Input() listType: string;
  favExists = false;
  favs = [];

  sortOptions = [
    {
      name: "Rating Crescator",
      value: "rating_asc",
      direction: "ASC",
      key: "rating-1",
    },
    {
      name: "Rating Descrescator",
      value: "rating_desc",
      direction: "DESC",
      key: "rating-2",
    },
  ];

  selectedOption: any;

  isMobile: boolean;

  private readonly subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private resourceFilterService: ResourceFilterService,
    private sessionStorageService: SessionStorageService,
    private router: Router,
    private geolocationService: GeolocationService,
    public localStorage:LocalStorageService,
    private readonly _breakPointObserver: BreakpointObserver
  ) {}

  setRestaurantFilters(lat, long, peopleNumber, date) {
    this.resourceFilterService.setLocationSubject({
      x: long,
      y: lat,
    });

    this.resourceFilterService.setPeopleNumberSubject(peopleNumber);

    this.resourceFilterService.setRestaurantReservationDateSubject(date);
  }

  convertDate(date, hour) {
    const restaurantDate = new Date(date);

    const year = restaurantDate.getFullYear();
    const month = restaurantDate.getMonth() + 1;
    const day = restaurantDate.getDate();

    const [hours, minutes] = hour.split(":");

    const combinedDateTime = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}T${hours}:${minutes}:00`;
    return combinedDateTime;
  }

  ngOnInit(): void {
    this.subscribeToList();
    this.setupSearch();

    this.subscriptions.add(
      this._breakPointObserver.observe(['(max-width: 980px)']).subscribe((result)=> this.isMobile = result.breakpoints['(max-width: 980px)'])
    );

    console.log(this.sessionStorageService.get("filterType"), "GET local set");

    const sub = this.authService.getCurrentUser().subscribe((user) => {
      this.currentUser = user;

      if (JSON.parse(this.sessionStorageService.get("filters"))) {
        const filters = JSON.parse(this.sessionStorageService.get("filters"));
        this.setRestaurantFilters(
          filters.geographicalCoordinates.latitude,
          filters.geographicalCoordinates.longitude,
          filters.timePickerSearch.adults + filters.timePickerSearch.children,
          this.convertDate(
            filters.timePickerSearch.timePickerDate,
            filters.timePickerSearch.timePickerHour,
          ),
        );

        this.geolocationService
          .getCityName(
            filters.geographicalCoordinates.latitude,
            filters.geographicalCoordinates.longitude,
          )
          .then((cityName) => {
            // this.resourceFilterService
            //   .getRestaurants(undefined)
            //   .pipe(takeUntil(this.ngUnsubscribe))
            //   .subscribe();
            //
            // this.resourceFilterService
            //   .getFavoriteRestaurants(this.currentUser.id)
            //   .pipe(takeUntil(this.ngUnsubscribe))
            //   .subscribe();

            this.cityName = cityName;
          });
      }
    });

    this.getTitles();

    this.subs.push(sub);
    this.subs.push(this.resourceSubscription);
  }

  calculatePageLinkSize(): number {
    return window.innerWidth < 980 ? 2 : 5;
  }

  onSortChange($event) {
    console.log($event.value);
    this.resourceFilterService
      .getRestaurants(undefined, {
        sortBy: "rating",
        dir: $event.value.direction,
      })
      .subscribe();
  }

  setupSearch() {
    this.restaurantSearch.valueChanges
      .pipe(
        debounceTime(1300), // Wait for 2000 milliseconds of inactivity
        distinctUntilChanged(), // Only emit when the current value is different from the last
      )
      .subscribe((value) => {
        this.resourceFilterService
          .getRestaurants(undefined, { name: value ? value : undefined })
          .subscribe();
      });
  }

  private subscribeToList() {
    switch (this.listType) {
      case "restaurants":
        this.resourceFilterService.totalRestaurants$.subscribe((total) => {
          this.totalRecords = total;
        });

        this.resourceFilterService.favRestaurants$.subscribe((fav) => {
          this.favExists = fav.length > 0;
          this.favs = fav;
        });
        this.resourceSubscription =
          this.resourceFilterService.restaurantListObj$.subscribe({
            next: (data) => {
              if (data) {
                // Handle the data here
                this.listings = this.constructListingCard(data);
                this.rows = 10;
                this.resourceLoaded = true;
              }
            },
            error: (error) => {
              // Handle errors if any
              console.error("Error:", error);
            },
            complete: () => {
              // Handle completion if needed
              console.log("Subscription completed");
            },
          });
        break;
      case "hotels":
        //TODO: Add new observable for Hotel results, and subscribe to it when the endpoint is ready

        // (this.resourceSubscription =
        //   this.resourceFilterService.restaurantListObj$.subscribe({
        //     next: (data) => {
        //       if (data) {
        //         // Handle the data here
        //         this.listings = this.constructListingCard(data);
        //         this.rows = 10
        //         this.resourceLoaded = true;
        //       }
        //     },
        //     error: (error) => {
        //       // Handle errors if any
        //       console.error("Error:", error);
        //     },
        //     complete: () => {
        //       // Handle completion if needed
        //       console.log("Subscription completed");
        //     },
        //   }));
        break;
      default:
        break;
    }
  }

  private constructListingCard(resource: any) {
    const regexForReservationPolicy: RegExp = /\d+/g;
    const listings = resource.map((item) => {
      return {
        cardText: {
          title: item.name,
          address: item.address,
          sub_address: "",
          priceCategory: "RESTAURANTS.PRICE_CATEGORY",
          otherInfo: `Nota medie: de la ${item.avgPrice || 0} lei`,
          specific: item.specific,
          available_seats: item.available,
          rating: `${item.rating}+`,
          discount: !+item?.reservationPolicy?.match(regexForReservationPolicy)?.[0]
        },
        available: item.available,
        id: item._id,
        imageUrl: item.featuredImage,
      };
    });
    return listings;
  }

  navigateToDetails(listing) {
    console.log(listing)
    console.log(this.listType);

    switch (this.listType) {
      case "restaurants":
        this.router.navigate([
          "/client/domain/63bfcca765dc3f3863af755c/category/63dbb183df393f737216183c/resource-type/63dbb18cdf393f737216183d/view/",
          listing.id,
        ]);
        break;

      case "hotels":
        this.router.navigate([
          "/client/domain/63bfcca765dc3f3863af755c/category/63d2ae569d6ce304608d1a88/resource-type/63d8d4a9d2180d7935acb4e0/view/",
          listing.id,
        ]);
        break;
      default:
        break;
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();

    this.subs.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  get placeholder() {
    // TODO: Add strings for more resource types
    switch (this.listType) {
      case "restaurants":
        return "Cauta Restaurante..";
      case "hotels":
        return "Cauta Proprietati..";
      default:
        return "";
    }
  }

  get translationKey() {
    // TODO: Add strings for more resource types
    switch (this.listType) {
      case "restaurants":
        return "RESTAURANTS.RECOMMENDED_RESTAURANT";
      case "hotels":
        return "HOTELS.RECOMMENDED_HOTEL";
      default:
        return "";
    }
  }

  get title() {
    const selectedCoords = JSON.parse(this.localStorage.get('filters'))?.location?.match(/(.+?)(?=,)/)?.[0];
    if (!selectedCoords)
    switch (this.listType) {
      case "restaurants":
        return this.resourceFilterService.totalResultsSubject.getValue() + " Restaurante disponibile in " + JSON.parse(this.localStorage.get('filters'))?.location;
      case "hotels":
        return "HOTELS.RECOMMENDED_HOTEL";
      default:
        return "";
    }
  }

  getTitles() {
    this.titles = {
      restaurant: "Restaurante recomandate de Bestinform pentru",
    };
  }

  onPageChange(event) {
    const filters = JSON.parse(localStorage.getItem("filters"));
    this.resourceFilterService
      .getRestaurants(event.page, filters)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe();
  }
}
