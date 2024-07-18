import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {Router} from "@angular/router";

import {SelectedItemForDetailsService} from "../../../shared/_services/selected-item-for-details.service";

import {ShortHodelCardModel} from "../../../shared/_models/hotelsModels.model";

@Component({
  selector: "app-hotel-card",
  templateUrl: "hotel-card.component.html",
  styleUrls: ["hotel-card.component.scss"],
})
export class HotelCardComponent implements OnInit {
  @Input() hotel: ShortHodelCardModel;
  @Input() country: string;
  @Input() city: string;
  @Output() routeChanged: EventEmitter<any> = new EventEmitter<any>();

  public daysBetween = 0;
  public totalPrice = 0;
  public guestsTotal = 0;

  constructor(
    private router: Router,
    private selectedItemForDetailsService: SelectedItemForDetailsService,
  ) {}

  public ngOnInit(): void {
    this.daysBetween = this.selectedItemForDetailsService.calculatePrice(this.hotel.hotelSearchRequest);
    this.totalPrice = Number((this.hotel.lowestPrice * this.daysBetween * this.hotel.hotelSearchRequest.guests.length).toFixed(2));
    this.guestsTotal = this.hotel.hotelSearchRequest.guests.map(g => g.adults).reduce((acc, curr) => acc + curr);

    // console.log(this.hotel);
    // if (!this.hotel.featuredImage) {
    //   if (this.hotel.images) {
    //     this.hotel.featuredImage = this.hotel.images[0].replace(
    //         "{size}",
    //         "240x240",
    //     );
    //   }
    //   if (this.hotel.hotelsImages) {
    //     this.hotel.featuredImage = this.hotel.hotelsImages[0].replace(
    //         "{size}",
    //         "240x240",
    //     );
    //   }
    // }
    if (this.hotel.images) {
      this.hotel.featuredImage = this.hotel.images[0].replace(
          "{size}",
          "240x240",
      );
    }
    if (this.hotel.hotelsImages) {
      this.hotel.featuredImage = this.hotel.hotelsImages[0].replace(
          "{size}",
          "240x240",
      );
    }

    /*
    {size} - size of the image that you can request. List of available values:
      • 100x100 — crop
      • 1024x768 — fit
      • 120x120 — crop
      • 240x240 — crop
      • x220 — fit-h
      • x500 — fit-h
      crop - image is fit by the width, and is cut equally from the bottom and top till the middle part (of height's value)
      fit-h - image is fit by the height
      fit - image is fit into the rectangle of the size in question
     */
  }

  // protected navigateToRouteWithSelectedTab(): void {
  //   this.selectedItemForDetailsService.setSelectedItem({ ...this.hotel });
  //
  //   this.router.navigate(
  //     [
  //       `/client/domain/63bfcca765dc3f3863af755c/category/63d2ae569d6ce304608d1a88/resource-type/63d8d4a9d2180d7935acb4e0/view/${this.hotel.id}`,
  //     ],
  //     { queryParams: { selectedTab: "reservation" } },
  //   );
  // }
  navigateToRouteWithSelectedTab() {
    this.routeChanged.emit();
    this.router.navigate([
      "/client/domain/63bfcca765dc3f3863af755c/category/63d2ae569d6ce304608d1a88/resource-type/63d8d4a9d2180d7935acb4e0/view/",
      this.hotel.id,
    ]);
  }
}
