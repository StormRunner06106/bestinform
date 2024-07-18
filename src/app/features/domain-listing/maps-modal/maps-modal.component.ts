import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {mapsOptions} from "../../../shared/maps-options";
import {ResourceFilterService} from "../../../shared/_services/resource-filter.service";
import {MatDialog} from "@angular/material/dialog";
import {debounceTime, distinctUntilChanged, first, Observable, Subject, takeUntil} from "rxjs";
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-maps-modal',
  templateUrl: './maps-modal.component.html',
  styleUrls: ['./maps-modal.component.scss']
})
export class MapsModalComponent implements OnInit, OnDestroy {
  @Input() restaurantModalFilters: any[] = [];
  @Input() initialData: any[] = [];
  @Input() wasClosed: Observable<any>;
  public modalMarkerPositions: any[] = this.initialData;
  public isMarkerClicked: boolean = false;
  public readonly mapsOptions = mapsOptions;
  public googlemapOptions = mapsOptions;
  public selectedItems: any[] = [];
  public isFiltersShown: boolean = false;
  private ngUnsubscribe = new Subject<void>();

  public markerOptions: any = {
    draggable: false,
    icon: {
      url: '../../../../assets/images/others/frame.svg',
      scaledSize: new google.maps.Size(60, 60 ) // Adjust the size here
    }
  };

  public notActiveMarkerOptions: any = {
    draggable: false,
    icon: {
      url: '../../../../assets/images/others/notActiveFrame.svg',
      scaledSize: new google.maps.Size(60, 60 ) // Adjust the size here
    }
  };
  avgRangeValues = [0, 10000];
  private filterChangeSubject = new Subject<any>();


  public center: google.maps.LatLngLiteral = {
    lat: 44.4268,
    lng: 26.1025,
  };
  public zoom = 12;
  public markerData: any;
  currentFilters: any = {};
  public infoWindow: google.maps.InfoWindow | null = null;

  constructor(
      private resourceFilterService: ResourceFilterService,
      public modal: MatDialog,
      private matIconRegistry: MatIconRegistry,
      private domSanitizer: DomSanitizer
  ) {
    this.matIconRegistry.addSvgIcon(
        'custom-icon',
        this.domSanitizer.bypassSecurityTrustResourceUrl('../../../assets/images/others/restaurant-icon.svg')
    );
  }

  ngOnInit() {
    console.log('---------------------------------------')
    this.currentFilters = {};
    this.filteredDataList = [];

    this.onFilterChange();
    this.infoWindow = new google.maps.InfoWindow();

  }

  public map: google.maps.Map | undefined;

  isMobile(): boolean {
    return window.innerWidth < 980;
  }

  showFilters() {
    this.isFiltersShown = true;
  }

  getLocationData(data: any, event: any): void {
    console.log(data)
    data.isSelected = true;

    this.center = {
      lat: data.lat,
      lng: data.lng
    };
    this.isMarkerClicked = true;
    this.markerData = data;

    // Toggle isSelected for the clicked marker
    // data.isSelected = !data.isSelected;

    // Set isMarkerClicked to true to display the wrapper element
    this.isMarkerClicked = true;

    // Reset isSelected for all other markers
    this.modalMarkerPositions.forEach(marker => {
      marker.options = marker === data ? this.markerOptions : this.notActiveMarkerOptions;
      if (marker !== data) {
        marker.isSelected = false; // Set other markers as not selected
      }
    });
  }

  setRating(inputName?: string, value?: any, iterableItems?: any) {
    iterableItems.forEach(star => {
      star.color = star.value <= value ? 'gold' : '#4257EE';
    });

    this.onFilterChange(inputName, value)
  }



  public collectData(inputName?: string, value?: any): any {
    console.log(value)
    // Find the item in restaurantModalFilters corresponding to inputName
    const item = this.restaurantModalFilters.find(item => item.modelName === inputName);
    if (!item) return;

    const idx: number = item.selectedItems.indexOf(value);
    if (idx === -1) {
      item.selectedItems.push(value);
    } else {
      item.selectedItems.splice(idx, 1);
    }

    this.onFilterChange(inputName, item.selectedItems);
  }

  getAvgItems(modelName: string, avgRangeValues: any): void {
    if (modelName === 'avgPrice') {
      this.onFilterChange("avgPriceMin", avgRangeValues[0])
      this.onFilterChange("avgPriceMax", avgRangeValues[1])
    }
  }

  private filteredDataList: any[] = [];
  onFilterChange(inputName?: string, value?: any) {
    /*@TODO this.filteredDataList was created for Post requests with json data
    Use this one for requests which requires array of objects, in other case use filtersToSend
    */
    if (inputName === undefined) {
      this.resourceFilterService
          .getRestaurantsInSearch()
          .pipe(
              takeUntil(this.ngUnsubscribe)
          )
          .subscribe(data => {
            this.modalMarkerPositions = data.body.map(item => ({
              ...item,
              lat: item.location.y,
              lng: item.location.x,
            }));
            console.log(this.modalMarkerPositions);
          });
      return;
    }

    const filterData = {};
    filterData[inputName] = value;

    if (this.filteredDataList.length === 0) {
      this.filteredDataList.push(filterData);
    } else {
      this.filteredDataList[this.filteredDataList.length - 1][inputName] = value;
    }

    console.log(this.filteredDataList)


    if (value === '') {
      delete this.currentFilters[inputName]; // Remove the filter if it's empty
    } else {
      this.currentFilters[inputName] = value;
    }

    console.log(this.currentFilters)
    const filtersToSend = Object.keys(this.currentFilters).length === 0 ? undefined : this.currentFilters;
    console.log(filtersToSend)

    this.resourceFilterService
        .getRestaurantsInSearch(undefined, filtersToSend)
        .pipe(
            distinctUntilChanged(),
            debounceTime(700),
            takeUntil(this.ngUnsubscribe)
        )
        .subscribe(data => {
          this.modalMarkerPositions = data.body.map(item => ({
            ...item,
            lat: item.location.y,
            lng: item.location.x,
          }));
          console.log(this.modalMarkerPositions);
        });
  }

  ngOnDestroy() {
    this.currentFilters = null;
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
