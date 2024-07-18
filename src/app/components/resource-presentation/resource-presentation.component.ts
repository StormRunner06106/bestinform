import {Component, Input, OnInit, TemplateRef} from "@angular/core";
import {CustomMapMarker, mapsOptions, triangleIcon,} from "src/app/shared/maps-options";

import {ResourceFilterService} from "src/app/shared/_services/resource-filter.service";
import {SelectedItemForDetailsService} from "../../shared/_services/selected-item-for-details.service";
import {HotelsService} from "../../shared/_services/hotels.service";

import {MatDialog} from "@angular/material/dialog";
import { Subject, take } from "rxjs";
import {
  AmenityGroupsModel,
  DescriptionStruct,
  HotelPageModel,
  HotelSearchRequest, RoomDetails, RoomGroupsModel,
} from "../../shared/_models/hotelsModels.model";
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";
import { LocalStorageService } from "../../shared/_services/localStorage.service";
import {isArray} from "ngx-bootstrap/chronos";
import { mockRoomData } from "./mockRoomData";
import {LoadingService} from "../../utils/spinner/loading.service";
import {ToastService} from "../../shared/_services/toast.service";
import {LocationStrategy} from "@angular/common";


@Component({
  selector: "app-resource-presentation",
  templateUrl: "./resource-presentation.component.html",
  styleUrls: ["./resource-presentation.component.scss"],
})
export class ResourcePresentationComponent implements OnInit {
  public displayHotelReservation: boolean;
  public roomDetails: RoomDetails;
  public mockRoomDetails = mockRoomData;
  public isTransportationTitleVisible: boolean = false;

  constructor(
    public modal: MatDialog,
    private resourcesFilterService: ResourceFilterService,
    private hotelsService: HotelsService,
    private selectedItemForDetailsService: SelectedItemForDetailsService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private localStorageService: LocalStorageService,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private location: LocationStrategy
  ) {
    this.matIconRegistry.addSvgIcon(
        'iconFlight',
        this.domSanitizer.bypassSecurityTrustResourceUrl('../../../assets/images/others/airplane.svg')
    );
    this.matIconRegistry.addSvgIcon(
        'custom-icon',
        this.domSanitizer.bypassSecurityTrustResourceUrl('../../../assets/images/others/restaurant-icon.svg')
    );
  }

  @Input() resourceId;
  @Input() isBiggerThan981: boolean = false;
  @Input() selectedMenu;
  @Input() selected = "";

  loading: boolean = true;
  isMarkerClicked: boolean = false;
  public markerData: any;
  resourceDetails;
  imageUrls = [];
  carouselImages;
  shortAmenityGroups: AmenityGroupsModel[];
  hotelSearchParams: HotelSearchRequest;
  restaurantCards: any[] = [];
  roomGroups: RoomGroupsModel[] = [];
  public checkIn;
  public checkOut;

  bookingFee: number;
  sessionId: string;

  submitReservationObservable = new Subject<boolean>();

  display: any;
  center: google.maps.LatLngLiteral = {
    lat: 44.4268,
    lng: 26.1025,
  };
  zoom = 12;

  public markerOptions: any = {
    draggable: false,
    icon: {
      url: '../../../../assets/images/others/frame.svg',
      scaledSize: new google.maps.Size(45, 45 ) // Adjust the size here
    }
  };

  public inactiveMarker : any = {
    draggable: false,
    icon: triangleIcon,
  };

  markerPositions: any[] = [];
  inactiveMarkers: CustomMapMarker[] = [];
  googlemapOptions = mapsOptions;

  programTitle = "Ore de lucru";
  programs = [];
  public infoCategories: any[] = [];
  description =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.";
  protected hotelDescription: DescriptionStruct[] = [];
  protected hotelInfoRequest: any;
  protected hotelFullInfo: HotelPageModel[] = [];



  public ngOnInit(): void {
    const parsedFilters = JSON.parse(
        this.localStorageService.get("filters"),
    );
    this.center.lat = parsedFilters.data?.latitude;
    this.center.lng = parsedFilters.data?.longitude;
    switch (this.selected) {
      case "hotels":
        this.hotelsService.hotelSearchRequest$.subscribe(
          (request: any): void => {


            this.loading = true;

            this.hotelInfoRequest = {
              ...new HotelSearchRequest(), // Default values
              ...parsedFilters.data, // Merged with JSON data
              id: this.resourceId,
            };

            this.getHotelInfo(this.hotelInfoRequest);
            const savedFilters = localStorage.getItem("hotelFilters");
            if (savedFilters) {
              const hotelFilters = JSON.parse(savedFilters);
              delete hotelFilters["params"];
              delete hotelFilters["searchName"];
              hotelFilters.sort = "priceAsc";
              localStorage.setItem("hotelFilters", JSON.stringify(hotelFilters));
            }
          },
        );
        break;
      case "restaurants":
        this.getRestaurantData();

    }
  }

