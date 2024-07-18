import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from "@angular/core";
import {Router} from "@angular/router";

import {HotelListByGeo, ShortHotelModel,} from "../../../shared/_models/hotelsModels.model";
import {SelectedItemForDetailsService} from "../../../shared/_services/selected-item-for-details.service";
import {FormControl} from "@angular/forms";

@Component({
  selector: "app-hotels-overview",
  templateUrl: "hotels-overview.component.html",
  styleUrls: ["hotels-overview.component.scss"],
})
export class HotelsOverviewComponent implements OnChanges {
  @Input() allHotelsCount: number;
  @Input() hotelListResponse: HotelListByGeo;
  @Input() country: string;
  @Input() city: string;
  @Input() searchName: string;
  @Input() filterData: any;

  @Output() triggerSort = new EventEmitter<any>();
  @Output() triggerSearchName = new EventEmitter<any>();

  protected hotelsSearch: FormControl = new FormControl("");
  protected sortBy = [
    { name: "Pret Crescator", value: "priceAsc" },
    { name: "Pret Descrescator", value: "priceDesc" }
  ];
  protected selectedSort = this.sortBy[0];

  constructor(
    private router: Router,
    private selectedItemForDetailsService: SelectedItemForDetailsService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.filterData && this.filterData.sort && this.filterData.sort === "priceDesc") {
      this.selectedSort = this.sortBy[1];
    }
  }

  protected onSortChange(e): void {
    this.triggerSort.emit(this.selectedSort);
  }

  protected onSearchChange() {
    this.triggerSearchName.emit(this.searchName);
  }

  protected navigateToDetails(hotel: ShortHotelModel): void {
    this.selectedItemForDetailsService.setSelectedItem({ ...hotel });

    this.router.navigate([
      "/client/domain/63bfcca765dc3f3863af755c/category/63d2ae569d6ce304608d1a88/resource-type/63d8d4a9d2180d7935acb4e0/view/",
      hotel.id,
    ]);
  }

}
