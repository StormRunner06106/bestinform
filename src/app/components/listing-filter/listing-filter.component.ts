import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from "@angular/core";
import { ResourceFilterService } from "src/app/shared/_services/resource-filter.service";
import {Accordion, AccordionTab} from "primeng/accordion";

@Component({
  selector: "app-listing-filter",
  templateUrl: "./listing-filter.component.html",
  styleUrls: ["./listing-filter.component.scss"],
})
export class ListingFilterComponent  implements OnChanges {
  constructor(private resourceFilterService: ResourceFilterService) {}
  @Input() hotelFilters: boolean = false;
  @Output() applyHotelFilters = new EventEmitter();
  @Input() filterData: {
    avgPrice: 10000,
    currency: "EUR",
    minPrice: 0,
    params: any
  }

  @ViewChild("stars")
  public accordionTab: any;

  // hotel variables start
  hotelSearchParams = {
    // language: [
    //   { title: "English", value: "en", selected: false },
    //   { title: "Spanish", value: "sp", selected: false },
    //   { title: "Polish", value: "po", selected: false },
    //   { title: "Romanian", value: "ro", selected: false },
    // ],
    // mealOptions: [
    //   { title: "Breakfast", selected: false },
    //   { title: "Dinner", selected: false },
    // ],
    starsOptions: [
      { title: "1", selected: false },
      { title: "2", selected: false },
      { title: "3", selected: false },
      { title: "4", selected: false },
      { title: "5", selected: false },
    ],
    hotelFacilities: [
      { title: "Air conditioning", selected: false },
      { title: "24-hour reception", selected: false },
      { title: "Smoke-free property", selected: false },
      { title: "Garden", selected: false },
      { title: "Room service", selected: false },
      { title: "Smoking areas", selected: false },
      { title: "Elevator/lift", selected: false },
      { title: "Heating", selected: false },
      { title: "Terrace", selected: false },
    ],
    minPrice: 1,
    price: 2000
  };
  // hotel variables end

  reviews;
  rating;
  selectedCities = [];
  paymentOptions = [];
  currency = [];
  facilities: string[];
  tags: string[];
  dietaryPreferences: string[];
  max = 5;
  specific = "";
  menuItemName = "";
  avgPriceRangeValues = [0, 10000];
  price = 10000;
  priceMin = 0;

  ngOnChanges(changes: SimpleChanges): void {
    this.price = this.filterData.avgPrice ? this.filterData.avgPrice : 2000;
    this.priceMin = this.filterData.minPrice && this.filterData.minPrice > 0 ? this.filterData.minPrice : 0;
    if (this.filterData.params && this.filterData.params.hotelFacilities) {
      for (let i = 0; i < this.filterData.params.hotelFacilities.length; i++) {
        if (this.filterData.params.hotelFacilities[i].selected) {
          this.hotelSearchParams.hotelFacilities[i].selected = this.filterData.params.hotelFacilities[i].selected;
          setTimeout(() => {
            this.accordionTab.accordion.tabs[0].selected = true;
          }, );
        }
      }
    }
    if (this.filterData.params && this.filterData.params.starsOptions) {
      for (let i = 0; i < this.filterData.params.starsOptions.length; i++) {
        if (this.filterData.params.starsOptions[i].selected) {
          this.hotelSearchParams.starsOptions[i].selected = this.filterData.params.starsOptions[i].selected;
          setTimeout(() => {
            this.accordionTab.accordion.tabs[1].selected = true;
          }, );
        }
      }
    }
  }



  onFacilitiesSubmit($event) {
    this.onFilterChange();
  }

  onSpecificsSubmit() {
    this.onFilterChange();
  }

  protected getStarArray(rating: string): any[] {
    const starCount: number = parseInt(rating);
    return Array(starCount).fill(0);
  }

  protected hotelsFiltersChange(): void {
    this.hotelSearchParams.price = this.price;
    this.hotelSearchParams.minPrice = this.priceMin;
    this.applyHotelFilters.emit(this.hotelSearchParams);
  }

  protected languageChange(e): void {
    // this.hotelSearchParams.language.forEach((language): void => {
    //   if (language.value !== e.checked[0]) {
    //     language.selected = false;
    //   }
    // });

    this.applyHotelFilters.emit(this.hotelSearchParams);
  }

  onFilterChange() {
    const latestCity = this.selectedCities[this.selectedCities.length - 1];

    this.selectedCities.length = 0;
    this.selectedCities.push(latestCity);

    const latestPaymentOption =
      this.paymentOptions[this.paymentOptions.length - 1];
    this.paymentOptions.length = 0;
    this.paymentOptions.push(latestPaymentOption);

    const latestCurrency = this.currency[this.currency.length - 1];
    this.currency.length = 0;
    this.currency.push(latestCurrency);

    const currentFilters = {
      currency: this.currency[0] || undefined,
      minReviews: this.reviews,
      paymentOptions: this.paymentOptions[0] || undefined,
      rating: this.rating ? this.rating / 20 : undefined,
      facilities: this.facilities,
      specific: this.specific ? this.specific : undefined,
      tags: this.tags,
      menuItemName: this.menuItemName ? this.menuItemName : undefined,
      menuItemDietaryPreferences: this.dietaryPreferences,
      avgPriceMin: this.avgPriceRangeValues[0],
      avgPriceMax: this.avgPriceRangeValues[1],
    };

    this.resourceFilterService
      .getRestaurants(undefined, currentFilters)
      .subscribe();
  }

  minPriceChanged($event: number) {
    this.priceMin = $event;
    // this.hotelsFiltersChange();
  }

  maxPriceChanged($event: number) {
    this.price = $event;
    // this.hotelsFiltersChange();
  }

  changeStarValue($event: any, option: any) {
    if (!$event.length) {
      option.selected = false;
    }
  }
}
