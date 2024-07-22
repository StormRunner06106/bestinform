import { NgFor, NgClass, NgStyle } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { Router } from "@angular/router";
import { PaginatorModule } from "primeng/paginator";
import { DomainListingModule } from "../../domain-listing/domain-listing.module";
import { MatCheckbox, MatCheckboxModule } from "@angular/material/checkbox";
import { MatRadioModule } from "@angular/material/radio";
import { MatSliderModule } from "@angular/material/slider";
import { BookingListingComponent } from "../../../components/booking-list/booking-list.component";
import { CarouselModule as PCarouselModule } from "primeng/carousel";

@Component({
  selector: "app-book-detail",
  templateUrl: "./book-detail.component.html",
  styleUrls: ["./book-detail.component.scss", "../holiday-book.component.scss"],
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
    PCarouselModule,
  ],
})
export class BookDetailComponent implements OnInit {
  travels: Array<any> = [];
  constructor(private router: Router) {}
  ngOnInit() {
    this.travels = [
      {
        imageUrl: "../../../../assets/images/travels/devino-provider-min.jpg",
      },
      {
        imageUrl: "../../../../assets/images/travels/editorial-banner-min.jpg",
      },
      {
        imageUrl: "../../../../assets/images/travels/homepage.jpg",
      },
    ];
  }
}
