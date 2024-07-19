import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "app-holiday-listing",
  templateUrl: "./holiday-listing.component.html",
  styleUrls: ["./holiday-listing.component.scss"],
})
export class HolidayListingComponent implements OnInit {
  @Input() holiday: any = {};
  ngOnInit(): void {}
  renderHolidayIcon(type: string) {
    let src = "";
    switch (type) {
      case "Exotic":
        src = "../../../assets/icons/island.svg";
        break;
      case "Last Minute":
        src = "../../../assets/icons/sale.svg";
        break;
      case "Tours":
        src = "../../../assets/icons/theater.svg";
        break;
      default:
        break;
    }
    return src;
  }
}
