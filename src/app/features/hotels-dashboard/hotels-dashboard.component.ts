import {Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation} from "@angular/core";

import {HotelsService} from "../../shared/_services/hotels.service";

import {LocalStorageService} from "../../shared/_services/localStorage.service";

import {
  HotelListByGeo, HotelPageModel,
  HotelPageResponse,
  HotelSearchRequest,
  HotelShowMap, ShortHotelModel,
} from "../../shared/_models/hotelsModels.model";
import {SelectedItemForDetailsService} from "../../shared/_services/selected-item-for-details.service";
import {HttpParams} from "@angular/common/http";
import {mapsOptions, triangleIcon} from "../../shared/maps-options";
import {MatDialog} from "@angular/material/dialog";
import {LoadingService} from "../../utils/spinner/loading.service";
import {Router} from "@angular/router";
import {ToastService} from "../../shared/_services/toast.service";
import {DataCacheService} from "../../shared/_services/data-cache.service";

@Component({
  selector: "app-hotels-dashboard",
  templateUrl: "hotels-dashboard.component.html",
  styleUrls: ["hotels-dashboard.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class HotelsDashboardComponent implements OnInit {
  protected loading: boolean = false;
  protected loadingMap: boolean = false;

  protected city: string;
  protected country: string;

  private pageNumber: number = 0;
  private filterPrice: number;
  private filterPriceMin: number;
  private sort: string = "priceAsc";
  private searchName;
  private hotelsSearchRequest: HotelSearchRequest = new HotelSearchRequest();
  private hotelSearchParams: HttpParams = new HttpParams();
  private params;
  protected hotelListResponse: HotelListByGeo = new HotelListByGeo();
  protected allHotels: ShortHotelModel[] = [];
  protected allHotelsCount: number;
  protected currentSearchHotelsCount: number;

  public googlemapOptions = mapsOptions;
  public center: google.maps.LatLngLiteral = {
    lat: 44.4268,
    lng: 26.1025,
  };
  markerClustererImagePath =
      'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m';

  public zoom = 12;
  display: any;
  markerPositions: any[] = [];

  public inactiveMarker : any = {
    draggable: false,
    icon: triangleIcon,
  };
  public markerData: any;
  public isMarkerClicked = false;

  @ViewChild("googleMap")
  public googleMap: any;

  public filterData = {};

  constructor(
      private hotelsService: HotelsService,
      private modal: MatDialog,
      private router: Router,
      private localStorageService: LocalStorageService,
      private toastService: ToastService,
      private selectedItemForDetailsService: SelectedItemForDetailsService,
      private loadingService: LoadingService,
      private dataCacheService: DataCacheService
  ) {}

  public ngOnInit(): void {
    this.searchSubscriptionTrigger();
    this.selectedItemForDetailsService.clearTitle$.next({});
  }

  private searchSubscriptionTrigger(): void {

    this.hotelsService.hotelSearchRequest$.subscribe(
        (request: HotelSearchRequest): void => {

          if (request) {
            const parsedFilters = JSON.parse(
                this.localStorageService.get("filters"),
            );
            this.loading = true;
            this.city = JSON.parse(this.localStorageService.get("filters")).location;
            if (parsedFilters.country) {
              this.city = parsedFilters.country;
            }
            this.country = JSON.parse(
                this.localStorageService.get("filters"),
            ).country;

            this.hotelsSearchRequest = {
              ...new HotelSearchRequest(), // Default values
              ...parsedFilters.data, // Merged with JSON data
            };

            const hotelFilters = this.localStorageService.get("hotelFilters")
            let params;
            if (hotelFilters) {
              const parsedHotelFilters = JSON.parse(hotelFilters);
              if (parsedHotelFilters.pageNumber) {
                this.pageNumber = parsedHotelFilters.pageNumber;
              }
              if (parsedHotelFilters.sort) {
                this.sort = parsedHotelFilters.sort;
              }
              if (parsedHotelFilters.searchName) {
                this.searchName = parsedHotelFilters.searchName;
              }
              if (parsedHotelFilters.params) {
                params = parsedHotelFilters.params;
              }
            }

            this.getHotelList(true, params);

          } else {
            this.loading = false;
            // setTimeout(() => {
            //   this.router.navigate(["/client/domain/63bfcca765dc3f3863af755c"]);
            // }, 100);
          }
        },
    );
  }

  private getHotelList(init : boolean, params?: any): void {
    this.selectedItemForDetailsService.setSelectedItem(null);

    if (params) {
      this.hotelSearchParams = this.constructQueryParams(params);
      this.params = params;
    } else {
      const hotelFilters = this.localStorageService.get("hotelFilters");
      if (hotelFilters) {
        const parsedHotelFilters = JSON.parse(hotelFilters);
        const newFilters = {};
        if (parsedHotelFilters.pageNumber) {
          newFilters["pageNumber"] = parsedHotelFilters.pageNumber;
        }
        if (parsedHotelFilters.sort) {
          newFilters["sort"] = parsedHotelFilters.sort;
        }
        if (parsedHotelFilters.searchName) {
          newFilters["searchName"] = parsedHotelFilters.searchName;
        }
        if (Object.keys(parsedHotelFilters).length) {
          this.localStorageService.set("hotelFilters", JSON.stringify(newFilters));
        } else {
          this.localStorageService.remove("hotelFilters");
        }
      }

    }

    this.loadingService.showLoading();
    localStorage.setItem("hotelFilters", JSON.stringify({
      params: params,
      pageNumber: this.pageNumber,
      sort: this.sort,
      searchName: this.searchName
    }));
    this.hotelsService
        .getHotelListByGeo(
            this.hotelsSearchRequest,
            this.pageNumber,
            20,
            this.sort,
            this.searchName,
            this.hotelSearchParams,
            init
        )
        .subscribe((hotelPageResponse: HotelPageResponse): void => {
              this.hotelListResponse = hotelPageResponse.page;
              this.allHotels = hotelPageResponse.allHotels;
              if (this.pageNumber === 0 && init && this.sort === "priceAsc" && !this.searchName && this.dataCacheService.checkSameHotelsFilter(this.hotelsSearchRequest)) {
                this.dataCacheService.saveHotelsFilter(this.hotelsSearchRequest);
                this.dataCacheService.saveHotels(hotelPageResponse);
              }
              this.allHotelsCount = hotelPageResponse.page.totalElements;
              this.currentSearchHotelsCount = hotelPageResponse.currentSearchTotal;

              this.center.lat = this.hotelsSearchRequest.latitude;
              this.center.lng = this.hotelsSearchRequest.longitude;

              this.hotelListResponse.content.forEach(h => {
                h.hotelSearchRequest = this.hotelsSearchRequest;
                if (h.images) {
                  for (let i = 0; i < h.images.length; i++) {
                    h.images[i] = h.images[i].replace("{size}", "1024x768");
                  }
                }
                if (h.hotelsImages) {
                  for (let i = 0; i < h.hotelsImages.length; i++) {
                    h.hotelsImages[i] = h.hotelsImages[i].replace("{size}", "1024x768");
                  }
                }
              });
              this.filterData = {
                currency: this.hotelsSearchRequest.currency,
                avgPrice: this.filterPrice,
                minPrice: this.filterPriceMin,
                params: this.params,
                sort: this.sort
              }
              this.populateAllMapMarkers()


              setTimeout((): void => {
                this.loading = false;
                this.loadingService.hideLoading();
              });
            },
            error => {
              this.filterData = {
                currency: this.hotelsSearchRequest.currency,
                avgPrice: this.filterPrice,
                minPrice: this.filterPriceMin,
                params: this.params,
                sort: this.sort
              }
              this.loading = false;
              this.loadingService.hideLoading();
              this.toastService.showToast("Eroare","La afisarea hotelurilor disponibile. Va rugam reincercati.","error");
            });
  }

  protected applyHotelFilters(request: HotelSearchRequest): void {
    this.loading = true;
    this.getHotelList(false, request);
  }

  protected applySort(request): void {
    this.sort = request.value;
    this.loading = true;
    this.getHotelList(false);
  }

  protected applySearchName(request): void {
    this.searchName = request;
    this.loading = true;
    this.getHotelList(false);
  }

  private constructQueryParams(request: any): HttpParams {
    let params: HttpParams = new HttpParams();

    // Language options
    const languages = [];
    request?.language?.forEach((option) => {
      if (option?.selected) {
        this.hotelsSearchRequest.language = option.value;
        params = params.append("languages", option.value);
      }
    });

    // const allLanguages = ['en', 'sp', 'po', 'ro']; // Assuming these are all possible languages
    // allLanguages.forEach((lang) => {
    //   if (!selectedLanguages.includes(lang)) {
    //     params = params.delete("language", lang);
    //   }
    // });

    // Meal options
    request?.mealOptions?.forEach((option) => {
      if (option?.selected?.length) {
        params = params.append("mealOptions", option.title);
      }
    });

    // Stars options
    request?.starsOptions?.forEach((option) => {
      if (option?.selected?.length) {
        params = params.append("starsOptions", option.title);
      }
    });

    // Hotel facilities
    request?.hotelFacilities?.forEach((option) => {
      if (option?.selected?.length) {
        params = params.append("hotelFacilities", option.title);
      }
    });

    // Property types
    request?.propertyTypes?.forEach((option) => {
      if (option?.selected?.length) {
        params = params.append("propertyTypes", option.title);
      }
    });

    // Property themes
    request?.propertyThemes?.forEach((option) => {
      if (option?.selected?.length) {
        params = params.append("propertyThemes", option.title);
      }
    });

    // Bed types
    request?.bedTypes?.forEach((option) => {
      if (option?.selected?.length) {
        params = params.append("bedTypes", option.title);
      }
    });

    if (request && request.price && request.price < 2000) {
      this.filterPrice = request.price;
      params = params.append("maxPrice", request.price);
    }
    if (request && request.minPrice && request.minPrice > 0) {
      this.filterPriceMin = request.minPrice;
      params = params.append("minPrice", request.minPrice);
    }

    // Sort by
    // if (request?.sortBy) {
    //   params = params.append("sortBy", request.sortBy);
    // } else {
    //   params = params.delete("sortBy");
    // }

    return params;
  }

  protected onPageChange(e): void {
    this.pageNumber = e.page;
    this.getHotelList(false);
  }

  moveMap(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.center = event.latLng.toJSON();
  }
  move(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.display = event.latLng.toJSON();
  }

  openModal(mapsModalTemplate: TemplateRef<any>) {
    this.modal.open(mapsModalTemplate);
  }
  closeModal(): void {
    this.modal.closeAll();
    this.isMarkerClicked = false;
  }
  public getLocationDetails(data: any, event: any): void {
    this.center = {
      lat: data.lat,
      lng: data.lng
    };
    if(data.featuredImage && data.featuredImage.includes("{size}")) {
      data.featuredImage = data.featuredImage.replace("{size}", "1024x768");
    }
    this.markerData = data;
    this.isMarkerClicked = true;
  }

  routeChanged() {
    this.modal.closeAll();
  }

  private populateAllMapMarkers() {
    if (this.pageNumber === 0) {
      this.markerPositions = [];

      this.allHotels.forEach(hotel => {

        this.loadingMap = true;
        this.markerPositions.push({
          ...hotel,
          lat: hotel.latitude,
          lng: hotel.longitude,
          label: hotel.name,
          activeIcon: true,
          featuredImage: hotel.images?.length ? hotel.images[0].replace("{size}", "1024x768") : "",
          country: this.country,
          hotelSearchRequest: this.hotelsSearchRequest,
          options: {
            draggable: false,
            label: {
              text: Number((((hotel.lowestPrice ?? 0) * this.selectedItemForDetailsService.calculatePrice(this.hotelsSearchRequest))).toFixed(2)) + " " + this.hotelsSearchRequest.currency,
              color: "white",
              className: "custom-label"
            },
            icon: {
              url: '../../../../assets/images/others/frame.svg',
              scaledSize: new google.maps.Size(45, 45) // Adjust the size here
            }
          }
        });

        this.filterData = {
          currency: this.hotelsSearchRequest.currency,
          avgPrice: this.filterPrice,
          minPrice: this.filterPriceMin,
          params: this.params,
          sort: this.sort
        }
      });

      this.loadingMap = false;
      // this.hotelsService
      //     .getAllHotelsLocations(
      //         this.hotelsSearchRequest,
      //         this.sort,
      //         this.searchName,
      //         this.hotelSearchParams,
      //     )
      //     .subscribe((hotelListAll: ShortHotelModel[]) => {
      //       hotelListAll.forEach(hotel => {
      //         hotel.hotelSearchRequest = this.hotelsSearchRequest;
      //         this.markerPositions.push({
      //           ...hotel,
      //           lat: hotel.latitude,
      //           lng: hotel.longitude,
      //           label: hotel.name,
      //           activeIcon: true,
      //           featuredImage: hotel.hotelsImages[0].replace("{size}", "1024x768"),
      //           country: this.country,
      //           options: {
      //             draggable: false,
      //             label: {
      //               text: Number((((hotel.lowestPrice ?? 0) * this.selectedItemForDetailsService.calculatePrice(this.hotelsSearchRequest))).toFixed(2)) + " " + this.hotelsSearchRequest.currency,
      //               color: "white",
      //               className: "custom-label"
      //             },
      //             icon: {
      //               url: '../../../../assets/images/others/frame.svg',
      //               scaledSize: new google.maps.Size(45, 45) // Adjust the size here
      //             }
      //           }
      //         });
      //
      //         this.filterData = {
      //           currency: this.hotelsSearchRequest.currency,
      //           range: Math.floor(this.hotelsSearchRequest.radius / 1000),
      //           avgPrice: this.filterPrice,
      //           minPrice: this.filterPriceMin,
      //           params: this.params,
      //           sort: this.sort
      //         }
      //         this.loadingMap = false;
      //       });
      //
      //     }, error => {
      //       this.toastService.showToast("Eroare","La afisarea hotelurilor pe harta. Va rugam reincercati.","error");
      //       this.loadingMap = false;
      //       this.filterData = {
      //         currency: this.hotelsSearchRequest.currency,
      //         range: Math.floor(this.hotelsSearchRequest.radius / 1000),
      //         avgPrice: 2000,
      //         minPrice: this.filterPriceMin,
      //         params: this.params,
      //         sort: this.sort
      //       }
      //     });
    }
  }
}
