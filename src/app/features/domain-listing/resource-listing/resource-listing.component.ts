import {Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild,} from "@angular/core";
import moment from 'moment';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  Observable,
  Subject,
  Subscription,
  switchMap,
  take
} from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { takeUntil } from "rxjs/operators";
import { EventInstance } from 'src/app/shared/_models/event-instance.model';
import { EventsNewService } from 'src/app/shared/_services/events-new.service';
import { ResourceFilterService } from "../../../shared/_services/resource-filter.service";
import { ResourceType } from "../../../shared/_models/resource-type.model";
import { TranslateService } from "@ngx-translate/core";
import { ResourceTemplate } from "../../../shared/_models/resource-template.model";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import { ResourceListMapComponent } from "../_components/resource-list-map/resource-list-map.component";

import { Feature } from "ol";
import { Point } from "ol/geom";
import { fromLonLat } from "ol/proj";

import { BlockScrollStrategy, Overlay } from "@angular/cdk/overlay";
import { mapsOptions, triangleIcon } from "src/app/shared/maps-options";
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";
import {FormControl, FormGroup} from "@angular/forms";
import { BreakpointObserver } from "@angular/cdk/layout";

export function scrollFactory(overlay: Overlay): () => BlockScrollStrategy {
  return () => overlay.scrollStrategies.block();
}

@Component({
  selector: "app-resource-listing",
  templateUrl: "./resource-listing.component.html",
  styleUrls: ["./resource-listing.component.scss"],
})
export class ResourceListingComponent implements OnInit, OnDestroy {

  public searchForm: FormGroup = new FormGroup<any>({
    searchControl: new FormControl()
  })

  responsiveOptions = [
    {
      breakpoint: '1199px',
      numVisible: 1,
      numScroll: 1
    },
    {
      breakpoint: '991px',
      numVisible: 1,
      numScroll: 1
    },
    {
      breakpoint: '767px',
      numVisible: 1,
      numScroll: 1
    }
  ];

  stateOptions: any[] = [
    { label: "Search", value: "search", icon: "fas fa-search", type: "search" },
    { label: "Sort", value: "sort", icon: "fas fa-sort", type: "sort" },
    { label: "Filter", value: "filter", icon: "fas fa-filter", type: "filter" },
    { label: "Map", value: "map", icon: "fas fa-map-marker-alt", type: "map" },
  ];
  @ViewChild('marker') marker: any;

  public showSearchInput: boolean = false;
  public showFilters: boolean = false;

  public cuisine: any[] = [
    { value: 'HIGH_END', displayText: 'High end'},
    { value: 'GOURMET', displayText: 'Gourmet'},
    { value: 'FINE_DINING', displayText: 'Fine dining'},
    { value: 'CASUAL', displayText: 'Casual'},
    { value: 'CAFE', displayText: 'CAFE'},
  ];

  public locationType: any[] = [
    { value: 'RESTAURANT', displayText: 'Restaurant' },
    { value: 'BAR', displayText: 'Bar' },
    { value: 'CLUB', displayText: 'Club' },
    { value: 'BISTRO', displayText: 'Bistro' },
    { value: 'CAFE', displayText: 'Cafe' },
  ];

  public paymentOptions: any[] = [
    { value: 'CREDIT_CARD', displayText: 'Card'},
    { value: 'CASH', displayText: 'Numerar'},
    { value: 'ONLINE', displayText: 'Plata online'},
  ];

  public entertainments: any[] = [
    { value: "LIVE_MUSIC", displayText: "Live music" },
    { value: "LIVE_DJ", displayText: "Live DJ" },
    { value: "JAZZ_BAR", displayText: "Jazz bar" },
    { value: "KARAOKE", displayText: "Karaoke" },
    { value: "BLUES_BAR", displayText: "Blues bar" },
    { value: "STAND_UP", displayText: "Stand up" },
    { value: "DANCERS_SHOW", displayText: "Dancers show" },
    { value: "MAGIC_SHOW", displayText: "Magic show" },
    { value: "CABARET", displayText: "Cabaret" },
    { value: "BOOKS", displayText: "Books available" },
    { value: "PLAYGROUND", displayText: "Playground" },
    { value: "TRADITIONS", displayText: "Local traditions" },
  ];

