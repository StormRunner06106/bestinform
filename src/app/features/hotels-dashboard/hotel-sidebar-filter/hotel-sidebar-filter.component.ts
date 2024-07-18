import { Component, EventEmitter, Input, Output } from "@angular/core";

import { HotelSearchRequest } from "../../../shared/_models/hotelsModels.model";

@Component({
  selector: "app-hotel-sidebar-filter",
  templateUrl: "hotel-sidebar-filter.component.html",
  styleUrls: ["hotel-sidebar-filter.component.scss"],
})
export class HotelSidebarFilterComponent {
  @Input() hotelSearchRequest: HotelSearchRequest = new HotelSearchRequest();

  @Output() applyHotelFilters = new EventEmitter();

  protected languageOptions: { title: string; selected: boolean }[] = [
    { title: "English", selected: false },
    { title: "Spanish", selected: false },
    { title: "Polish", selected: false },
    { title: "Romanian", selected: false },
  ];

  constructor() {
    console.log();
  }

  protected onFilterChange(): void {
    console.log();
  }
}
