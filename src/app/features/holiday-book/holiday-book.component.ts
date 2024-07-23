import { NgFor, NgClass, NgStyle } from "@angular/common";
import { Component, OnInit, Input } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { Router } from "@angular/router";
import { PaginatorModule } from "primeng/paginator";
import { DomainListingModule } from "../domain-listing/domain-listing.module";
import { MatCheckbox, MatCheckboxModule } from "@angular/material/checkbox";
import { MatRadioModule } from "@angular/material/radio";
import { MatSliderModule } from "@angular/material/slider";
import { BookingListingComponent } from "src/app/components/booking-list/booking-list.component";

@Component({
  selector: "app-holiday-book",
  templateUrl: "./holiday-book.component.html",
  styleUrls: ["./holiday-book.component.scss"],
  standalone: true,
  imports: [
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatCheckboxModule,
    MatRadioModule,
    DomainListingModule,
    NgFor,
    PaginatorModule,
    NgClass,
    NgStyle,
    MatSliderModule,
    BookingListingComponent,
  ],
})
export class HolidayBookComponent implements OnInit {
@Input() route = '/';
  locationName: string = "";
  checked1 = true;
  checked2 = false;
  selectedOption = "option1";
  constructor(private router: Router) {}
  ngOnInit() {
    console.log(this.router);
    const urlItems: Array<string> = this.router.url.split("/");
    this.locationName = urlItems[urlItems.length];

    //Post API
  }

  toDetail() {
    this.router.navigate([this.route + '/dsfgwefwegwg']);
  }
}