  public propertyType: any[] = [
    { value: "TERRACE", displayText: "Terrace" },
    { value: "NO_TERRACE", displayText: "No terrace" },
    { value: "ROOFTOP", displayText: "Rooftop" },
    { value: "SEASIDE", displayText: "Seaside" },
    { value: "GARDEN", displayText: "Garden" },
    { value: "HISTORIC", displayText: "Historic" },
    { value: "URBAN", displayText: "Urban" },
    { value: "RETREAT", displayText: "Retreat" },
    { value: "THEMATIC", displayText: "Thematic" },
    { value: "TRUCK", displayText: "Truck" },
  ];

  public locationSpecific: any[] = [
    { value: 'FUSION', displayText: 'Fusion' },
    { value: 'VEGAN', displayText: 'Vegan' },
    { value: 'STREET', displayText: 'Street' },
    { value: 'FAST_FOOD', displayText: 'Fast food' },
    { value: 'BISTRO', displayText: 'Bistro' },
    { value: 'GASTRO', displayText: 'Gastro' },
    { value: 'BIO', displayText: 'Bio' },
    { value: 'THEMED', displayText: 'Themed' },
    { value: 'BRASSERIE', displayText: 'Brasserie' },
    { value: 'TAPAS', displayText: 'Tapas' },
    { value: 'BUFFET', displayText: 'Buffet' },
    { value: 'ETHNIC', displayText: 'Ethnic' },
    { value: 'INTERNATIONAL', displayText: 'International' },
    { value: 'ITALIAN', displayText: 'Italian' },
    { value: 'MEDITERANEAN', displayText: 'Mediteranean' },
    { value: 'ROMANESC', displayText: 'Romanesc' },
  ]

  public currencies: any[] = [
    { value: 'EUR', displayText: 'Euro' },
    { value: 'RON', displayText: 'Ron' },
    { value: 'USD', displayText: 'Usd' },
  ];

  public stars = [
    { value: 1, color: '#4257EE' },
    { value: 2, color: '#4257EE' },
    { value: 3, color: '#4257EE' },
    { value: 4, color: '#4257EE' },
    { value: 5, color: '#4257EE' }
  ];

  calegoriesList = [
    {title: 'Toate', url: 'assets/icons/reload'},
    {title: 'Teatru', url: 'assets/icons/theater'},
    {title: 'Opera', url: 'assets/icons/harp'},
    {title: 'Balet', url: 'assets/icons/balet'},
    {title: 'Concert', url: 'assets/icons/music'},
    {title: 'Conferinta', url: 'assets/icons/conference'},
    {title: 'Copii', url: 'assets/icons/kid'},
    {title: 'Expozitii', url: 'assets/icons/expositions'},
    {title: 'Festival', url: 'assets/icons/concert'},
    {title: 'Film', url: 'assets/icons/cinema'},
    {title: 'Muzical', url: 'assets/icons/violin'},
    {title: 'Recital', url: 'assets/icons/triangle-music'},
    {title: 'Spectacol', url: 'assets/icons/fireworks'},
    {title: 'Spectacole pentru Copii', url: 'assets/icons/hand-puppet'},
    {title: 'Stand-up Comedy', url: 'assets/icons/microphone-stand'},
    {title: 'Teatru Copii', url: 'assets/icons/hand-puppet-new'}
  ];


  selectedType = "";

  value = "off";

  modalVisible = false;
  dialogVisible = false;

  public markerOptions: any = {
    draggable: false,
    icon: {
      url: '../../../../assets/images/others/frame.svg',
      scaledSize: new google.maps.Size(45, 45 ) // Adjust the size here
    }
  };

