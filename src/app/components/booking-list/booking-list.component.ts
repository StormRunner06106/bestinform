import { CommonModule } from "@angular/common";
import { Component, OnInit, Input } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-booking-list",
  templateUrl: "./booking-list.component.html",
  styleUrls: ["./booking-list.component.scss"],
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
})
export class BookingListingComponent implements OnInit {
  @Input() travels: any = {};
  ngOnInit(): void {}
}