  private getRestaurantData(): void{
    this.resourcesFilterService
        .getRestaurantById(this.resourceId)
        .pipe(
            take(1),
        )
        .subscribe((restaurant) => {
          const regexForReservationPolicy: RegExp =/\d+/g;
          this.bookingFee = +restaurant?.reservationPolicy?.match(regexForReservationPolicy)?.[0];
          if (restaurant['about']) {
            if (restaurant['about'].airportDistance) {
              if (restaurant['about'].airportDistance.startsWith('{')) {
                const parsedAirports = JSON.parse(restaurant['about'].airportDistance);

                const items = parsedAirports.items
                    .filter(airport => airport.name)
                    .map(airport => ({
                      name: airport.name,
                      distance: airport.distance,
                      svgImagePath: "airplane-icon"
                    }));

                console.log(items)
                this.infoCategories.push({
                  title: "Aeroporturi in apropiere",
                  items: items
                });
              }
            }


            if (restaurant['about'].nearBy) {
              if (restaurant['about'].nearBy.startsWith('{')) {
                const parsedNearByLocations: any = JSON.parse(restaurant['about'].nearBy);
                const items = parsedNearByLocations.items
                    .filter(location => location.name)
                    .map(location => ({
                      name: location.name,
                      distance: location.distance,
                      svgImagePath: "locations"
                    }));

                this.infoCategories.push({
                  title: "Principalele Atractii",
                  items: items
                });
              }
            }
            if (restaurant['about'].principalAttractions) {
              console.log(restaurant['about'].principalAttractions)
              if (restaurant['about'].principalAttractions.startsWith('{')) {
                const parsedPrincipalAttractions: any = JSON.parse(restaurant['about'].principalAttractions);
                console.log(parsedPrincipalAttractions)
                const items = parsedPrincipalAttractions.items
                    .filter(location => location.name && location.distance)
                    .map(location => ({
                      name: location.name,
                      distance: location.distance,
                      svgImagePath: "nearBy"
                    }));

                this.infoCategories.push({
                  title: "In apropiere",
                  items: items
                });
              }

            }

            if (restaurant['about'].publicTransportation) {
              if (isArray(restaurant['about'].publicTransportation)) {
                const parsedData = restaurant['about'].publicTransportation.map(item => {
                  return  item.startsWith('{') ? JSON.parse(item) : []
                });

                const items = parsedData.filter(location => location.stationName && location.distanceTo)
                    .map(location => ({
                      name: location.stationName,
                      distance: location.distanceTo,
                      svgImagePath: "bus"
                    }));

                this.infoCategories.push({
                  title: "Transport Public",
                  items: items
                });
              }
              console.log(restaurant)
              }

          } else {
            this.infoCategories = [];
          }


          this.infoCategories.map(item => {
            if (item.items.length) {
              this.isTransportationTitleVisible = true;
            }
          })
          this.resourcesFilterService.setSelectedRestaurant(restaurant);
          console.log(restaurant)
          this.resourceDetails = restaurant;
          this.imageUrls = restaurant.images;

          if (!restaurant.images) {
            this.imageUrls = [];
          }

          const lat = restaurant.location.y;
          const lon = restaurant.location.x;

          this.markerPositions.push({
            ...restaurant,
            lat: lat,
            lng: lon,
            label: restaurant.name,
            activeIcon: true,
          });
          // Set the map center to the new coordinates
          this.center = { lat: lat, lng: lon };

          // Initial zoom level (further out)
          this.zoom = 8;

          this.loading = false;
          // Gradually zoom in
          const finalZoom = 14;
          const zoomInterval = setInterval(() => {
            if (this.zoom < finalZoom) {
              this.zoom += 1;
            } else {
              clearInterval(zoomInterval);
            }
          }, 200);

          this.programs = restaurant.timetable.map((item) => {
            const itemDay = item.day;

            // Check if timetable is empty, if so, add a default object
            const hoursArray = item.timetable.length > 0 ? item.timetable.map((hourItem) => {
              return {
                startHour: hourItem.startHour,
                endHour: hourItem.endHour,
              };
            }) : [{ startHour: null, endHour: null }];

            return {
              label: itemDay,
              value: hoursArray,
            };
          });
          console.log("this.programs", this.programs);

          this.description = restaurant.description;
        });
  }

  isMobile(): boolean {
    return window.innerWidth < 980;
  }

  openModal(tpl: TemplateRef<any>): void {
    this.modal.open(tpl);

    // this.resourcesFilterService
    //     .getRestaurantsInSearch(undefined)
    //     .pipe(
    //         map(items => {
    //           return items.body.map(val => {
    //             this.inactiveMarkers.push({
    //               ...val,
    //               lat: val.location.y,
    //               lng: val.location.x,
    //               label: val.name,
    //               activeIcon: true,
    //             });
    //           })
    //         })
    //     )
    //     .subscribe(data => {
    //       this.markerPositions = this.inactiveMarkers;
    //       console.log(this.inactiveMarkers)
    //     });

  }

  public getCurrentLocation(){
    this.modal.closeAll();
    this.getRestaurantData();
  }

