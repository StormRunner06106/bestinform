import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild,} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {SelectItem} from "primeng/api/selectitem";
import * as _ from "lodash";
import {animate, state, style, transition, trigger,} from "@angular/animations";
import {ResourceTemplate} from "src/app/shared/_models/resource-template.model";
import {ResourceType} from "src/app/shared/_models/resource-type.model";
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {EventsNewService} from 'src/app/shared/_services/events-new.service';
import {ResourceFilterService} from "src/app/shared/_services/resource-filter.service";
import {firstValueFrom, startWith, Subject, Subscription, takeUntil, tap, withLatestFrom} from "rxjs";
import {UserLocationService} from "src/app/shared/_services/user-location.service";
import {User} from "src/app/shared/_models/user.model";
import moment from "moment";
import {LocalStorageService} from "src/app/shared/_services/localStorage.service";
import {GeolocationService} from "src/app/shared/_services/geolocation.service";
import {SessionStorageService} from "src/app/shared/_services/sessionStorage.service";
import {DatePipe} from "@angular/common";
import {TranslateService} from "@ngx-translate/core";
import {AuthService} from "src/app/shared/_services/auth.service";
import {HotelSearchRequest} from "../../shared/_models/hotelsModels.model";
import {HotelsService} from "../../shared/_services/hotels.service";
import {ToastService} from "../../shared/_services/toast.service";
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";
import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from "@angular/material/form-field";
import {Calendar} from "primeng/calendar";
import {map} from "rxjs/operators";
import {FilterService} from "primeng/api";
import {MatAutocomplete, MatAutocompleteTrigger} from "@angular/material/autocomplete";
import {OverlayContainer, OverlayRef} from "@angular/cdk/overlay";
import {LoadingService} from "../../utils/spinner/loading.service";
import {SelectedFlightStore} from "../../features/domain-listing/transportation/_services/selected-flight.store";
import {PlaneFlightsStore} from "../../features/domain-listing/transportation/_services/plane-flights.store";
import {ResourcesService} from "../../features/resources/_services/resources.service";
import {RestaurantWithLocation} from "../../features/resources/_models/RestaurantWithLocation";

