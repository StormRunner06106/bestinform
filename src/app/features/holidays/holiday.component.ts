import {
  ChangeDetectorRef,
  Component,
  HostListener,
  NgZone,
  OnInit,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { ActivatedRoute, Router } from "@angular/router";
import { HolidayListingComponent } from "src/app/components/holiday-listing/holiday-listing.component";
import { DomainListingModule } from "../domain-listing/domain-listing.module";
import { BrowserModule } from "@angular/platform-browser";
import { NgClass, NgFor, NgStyle } from "@angular/common";
import { PaginatorModule } from "primeng/paginator";
import { Observable } from "rxjs/internal/Observable";
import { fromEvent, map, startWith } from "rxjs";

@Component({
  selector: "app-holiday",
  templateUrl: "./holiday.component.html",
  styleUrls: ["./holiday.component.scss"],
  standalone: true,
  imports: [
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    DomainListingModule,
    NgFor,
    PaginatorModule,
    NgClass,
    NgStyle,
  ],
})
export class HolidayComponent implements OnInit {
  lang: string;
  holidayList: Array<any> = [];
  rows: number = 10;
  selectedFilter: string = "";
  isSearch: boolean = false;
  isFocused: boolean = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private router: Router
  ) {}

  ngOnInit() {
    for (let i = 0; i < 30; i++) {
      this.holidayList.push({
        location: "Greece",
        date: "Summer 2024",
        price: "830",
        type: "Exotic",
        url: "../../../assets/images/travels/tr.png",
      });
    }
    console.log(this.holidayList.length);
    this.cdr.detectChanges();
  }

  @HostListener("window:resize", ["$event"])
  onResize(event: Event): void {
    if (window.innerWidth < 1248) {
      this.isSearch = true;
    }
  }

  goToBookingPage(index: number) {
    this.router.navigate([
      `client/dashboard/holidays/${this.holidayList[index].location}`,
    ]);
  }

  renderCssForFilter(param: string): { [key: string]: boolean } {
    return {
      active: this.selectedFilter == param,
      "search-state": this.isSearch,
    };
  }

  onPageChange(event) {}

  onClickFilter(name: string) {
    this.selectedFilter = name;
    //Call api...
  }

  toggleSearchBox(p: boolean) {
    this.isSearch = p;
  }

  onFocus() {
    this.isFocused = true;
  }

  onBlur() {
    this.isFocused = false;
  }
}
