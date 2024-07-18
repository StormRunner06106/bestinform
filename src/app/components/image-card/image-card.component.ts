import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-image-card",
  templateUrl: "./image-card.component.html",
  styleUrls: ["./image-card.component.scss"],
})
export class ImageCardComponent implements OnInit {
  @Input() size: string;
  @Input() isSelected = false;
  @Input() events = false;
  @Input() card;
  @Input() disableCarouselAnimation: boolean = false;
  @Input() smallerRadius = false;
  @Input() hasSpecifity = false;
  @Input() seatsAvailable = false;
  @Input() button;
  @Input() listing = false;
  @Input() inputType;
  @Input() listingPage = false;
  @Input() showAvailability = false;
  @Input() disableHover = false;
  @Input() alwaysVertical = false;
  @Input() smallerButton = false;
  @Input() smallerTitle = false;
  @Input() locked = false;

  constructor(private translate: TranslateService) {}

  ngOnInit() {
    this.isSelected = this.isCardSelected;
  }

  get isCardSelected() {
    if (!this.inputType || !this.card.inputType) {
      return false;
    }
    return this.inputType === this.card.inputType;
  }
  handleImageError(event: any, url: string) {
    // try again with the url
    event.target.src = url;
  }
}
