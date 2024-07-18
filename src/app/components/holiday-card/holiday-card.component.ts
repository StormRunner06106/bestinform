import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "app-holiday-card",
  templateUrl: "./holiday-card.component.html",
  styleUrls: ["./holiday-card.component.scss"],
})
export class HolidayCardComponent implements OnInit {
  @Input() holiday: any = {};
  ngOnInit(): void {}
}
