import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import {ResourceFilterService} from "../../shared/_services/resource-filter.service";
import { SelectedItemForDetailsService } from "src/app/shared/_services/selected-item-for-details.service";
import { HttpParams } from "@angular/common/http";
import { HotelsService } from "src/app/shared/_services/hotels.service";
import { HotelListByGeo, HotelSearchRequest } from "src/app/shared/_models/hotelsModels.model";
import { HotelPageResponse } from "src/app/shared/_models/hotelsModels.model";
import { AuthService } from "src/app/shared/_services/auth.service";
import { User } from "src/app/shared/_models/user.model";
import { Subscription } from "rxjs";
import {DataCacheService} from "../../shared/_services/data-cache.service";

@Component({
  selector: "app-hotels-carousel",
  templateUrl: "./hotels-carousel.component.html",
  styleUrls: ["./hotels-carousel.component.scss"],
})
export class HotelsCarouselComponent implements OnInit, OnDestroy {
  constructor(
      private router: Router,
      private resourceFilterService: ResourceFilterService,
      private selectedItemForDetailsService: SelectedItemForDetailsService,
      private hotelsService: HotelsService,
      private authService: AuthService,
      private dataCacheService: DataCacheService
  ) {}


  responsiveOptions;
  visibilityOptions;
  private hotelSearchParams: HttpParams = new HttpParams();
  private hotelsSearchRequest: HotelSearchRequest = new HotelSearchRequest();
  protected hotelListResponse: HotelListByGeo = new HotelListByGeo();
  protected currentSearchHotelsCount: number;
  protected allHotelsCount: number;
  protected loading: boolean = true;
  user: User;
  currentGeographicalCoordinates;
  subs: Subscription[] = [];
  city: string;

  ngOnInit() {
    this.responsiveOptions = [
      {
        breakpoint: "700px",
        numVisible: 1,
        numScroll: 1,
      },
      {
        breakpoint: "1100px",
        numVisible: 2,
        numScroll: 2,
      },
      {
        breakpoint: "2000px",
        numVisible: 3,
        numScroll: 2,
      },
    ];
    this.visibilityOptions = {
      numVisible: 3,
      numScroll: 2,
    };
    const userSub = this.authService.getCurrentUser().subscribe((user) => {
      this.user = user;
      this.currentGeographicalCoordinates = user.currentGeographicalCoordinates;
      this.city = user.city;
      this.getHotelList(true);
    });
    this.subs.push(userSub);

  }

  ngOnDestroy(): void {
      this.subs.forEach(sub => {
        sub.unsubscribe();
      })
  }

  private getHotelList(init : boolean, params?: any): void {
    this.selectedItemForDetailsService.setSelectedItem(null);

    if (params) {
      this.hotelSearchParams = this.constructQueryParams(params);
    }

    this.hotelsSearchRequest = this.constructSearchRequest();

    this.hotelsService
      .getHotelListByGeo(
        this.hotelsSearchRequest,
        0,
        20,
        'asc',
        undefined,
        this.hotelSearchParams,
          init
      )
      .subscribe((hotelPageResponse: HotelPageResponse): void => {
        this.hotelListResponse = hotelPageResponse.page;
        if (init && this.dataCacheService.checkSameHotelsFilter(this.hotelsSearchRequest)) {

          this.dataCacheService.saveHotelsFilter(this.hotelsSearchRequest);
          this.dataCacheService.saveHotels(hotelPageResponse);
        }

        if (init) {
          this.allHotelsCount = hotelPageResponse.page.totalElements;
          this.currentSearchHotelsCount = hotelPageResponse.currentSearchTotal;
        } else {
          this.currentSearchHotelsCount = hotelPageResponse.currentSearchTotal;
        }

        // this.center.lat = this.hotelsSearchRequest.latitude;
        // this.center.lng = this.hotelsSearchRequest.longitude;

        // this.populateAllMapMarkers();

        this.hotelListResponse.content.forEach(h => {
          h.hotelSearchRequest = this.hotelsSearchRequest;
          for(let i = 0; i < h.images.length; i++) {
            h.images[i] = h.images[i].replace("{size}", "1024x768");
          }
        });



        setTimeout((): void => {
          this.loading = false;
        }, 1000);
      });
  }

  private constructSearchRequest() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const checkin = this.toLocalISOString(today).slice(0, 10);
    const checkout = this.toLocalISOString(tomorrow).slice(0, 10);

    return {
      "radius": 2000,
      "residency": "gb",
      "language": "en",
      "currency": "EUR",
      "latitude": 44.435535,
      "longitude": 26.102920,
      "checkin": checkin,
      "checkout": checkout,
      "guests": [
          {
              "adults": 2,
              "children": []
          }
      ]
    };   
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

    // Sort by
    // if (request?.sortBy) {
    //   params = params.append("sortBy", request.sortBy);
    // } else {
    //   params = params.delete("sortBy");
    // }

    return params;
  }
  
  private toLocalISOString(date: Date): string {
    const off = date.getTimezoneOffset();
    const offset = off * 60000; // offset in milliseconds
    const localISOTime = (new Date(date.getTime() - offset)).toISOString();
    return localISOTime;
  }

  // showCity(position) {
  //   const latitude = position.latitude;
  //   const longitude = position.longitude;
  
  //   // Make a request to a Geocoding API (e.g. Google Maps Geocoding API)
  //   const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyDYV0uyLUobXB_JG1m4LVbcciQbu8DbfT0`;
  
  //   fetch(url)
  //     .then((response) => response.json())
  //     .then((data) => {
  //       this.city = data.results[0].address_components.find((component) =>
  //         component.types.includes("locality")
  //       ).long_name;
  //     })
  //     .catch((error) => console.log(error));
  // }

}
