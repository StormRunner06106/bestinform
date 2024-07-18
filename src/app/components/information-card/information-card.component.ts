import { Component, EventEmitter, Input, Output } from "@angular/core";

import { DescriptionStruct } from "../../shared/_models/hotelsModels.model";

@Component({
  selector: "app-information-card",
  templateUrl: "./information-card.component.html",
  styleUrls: ["./information-card.component.scss"],
})
export class InformationCardComponent {
  @Input() selected: string;
  @Input() width: string;
  @Input() showButton: string;
  @Input() labelText: string;
  @Input() title: string;
  @Input() description: string;
  @Input() hotelDescription: DescriptionStruct[];
  @Input() itemsTitle: string;
  @Input() items: { label: string; value: string }[];

  @Output() buttonClick = new EventEmitter<any>();

  protected buttonClicked(): void {
    this.buttonClick.emit("Rezervari");
  }
}
