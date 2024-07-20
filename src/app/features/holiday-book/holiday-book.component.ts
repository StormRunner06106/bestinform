import { NgFor, NgClass, NgStyle } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { Router } from "@angular/router";
import { PaginatorModule } from "primeng/paginator";
import { DomainListingModule } from "../domain-listing/domain-listing.module";

@Component({
  selector: "app-holiday-book",
  templateUrl: "./holiday-book.component.html",
  styleUrls: ["./holiday-book.component.scss"],
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
export class HolidayBookComponent implements OnInit {
  locationName: string = "";
  constructor(private router: Router) {}
  ngOnInit() {
    console.log(this.router);
    const urlItems: Array<string> = this.router.url.split("/");
    this.locationName = urlItems[urlItems.length];

    //Post API
  }
}