@Component({
  selector: "app-main-search",
  templateUrl: "./main-search.component.html",
  styleUrls: ["./main-search.component.scss"],
  providers: [DatePipe, {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: 'fill'}],
  animations: [
    trigger("panelState", [
      state(
          "hidden",
          style({
            opacity: 0,
            transform: "translateY(-10%)",
          }),
      ),
      state(
          "visible",
          style({
            opacity: 1,
            transform: "translateY(0)",
          }),
      ),
      transition("visible => hidden", animate("200ms ease-in")),
      transition("hidden => visible", animate("200ms ease-out")),
    ]),
  ],
})
export class MainSearchComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('myCalendar') datePicker: Calendar;
  @ViewChild('departuresTrigger') departuresTrigger: MatAutocompleteTrigger;
  @ViewChild('arrivalsTrigger') arrivalsTrigger: MatAutocompleteTrigger;

  readonly travelClasses: string[] = ['Economy', 'Economy+', 'Business', 'First']

  rooms: FormArray<FormGroup> = this.fb.array<FormGroup>([this.fb.group({
    adults: this.fb.control<number>(1),
    children: this.fb.array<number>([])
  })]);
  guestsValue: string;
  travelClass: string = this.travelClasses[0];
  passengersValue: number = 1;

  items: SelectItem[];
  selectedItem: string;
  inputValues: number[] = [0, 0, 0, 1, 0, 0, 0, 1, 0, 0];
  @ViewChild("autocomplete") addressInput: any;
  @ViewChild("departures") departures: MatAutocomplete;
  @ViewChild("arrivals") arrivals: MatAutocomplete;
  location: any;
  private ngUnsubscribe = new Subject<void>();

  public roomsArray: string[];

  public childrenArray: any[] = [];
  public ageOptions: any[] = [];
  public isSearchDisabled: boolean = false;
  private allDepartures = false;
  private allArrivals = false;
  public locationListRestaurants: RestaurantWithLocation[] = [];
  public selectedRestaurantLocation: RestaurantWithLocation;
  public selectedEventLocation;

  constructor(
      private fb: FormBuilder,
      private resourceFilterService: ResourceFilterService,
      private route: ActivatedRoute,
      private router: Router,
      private userLocationService: UserLocationService,
      private sessionStorageService: SessionStorageService,
      private localStorageService: LocalStorageService,
      private geolocationService: GeolocationService,
      private datePipe: DatePipe,
      private translateService: TranslateService,
      private authService: AuthService,
      private hotelService: HotelsService,
      private toastService: ToastService,
      private sessionStoreManager: SessionStorageService,
      private eventsService: EventsNewService,
      private filterService: FilterService,
      private loadingService: LoadingService,
      private planeFlightsStore: PlaneFlightsStore,
      private readonly _registry: MatIconRegistry,
      private readonly _sanitize: DomSanitizer,
      private resourceService: ResourcesService
  ) {
    this._registry.addSvgIcon('location', this._sanitize.bypassSecurityTrustResourceUrl('/assets/icons/location.svg'));
    this._registry.addSvgIcon('calendar', this._sanitize.bypassSecurityTrustResourceUrl('/assets/icons/calendar.svg'));
    this._registry.addSvgIcon('guests', this._sanitize.bypassSecurityTrustResourceUrl('/assets/icons/guests.svg'));
    this._registry.addSvgIcon('plane-in', this._sanitize.bypassSecurityTrustResourceUrl('/assets/icons/plane-in.svg'));
    this._registry.addSvgIcon('plane-out', this._sanitize.bypassSecurityTrustResourceUrl('/assets/icons/plane-out.svg'));

    this.items = [{ label: "Select Values", value: null }];
    this.selectedItem = this.items[0].value;
  }

  @Output() updatePlaneOffers = new EventEmitter<any>();
  departureAirport;
  arrivalAirport;
  @Input() listingSearch;
  @Input() selected = "";
  @Input() listingCards: boolean;
  moment = moment;
  selectedHotel = {};
  filteredHotels = [];
  value: string;
  hotels = [];
  rangeDates = [];
  guests = [];
  passengers = [];
  hotelCountAdulti = 0;
  hotelCountCopii = 0;
  hotelCountCamere = 0;
  restaurantCountCopii = 0;
  restaurantCountAdulti = 0;
  stateOptions: any[] = [
    { label: "Dus-intors", value: "comeBack" },
    { label: "Doar Dus", value: "go" },
  ];
  calendarOption = "range";
  minimumDate: Date;
  travels;
  restaurantDate: Date = new Date(new Date().setMinutes(0));
  hours = [];
  selectedHour;
  dropdownValueRestaurant = "";
  private autocompleteInitialized = false;
  @Output() filtersSubmitted = new EventEmitter<void>();
  resourceTemplate: ResourceTemplate = null;
  resourceTypeData: ResourceType;
  locationCoordinates;
  filterForm: FormGroup;
  autoCompletePlace;
  formattedAddress;
  currentUrl: string;
  filters;
  currentUser: User = null;
  allFilterOptionsFalse = true;
  subs: Subscription[] = [];
  airports = [];
  filteredArrivalAirports = [];
  filteredDepartureAirports = [];
  selectedArrivalAirport;
  selectedDepartureAirport;
  singleDate;
  city;
  country;
  locationHidden;
  currentUserId;

  arrivalValue: string;
  departureValue: string;

  @Output() hotelSearchRequestChanged = new EventEmitter<any>();

  hotelSearchRequest: HotelSearchRequest = new HotelSearchRequest();

  get guestFilter(): unknown[] {
    return JSON.parse(sessionStorage.getItem('filters'))?.data?.guests
  }

  private _catchRoomsChange(): void {
    this.rooms.valueChanges
        .pipe(
            startWith(this.rooms.value),
            map((rooms) => {
              const nrOfAdults = rooms?.map(room => room.adults).reduce((prev, next) => prev + next, 0);

              return `${nrOfAdults} Pers. - ${rooms?.length} Cam`
            }),
            takeUntil(this.ngUnsubscribe)
        )
        .subscribe((value) => this.guestsValue = value)
  }
  addRooms(): void {
    this.rooms.push(this.fb.group({
      adults: this.fb.control<number>(1),
      children: this.fb.array<number>([])
    }));
  }

  changeAge({value, formattedValue}, index: number): void {
    const childrenArray = this.rooms.at(index).controls.children as FormArray;

    if(formattedValue < value) childrenArray.push(this.fb.control(0));
    else childrenArray.removeAt(childrenArray?.length - 1)
  }

  ngOnInit() {
    this.authService.getCurrentUser().subscribe((user) => {
      this.currentUserId = user.id;
      this.currentUser = user;
    });

    const savedFilters = localStorage.getItem("hotelFilters");
    if (savedFilters) {
      const hotelFilters = JSON.parse(savedFilters);
      delete hotelFilters["params"];
      delete hotelFilters["searchName"];
      hotelFilters.sort = "priceAsc";
      localStorage.setItem("hotelFilters", JSON.stringify(hotelFilters));
    }

    this.initializeAgeOptions();
    this.checkForPath();
    this.setAirports();
    this.dateChanged();
    this.dropdownValueRestaurant = "Nr. Oaspeti";
    this.minimumDate = new Date(new Date().setMinutes(0));
    this.travels = this.stateOptions[0];
    this.getCurrentUrl();
    const storedFilters = JSON.parse(localStorage.getItem("filters"));

    if (this.selected == "planes" && storedFilters) {
      this.selectedDepartureAirport = storedFilters.departureObject;
      this.selectedArrivalAirport = storedFilters.arrivalObject;
      this.departureValue = storedFilters.allDepartures ? `(${storedFilters.departureObject.cityCode}) ${storedFilters.departureObject.city}` : `(${storedFilters.departureObject.value}) ${storedFilters.departureObject.city}`;
      this.allDepartures = storedFilters.allDepartures;
      this.planeFlightsStore.setAllDepartures(this.allDepartures, this.allDepartures ? storedFilters.departureObject.items.map(i => i.value.toLowerCase()) : undefined);
      this.inputValues[3] = storedFilters.adults;
      this.inputValues[4] = storedFilters.young;
      this.inputValues[5] = storedFilters.children;
      this.inputValues[6] = storedFilters.heldInfants;
      this.passengersValue = storedFilters.adults + storedFilters.young + storedFilters.children + storedFilters.heldInfants;
      if (!storedFilters.returnDate) {
        this.calendarOption = "single";
        this.singleDate = new Date(storedFilters.departureDate);
      } else {
        this.calendarOption = "range";
        this.rangeDates.push(new Date(storedFilters.departureDate));
        this.rangeDates.push(new Date(storedFilters.returnDate));
        this.arrivalValue = storedFilters.allArrivals ? `(${storedFilters.arrivalObject.cityCode}) ${storedFilters.arrivalObject.city}` : `(${storedFilters.arrivalObject.value}) ${storedFilters.arrivalObject.city}`;
        this.allArrivals = storedFilters.allArrivals;
        this.planeFlightsStore.setAllArrivals(this.allArrivals, this.allArrivals ? storedFilters.arrivalObject.items.map(i => i.value.toLowerCase()) : undefined);
      }
    }


    if (this.selected === "hotels" && storedFilters) {
      if (storedFilters && storedFilters.data && storedFilters.data.checkin) {
        this.rangeDates.push(new Date(storedFilters.data.checkin));
      }
      if (storedFilters && storedFilters.data && storedFilters.data.checkout) {
        this.rangeDates.push(new Date(storedFilters.data.checkout));
      }

      if (storedFilters && storedFilters.data && typeof storedFilters.data.guests) {
        for(let i = 0; i < storedFilters.data.guests.length; i++) {
          if (!this.rooms.controls[i]) {
            this.rooms.push(this.fb.group({
              adults: this.fb.control<number>(1),
              children: this.fb.array<number>([])
            }));
          }
          this.rooms.controls[i].controls.adults.setValue(storedFilters.data.guests[i].adults);
          if (storedFilters.data.guests[i].children.length) {
            const childrenArray = this.rooms.at(i).controls.children as FormArray;
            storedFilters.data.guests[i].children.forEach(ch => {
              childrenArray.push(this.fb.control(ch));
            });
          }
        }
        // this.inputValues[0] = storedFilters.data.guests.reduce((sum, current) => sum + current.adults, 0);
        //
        // this.guestsInputChangedHotel(
        //     this.inputValues[0],
        //     "adulti",
        // );
      }

      // if (storedFilters && storedFilters.data && typeof storedFilters.data.guests[0].children.length === "number") {
      //   this.guestsInputChangedHotel(
      //       storedFilters.data.guests[0].children.length,
      //       "copii",
      //   );
      //   this.inputValues[1] = storedFilters.data.guests[0].children.length;
      //   this.inputValues[2] = storedFilters.data.guests.length;
      // }

      // if (storedFilters && storedFilters.data && typeof storedFilters.data.guests.length === "number") {
      //   this.guestsInputChangedHotel(
      //       storedFilters.data.guests.length,
      //       "camere",
      //   );
      //   this.inputValues[6] = storedFilters.data.guests[0].children.length;
      //   this.inputValues[2] = storedFilters.data.guests.length;
      // }

      if (storedFilters && storedFilters.data) {
        this.locationCoordinates = {
          latitude: storedFilters.data.latitude,
          longitude: storedFilters.data.longitude,
        }

        // location: "Bucharest, Romania";
        this.location = storedFilters.country || storedFilters.location;

        if (storedFilters && storedFilters.data) {
          this.hotelSearchRequest = {
            latitude: this.locationCoordinates?.latitude,
            longitude: this.locationCoordinates?.longitude,
            checkin: this.moment(this.rangeDates[0]).format("YYYY-MM-DD"),
            checkout: this.moment(this.rangeDates[1]).format("YYYY-MM-DD"),
            guests: this.rooms.value,
          };
          if (!this.loadingService.isLoading()) {
            this.hotelService.updateHotelSearchRequest(this.hotelSearchRequest);
          }
        }
      }
    }

    if (this.selected === "restaurants" && storedFilters) {
      this.location = storedFilters.location;
      this.selectedRestaurantLocation = this.locationListRestaurants.find(l => l.location === this.location);
      this.inputValues[7] = storedFilters.adultsNumber ? storedFilters.adultsNumber : this.inputValues[7];
      this.inputValues[8] = storedFilters.childrenNumber ? storedFilters.childrenNumber : this.inputValues[8];
      this.restaurantDate = storedFilters.dateAsDay ? new Date(storedFilters.dateAsDay) : new Date(new Date().setMinutes(0));
    }
    if (this.selected === "events" && storedFilters) {
      this.location = storedFilters.location;
      this.selectedEventLocation = this.locationListRestaurants[0];
    }

    const filterSub = this.resourceFilterService.filterForm$
        .pipe(
            withLatestFrom(this.resourceFilterService.location$)
        )
        .subscribe(
      ([filters, locations]) => {
        if (filters) {
          if (this.selected == "restaurants") {
            if (filters.location) {
              this.formattedAddress = filters.location;
              this.location = filters.location;
            }
            if (filters.geographicalCoordinates) {
              this.locationCoordinates = filters.geographicalCoordinates;
            }
            if (filters.dateAsDay) {
              this.restaurantDate = new Date(new Date(filters.dateAsDay).setMinutes(0));
            }
            if (typeof filters.adultsNumber === "number") {
              this.guestsInputChangedRestaurant(filters.adultsNumber, "adulti");
              this.inputValues[7] = filters.adultsNumber;
            }
            if (typeof filters.childrenNumber === "number") {
              this.guestsInputChangedRestaurant(
                filters.childrenNumber,
                "copii",
              );
              this.inputValues[8] = filters.childrenNumber;
            }

              if (filters.startHour) {
                this.selectedHour = this.formatTime(filters.startHour);
              }
            } else if (this.selected == "hotels") {
              if (filters.location) {
                this.formattedAddress = filters.location;
                this.location = filters.location;
              }

              if (filters.geographicalCoordinates) {
                this.locationCoordinates = filters.geographicalCoordinates;
              }
              if (filters.location) {
                this.selectedRestaurantLocation = this.locationListRestaurants.find(l => l.city === filters.location);
              }
            }
          }
        },
    );
    this.subs.push(filterSub);

    this.applyFiltersIfExist();

    this.resourceService.getRestaurantLocationsWithGeo().subscribe((res) => {
      if (res) {
        try {
          this.locationListRestaurants = res;
          if (this.selected === "restaurants" && storedFilters) {
            this.selectedRestaurantLocation = this.locationListRestaurants.find(l => l.city === storedFilters.location);
            this.loadingService.showLoading();
            this.resourceFilterService
                .getRestaurants(undefined, storedFilters)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe(
                    (res) => {this.loadingService.hideLoading();},
                    (error) => {this.loadingService.hideLoading();}
                );
          }
        } catch (e) {
          this.toastService.showToast("Eroare", "Eroare la preluarea locatiilor disponibile pentrun restaurante.", "error");
        }
      }
    });
    this._catchRoomsChange();
    this.rooms.patchValue(this.guestFilter);
  }

  ngOnDestroy() {
    this.subs.forEach((sub) => {
      sub.unsubscribe();
    });

    this.ngUnsubscribe.complete();
    this.ngUnsubscribe.unsubscribe();
  }

  checkForPath() {
    const currentUrl = this.router.url;
    if (currentUrl.includes("view")) {
      this.isSearchDisabled = true;

      this.locationHidden = true;
    } else {
      this.locationHidden = false;
    }
  }

  private applyFiltersIfExist() {
    const filterProps = this.getFilterProps();
    if (filterProps.filters && filterProps.filterType === "restaurant") {
      const [hours, minutes] = filterProps.filters.timePickerSearch && filterProps.filters.timePickerSearch.timePickerHour ?
          filterProps.filters.timePickerSearch.timePickerHour.split(":") : [20, 0];
      this.restaurantDate = new Date(new Date(new Date(
          filterProps.filters.timePickerSearch.timePickerDate,
      ).setHours(hours)).setMinutes(0));

      const adulti = filterProps.filters.timePickerSearch.adults;
      const copii = filterProps.filters.timePickerSearch.child;
      this.selectedRestaurantLocation = this.locationListRestaurants.find(l => l.location === filterProps.filters.location);

      this.inputValues[7] = adulti;
      this.inputValues[8] = copii;

      this.guestsInputChangedRestaurant(adulti, "adulti");
      this.guestsInputChangedRestaurant(copii, "copii");

      this.geolocationService
          .reverseGeocode(
              filterProps.filters.geographicalCoordinates.latitude,
              filterProps.filters.geographicalCoordinates.longitude,
          )
          .then((result) => {
            this.city = result.split(",")[0];
            this.country = result.split(",")[1];
            this.location = result;
            this.locationCoordinates = {
              latitude: filterProps.filters.geographicalCoordinates.latitude,
              longitude: filterProps.filters.geographicalCoordinates.longitude,
            };

            this.applyRestaurantFilters();
          })
          .catch((error) => console.error(error));
    } else if (filterProps.filters && filterProps.filterType === "hotel") {
    }

    // TODO: Add here the logic for applying the filters for hotels and others
  }

  private getFilterProps() {
    const filterType = this.sessionStorageService.get("filterType");
    const filters = JSON.parse(
        this.sessionStorageService.get("filters") || "null",
    );

    return { filterType, filters };
  }

  setAirports() {
    const roData = require("../../../assets/i18n/ro.json");
    const airports = roData.airports;
    airports.forEach(a => {
      if (this.airports.findIndex(air => air.label === a.city) < 0) {
        this.airports.push({
          label: a.city,
          value: a.airport_code,
          city: a.city,
          cityCode: a.city_code,
          country: a.country,
          labelExtra: a.airport_name + ' (' + a.airport_code + ')',
          items: airports
              .filter(a1 => a1.city === a.city)
              .map(a1 => ({
                country: a.country,
                label: a1.airport_name,
                value: a1.airport_code,
                city: a1.city,
                cityCode: a.city_code,
                labelExtra: a1.airport_name + ' (' + a1.airport_code + ')',
              }))
        })
      }
    });
  }

  filterAirports(event: any, isDepartures: boolean) {
    if (!event || !(typeof event === "string")) return;
    const query = event?.toLowerCase();
    const filteredGroups = [];

    for (const airport of this.airports) {
      const filteredSubOptions = this.filterService.filter(airport.items, ['city', 'value'], query, "contains");

      if (filteredSubOptions && filteredSubOptions.length) {
        filteredGroups.push({
          label: airport.label,
          value: airport.value,
          cityCode: airport.cityCode,
          country: airport.country,
          city: airport.city,
          items: filteredSubOptions
        });
      }
    }
    isDepartures ? this.filteredDepartureAirports = [...filteredGroups] : this.filteredArrivalAirports = [...filteredGroups];
  }

  translate(value: string): string {
    return this.translateService.instant(value);
  }

  async getCurrentUserLocation() {
    this.currentUser = await firstValueFrom(
        this.userLocationService.getCurrentUser(),
    );

    this.initFilterForm();
  }

  listenToResourceTemplate() {
    this.resourceFilterService.resourceTemplateObs$
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res) => {
            this.resourceTemplate = res;
          },
        });
  }

  private initializeAgeOptions(): void {
    for (let i = 0; i <= 17; i++) {
      this.ageOptions.push({ label: i.toString(), value: i });
    }
  }

  initFilterForm() {
    const tomorrow = new Date();
    tomorrow.setDate(new Date().getDate() + 1);

    this.filterForm = this.fb.group({
      location: [this.currentUser.city],
      geographicalCoordinates: [
        this.currentUser.currentGeographicalCoordinates,
      ],
      dateAsDay: tomorrow,
      dateAsHour: tomorrow,
      startDate: tomorrow,
      endDate: tomorrow,
      startHour: tomorrow,
      endHour: tomorrow,
      // guests filter options
      adultsNumber: [1, [Validators.min(1)]],
      childrenNumber: [0, Validators.min(0)],
      roomsNumber: [1, Validators.min(1)],
    });

    this.formattedAddress = this.formattedAddress
        ? this.formattedAddress
        : this.filterForm.value.location;
    this.location = this.filterForm.value.location;
    this.locationCoordinates = this.filterForm.value.geographicalCoordinates;
    this.restaurantDate = new Date(new Date(this.filterForm.value.dateAsDay).setMinutes(0));
    this.guestsInputChangedRestaurant(
        this.filterForm.value.adultsNumber,
        "adulti",
    );
    this.inputValues[5] = this.filterForm.value.adultsNumber;
    this.guestsInputChangedRestaurant(
        this.filterForm.value.adultsNumber,
        "copii",
    );
    this.inputValues[6] = this.filterForm.value.childrenNumber;
    this.selectedHour = this.formatTime(this.filterForm.value.startHour);

    this.guestsInputChangedRestaurant(
        this.filterForm.value.adultsNumber,
        "adulti",
    );
    this.guestsInputChangedRestaurant(
        this.filterForm.value.childrenNumber,
        "copii",
    );
  }

  listenToResourceType() {
    this.resourceFilterService.resourceTypeObs$
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res) => {
            if (res.filterOption) {
              for (const key of Object.keys(res.filterOption)) {
                if (res.filterOption[key] === true) {
                  this.allFilterOptionsFalse = false;
                }
              }
            }
            this.resourceTypeData = res;
          },
        });
  }

  ngAfterViewInit() {
    this.getAutocomplete();
    // this.resourceFilterService.selectedSearchStateSubject.subscribe(val => {
    //     this.isSearchDisabled = val === 'Rezervari' || val === 'Meniu' || val === 'Prezentare';
    // })
    const savedFilters = JSON.parse(this.sessionStoreManager.get("filters"));
    if (savedFilters && savedFilters.timePickerSearch) {
      this.selectedHour = savedFilters.timePickerSearch.timePickerHour
    }

  }

  ngOnChanges(SimpleChanges) {
    this.getAutocomplete();
  }

  ngAfterViewChecked() {
    // Ensures we try initializing the autocomplete once the element is available
    if (!this.autocompleteInitialized) {
      this.getAutocomplete();
    }
  }

  getCurrentUrl() {
    this.currentUrl = this.route.snapshot.pathFromRoot
        .map((v) => v.url.map((segment) => segment.toString()).join("/"))
        .join("/");
  }

  private getAutocomplete(): void {
    setTimeout(() => {
      if (
          (this.selected === "hotels" ||
              this.selected === "restaurants" ||
              this.selected === "common") &&
          this.addressInput?.nativeElement &&
          google.maps.places
      ) {
        this.autocompleteInitialized = true;

        if (google.maps.places) {
          const autocomplete = new google.maps.places.Autocomplete(
              this.addressInput.nativeElement
          );

          google.maps.event.addListener(autocomplete, "place_changed", () => {
            this.autoCompletePlace = autocomplete.getPlace();
            if (
                this.autoCompletePlace &&
                this.autoCompletePlace.address_components
            ) {
              const locality = _.find(
                  this.autoCompletePlace.address_components,
                  { types: ["locality"] },
              );
              this.city = locality?.long_name;
              this.country = this.autoCompletePlace.formatted_address;
              this.locationCoordinates = {
                longitude: this.autoCompletePlace.geometry?.location?.lng(),
                latitude: this.autoCompletePlace.geometry?.location?.lat(),
              };

              this.datePicker.toggle();
            }
          });
        }
      }
    }, 500);
    if (this.autoCompletePlace) {
      this.autoCompletePlace.formatted_address = this.formattedAddress
          ? this.formattedAddress
          : this.autoCompletePlace?.formatted_address;
    }
  }

  onValueChange(event: any) {
    this.getAutocomplete();
  }

  modifyCalendar() {
    this.calendarOption = this.calendarOption === "single" ? "range" : "single";
    this.rangeDates = [];
  }

  filterHotel(event: any) {
    const filtered = [];
    const query = event.query;

    for (let i = 0; i < this.hotels.length; i++) {
      const hotel = this.hotels[i];
      if (hotel.name?.toLowerCase().indexOf(query?.toLowerCase()) == 0) {
        filtered.push(hotel);
      }
    }

    this.filteredHotels = filtered;
  }

  guestsInputChangedHotel(value: number, type: string) {
    switch (type) {
      case "adulti":
        this.hotelCountAdulti = value;
        break;
      case "copii":
        this.hotelCountCopii = value;
        this.childrenArray = Array.from({ length: this.hotelCountCopii }).map(
            () => ({ age: null }),
        );
        break;
      case "camere":
        this.hotelCountCamere = value;
        this.roomsArray = Array.from({length: this.hotelCountCamere})
        break;
    }

    const parts = [];
    if (this.hotelCountAdulti > 0) {
      parts.push(`${this.hotelCountAdulti} Adulti`);
    }

    if (this.hotelCountCopii > 0) {
      const copiiAges = this.childrenArray
          .filter((child) => child !== null && typeof child === "object")
          .map((child) => child.age);

      if (copiiAges.length > 0) {
        parts.push(`${this.hotelCountCopii} Copii (${copiiAges.join(", ")})`);
      } else {
        parts.push(`${this.hotelCountCopii} Copii`);
      }
    }

    if (this.hotelCountCamere > 0) {
      parts.push(`${this.hotelCountCamere} Camere`);
    }

    const finalString = parts.join(" / ");

    this.guests = [finalString];
  }

  guestsInputChangedPlane({value, formattedValue}, index: number): void {
    if(formattedValue < value) this.passengersValue += (value - formattedValue);
    else this.passengersValue -= (formattedValue - value);

    this.inputValues[index] = value;
  }

  guestsInputChangedRestaurant(value: number, type: string) {
    switch (type) {
      case "adulti":
        this.restaurantCountAdulti = value;
        break;
      case "copii":
        this.restaurantCountCopii = value;
        break;
    }

    const parts = [];
    if (this.restaurantCountAdulti > 0)
      parts.push(`${this.restaurantCountAdulti} Adulti`);
    if (this.restaurantCountCopii > 0)
      parts.push(`${this.restaurantCountCopii} Copii`);

    const finalString = parts.join(" / ");

    this.passengers = [finalString];
    this.dropdownValueRestaurant = finalString ? finalString : "Nr. Oaspeti";
  }

  convertDate() {
    const restaurantDate = new Date(this.restaurantDate);

    const year = restaurantDate.getFullYear();
    const month = restaurantDate.getMonth() + 1;
    const day = restaurantDate.getDate();

    const [hours, minutes] = this.selectedHour.split(":");

    const combinedDateTime = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}T${hours}:${minutes}:00`;
    return combinedDateTime;
  }

  applyRestaurantFilters() {
    if (!this.locationCoordinates) return;
    this.resourceFilterService.setLocationSubject({
      x: this.locationCoordinates.longitude,
      y: this.locationCoordinates.latitude,
    });

    this.resourceFilterService.setPeopleNumberSubject(
        this.inputValues[7] + this.inputValues[8],
    );

    this.resourceFilterService.setRestaurantReservationDateSubject(
        this.convertDate(),
    );
  }

  submitFilters(): void {
    //A. Tache comment for time being as we have only Buchares
    // if (this.selected === 'restaurants') {
    //   this.applyRestaurantFilters();
    // }
    let filtersToSend: any;
    let filterType: string;
    let filters: any;

    let targetUrl: string;

    this.filterForm = this.fb.group({
      location: "",
      geographicalCoordinates: {},
      dateAsDay: "",
      dateAsHour: "",
      startDate: "",
      endDate: "",
      startHour: "",
      endHour: "",
      // guests filter options
      adultsNumber: [1, Validators.min(1)],
      childrenNumber: 0,
      roomsNumber: 0,
    });

    this.filtersSubmitted.emit();
    if (this.selected == "restaurants") {
      targetUrl =
          "/client/domain/63bfcca765dc3f3863af755c/category/63dbb183df393f737216183c/resource-type/63dbb18cdf393f737216183d";
      filterType = "restaurant";
      const baseDate = this.restaurantDate
          ? new Date(new Date(this.restaurantDate).setMinutes(0))
          : new Date(new Date().setMinutes(0));

      const [hour, minute] = this.selectedHour.split(":").map(Number);

      baseDate.setHours(hour, minute, 0, 0);

      this.filterForm.patchValue({
        location: this.selectedRestaurantLocation.city,
        // location: this.autoCompletePlace?.formatted_address
        //     ? this.autoCompletePlace.formatted_address
        //     : "",
        geographicalCoordinates: this.selectedRestaurantLocation
            ? this.selectedRestaurantLocation.geographicalCoordinates
            : this.currentUser.currentGeographicalCoordinates,
        dateAsDay: this.restaurantDate
            ? this.restaurantDate.toISOString()
            : new Date().toISOString(),
        dateAsHour: this.restaurantDate
            ? this.restaurantDate.toISOString()
            : new Date().toISOString(),
        startDate: this.restaurantDate
            ? this.restaurantDate.toISOString()
            : new Date().toISOString(),
        endDate: this.restaurantDate
            ? new Date(
                this.restaurantDate.getTime() + 2 * 60 * 60 * 1000,
            ).toISOString()
            : new Date(2 * 60 * 60 * 1000).toISOString(),
        startHour: baseDate.toISOString(),
        endHour: new Date(
            baseDate.getTime() + 2 * 60 * 60 * 1000,
        ).toISOString(),
        adultsNumber: this.inputValues[7],
        childrenNumber: this.inputValues[8],
      });

      this.resourceFilterService.reservationDate.next(this.formatDateAndTime(this.restaurantDate, this.selectedHour));
      this.resourceFilterService.totalPeopleCounter.next(Number(this.inputValues[7] + this.inputValues[8]));

      this.formattedAddress = this.filterForm.value.location;

      const date = new Date();

      filtersToSend = {
        geographicalCoordinates: this.selectedRestaurantLocation
            ? this.selectedRestaurantLocation.geographicalCoordinates
            : this.currentUser.currentGeographicalCoordinates,
        location: this.selectedRestaurantLocation.city,
        dateAsDay: this.restaurantDate
            ? this.restaurantDate.toISOString()
            : new Date().toISOString(),
        dateAsHour: this.restaurantDate
            ? this.restaurantDate.toISOString()
            : new Date().toISOString(),
        timePickerSearch: {
          timePickerDate: this.restaurantDate
              ? this.restaurantDate.getFullYear() +
              "-" +
              ("0" + (this.restaurantDate.getMonth() + 1)).slice(-2) +
              "-" +
              ("0" + this.restaurantDate.getDate()).slice(-2)
              : date.getFullYear() +
              "-" +
              ("0" + (date.getMonth() + 1)).slice(-2) +
              "-" +
              ("0" + date.getDate()).slice(-2),
          timePickerHour: this.selectedHour,
        },
        adultsNumber: this.inputValues[7],
        childrenNumber: this.inputValues[8],
      };
    } else if (this.selected == "hotels") {
      // Extract children ages from childrenArray
      const childrenAges = this.childrenArray
          .map((child) => child.age)
          .filter((age): boolean => age !== null);

      this.hotelSearchRequest = {
        latitude: this.locationCoordinates?.latitude,
        longitude: this.locationCoordinates?.longitude,
        checkin: this.moment(this.rangeDates[0]).format("YYYY-MM-DD"),
        checkout: this.moment(this.rangeDates[1]).format("YYYY-MM-DD"),
        guests: this.rooms.value,
      };

      targetUrl =
          "/client/domain/63bfcca765dc3f3863af755c/category/63d2ae569d6ce304608d1a88/resource-type/63d8d4a9d2180d7935acb4e0";
      filterType = "hotel";

      filtersToSend = {
        resourceTypeId: "63d8d4a9d2180d7935acb4e0",
        status: "active",
        city: this.city,
        country: this.country,
        data: this.hotelSearchRequest,
        location: this.location
      };
      this.filterForm.patchValue({
        location: this.autoCompletePlace?.formatted_address
            ? this.autoCompletePlace.formatted_address
            : "",
        geographicalCoordinates: this.locationCoordinates
            ? this.locationCoordinates
            : this.currentUser.currentGeographicalCoordinates
      });
    } else if (this.selected === "planes") {
      targetUrl =
          "/client/domain/63bfcca765dc3f3863af755c/category/63dbb1a4df393f7372161842/available-plane-tickets";

      filtersToSend = {
        departureObject: this.selectedDepartureAirport,
        arrivalObject: this.selectedArrivalAirport,
        originLocationCode: this.allDepartures ? this.selectedDepartureAirport.cityCode : this.selectedDepartureAirport.value,
        destinationLocationCode: this.allArrivals ? this.selectedArrivalAirport.cityCode : this.selectedArrivalAirport.value,
        allDepartures: this.allDepartures,
        allArrivals: this.allArrivals,
        allDeparturesAirportCodes: this.allDepartures ? this.planeFlightsStore.allDeparturesAirportCodes : [],
        allArrivalsAirportCodes: this.allArrivals ? this.planeFlightsStore.allArrivalsAirportCodes : [],
        departureDate: this.datePipe.transform(
            this.calendarOption == "range"
                ? this.selectedModel[0]
                : this.selectedModel,
            "yyyy-MM-dd",
        ),
        returnDate: this.datePipe.transform(
            this.calendarOption == "range" ? this.selectedModel[1] : null,
            "yyyy-MM-dd",
        ),
        adults: this.inputValues[3],
        young: this.inputValues[4],
        children: this.inputValues[5],
        heldInfants: this.inputValues[6],
        travelClass: "ECONOMY",
        maxResultsNumber: 50,
      };
    } else if (this.selected === "events") {
      this.filterForm.patchValue({
        location: this.selectedEventLocation.display,
        // location: this.autoCompletePlace?.formatted_address
        //     ? this.autoCompletePlace.formatted_address
        //     : "",
        geographicalCoordinates: this.selectedEventLocation
            ? this.selectedEventLocation.coords
            : this.currentUser.currentGeographicalCoordinates
      });
      filtersToSend = {
        geographicalCoordinates: this.selectedEventLocation
            ? this.selectedEventLocation.coords
            : this.currentUser.currentGeographicalCoordinates,
        location: this.selectedEventLocation.display
        }
    }

    this.resourceFilterService.updateSavedFilters(this.filterForm.value);
    this.resourceFilterService.updateCachedFiltersValue(this.filterForm.value);

    if (this.selected === "restaurants") {
      this.loadingService.showLoading();
      this.resourceFilterService
          .getRestaurants(undefined, filtersToSend)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(
              (res) => {this.loadingService.hideLoading();},
              (error) => {this.loadingService.hideLoading();}
          );

      this.resourceFilterService
          .getFavoriteRestaurants(this.currentUserId)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe();
    }

    if (this.selected === "common") {
      this.filterForm.patchValue({
        location: this.autoCompletePlace?.formatted_address
            ? this.autoCompletePlace.formatted_address
            : "",
        geographicalCoordinates: this.locationCoordinates
            ? this.locationCoordinates
            : this.currentUser.currentGeographicalCoordinates
      });
    }

    // Save the filters on local storage to not lose them on page refresh
    if (this.selected) {
      this.sessionStorageService.set("filterType", this.selected);
      this.localStorageService.set("filterType", this.selected);
    }
    this.localStorageService.set("location", JSON.stringify(this.filterForm.controls.location.value));

    // Save the filters on local storage to not lose them on page refresh

    if (filtersToSend) {
      this.sessionStorageService.set("filters", JSON.stringify(filtersToSend));
      this.localStorageService.set("filters", JSON.stringify(filtersToSend));
    }

    if (this.selected === "hotels" && this.route.snapshot.paramMap.get("categoryId")) {
      this.hotelService.updateHotelSearchRequest(this.hotelSearchRequest);
    }

    if (this.selected == "planes") {
      this.getPlaneOffers();
    }
    if (this.filterForm.invalid) {
      this.toastService.showToast('Eroare','Numărul adulților nu poate fi 0!','error');

    }
    if (this.resourceFilterService.selectedSearchStateSubject.value === 'Spectacole') {
      targetUrl = '/client/domain/63bfcca765dc3f3863af755c/category/events/resource-type/63dbb18cdf393f737216183d';
      this.eventsService.getEventsData();
    }
    if (this.currentUrl !== targetUrl && !this.filterForm.invalid) {
      this.router.navigate([targetUrl]);
    }
    // this.clearFilter(); //TODO Brokes airplanes flow

  }

  private formatDateAndTime(date, timeString) {
    const newDate = new Date(date);
    const [hours, minutes] = timeString.split(':');
    newDate.setHours(+hours, +minutes);
    const offset = newDate.getTimezoneOffset();
    newDate.setMinutes(newDate.getMinutes() - offset);
    const isoString = newDate.toISOString();
    return isoString.slice(0, -1);
  }

  formatTime(date) {

    const dateInput = typeof date === "string" ? new Date(date) : date;
    const hours = dateInput.getHours().toString().padStart(2, "0");
    const minutes = dateInput.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  getPlaneOffers() {
    this.updatePlaneOffers.emit("Update plane offers");
  }

  get selectedModel(): any {
    return this.calendarOption === "single" ? this.singleDate : this.rangeDates;
  }

  set selectedModel(value: any) {
    if (this.calendarOption === "single") {
      this.singleDate = value;
    } else {
      this.rangeDates = value;
    }
  }

  done(): void {
    this.datePicker.toggle();
  }
  close() {
    this.rangeDates = [];
    this.datePicker.toggle();
  }

  change(event: any, departure: boolean) {
    if (departure) {
      this.departureValue = `(${event.option.value.value}) ${event.option.value.city}`;
      this.selectedDepartureAirport = event.option.value;
      this.allDepartures = false;
      this.planeFlightsStore.setAllDepartures(this.allDepartures, undefined);
      this.departuresTrigger.closePanel();
      this.arrivalsTrigger.openPanel();
    } else {
      this.arrivalValue = `(${event.option.value.value}) ${event.option.value.city}`;
      this.selectedArrivalAirport = event.option.value;
      this.allArrivals = false;
      this.planeFlightsStore.setAllArrivals(this.allArrivals, undefined);
    }

  }

  removeRooms() {
    this.rooms.removeAt(this.rooms.value.length - 1);
  }

  dateChanged() {
    this.selectedHour = this.restaurantDate.getHours() + ":" + this.restaurantDate.getMinutes();

  }

  onEnter(group) {
    document.getElementById(group._labelId).style.backgroundColor = "rgba(0,0,0,0.1)";
  }

  onLeave(group) {
    document.getElementById(group._labelId).style.backgroundColor = "";
  }

  selectAll(option, isDeparture: boolean) {
    if (isDeparture) {
      this.allDepartures = true;
      this.departureValue = `(${option.cityCode}) ${option.city}`;
      this.selectedDepartureAirport = option;
      this.planeFlightsStore.setAllDepartures(this.allDepartures, option.items.map(i => i.value.toLowerCase()));
      this.departuresTrigger.closePanel();
      this.arrivalsTrigger.openPanel();
    } else {
      this.allArrivals = true;
      this.arrivalValue = `(${option.cityCode}) ${option.city}`;
      this.selectedArrivalAirport = option;
      this.planeFlightsStore.setAllArrivals(this.allArrivals, option.items.map(i => i.value.toLowerCase()));
    }
  }

  clearFilter() {
    this.selectedDepartureAirport = undefined;
    this.selectedArrivalAirport = undefined;
    this.departureValue = undefined;
    this.calendarOption = "single";
    this.singleDate = undefined;
    this.calendarOption = "range";
    this.rangeDates = [];
    this.arrivalValue = undefined;
    this.inputValues = [0, 0, 0, 1, 0, 0, 0, 1, 0, 0];
    this.locationCoordinates = {};
    this.location = undefined;
    this.sessionStorageService.remove("filterType");
    this.sessionStorageService.remove("filters");
    this.selectedRestaurantLocation = undefined;
    this.restaurantDate = undefined;
    localStorage.removeItem("filters");
    localStorage.removeItem("filterType");
    localStorage.removeItem("hotelFilters");
  }
}