  public getLocationDetails(data: any, event: any): void {
    if (this.hotelFullInfo) {
      return;
    }
    this.center = {
      lat: data.lat,
      lng: data.lng
    };
    this.markerData = data;
    this.isMarkerClicked = true;

  }

  closeModal(): void {
    this.modal.closeAll();
    this.isMarkerClicked = false;
  }

  protected buttonClicked($event: any, scrollUp: boolean = false): void {
    if (this.selected === 'hotels') {
      return;
    }
    this.selectedMenu = $event;

    if (scrollUp) {
      window.scrollTo({ top: window.pageYOffset - 100, behavior: 'smooth' });

    }
  }

  isSmallScreen(): boolean {
    return window.innerWidth <= 980;
  }

  moveMap(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.center = event.latLng.toJSON();
  }
  move(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.display = event.latLng.toJSON();
  }

  private getHotelInfo(request: any): void {
    this.loadingService.showLoading();
    this.hotelsService
      .getHotelById(request)
      .subscribe((data: HotelPageModel[]): void => {
        this.hotelFullInfo = data;
        const hotel = data[0].hotel;
        //  start get close resaurants to hotel
        const localStorageCoords = JSON.parse(
          this.localStorageService.get("filters"),
        );
        this.hotelSearchParams = localStorageCoords;
        this.roomGroups = this.hotelFullInfo[0].hotel.room_groups;

        const restaurantsRequest = {
          latitude: localStorageCoords?.data?.latitude,
          longitude: localStorageCoords?.data?.longitude,
          rangeInKm: 50,
        };

        //removed for now
        // this.resourcesFilterService
        //   .getRestaurants(0, restaurantsRequest)
        //   .subscribe((restaurant: any): void => {
        //     this.restaurantCards = restaurant.map((item): any => {
        //       return {
        //         cardText: {
        //           title: item.name,
        //           address: item.address,
        //           specifity: item.specific,
        //         },
        //         imageUrl: item.featuredImage,
        //       };
        //     });
        //   });
        //  end get close resaurants to hotel

        // cut additional info for do not increase the block
        const sentences: string[] =
          data[0].hotel?.metapolicy_extra_info?.split(".");
        const firstTwoPurposes: string[] = sentences?.slice(0, 2);
        data[0].hotel.metapolicy_extra_info = firstTwoPurposes?.join(".");

        this.resourceDetails = data[0].hotel;

        // metapolicy_extra_info
        this.selectedItemForDetailsService.setSelectedItem({
          ...data[0].hotel,
        });

        this.carouselImages = data[0].hotel?.images.map(
          (img: string): string => {
            return img.replace("{size}", "1024x768");
          },
        );

        this.shortAmenityGroups = [
          data[0].hotel?.amenity_groups[0],
          data[0].hotel?.amenity_groups[1],
          data[0].hotel?.amenity_groups[2],
        ];

        if (!data[0].hotel.images) {
          this.imageUrls = [];
        } else {
          this.imageUrls = data[0].hotel.images;
          for(let i = 0; i < this.imageUrls.length; i++) {
            this.imageUrls[i] = this.imageUrls[i].replace("{size}", "1024x768");
          }
        }

        this.hotelDescription = data[0].hotel?.description_struct;

        this.loading = false;
        this.markerPositions = [];
        this.markerPositions.push({
          ...hotel,
          lat: hotel.latitude,
          lng: hotel.longitude,
          label: hotel.name,
          featuredImage: hotel.images[0],
          activeIcon: true,
          country: localStorageCoords.country,
          specific: undefined,
          options: {
            draggable: false,
            icon: {
              url: '../../../../assets/images/others/frame.svg',
              scaledSize: new google.maps.Size(45, 45) // Adjust the size here
            }
          }
        });
        this.markerData = hotel;
        setTimeout(() => {
          this.loadingService.hideLoading();
          this.computeHeight();
        }, 1000);
        // this.description = data.description_struct[0].paragraphs[0];
      },
          () => {
            this.loadingService.hideLoading();
            this.toastService.showToast("Eroare.", "Eroare la afisarea paginii hotelului.", "error");
            this.location.back();
          });
  }

  showResevation($event: RoomDetails) {
    this.roomDetails = $event;
    this.displayHotelReservation = true;
  }

  backButtonEmitted() {
    this.displayHotelReservation = false;
  }

  private computeHeight() {

    if (this.selected === 'hotels') {
      const presentationBlock = document.getElementById("presentation-block");
      const elementsToCompute = document.getElementsByClassName("information-part1")[0];
      const rowHeight = document.getElementsByClassName("restaurant-row")[0];
      let height = Number(getComputedStyle(elementsToCompute).gap.split("px")[0]);
      Array.from(elementsToCompute.children).forEach(el => {
        height += el.getBoundingClientRect().height;
      });
      presentationBlock.style.height = height + (rowHeight ? rowHeight.getBoundingClientRect().height * 0.05 : 0) + "px";
    }
  }
  submitReservation(): void {
    this.submitReservationObservable.next(true);
  }
  startStripeSession(sessionId: string): void {
    this.sessionId = sessionId;
  }
}