  markerPositions: any[] = [];
  modalMarkerPositions: any[] = [];

  googlemapOptions = mapsOptions;
  openModal(type) {
    if (type != "sort") {
      this.selectedType = type;
      this.modalVisible = true;
    } else {
      this.dialogVisible = true;
    }
  }
  selectedOption = "";
  options = [
    { name: "Rating Crescator", value: "rating_asc", key: "rating" },
    { name: "Rating Descrescator", value: "rating_desc", key: "rating-2" },
  ];

  display: any;
  center: google.maps.LatLngLiteral = {
    lat: 44.4268,
    lng: 26.1025,
  };
  zoom = 12;
  closedModal($event) {
    if ($event) {
      this.modalVisible = false;
    }
  }

  @ViewChild("resourcesList") resourcesListRef: ElementRef;

  map: google.maps.Map;
  private ngUnsubscribe = new Subject<void>();
  selectedCity: any;
  points = [];
  coordinatesData = [];
  resourceListObs$ = this.resourceFilterService.resourceListObs$
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (myList: any) => {
        this.points = [];
        this.selectedCity = this.resourceFilterService.getSavedFilters();
        this.coordinatesData = myList?.content;
        if (this.coordinatesData !== undefined) {
          this.coordinatesData.forEach((element) => {
            if (element.geographicalCoordinates !== null) {
              const point = new Feature({
                geometry: new Point(
                  fromLonLat([
                    element.geographicalCoordinates.longitude,
                    element.geographicalCoordinates.latitude,
                  ]),
                ),
                type: "Point",
                desc:
                  '<div class="resource-card-map d-flex flex-column justify-content-start align-items-start"><a style="text-decoration:none; color:inherit" href="/client/domain/' +
                  element.domain +
                  "/category/" +
                  element.categoryId +
                  "/resource-type/" +
                  element.resourceTypeId +
                  "/view/" +
                  element.id +
                  '"><img width="300px" height="192px" src="' +
                  element?.featuredImage?.filePath +
                  '"/> ' +
                  " <h3>" +
                  element?.title +
                  " </h3> <h4>" +
                  element?.resourceCategoryName +
                  ' </h4>  <p> <i class="fas fa-map-marker" style="margin-right:5px"></i>' +
                  element?.address +
                  "</p>  <p>" +
                  (element?.shortDescription !== null
                    ? element?.shortDescription
                    : "Nu există descriere!") +
                  "</p> </a></div>",
              });
              this.points.push(point);
            }
          });
        }
      },
    });

  //   selectedCity = this.resourceFilterService.getSavedFilters();

  domainId: string = null;
  categoryId: string = null;
  resourceTypeId: string = null;

  currentLanguage: string = null;

  resourceTypeData: ResourceType = null;
  currentSortDirection: string = 'ASC'; // Initial direction

  resourceTemplate: ResourceTemplate = null;
  selected = "";

  // eventsExpanded = '';
  daysFilter = new BehaviorSubject(0);
  categoryFilter = new BehaviorSubject(0);
  searchString = new BehaviorSubject('');
  sortBy = new BehaviorSubject('Date (asc)');
  // categories = ['all', 'theater', 'opera', 'other'];
  events: EventInstance[] = [];
  filteredEvents: EventInstance[] = [];

  isMobile: boolean;

  private readonly subscriptions = new Subscription();

  public restaurantModalFilters: any[] = [];
  public wasClosedSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private resourceFilterService: ResourceFilterService,
    private translate: TranslateService,
    private matDialog: MatDialog,
    private overlay: Overlay,
    public modal: MatDialog,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private eventsService: EventsNewService,
    private readonly _breakPointObserver: BreakpointObserver
  ) {
    this.matIconRegistry.addSvgIcon(
        'zoom-icon',
        this.domSanitizer.bypassSecurityTrustResourceUrl('../../../assets/images/others/zoom-icon.svg')
    );

    this.matIconRegistry.addSvgIcon(
        'filter-icon',
        this.domSanitizer.bypassSecurityTrustResourceUrl('../../../assets/images/others/filter.svg')
    );


    this.matIconRegistry.addSvgIcon(
        'sort-icon',
        this.domSanitizer.bypassSecurityTrustResourceUrl('../../../assets/images/others/sort.svg')
    );

    this.matIconRegistry.addSvgIcon(
        'map-icon',
        this.domSanitizer.bypassSecurityTrustResourceUrl('../../../assets/images/others/map.svg')
    );
  }

  ngOnInit(): void {
    // this.initResourceFilterService();
    this.checkForLanguage();
    this.checkRouteForResourceId();
    this.generateMarkerPositions();

    if (this.eventsService.events.value.length === 0) {
      this.eventsService.getEventsData();
    }

    this.eventsService.events.subscribe(data => {
      this.events = data;
      this.sortBy.next('Date (asc)');
      // this.filteredEvents = this.events;
    });

    this.subscriptions.add(
      this._breakPointObserver.observe(['(max-width: 980px)']).subscribe((result)=> this.isMobile = result.breakpoints['(max-width: 980px)'])
    );

    this.restaurantModalFilters = [
      { accordionHeader: "Name", inputType: "text", modelName: 'name' },
      { accordionHeader: "Country", inputType: "text", modelName: 'country' },
      { accordionHeader: "Min Reviews", inputType: "text", modelName: 'minReviews' },
      { accordionHeader: "Specific", inputType: "checkbox", modelName: 'specific', iterableItems: this.locationSpecific, selectedItems: [] },
      { accordionHeader: "Type of property", inputType: "checkbox", modelName: 'propertyType', iterableItems: this.propertyType, selectedItems: [] },
      { accordionHeader: "Entertainment", inputType: "checkbox", modelName: 'entertainment', iterableItems: this.entertainments, selectedItems: [] },
      { accordionHeader: "Metode de plată", inputType: "checkbox", modelName: 'paymentOptions', iterableItems: this.paymentOptions, selectedItems: [] },
      { accordionHeader: "Cuisine", inputType: "checkbox", modelName: 'cuisine', iterableItems: this.cuisine, selectedItems: [] },
      { accordionHeader: "Rating", inputType: "star", modelName: 'rating', iterableItems: this.stars },
      { accordionHeader: "Currency", inputType: "radio", modelName: 'currency', iterableItems: this.currencies, selectedItems: [] },
      { accordionHeader: "Preț mediu", inputType: "slider", step: 50, min: 0, max: 10000, range: true, avgRangeValues: [0, 10000], modelName: 'avgPrice' },
    ];

    const { searchControl } = this.searchForm.controls;

    searchControl.valueChanges
        .pipe(
            distinctUntilChanged(),
            debounceTime(500),
            switchMap(item => {
              return this.getRestaurantList(item)
            })
        )
        .subscribe()

    combineLatest([this.daysFilter, this.categoryFilter, this.searchString, this.sortBy]).pipe(takeUntil(this.ngUnsubscribe)).subscribe(([daysFilter, categoryFilter, searchString, sortBy]) => {
      let daysFilterFunction;
      switch (daysFilter) {
        case 0:
          daysFilterFunction = (data) => data;
          break;
        case 1:
          daysFilterFunction = this.getCurrentEvents;
          break;
        case 2:
          daysFilterFunction = this.getNextWeekendEvents;
          break;
        case 3:
          daysFilterFunction = this.getNextWeekEvents;
          break;
        case 4:
          daysFilterFunction = this.getCurrentMonthEvents;
          break;
        case 5:
          daysFilterFunction = this.getLatestEvents;
          break;
      }
      console.log('categoryFilter', categoryFilter);
      const category = this.calegoriesList[categoryFilter]?.title?.toLowerCase();
      console.log('category', category);
      const sortByFunction = sortBy === 'Date (asc)' ? (a: EventInstance, b: EventInstance) => a.dateStart - b.dateStart : (a: EventInstance, b: EventInstance) => b.dateStart - a.dateStart;
      let tempEventsArr: EventInstance[] = [];
      tempEventsArr = daysFilterFunction(this.events).filter(event => {
        console.log('event category', event?.event?.eventCategory?.name?.toLocaleLowerCase());
        return categoryFilter === 0 ? true : event?.event?.eventCategory?.name?.toLocaleLowerCase() === category;
      });
      console.log('before before',  daysFilterFunction(this.events));
      tempEventsArr = tempEventsArr.filter(event => this.eventHasSubstring(event, searchString.toLowerCase())).sort(sortByFunction);
      console.log('this.events before', this.events, 'after', tempEventsArr);
      this.filteredEvents = tempEventsArr;
    });

  }

  private getRestaurantList(inputValue: string): Observable<any> {
    return this.resourceFilterService.getRestaurants(0, { name: inputValue })
  }

  sortItems(sortOptions: { sortBy: string, dir: string }) {
    // Toggle the direction
    this.currentSortDirection = this.currentSortDirection === 'ASC' ? 'DESC' : 'ASC';

    console.log({ sortBy: sortOptions.sortBy, dir: this.currentSortDirection });

    this.resourceFilterService
        .getRestaurants(undefined, {
          sortBy: sortOptions.sortBy,
          dir: this.currentSortDirection,
        })
        .subscribe();
  }
  modalRef: MatDialogRef<any>;


  public openMapsModal(tpl: TemplateRef<any>): void {
    this.wasClosedSubject.next(false)
    this.modalRef = this.modal.open(tpl);
    this.modalRef.afterClosed().subscribe(item => {
      this.wasClosedSubject.next(true);
    })

  }

  public closeFilters(): void {
    this.searchForm.controls.searchControl.setValue('');
  }

  generateMarkerPositions() {
    if (this.markerPositions.length > 0) {
      this.markerPositions = [];
    }
    this.resourceFilterService.coordinatesList$.subscribe((locations) => {
      locations.map((location) => {
        this.markerPositions.push({
          ...location,
          lat: location.location.y,
          lng: location.location.x,
          label: location.name,
        });

        this.modalMarkerPositions.push({
          ...location,
          lat: location.location.y,
          lng: location.location.x,
          label: location.name,
        })
      });
    });
  }

  checkForLanguage() {
    this.currentLanguage = this.translate.currentLang;
    this.translate.onLangChange.pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (res) => {
        this.currentLanguage = res.lang;
      },
    });
  }

  checkRouteForResourceId() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          if (params.has("domainId")) {
            this.domainId = params.get("domainId");
          }
          if (params.has("categoryId")) {
            this.categoryId = params.get("categoryId");
            switch (this.categoryId) {
              case "63d2ae569d6ce304608d1a88":
                this.selected = "hotels";
                break;
              case "63dbb183df393f737216183c":
                this.selected = "restaurants";
                break;
              case "events":
                this.selected = "events";
                break;
              default:
                this.selected = "";
                break;
            }
          }

          if (params.has("resourceTypeId")) {
            this.resourceTypeId = params.get("resourceTypeId");
            return forkJoin([
              this.resourceFilterService
                .getResourceTypeById(this.resourceTypeId)
                .pipe(take(1)),
              this.resourceFilterService
                .getResourceTemplateByResourceTypeId(this.resourceTypeId)
                .pipe(take(1)),
            ]);
          }
        }),
        takeUntil(this.ngUnsubscribe),
      )
      .subscribe({
        next: (res) => {
          [this.resourceTypeData, this.resourceTemplate] = res;
        },
        error: () => {
          void this.router.navigate(["/client/domain", this.domainId]);
        },
      });
  }

  scrollResourcesListIntoView() {
    this.resourcesListRef.nativeElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  openMap() {
    this.matDialog.open(ResourceListMapComponent, {
      width: "100%",
      height: "90%",
      panelClass: "map-dialog",
      scrollStrategy: this.overlay.scrollStrategies.noop(),
      data: {
        coordinate: this.points,
        resourceCoordinatesData: this.coordinatesData,
        filterData: this.selectedCity,
      },
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  moveMap(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.center = event.latLng.toJSON();
  }
  move(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.display = event.latLng.toJSON();
  }

  navigateToEventDetails(event: EventInstance): void {
    console.log('navigation clicked', event);
    this.router.navigate(["/client/event"], { queryParams: {id: event.id}});
  }

  getEventImgUrl(event: EventInstance): string {
    const defaultUrl = 'assets/images/others/events/eventDefaultBackground.png';
    const url = event?.image?.url || defaultUrl;
    return `url(${url})`;
  }

  getDay(event: EventInstance): number {
    return new Date(event.dateStart).getDate();
  }

  getMonth(event: EventInstance): string {
    const formatter = new Intl.DateTimeFormat('en', { month: 'long' });
    return formatter.format(new Date(event.dateStart));
  }

  getNextWeekendEvents(events: EventInstance[]): EventInstance[] {
    const weekendStart = moment().isoWeekday(5).startOf('day').unix();
    const weekendEnd = moment().isoWeekday(7).endOf('day').unix();
    return events.filter(event => event.dateStart > weekendStart && event.dateStart < weekendEnd);
  }

  getNextWeekEvents(events: EventInstance[]): EventInstance[] {
    const weekStart = moment().add(1, 'weeks').isoWeekday(5).startOf('day').unix();
    const weekEnd = moment().add(1, 'weeks').isoWeekday(7).endOf('day').unix();
    return events.filter(event => event.dateStart > weekStart && event.dateStart < weekEnd);
  }

  getCurrentEvents(events: EventInstance[]): EventInstance[] {
    const currDay = moment().isoWeekday();
    const periodLastDay = currDay < 5 ? 4 : 7;
    const periodStart = moment().startOf('day').unix();
    const periodEnd = moment().isoWeekday(periodLastDay).endOf('day').unix();
    return events.filter(event => event.dateStart > periodStart && event.dateStart < periodEnd);
  }

  getCurrentMonthEvents(events: EventInstance[]): EventInstance[] {
    const currentDay = moment().startOf('day').unix();
    const lastDayOfMonth = moment().endOf('month').unix();
    return events.filter(event => event.dateStart > currentDay && event.dateStart < lastDayOfMonth);
  }

  getLatestEvents(events: EventInstance[]): EventInstance[] {
    const startOfNextMonth = moment().add(1, 'M').startOf('month').unix();
    // const endOfNextMonth = moment().add(1, 'M').startOf('month').unix();
    return events.filter(event => event.dateStart > startOfNextMonth);
  }

  selectPeriodFilter(i: number): void {
    this.daysFilter.next(this.daysFilter.value === i ? 0 : i);
  }

  searchByString(e: any): void {
    this.searchString.next(e.target.value);
  }

  eventHasSubstring(event: EventInstance, str: string): boolean {
    const inDescription = event?.description?.toLowerCase().includes(str);
    const inTitle = event?.title?.toLowerCase().includes(str);
    const inEventCategoryName = event?.event?.eventCategory?.name?.toLowerCase().includes(str);
    const inEventCategoryDesc = event?.event?.eventCategory?.description?.toLowerCase().includes(str);
    const inEventVenueAdress = event?.venue?.address?.toLowerCase().includes(str);
    const inEventVenueName = event?.venue?.name?.toLowerCase().includes(str);
    return inDescription || inEventCategoryName || inEventCategoryDesc || inEventVenueAdress || inEventVenueName || inTitle;
  }

  selectSort(e: any): void {
    this.sortBy.next(e.value);
  }

  getCategoryIcon(activeCategory: number, i: number): string {
    const colorExtention = activeCategory === i ? 'y' : '';
    return this.calegoriesList[i]?.url + colorExtention + '.svg';
  }
}
