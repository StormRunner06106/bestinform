import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "app-two-column-container",
  templateUrl: "./two-column-container.component.html",
  styleUrls: ["./two-column-container.component.scss"],
})
export class TwoColumnContainerComponent {
  @Input() leftColumnWidth = "50%";
  @Input() rightColumnWidth = "50%";
  @Input() leftTitle = "";
  @Input() leftSubtitle = "";
  @Input() rightTitle = "";
  @Input() rightSubtitle = "";
  @Input() leftBackgroundImage = "";
  @Input() rightBackgroundImage = "";
  @Input() buttonText = "";
  @Input() buttonColor = "#007bff";
  @Input() textColor = "#4257EE";
  @Input() buttonPosition = "left";
  @Input() reverseColumns =false;

  @Output() onBtnClick = new EventEmitter();

  onButtonClick() {
    this.onBtnClick.emit();
  }
}
